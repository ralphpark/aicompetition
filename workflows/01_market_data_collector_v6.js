// ============================================
// Market Data Collector v6.0 - COMPREHENSIVE UPGRADE
// + ADX Percentile Ranking
// + Squeeze Momentum Reversal Detection
// + Volume Divergence & Acceleration
// + ATR-based Adaptive SL/TP Scaling
// + Timeframe-Weighted Trend Scoring
// + Improved Market State Categorization
// + Volatility Regime Detection
// + Dynamic SuperTrend Multiplier
// + Multi-Timeframe Confluence Validation
// ============================================

const SYMBOL = 'BTCUSDT';

async function fetchBinance(endpoint) {
  try {
    const response = await this.helpers.httpRequest({
      method: 'GET',
      url: `https://fapi.binance.com${endpoint}`,
      json: true
    });
    return response;
  } catch (e) {
    console.log('Error fetching ' + endpoint + ':', e.message);
    return null;
  }
}

const [
  klines5m, klines15m, klines1h, klines4h, klines1d,
  funding, ticker, openInterest, openInterestHist,
  longShort5m, topTrader5m,
  longShort15m, topTrader15m,
  longShort1h, topTrader1h,
  longShort4h, topTrader4h
] = await Promise.all([
  fetchBinance.call(this, `/fapi/v1/klines?symbol=${SYMBOL}&interval=5m&limit=50`),
  fetchBinance.call(this, `/fapi/v1/klines?symbol=${SYMBOL}&interval=15m&limit=50`),
  fetchBinance.call(this, `/fapi/v1/klines?symbol=${SYMBOL}&interval=1h&limit=50`),
  fetchBinance.call(this, `/fapi/v1/klines?symbol=${SYMBOL}&interval=4h&limit=50`),
  fetchBinance.call(this, `/fapi/v1/klines?symbol=${SYMBOL}&interval=1d&limit=30`),
  fetchBinance.call(this, `/fapi/v1/premiumIndex?symbol=${SYMBOL}`),
  fetchBinance.call(this, `/fapi/v1/ticker/24hr?symbol=${SYMBOL}`),
  fetchBinance.call(this, `/fapi/v1/openInterest?symbol=${SYMBOL}`),
  fetchBinance.call(this, `/futures/data/openInterestHist?symbol=${SYMBOL}&period=1h&limit=25`),
  fetchBinance.call(this, `/futures/data/globalLongShortAccountRatio?symbol=${SYMBOL}&period=5m&limit=1`),
  fetchBinance.call(this, `/futures/data/topLongShortPositionRatio?symbol=${SYMBOL}&period=5m&limit=1`),
  fetchBinance.call(this, `/futures/data/globalLongShortAccountRatio?symbol=${SYMBOL}&period=15m&limit=1`),
  fetchBinance.call(this, `/futures/data/topLongShortPositionRatio?symbol=${SYMBOL}&period=15m&limit=1`),
  fetchBinance.call(this, `/futures/data/globalLongShortAccountRatio?symbol=${SYMBOL}&period=1h&limit=1`),
  fetchBinance.call(this, `/futures/data/topLongShortPositionRatio?symbol=${SYMBOL}&period=1h&limit=1`),
  fetchBinance.call(this, `/futures/data/globalLongShortAccountRatio?symbol=${SYMBOL}&period=4h&limit=1`),
  fetchBinance.call(this, `/futures/data/topLongShortPositionRatio?symbol=${SYMBOL}&period=4h&limit=1`)
]);

function parseKlines(klines) {
  if (!klines || !Array.isArray(klines) || klines.length === 0) {
    return { opens: [0], highs: [0], lows: [0], closes: [0], volumes: [0], timestamps: [Date.now()] };
  }
  return {
    opens: klines.map(k => parseFloat(k[1])),
    highs: klines.map(k => parseFloat(k[2])),
    lows: klines.map(k => parseFloat(k[3])),
    closes: klines.map(k => parseFloat(k[4])),
    volumes: klines.map(k => parseFloat(k[5])),
    timestamps: klines.map(k => k[0])
  };
}

function getLSRatio(data) {
  if (data && Array.isArray(data) && data.length > 0) return parseFloat(data[0].longShortRatio) || 1.0;
  return 1.0;
}

function calculateEMA(prices, period) {
  if (prices.length === 0) return 0;
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) ema = prices[i] * k + ema * (1 - k);
  return ema;
}

