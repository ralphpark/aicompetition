-- =============================================================
-- Migration 015: fix_portfolio_stats_and_index
-- Date: 2026-02-13
-- Fixes:
--   H6: Add risk_reward_ratio to update_portfolio_statistics()
--   H9: Drop orphaned update_risk_metrics(uuid) function
--   M7: Add created_at DESC index on market_data
-- =============================================================

-- FIX 1 (H6): Recreate update_portfolio_statistics with risk_reward_ratio
CREATE OR REPLACE FUNCTION update_portfolio_statistics()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_portfolio RECORD;
  v_max_drawdown NUMERIC;
  v_profit_factor NUMERIC;
  v_peak_balance NUMERIC;
  v_avg_win NUMERIC;
  v_avg_loss NUMERIC;
  v_total_wins NUMERIC;
  v_total_losses NUMERIC;
  v_current_streak INT;
  v_max_win_streak INT;
  v_max_loss_streak INT;
  v_pos RECORD;
  v_running_balance NUMERIC;
  v_running_peak NUMERIC;
  v_running_drawdown NUMERIC;
  v_risk_reward NUMERIC;
BEGIN
  FOR v_portfolio IN
    SELECT vp.id as portfolio_id, vp.model_id, vp.initial_balance
    FROM virtual_portfolios vp
  LOOP
    -- Calculate avg win/loss amounts from realized_pnl
    SELECT
      COALESCE(AVG(CASE WHEN realized_pnl > 0 THEN realized_pnl END), 0),
      COALESCE(AVG(CASE WHEN realized_pnl < 0 THEN ABS(realized_pnl) END), 0),
      COALESCE(SUM(CASE WHEN realized_pnl > 0 THEN realized_pnl END), 0),
      COALESCE(SUM(CASE WHEN realized_pnl < 0 THEN ABS(realized_pnl) END), 0)
    INTO v_avg_win, v_avg_loss, v_total_wins, v_total_losses
    FROM virtual_positions
    WHERE model_id = v_portfolio.model_id
      AND status = 'CLOSED'
      AND realized_pnl IS NOT NULL;

    -- Profit factor
    IF v_total_losses > 0 THEN
      v_profit_factor := ROUND(v_total_wins / v_total_losses, 4);
    ELSE
      v_profit_factor := CASE WHEN v_total_wins > 0 THEN 999.0 ELSE 0.0 END;
    END IF;

    -- Risk/Reward ratio
    IF v_avg_loss > 0 THEN
      v_risk_reward := ROUND(v_avg_win / v_avg_loss, 2);
    ELSE
      v_risk_reward := CASE WHEN v_avg_win > 0 THEN 999.0 ELSE 0.0 END;
    END IF;

    -- Calculate streaks and drawdown by iterating positions in time order
    v_running_balance := COALESCE(v_portfolio.initial_balance, 10000);
    v_running_peak := v_running_balance;
    v_max_drawdown := 0;
    v_max_win_streak := 0;
    v_max_loss_streak := 0;
    v_current_streak := 0;

    FOR v_pos IN
      SELECT realized_pnl
      FROM virtual_positions
      WHERE model_id = v_portfolio.model_id
        AND status = 'CLOSED'
        AND realized_pnl IS NOT NULL
      ORDER BY closed_at ASC
    LOOP
      v_running_balance := v_running_balance + v_pos.realized_pnl;

      -- Track peak and drawdown
      IF v_running_balance > v_running_peak THEN
        v_running_peak := v_running_balance;
      END IF;
      v_running_drawdown := CASE
        WHEN v_running_peak > 0 THEN ROUND((v_running_peak - v_running_balance) / v_running_peak * 100, 2)
        ELSE 0
      END;
      IF v_running_drawdown > v_max_drawdown THEN
        v_max_drawdown := v_running_drawdown;
      END IF;

      -- Track streaks
      IF v_pos.realized_pnl > 0 THEN
        IF v_current_streak > 0 THEN
          v_current_streak := v_current_streak + 1;
        ELSE
          v_current_streak := 1;
        END IF;
        IF v_current_streak > v_max_win_streak THEN
          v_max_win_streak := v_current_streak;
        END IF;
      ELSIF v_pos.realized_pnl < 0 THEN
        IF v_current_streak < 0 THEN
          v_current_streak := v_current_streak - 1;
        ELSE
          v_current_streak := -1;
        END IF;
        IF ABS(v_current_streak) > v_max_loss_streak THEN
          v_max_loss_streak := ABS(v_current_streak);
        END IF;
      END IF;
    END LOOP;

    -- Update portfolio with all statistics including risk_reward_ratio
    UPDATE virtual_portfolios SET
      max_drawdown = v_max_drawdown,
      profit_factor = v_profit_factor,
      peak_balance = v_running_peak,
      avg_win_amount = ROUND(v_avg_win, 2),
      avg_loss_amount = ROUND(v_avg_loss, 2),
      risk_reward_ratio = v_risk_reward,
      max_consecutive_wins = v_max_win_streak,
      max_consecutive_losses = v_max_loss_streak
    WHERE id = v_portfolio.portfolio_id;

  END LOOP;
END;
$$;

-- FIX 2 (H9): Drop orphaned update_risk_metrics function
DROP FUNCTION IF EXISTS update_risk_metrics(uuid);

-- FIX 3 (M7): Add created_at index on market_data for ADX percentile trigger queries
CREATE INDEX IF NOT EXISTS idx_market_data_created_at ON market_data (created_at DESC);
