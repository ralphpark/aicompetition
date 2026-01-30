// ============================================
// Virtual Portfolio Manager v5.0
// + Risk-Based Position Sizing (ATR-based)
// + Volatility Regime Adjustment
// + Multi-Timeframe Confluence Check
// + Squeeze Release Detection
// + ADX Percentile Evaluation
// ============================================

const items = $input.all();
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZGF2ZnZma2tsbXVkYnBmZGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTc5MjgsImV4cCI6MjA4MzQ3MzkyOH0.TbFIFNUnYACyAT8c_vl3agifPPx8ut0OcCoz6JJ2aBY';
const BASE_URL = 'https://tndavfvfkklmudbpfdhj.supabase.co/rest/v1';
const headers = { 'apikey': API_KEY, 'Authorization': 'Bearer ' + API_KEY };

const decisionsRes = await this.helpers.httpRequest({ method: 'GET', url: BASE_URL + '/ai_decisions?order=created_at.desc&limit=12', headers: headers, json: true });
const decisions = (decisionsRes || []).filter(function(d) { return d && d.id; });

const portfoliosRes = await this.helpers.httpRequest({ method: 'GET', url: BASE_URL + '/virtual_portfolios?select=*,ai_models(name)', headers: headers, json: true });
const portfolioMap = new Map();
for (var i = 0; i < (portfoliosRes || []).length; i++) { var p = portfoliosRes[i]; if (p && p.id && !portfolioMap.has(p.id)) portfolioMap.set(p.id, p); }
const portfolios = Array.from(portfolioMap.values());

const positionsRes = await this.helpers.httpRequest({ method: 'GET', url: BASE_URL + '/virtual_positions?status=eq.OPEN', headers: headers, json: true });
const positionMap = new Map();
for (var j = 0; j < (positionsRes || []).length; j++) { var pos = positionsRes[j]; if (pos && pos.id && !positionMap.has(pos.id)) positionMap.set(pos.id, pos); }
const positions = Array.from(positionMap.values());

const marketRes = await this.helpers.httpRequest({ method: 'GET', url: BASE_URL + '/market_data?symbol=eq.BTCUSD&order=timestamp.desc&limit=1', headers: headers, json: true });
const marketData = (marketRes && marketRes[0]) ? marketRes[0] : {};

const priceRes = await this.helpers.httpRequest({ method: 'GET', url: 'https://fapi.binance.com/fapi/v1/ticker/price?symbol=BTCUSDT', json: true });
const currentPrice = parseFloat(priceRes && priceRes.price ? priceRes.price : 0) || 0;

var finalOutput = [{ json: { operation: 'NONE', reason: 'No price', skipped: [] } }];