function calculateSMA(prices, period) {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
}

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
  }
  if (avgLoss === 0) return 100;
  return 100 - (100 / (1 + avgGain / avgLoss));
}

function calculateATR(highs, lows, closes, period = 14) {
  if (highs.length < period + 1) return 0;
  const trs = [];
  for (let i = 1; i < highs.length; i++) {
    trs.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i-1]), Math.abs(lows[i] - closes[i-1])));
  }
  return trs.slice(-period).reduce((a, b) => a + b, 0) / period;
}

function calculateMACD(prices) {
  const ema12 = calculateEMA(prices, 12), ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26, signal = calculateEMA(prices.slice(-9), 9);
  return { macd, signal, histogram: macd - signal };
}

function calculateBB(prices, period = 20, stdDev = 2) {
  const sma = calculateSMA(prices, period), slice = prices.slice(-period);
  if (slice.length === 0) return { upper: 0, middle: 0, lower: 0, width: 0 };
  const variance = slice.reduce((sum, p) => sum + Math.pow(p - sma, 2), 0) / period;
  const std = Math.sqrt(variance);
  const upper = sma + (stdDev * std);
  const lower = sma - (stdDev * std);
  return { upper, middle: sma, lower, width: upper - lower };
}

function calculateOBV(closes, volumes) {
  if (closes.length < 2) return 0;
  let obv = 0;
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i-1]) obv += volumes[i];
    else if (closes[i] < closes[i-1]) obv -= volumes[i];
  }
  return obv;
}

// ========== IMPROVEMENT #1: ADX with Percentile Ranking ==========
function calculateADX(highs, lows, closes, period = 14) {
  if (highs.length < period + 1) return { adx: 25, adxPercentile: 50, adxRegime: 'NORMAL' };

  const trs = [], plusDMs = [], minusDMs = [];
  for (let i = 1; i < highs.length; i++) {
    trs.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i-1]), Math.abs(lows[i] - closes[i-1])));
    const upMove = highs[i] - highs[i-1], downMove = lows[i-1] - lows[i];
    plusDMs.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDMs.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }

  let atr = trs.slice(0, period).reduce((a,b) => a+b, 0);
  let plusDM = plusDMs.slice(0, period).reduce((a,b) => a+b, 0);
  let minusDM = minusDMs.slice(0, period).reduce((a,b) => a+b, 0);
  const dxValues = [];

  for (let i = period; i < trs.length; i++) {
    atr = atr - (atr / period) + trs[i];
    plusDM = plusDM - (plusDM / period) + plusDMs[i];
    minusDM = minusDM - (minusDM / period) + minusDMs[i];
    const plusDI = (plusDM / atr) * 100, minusDI = (minusDM / atr) * 100;
    const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
    if (!isNaN(dx)) dxValues.push(dx);
  }

  const adx = dxValues.length > 0 ? dxValues.slice(-period).reduce((a,b) => a+b, 0) / Math.min(dxValues.length, period) : 25;

  // Calculate ADX Percentile vs last 20 ADX values
  const adxHistory = dxValues.slice(-20);
  const sortedADX = [...adxHistory].sort((a, b) => a - b);
  const rank = sortedADX.filter(v => v <= adx).length;
  const adxPercentile = adxHistory.length > 0 ? (rank / adxHistory.length) * 100 : 50;

  // ADX Regime Classification
  let adxRegime = 'NORMAL';
  if (adxPercentile < 30) adxRegime = 'WEAK'; // ADX historically low
  else if (adxPercentile > 70) adxRegime = 'STRONG'; // ADX historically high

  return {
    adx: Math.round(adx * 100) / 100,
    adxPercentile: Math.round(adxPercentile * 100) / 100,
    adxRegime
  };
}

// ========== IMPROVEMENT #2: Squeeze with Reversal Detection ==========
function calculateSqueeze(highs, lows, closes, volumes, period = 20) {
  if (closes.length < period + 5) return {
    squeezeOn: false, squeezePct: 0, squeezeReleasing: false,
    squeezeReleasePct: 0, bbWidthTrend: 0
  };

  const bb = calculateBB(closes, period, 2);
  const bbWidth = bb.width;
  const atr = calculateATR(highs, lows, closes, period);
  const kcWidth = atr * 1.5 * 2;

  // Squeeze ON when BB is inside KC
  const squeezeOn = bbWidth < kcWidth;

  // Squeeze Percentage
  let squeezePct = 0;
  if (kcWidth > 0) {
    squeezePct = Math.max(0, (1 - bbWidth / kcWidth) * 100);
    squeezePct = Math.round(squeezePct * 100) / 100;
  }

  // BB Width Trend (are bands expanding or contracting?)
  const prevBB = calculateBB(closes.slice(0, -1), period, 2);
  const bbWidthTrend = prevBB.width > 0 ? ((bbWidth - prevBB.width) / prevBB.width) * 100 : 0;

  // Squeeze Release Detection: BB expanding while squeeze was on
  const squeezeReleasing = squeezeOn && bbWidthTrend > 10; // 10% expansion

  // Calculate how much squeeze has released (0-100%)
  let squeezeReleasePct = 0;
  if (squeezeReleasing && kcWidth > 0) {
    squeezeReleasePct = Math.min(100, (bbWidth / kcWidth) * 100);
    squeezeReleasePct = Math.round(squeezeReleasePct * 100) / 100;
  }

  return {
    squeezeOn,
    squeezePct,
    squeezeReleasing,
    squeezeReleasePct,
    bbWidthTrend: Math.round(bbWidthTrend * 100) / 100,
    bbWidth: Math.round(bbWidth * 100) / 100
  };
}

// ========== IMPROVEMENT #3: Volume Divergence & Acceleration ==========
function calculateVolumeSentiment(opens, closes, volumes, period = 14) {
  if (closes.length < period + 5) return {
    sentiment: 0, acceleration: 1.0,
    bullishDivergence: false, bearishDivergence: false
  };

  let buyVolume = 0, sellVolume = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    if (closes[i] >= opens[i]) buyVolume += volumes[i];
    else sellVolume += volumes[i];
  }

  const total = buyVolume + sellVolume;
  const sentiment = total === 0 ? 0 : Math.round(((buyVolume - sellVolume) / total) * 100 * 100) / 100;

  // Volume Acceleration: current volume vs 20-period SMA
  const currentVolume = volumes[volumes.length - 1];
  const smaVolume = calculateSMA(volumes, 20);
  const acceleration = smaVolume > 0 ? currentVolume / smaVolume : 1.0;

  // Divergence Detection: Price new high but volume declining
  const recentPrices = closes.slice(-10);
  const recentVolumes = volumes.slice(-10);

  const priceHigh = Math.max(...recentPrices);
  const priceLow = Math.min(...recentPrices);
  const currentPrice = closes[closes.length - 1];

  const volumeTrend = recentVolumes.slice(-3).reduce((a,b) => a+b, 0) / 3;
  const prevVolumeTrend = recentVolumes.slice(-6, -3).reduce((a,b) => a+b, 0) / 3;

  // Bullish Divergence: Price new low but volume declining (weak selling)
  const bullishDivergence = currentPrice === priceLow && volumeTrend < prevVolumeTrend * 0.8;

  // Bearish Divergence: Price new high but volume declining (weak buying)
  const bearishDivergence = currentPrice === priceHigh && volumeTrend < prevVolumeTrend * 0.8;

  return {
    sentiment,
    acceleration: Math.round(acceleration * 100) / 100,
    bullishDivergence,
    bearishDivergence
  };
}

// ========== IMPROVEMENT #8: Dynamic SuperTrend Multiplier ==========
function calculateSuperTrend(highs, lows, closes, adx, period = 10) {
  if (closes.length < period) return { value: closes[closes.length-1], direction: 'NEUTRAL', multiplier: 3 };

  // Dynamic multiplier based on ADX (2.0 to 3.0)
  const multiplier = 2.0 + Math.min(1.0, adx / 50);

  const atr = calculateATR(highs, lows, closes, period);
  const current = closes[closes.length - 1];
  const high = highs[highs.length - 1];
  const low = lows[lows.length - 1];

  const basicLowerBand = ((high + low) / 2) - (multiplier * atr);
  const basicUpperBand = ((high + low) / 2) + (multiplier * atr);

  if (current > basicLowerBand) {
    return {
      value: Math.round(basicLowerBand * 100) / 100,
      direction: 'UP',
      multiplier: Math.round(multiplier * 100) / 100
    };
  }

  return {
    value: Math.round(basicUpperBand * 100) / 100,
    direction: 'DOWN',
    multiplier: Math.round(multiplier * 100) / 100
  };
}