if (currentPrice > 0) {
  var bbU = parseFloat(marketData.bb_upper)||0, bbL = parseFloat(marketData.bb_lower)||0, bbM = parseFloat(marketData.bb_middle)||0;
  var bbPos = 'MIDDLE';
  if (currentPrice > bbU) bbPos = 'ABOVE_UPPER';
  else if (currentPrice < bbL) bbPos = 'BELOW_LOWER';
  else if (currentPrice > bbM) bbPos = 'UPPER';
  else if (currentPrice < bbM) bbPos = 'LOWER';

  var ema20 = parseFloat(marketData.ema_20)||0, ema50 = parseFloat(marketData.ema_50)||0;
  var emaPos = 'BETWEEN';
  if (currentPrice > ema20 && currentPrice > ema50) emaPos = 'ABOVE_BOTH';
  else if (currentPrice < ema20 && currentPrice < ema50) emaPos = 'BELOW_BOTH';

  // ========== v5.0: Get v6.0 market data indicators ==========
  var actualMarketState = marketData.market_state || 'RANGING';
  var adx = parseFloat(marketData.adx) || 0;
  var adxPercentile = parseFloat(marketData.adx_percentile) || 50;
  var adxRegime = marketData.adx_regime || 'NORMAL';
  var atrRatio = parseFloat(marketData.atr_ratio) || 1.0;
  var avgATR = parseFloat(marketData.avg_atr) || 0;
  var volatilityRegime = marketData.volatility_regime || 'NORMAL';
  var volatilityPositionMultiplier = parseFloat(marketData.volatility_position_multiplier) || 1.0;
  var squeezeReleasing = marketData.squeeze_releasing || false;
  var confluenceLevel = parseInt(marketData.confluence_level) || 0;
  var confluenceDirection = marketData.confluence_direction || 'NEUTRAL';
  var entryAllowed = marketData.entry_allowed || false;
  var volumeAcceleration = parseFloat(marketData.volume_acceleration) || 1.0;
  var bullishDivergence = marketData.bullish_divergence || false;
  var bearishDivergence = marketData.bearish_divergence || false;
  // ========== END v5.0 ==========

  var indicators = {
    entry_rsi: parseFloat(marketData.rsi)||null,
    entry_rsi_1h: parseFloat(marketData.rsi_1h)||null,
    entry_rsi_4h: parseFloat(marketData.rsi_4h)||null,
    entry_macd: parseFloat(marketData.macd)||null,
    entry_macd_signal: parseFloat(marketData.macd_signal)||null,
    entry_macd_histogram: parseFloat(marketData.macd_histogram)||null,
    entry_bb_position: bbPos,
    entry_funding_rate: parseFloat(marketData.funding_rate)||null,
    entry_oi_change: parseFloat(marketData.open_interest_change)||null,
    entry_long_short_ratio: parseFloat(marketData.long_short_ratio)||null,
    entry_volume_24h: parseFloat(marketData.volume_24h)||null,
    entry_atr: parseFloat(marketData.atr)||null,
    entry_ema_position: emaPos,
    entry_trend: marketData.trend_1h||null,
    entry_market_state: actualMarketState,
    entry_adx: adx,
    entry_adx_percentile: adxPercentile,
    entry_adx_regime: adxRegime,
    entry_atr_ratio: atrRatio,
    entry_volatility_regime: volatilityRegime,
    entry_confluence_level: confluenceLevel,
    entry_confluence_direction: confluenceDirection,
    entry_volume_acceleration: volumeAcceleration,
    entry_bullish_divergence: bullishDivergence,
    entry_bearish_divergence: bearishDivergence
  };

  // ========== v5.0: New constants for risk-based sizing ==========
  var BASE_RISK_PCT = 0.02;  // 2% base risk per trade
  var MAX_POS = 0.05, MIN_POS = 0.005;  // Min lowered to 0.5%
  var MIN_TP_DOLLARS = 360, MIN_SL_DOLLARS = 240;
  var MIN_RR_RATIO = 1.5;  // Minimum Risk:Reward ratio
  var LEVERAGE = 5;
  // ========== END v5.0 ==========

  var now = new Date(), results = [], skippedList = [], processedPositions = new Set(), processedDecisionIds = new Set();

  // ========== CLOSE POSITIONS (TP/SL HIT) ==========
  for (var k = 0; k < positions.length; k++) {
    var ps = positions[k];
    if (ps.status !== 'OPEN' || processedPositions.has(ps.id)) continue;

    var ep = parseFloat(ps.entry_price)||0, tp = parseFloat(ps.take_profit)||0, sl = parseFloat(ps.stop_loss)||0, qty = parseFloat(ps.quantity)||0, lev = ps.leverage||5, side = ps.side;
    var hitType = null, closePrice = currentPrice;

    if (side === 'LONG') {
      if (tp > 0 && tp > ep && currentPrice >= tp) { hitType = 'TP'; closePrice = tp; }
      else if (sl > 0 && sl < ep && currentPrice <= sl) { hitType = 'SL'; closePrice = sl; }
    }
    else if (side === 'SHORT') {
      if (tp > 0 && tp < ep && currentPrice <= tp) { hitType = 'TP'; closePrice = tp; }
      else if (sl > 0 && sl > ep && currentPrice >= sl) { hitType = 'SL'; closePrice = sl; }
    }

    if (hitType) {
      var pnl = side === 'LONG' ? (closePrice - ep) * qty * lev : (ep - closePrice) * qty * lev;
      var port = portfolios.find(function(x) { return x.model_id === ps.model_id; });
      if (!port) continue;

      var mname = (port.ai_models && port.ai_models.name) ? port.ai_models.name : 'Unknown', bal = parseFloat(port.current_balance) || 10000;

      results.push({
        operation: 'CLOSE_POSITION',
        position_id: ps.id,
        model_id: ps.model_id,
        model_name: mname,
        portfolio_id: port.id,
        side: side,
        status: 'CLOSED',
        closed_at: new Date().toISOString(),
        close_price: closePrice,
        realized_pnl: pnl,
        pnl: pnl,
        is_win: pnl > 0,
        new_balance: bal + pnl,
        newBalance: bal + pnl,
        new_realized_pnl: (parseFloat(port.realized_pnl)||0) + pnl,
        new_total_trades: (port.total_trades||0) + 1,
        new_winning_trades: (port.winning_trades||0) + (pnl > 0 ? 1 : 0),
        close_reason: hitType + '_HIT'
      });

      processedPositions.add(ps.id);
    }
  }

  // ========== PROCESS AI DECISIONS ==========
  if (decisions.length > 0) {
    var latestTime = new Date(Math.max.apply(null, decisions.map(function(d) { return new Date(d.created_at).getTime(); })));
    var latestByModel = {};

    for (var m = 0; m < decisions.length; m++) {
      var d = decisions[m];
      var dt = new Date(d.created_at);
      if ((latestTime - dt) / 60000 <= 2) {
        if (!latestByModel[d.model_id]) latestByModel[d.model_id] = d;
      }
    }

    var processedModels = new Set();
    var modelIds = Object.keys(latestByModel);

    for (var n = 0; n < modelIds.length; n++) {
      var model_id = modelIds[n];
      if (processedModels.has(model_id)) continue;

      var dec = latestByModel[model_id];
      var action = dec.action, confidence = dec.confidence, stop_loss = dec.stop_loss, take_profit = dec.take_profit, position_size = dec.position_size, created_at = dec.created_at, decision_id = dec.id;

      if (processedDecisionIds.has(decision_id)) continue;

      var port2 = portfolios.find(function(x) { return x.model_id === model_id; });
      var mname2 = (port2 && port2.ai_models && port2.ai_models.name) ? port2.ai_models.name : 'Unknown';

      var dt2 = new Date(created_at);
      if ((now - dt2) / 60000 > 5) {
        skippedList.push({ model_name: mname2, action: action, reason: 'Too old' });
        continue;
      }

      if (action === 'NO_ACTION' || action === 'HOLD') {
        skippedList.push({ model_name: mname2, action: action, confidence: confidence, reason: 'NO_ACTION' });
        continue;
      }

      var mpos = positions.filter(function(x) { return x.model_id === model_id && x.status === 'OPEN' && !processedPositions.has(x.id); });

      if (!port2) {
        skippedList.push({ model_name: mname2, action: action, reason: 'No portfolio' });
        continue;
      }

      var bal2 = parseFloat(port2.current_balance) || 10000;
      var isChampion = port2.is_champion === true;

      var isOpenLong = action === 'OPEN_LONG' || action === 'LONG';
      var isOpenShort = action === 'OPEN_SHORT' || action === 'SHORT';

      // ========== OPEN POSITION LOGIC ==========
      if (isOpenLong || isOpenShort) {
        if (mpos.length >= 4) {
          skippedList.push({ model_name: mname2, action: action, reason: 'Max pos' });
          continue;
        }

        var tgtSide = isOpenLong ? 'LONG' : 'SHORT';
        if (mpos.filter(function(x) { return x.side === tgtSide; }).length >= 1) {
          skippedList.push({ model_name: mname2, action: action, reason: 'Has ' + tgtSide });
          continue;
        }

        // ========== v5.1: Confluence Check DISABLED for AI Autonomy ==========
        // AI models receive confluence data in prompts but make autonomous decisions
        // if (!entryAllowed) {
        //   skippedList.push({
        //     model_name: mname2,
        //     action: action,
        //     reason: 'Confluence fail (level=' + confluenceLevel + ', dir=' + confluenceDirection + ')'
        //   });
        //   continue;
        // }
        // ========== END v5.1 Confluence ==========

        // ========== v5.0: Squeeze Releasing Check ==========
        if (squeezeReleasing) {
          skippedList.push({
            model_name: mname2,
            action: action,
            reason: 'Squeeze releasing - wait for breakout'
          });
          continue;
        }
        // ========== END v5.0 Squeeze ==========

        // ========== v5.0: RISK-BASED POSITION SIZING ==========
        var baseSize = position_size || 0.02;

        // Calculate ATR-based risk sizing
        var dollarRisk = bal2 * BASE_RISK_PCT;  // 2% of balance
        var slDistDollars = 0;

        var fSL = parseFloat(stop_loss)||null, fTP = parseFloat(take_profit)||null;

        // Estimate SL distance (use AI suggestion or default MIN_SL_DOLLARS)
        if (fSL && tgtSide === 'LONG') {
          slDistDollars = Math.max(MIN_SL_DOLLARS, currentPrice - fSL);
        } else if (fSL && tgtSide === 'SHORT') {
          slDistDollars = Math.max(MIN_SL_DOLLARS, fSL - currentPrice);
        } else {
          slDistDollars = MIN_SL_DOLLARS;
        }

        // Scale SL distance by ATR ratio
        var scaledSLDist = slDistDollars * atrRatio;

        // Risk-based position size: dollarRisk / (scaledSLDist * leverage)
        var riskBasedSize = dollarRisk / (scaledSLDist * LEVERAGE);

        // Apply volatility regime multiplier
        var adjustedSize = riskBasedSize * volatilityPositionMultiplier;

        // Clamp to MIN/MAX
        var qty2 = Math.max(MIN_POS, Math.min(MAX_POS, adjustedSize));

        // ========== v5.0: Market State Adjustments ==========
        if (actualMarketState === 'RANGING') {
          if (adxPercentile < 30) {
            skippedList.push({
              model_name: mname2,
              action: action,
              reason: 'RANGING market (ADX percentile=' + adxPercentile.toFixed(0) + '% < 30%)'
            });
            continue;
          }
          qty2 = qty2 * 0.5;  // Reduce by 50% in ranging
        }

        if (actualMarketState === 'SQUEEZE') {
          qty2 = qty2 * 0.3;  // Very small position during squeeze
        }
        // ========== END v5.0 Market State ==========

        // ========== CALCULATE SL/TP ==========
        var adj = false;

        // Calculate dynamic SL/TP based on ATR
        var dynamicMinSL = MIN_SL_DOLLARS * atrRatio;
        var dynamicMinTP = MIN_TP_DOLLARS * atrRatio;

        if (tgtSide === 'LONG') {
          var minSL = currentPrice - dynamicMinSL;
          if (!fSL || fSL >= currentPrice || (currentPrice - fSL) < dynamicMinSL) {
            fSL = minSL;
            adj = true;
          }
          var minTP = currentPrice + dynamicMinTP;
          if (!fTP || fTP <= currentPrice || (fTP - currentPrice) < dynamicMinTP) {
            fTP = minTP;
            adj = true;
          }
        }
        else {
          var minSL2 = currentPrice + dynamicMinSL;
          if (!fSL || fSL <= currentPrice || (fSL - currentPrice) < dynamicMinSL) {
            fSL = minSL2;
            adj = true;
          }
          var minTP2 = currentPrice - dynamicMinTP;
          if (!fTP || fTP >= currentPrice || (currentPrice - fTP) < dynamicMinTP) {
            fTP = minTP2;
            adj = true;
          }
        }

        // ========== Enforce R:R Ratio ==========
        var tpDist, slDist;
        if (tgtSide === 'LONG') {
          tpDist = fTP - currentPrice;
          slDist = currentPrice - fSL;
          if (slDist > 0 && tpDist / slDist < MIN_RR_RATIO) {
            fTP = currentPrice + (slDist * MIN_RR_RATIO);
            adj = true;
          }
        } else {
          tpDist = currentPrice - fTP;
          slDist = fSL - currentPrice;
          if (slDist > 0 && tpDist / slDist < MIN_RR_RATIO) {
            fTP = currentPrice - (slDist * MIN_RR_RATIO);
            adj = true;
          }
        }

        fSL = Math.round(fSL * 10) / 10;
        fTP = Math.round(fTP * 10) / 10;

        // Final R:R validation
        var finalTpDist = tgtSide === 'LONG' ? (fTP - currentPrice) : (currentPrice - fTP);
        var finalSlDist = tgtSide === 'LONG' ? (currentPrice - fSL) : (fSL - currentPrice);
        var finalRR = finalSlDist > 0 ? finalTpDist / finalSlDist : 0;

        if (finalRR < MIN_RR_RATIO) {
          skippedList.push({
            model_name: mname2,
            action: action,
            reason: 'R:R too low (' + finalRR.toFixed(2) + ' < 1.5)'
          });
          continue;
        }
        // ========== END SL/TP ==========

        var newPos = {
          operation: 'OPEN_POSITION',
          model_id: model_id,
          model_name: mname2,
          portfolio_id: port2.id,
          symbol: 'BTCUSD',
          side: tgtSide,
          quantity: qty2,
          entry_price: currentPrice,
          current_price: currentPrice,
          stop_loss: fSL,
          take_profit: fTP,
          leverage: LEVERAGE,
          unrealized_pnl: 0,
          status: 'OPEN',
          decision_id: decision_id,
          tpsl_adjusted: adj,
          opened_as_champion: isChampion,
          entry_rr_ratio: finalRR,
          risk_based_size: riskBasedSize,
          volatility_adjusted_size: adjustedSize,
          final_position_size: qty2,
          atr_ratio_at_entry: atrRatio,
          volatility_regime_at_entry: volatilityRegime
        };

        for (var key in indicators) { newPos[key] = indicators[key]; }
        results.push(newPos);
        processedModels.add(model_id);
        processedDecisionIds.add(decision_id);
      }

      // ========== CLOSE POSITION LOGIC ==========
      var isCloseLong = action === 'CLOSE_LONG' || action === 'CLOSE';
      var isCloseShort = action === 'CLOSE_SHORT';

      if (isCloseLong || isCloseShort) {
        var tgtSide2 = isCloseShort ? 'SHORT' : 'LONG';
        var ptc = mpos.find(function(x) { return x.side === tgtSide2; });

        if (!ptc && action === 'CLOSE') {
          tgtSide2 = 'SHORT';
          ptc = mpos.find(function(x) { return x.side === tgtSide2; });
        }

        if (!ptc) {
          skippedList.push({ model_name: mname2, action: action, reason: 'No pos' });
          continue;
        }

        if (processedPositions.has(ptc.id)) continue;

        var ep2 = parseFloat(ptc.entry_price), qty3 = parseFloat(ptc.quantity), lev2 = ptc.leverage || 5;
        var pnl2 = ptc.side === 'LONG' ? (currentPrice - ep2) * qty3 * lev2 : (ep2 - currentPrice) * qty3 * lev2;

        results.push({
          operation: 'CLOSE_POSITION',
          position_id: ptc.id,
          model_id: model_id,
          model_name: mname2,
          portfolio_id: port2.id,
          side: ptc.side,
          status: 'CLOSED',
          closed_at: new Date().toISOString(),
          close_price: currentPrice,
          realized_pnl: pnl2,
          pnl: pnl2,
          is_win: pnl2 > 0,
          new_balance: bal2 + pnl2,
          newBalance: bal2 + pnl2,
          new_realized_pnl: (parseFloat(port2.realized_pnl)||0) + pnl2,
          new_total_trades: (port2.total_trades||0) + 1,
          new_winning_trades: (port2.winning_trades||0) + (pnl2 > 0 ? 1 : 0),
          close_reason: 'AI_DECISION',
          decision_id: decision_id
        });

        processedPositions.add(ptc.id);
        processedModels.add(model_id);
        processedDecisionIds.add(decision_id);
      }
    }
  }

  if (results.length === 0) {
    finalOutput = [{
      json: {
        operation: 'NONE',
        reason: decisions.length === 0 ? 'No decisions' : 'No actionable',
        skipped: skippedList,
        currentPrice: currentPrice
      }
    }];
  } else {
    results[0].skipped = skippedList;
    results[0].currentPrice = currentPrice;
    finalOutput = [];
    for (var q = 0; q < results.length; q++) { finalOutput.push({ json: results[q] }); }
  }
}

return finalOutput;