// ========== IMPROVEMENT #4: ATR-based Adaptive SL/TP Scaling ==========
function calculateATRScaling(highs, lows, closes, period = 14) {
  const currentATR = calculateATR(highs, lows, closes, period);

  // Calculate 20-period average ATR
  const atrHistory = [];
  for (let i = period; i < closes.length - period + 1; i++) {
    const historicalATR = calculateATR(
      highs.slice(Math.max(0, i - period), i),
      lows.slice(Math.max(0, i - period), i),
      closes.slice(Math.max(0, i - period), i),
      period
    );
    atrHistory.push(historicalATR);
  }

  const avgATR = atrHistory.length > 0
    ? atrHistory.reduce((a, b) => a + b, 0) / atrHistory.length
    : currentATR;

  const atrRatio = avgATR > 0 ? currentATR / avgATR : 1.0;

  return {
    currentATR: Math.round(currentATR * 100) / 100,
    avgATR: Math.round(avgATR * 100) / 100,
    atrRatio: Math.round(atrRatio * 100) / 100
  };
}

// ========== IMPROVEMENT #7: Volatility Regime Detection ==========
function detectVolatilityRegime(atrScaling) {
  const { atrRatio } = atrScaling;

  let regime = 'NORMAL';
  let positionSizeMultiplier = 1.0;

  if (atrRatio > 1.5) {
    regime = 'VOLATILE';
    positionSizeMultiplier = 0.5; // Reduce position size 50%
  } else if (atrRatio < 0.7) {
    regime = 'CALM';
    positionSizeMultiplier = 1.1; // Increase position size 10%
  }

  return { regime, positionSizeMultiplier };
}

// ========== IMPROVEMENT #5: Timeframe-Weighted Trend Scoring ==========
function calculateTrendScore(indicators, timeframe = '15m') {
  const {
    closes, ema20, ema50, rsi, macd, macdSignal,
    adx, squeezeOn, volumeSentiment, supertrendDirection,
    bullishDivergence, bearishDivergence
  } = indicators;

  if (closes.length === 0) return { score: 0, trend: 'NEUTRAL', confidence: 'LOW' };

  const current = closes[closes.length - 1];
  let score = 0;

  // Timeframe weights: 1h/4h > 15m > 5m
  const timeframeWeight = timeframe === '1h' || timeframe === '4h' ? 1.3
    : timeframe === '15m' ? 1.0
    : 0.7; // 5m has less weight

  // 1. Price vs EMA20 (±15)
  if (current > ema20 * 1.001) score += 15 * timeframeWeight;
  else if (current < ema20 * 0.999) score -= 15 * timeframeWeight;

  // 2. EMA20 vs EMA50 (±15)
  if (ema20 > ema50 * 1.001) score += 15 * timeframeWeight;
  else if (ema20 < ema50 * 0.999) score -= 15 * timeframeWeight;

  // 3. RSI (±20)
  if (rsi > 60) score += 20 * timeframeWeight;
  else if (rsi > 55) score += 10 * timeframeWeight;
  else if (rsi < 40) score -= 20 * timeframeWeight;
  else if (rsi < 45) score -= 10 * timeframeWeight;

  // 4. MACD vs Signal (±15)
  if (macd > macdSignal) score += 15 * timeframeWeight;
  else if (macd < macdSignal) score -= 15 * timeframeWeight;

  // 5. Volume Sentiment (±20)
  if (volumeSentiment > 30) score += 20;
  else if (volumeSentiment > 15) score += 10;
  else if (volumeSentiment < -30) score -= 20;
  else if (volumeSentiment < -15) score -= 10;

  // 6. SuperTrend (±15)
  if (supertrendDirection === 'UP') score += 15 * timeframeWeight;
  else if (supertrendDirection === 'DOWN') score -= 15 * timeframeWeight;

  // 7. Volume Divergence (±10)
  if (bullishDivergence) score += 10;
  if (bearishDivergence) score -= 10;

  // ADX-based confidence
  let confidence = 'LOW', adxMultiplier = 0.5;
  if (adx >= 30) { confidence = 'HIGH'; adxMultiplier = 1.0; }
  else if (adx >= 20) { confidence = 'MEDIUM'; adxMultiplier = 0.75; }

  if (squeezeOn) { confidence = 'LOW'; adxMultiplier = 0.3; }

  const adjustedScore = Math.round(score * adxMultiplier);

  let trend = 'NEUTRAL';
  if (adjustedScore >= 40) trend = 'BULLISH';
  else if (adjustedScore >= 20) trend = 'WEAK_BULLISH';
  else if (adjustedScore <= -40) trend = 'BEARISH';
  else if (adjustedScore <= -20) trend = 'WEAK_BEARISH';

  if (squeezeOn || adx < 15) trend = 'NEUTRAL';

  return {
    score: adjustedScore,
    rawScore: Math.round(score),
    trend,
    confidence,
    timeframeWeight: Math.round(timeframeWeight * 100) / 100
  };
}

function getTrendFromScore(trendData) {
  const { trend } = trendData;
  if (trend === 'BULLISH' || trend === 'WEAK_BULLISH') return 'BULLISH';
  if (trend === 'BEARISH' || trend === 'WEAK_BEARISH') return 'BEARISH';
  return 'NEUTRAL';
}

// ========== IMPROVEMENT #6: Improved Market State Categorization ==========
function detectMarketState(adx, adxPercentile, squeezeData, bb, closes, trend) {
  const { squeezeOn, bbWidthTrend, squeezeReleasing } = squeezeData;

  if (squeezeOn) {
    if (squeezeReleasing) return 'SQUEEZE_RELEASING';
    return 'SQUEEZE';
  }

  // Check if price is bouncing between BB bands (ranging behavior)
  const currentPrice = closes[closes.length - 1];
  const recentPrices = closes.slice(-10);
  const touchedUpper = recentPrices.filter(p => p >= bb.upper * 0.995).length > 0;
  const touchedLower = recentPrices.filter(p => p <= bb.lower * 1.005).length > 0;
  const insideBB = currentPrice > bb.lower && currentPrice < bb.upper;

  // BB Width Contracting = potential range
  const bbContracting = bbWidthTrend < -5; // 5% contraction

  // Improved RANGING detection
  if (adxPercentile < 30 && insideBB && bbContracting) {
    return 'RANGING'; // True range: low ADX + inside BB + contracting bands
  }

  // Support/Resistance bouncing
  if (touchedUpper && touchedLower && insideBB) {
    return 'RANGING'; // Bouncing between bands
  }

  if (adx >= 25) {
    if (trend === 'BULLISH') return 'TRENDING_UP';
    if (trend === 'BEARISH') return 'TRENDING_DOWN';
  }

  return 'WEAK_TREND';
}

// ========== IMPROVEMENT #9: Multi-Timeframe Confluence Validation ==========
function checkConfluence(trend1h, trend4h, trend15m, trend5m) {
  // Hierarchy: 1h/4h = bias, 15m = confirmation, 5m = entry

  const bias1h = trend1h; // Major bias
  const bias4h = trend4h; // Major bias
  const confirm15m = trend15m; // Confirmation
  const entry5m = trend5m; // Entry timing

  let confluenceLevel = 0;
  let confluenceDirection = 'NEUTRAL';

  // Count how many timeframes agree
  const trends = [bias1h, bias4h, confirm15m, entry5m];
  const bullishCount = trends.filter(t => t === 'BULLISH').length;
  const bearishCount = trends.filter(t => t === 'BEARISH').length;

  if (bullishCount >= 3) {
    confluenceLevel = bullishCount;
    confluenceDirection = 'BULLISH';
  } else if (bearishCount >= 3) {
    confluenceLevel = bearishCount;
    confluenceDirection = 'BEARISH';
  } else {
    confluenceLevel = 0;
    confluenceDirection = 'MIXED';
  }

  // v6.1: Require at least 2 timeframes aligned (more flexible)
  const entryAllowed = (
    // 1h + 15m aligned
    (bias1h === confirm15m && bias1h !== 'NEUTRAL' && confirm15m !== 'NEUTRAL') ||
    // 1h + 5m aligned
    (bias1h === entry5m && bias1h !== 'NEUTRAL' && entry5m !== 'NEUTRAL') ||
    // 15m + 5m aligned
    (confirm15m === entry5m && confirm15m !== 'NEUTRAL' && entry5m !== 'NEUTRAL')
  );

  return {
    confluenceLevel,
    confluenceDirection,
    entryAllowed,
    bias1h,
    confirm15m,
    entry5m
  };
}

function calculateComplete(data, timeframe = '15m', adxValue = null) {
  const { opens, highs, lows, closes, volumes } = data;
  const idx = Math.max(0, closes.length - 1);

  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const atr = calculateATR(highs, lows, closes);
  const bb = calculateBB(closes);
  const obv = calculateOBV(closes, volumes);
  const adxData = calculateADX(highs, lows, closes);
  const atrScaling = calculateATRScaling(highs, lows, closes);
  const volatilityRegime = detectVolatilityRegime(atrScaling);
  const squeeze = calculateSqueeze(highs, lows, closes, volumes);
  const volSentiment = calculateVolumeSentiment(opens, closes, volumes);

  // Use provided ADX or calculated ADX
  const finalADX = adxValue !== null ? adxValue : adxData.adx;
  const supertrend = calculateSuperTrend(highs, lows, closes, finalADX);

  const trendScore = calculateTrendScore({
    closes, ema20, ema50, rsi,
    macd: macd.macd, macdSignal: macd.signal,
    adx: adxData.adx, squeezeOn: squeeze.squeezeOn,
    volumeSentiment: volSentiment.sentiment,
    supertrendDirection: supertrend.direction,
    bullishDivergence: volSentiment.bullishDivergence,
    bearishDivergence: volSentiment.bearishDivergence
  }, timeframe);

  const trend = getTrendFromScore(trendScore);
  const marketState = detectMarketState(
    adxData.adx,
    adxData.adxPercentile,
    squeeze,
    bb,
    closes,
    trend
  );

  return {
    close: closes[idx],
    rsi: Math.round(rsi * 100) / 100,
    macd: Math.round(macd.macd * 100) / 100,
    macdSignal: Math.round(macd.signal * 100) / 100,
    macdHistogram: Math.round(macd.histogram * 100) / 100,
    ema20: Math.round(ema20 * 100) / 100,
    ema50: Math.round(ema50 * 100) / 100,
    atr: Math.round(atr * 100) / 100,
    bbUpper: Math.round(bb.upper * 100) / 100,
    bbMiddle: Math.round(bb.middle * 100) / 100,
    bbLower: Math.round(bb.lower * 100) / 100,
    bbWidth: bb.width,
    obv: Math.round(obv),
    adx: adxData.adx,
    adxPercentile: adxData.adxPercentile,
    adxRegime: adxData.adxRegime,
    squeezeOn: squeeze.squeezeOn,
    squeezePct: squeeze.squeezePct,
    squeezeReleasing: squeeze.squeezeReleasing,
    squeezeReleasePct: squeeze.squeezeReleasePct,
    bbWidthTrend: squeeze.bbWidthTrend,
    volumeSentiment: volSentiment.sentiment,
    volumeAcceleration: volSentiment.acceleration,
    bullishDivergence: volSentiment.bullishDivergence,
    bearishDivergence: volSentiment.bearishDivergence,
    supertrend: supertrend.value,
    supertrendDirection: supertrend.direction,
    supertrendMultiplier: supertrend.multiplier,
    atrRatio: atrScaling.atrRatio,
    avgATR: atrScaling.avgATR,
    volatilityRegime: volatilityRegime.regime,
    volatilityPositionMultiplier: volatilityRegime.positionSizeMultiplier,
    trend,
    marketState,
    trendScore: trendScore.score,
    trendConfidence: trendScore.confidence,
    trendScoreRaw: trendScore.rawScore,
    timeframeWeight: trendScore.timeframeWeight
  };
}

const data5m = parseKlines(klines5m);
const data15m = parseKlines(klines15m);
const data1h = parseKlines(klines1h);
const data4h = parseKlines(klines4h);
const data1d = parseKlines(klines1d);

const ind5m = calculateComplete(data5m, '5m');
const ind15m = calculateComplete(data15m, '15m');
const ind1h = calculateComplete(data1h, '1h');
const ind4h = calculateComplete(data4h, '4h');
const ind1d = calculateComplete(data1d, '1d');

// Calculate Multi-Timeframe Confluence
const confluence = checkConfluence(
  ind1h.trend,
  ind4h.trend,
  ind15m.trend,
  ind5m.trend
);

const ls5m = getLSRatio(longShort5m);
const topLs5m = getLSRatio(topTrader5m);
const ls15m = getLSRatio(longShort15m);
const topLs15m = getLSRatio(topTrader15m);
const ls1h = getLSRatio(longShort1h);
const topLs1h = getLSRatio(topTrader1h);
const ls4h = getLSRatio(longShort4h);
const topLs4h = getLSRatio(topTrader4h);

let oiChange = 0;
let currentOI = openInterest ? parseFloat(openInterest.openInterest) || 0 : 0;
if (openInterestHist && Array.isArray(openInterestHist) && openInterestHist.length >= 25) {
  const curr = parseFloat(openInterestHist[openInterestHist.length - 1].sumOpenInterest) || 0;
  const prev = parseFloat(openInterestHist[0].sumOpenInterest) || 0;
  if (prev > 0) oiChange = ((curr - prev) / prev) * 100;
}

let oiChange1h = 0;
if (openInterestHist && Array.isArray(openInterestHist) && openInterestHist.length >= 2) {
  const recent = parseFloat(openInterestHist[openInterestHist.length - 1].sumOpenInterest) || 0;
  const prev = parseFloat(openInterestHist[openInterestHist.length - 2].sumOpenInterest) || 0;
  if (prev > 0) oiChange1h = ((recent - prev) / prev) * 100;
}

let volChange24h = 0;
if (data1h.volumes.length >= 48) {
  const recent = data1h.volumes.slice(-24).reduce((a,b) => a+b, 0);
  const prev = data1h.volumes.slice(-48, -24).reduce((a,b) => a+b, 0);
  if (prev > 0) volChange24h = ((recent - prev) / prev) * 100;
}

const idx5m = Math.max(0, data5m.closes.length - 1);

return [{ json: {
  symbol: 'BTCUSD',
  timeframe: '5m',

  // ========== v6.0 ENHANCEMENTS ==========
  // All improvements integrated across timeframes

  // 5M Primary Data
  open_price: data5m.opens[idx5m],
  high_price: data5m.highs[idx5m],
  low_price: data5m.lows[idx5m],
  close_price: data5m.closes[idx5m],
  volume: data5m.volumes[idx5m],

  // 5M Indicators (Enhanced)
  rsi: ind5m.rsi,
  macd: ind5m.macd,
  macd_signal: ind5m.macdSignal,
  macd_histogram: ind5m.macdHistogram,
  atr: ind5m.atr,
  ema_20: ind5m.ema20,
  ema_50: ind5m.ema50,
  bb_upper: ind5m.bbUpper,
  bb_middle: ind5m.bbMiddle,
  bb_lower: ind5m.bbLower,
  bb_width: ind5m.bbWidth,
  obv: ind5m.obv,

  // ADX with Percentile (Improvement #1)
  adx: ind5m.adx,
  adx_percentile: ind5m.adxPercentile,
  adx_regime: ind5m.adxRegime,

  // Squeeze with Reversal (Improvement #2)
  squeeze_on: ind5m.squeezeOn,
  squeeze_pct: ind5m.squeezePct,
  squeeze_releasing: ind5m.squeezeReleasing,
  squeeze_release_pct: ind5m.squeezeReleasePct,
  bb_width_trend: ind5m.bbWidthTrend,

  // Volume Divergence (Improvement #3)
  volume_sentiment: ind5m.volumeSentiment,
  volume_acceleration: ind5m.volumeAcceleration,
  bullish_divergence: ind5m.bullishDivergence,
  bearish_divergence: ind5m.bearishDivergence,

  // Dynamic SuperTrend (Improvement #8)
  supertrend: ind5m.supertrend,
  supertrend_direction: ind5m.supertrendDirection,
  supertrend_multiplier: ind5m.supertrendMultiplier,

  // ATR Scaling (Improvement #4)
  atr_ratio: ind5m.atrRatio,
  avg_atr: ind5m.avgATR,

  // Volatility Regime (Improvement #7)
  volatility_regime: ind5m.volatilityRegime,
  volatility_position_multiplier: ind5m.volatilityPositionMultiplier,

  // Trend Score (Improvement #5)
  trend_score: ind5m.trendScore,
  trend_score_raw: ind5m.trendScoreRaw,
  trend_confidence: ind5m.trendConfidence,
  timeframe_weight: ind5m.timeframeWeight,

  // Market State (Improvement #6)
  market_state: ind5m.marketState,
  trend_strength_pct: ind5m.adx,

  long_short_ratio: ls5m,
  top_trader_ls_ratio: topLs5m,

  // 15M Data (Enhanced)
  close_15m: ind15m.close,
  rsi_15m: ind15m.rsi,
  macd_15m: ind15m.macd,
  trend_15m: ind15m.trend,
  obv_15m: ind15m.obv,
  adx_15m: ind15m.adx,
  adx_percentile_15m: ind15m.adxPercentile,
  squeeze_15m: ind15m.squeezeOn,
  squeeze_pct_15m: ind15m.squeezePct,
  squeeze_releasing_15m: ind15m.squeezeReleasing,
  volume_sentiment_15m: ind15m.volumeSentiment,
  volume_acceleration_15m: ind15m.volumeAcceleration,
  supertrend_15m: ind15m.supertrend,
  supertrend_direction_15m: ind15m.supertrendDirection,
  supertrend_multiplier_15m: ind15m.supertrendMultiplier,
  ema_20_15m: ind15m.ema20,
  ema_50_15m: ind15m.ema50,
  atr_15m: ind15m.atr,
  atr_ratio_15m: ind15m.atrRatio,
  volatility_regime_15m: ind15m.volatilityRegime,
  bb_upper_15m: ind15m.bbUpper,
  bb_middle_15m: ind15m.bbMiddle,
  bb_lower_15m: ind15m.bbLower,
  long_short_ratio_15m: ls15m,
  top_trader_ls_ratio_15m: topLs15m,
  trend_score_15m: ind15m.trendScore,
  market_state_15m: ind15m.marketState,

  // 1H Data (Enhanced)
  close_1h: ind1h.close,
  rsi_1h: ind1h.rsi,
  macd_1h: ind1h.macd,
  trend_1h: ind1h.trend,
  obv_1h: ind1h.obv,
  adx_1h: ind1h.adx,
  adx_percentile_1h: ind1h.adxPercentile,
  squeeze_1h: ind1h.squeezeOn,
  squeeze_pct_1h: ind1h.squeezePct,
  volume_sentiment_1h: ind1h.volumeSentiment,
  volume_acceleration_1h: ind1h.volumeAcceleration,
  supertrend_1h: ind1h.supertrend,
  supertrend_direction_1h: ind1h.supertrendDirection,
  ema_20_1h: ind1h.ema20,
  ema_50_1h: ind1h.ema50,
  atr_1h: ind1h.atr,
  atr_ratio_1h: ind1h.atrRatio,
  volatility_regime_1h: ind1h.volatilityRegime,
  long_short_ratio_1h: ls1h,
  top_trader_ls_ratio_1h: topLs1h,
  oi_change_1h: Math.round(oiChange1h * 100) / 100,
  trend_score_1h: ind1h.trendScore,

  // 4H Data (Enhanced)
  close_4h: ind4h.close,
  rsi_4h: ind4h.rsi,
  macd_4h: ind4h.macd,
  trend_4h: ind4h.trend,
  adx_4h: ind4h.adx,
  adx_percentile_4h: ind4h.adxPercentile,
  long_short_ratio_4h: ls4h,
  top_trader_ls_ratio_4h: topLs4h,
  trend_score_4h: ind4h.trendScore,

  // Daily
  close_1d: ind1d.close,
  rsi_1d: ind1d.rsi,
  macd_1d: ind1d.macd,
  trend_1d: ind1d.trend,
  obv_1d: ind1d.obv,

  // Multi-Timeframe Confluence (Improvement #9)
  confluence_level: confluence.confluenceLevel,
  confluence_direction: confluence.confluenceDirection,
  entry_allowed: confluence.entryAllowed,

  // Global
  funding_rate: funding ? parseFloat(funding.lastFundingRate) || 0 : 0,
  open_interest: currentOI,
  open_interest_change: Math.round(oiChange * 100) / 100,
  price_change_24h: ticker ? parseFloat(ticker.priceChangePercent) || 0 : 0,
  volume_24h: ticker ? parseFloat(ticker.volume) || 0 : 0,
  volume_change_24h: Math.round(volChange24h * 100) / 100,

  timestamp: new Date(data5m.timestamps[idx5m]).toISOString()
}}];
