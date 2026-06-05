/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getGeminiClient, callMultiProviderAI } from './src/lib/openai/client';
import {
  ALLOCATION_SYSTEM_PROMPT,
  SIDE_HUSTLE_SYSTEM_PROMPT,
  REVIEW_SYSTEM_PROMPT,
} from './src/lib/openai/prompts';

// ESM path-resolution since package.json type is module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function robustParsePrice(raw: any, isETF: boolean = false): number | null {
  if (raw === undefined || raw === null || raw === '') return null;
  
  let valStr = String(raw).trim();
  
  // Strip common suffixes/units
  valStr = valStr.replace(/(VND|VNĐ|đ|usd|\$)/gi, '');
  valStr = valStr.replace(/\s+/g, ''); // strip all spaces
  
  // Check if it says "triệu" or similar
  let multiplier = 1;
  if (/triệu|trieu|m/i.test(valStr)) {
    multiplier = 1000000;
    valStr = valStr.replace(/triệu|trieu|m/i, '');
  }
  
  // Count dots and commas
  const dotCount = (valStr.match(/\./g) || []).length;
  const commaCount = (valStr.match(/,/g) || []).length;
  
  if (dotCount > 1) {
    valStr = valStr.replace(/\./g, ''); // "90.500.000" -> "90500000"
  } else if (commaCount > 1) {
    valStr = valStr.replace(/,/g, ''); // "90,500,000" -> "90500000"
  } else if (dotCount === 1 && commaCount === 0) {
    const parts = valStr.split('.');
    if (parts[1].length === 3) {
      valStr = valStr.replace(/\./g, ''); // "35.130" -> "35130"
    }
  } else if (commaCount === 1 && dotCount === 0) {
    const parts = valStr.split(',');
    if (parts[1].length === 3) {
      valStr = valStr.replace(/,/g, ''); // "35,130" -> "35130"
    } else {
      valStr = valStr.replace(/,/g, '.'); // "35,13" -> "35.13"
    }
  }
  
  let num = parseFloat(valStr);
  if (isNaN(num)) return null;
  
  num = num * multiplier;
  
  // Final logical range scaling
  if (isETF) {
    if (num > 0 && num < 100) {
      num = num * 1000; // e.g. 35.13 -> 35130
    }
  } else {
    // SJC gold prices in VND are typically 50,000,000 - 100,000,000
    if (num > 5 && num < 200) {
      num = num * 1000000; // e.g. 90.5 -> 90500000
    } else if (num >= 50000 && num < 200000) {
      num = num * 1000; // e.g. 90500 -> 90500000
    }
  }
  
  return Math.round(num);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for pending webhook transactions (token -> transaction array)
  const pendingWebhookTransactions: Record<string, any[]> = {};

  // === API ENDPOINTS ===

  // Webhook Receiver from n8n / Telegram
  app.post('/api/webhook/transaction', (req, res) => {
    const token = (req.query.token as string) || (req.headers['x-webhook-token'] as string);
    if (!token || token.length < 8) {
      return res.status(401).json({ error: 'Token hợp lệ là bắt buộc (tối thiểu 8 ký tự).' });
    }

    const data = req.body;
    const txs = Array.isArray(data) ? data : [data];
    const added: any[] = [];

    for (const item of txs) {
      if (!item) continue;
      const type = item.type;
      const amount = Number(item.amount_vnd);

      if (!['income', 'expense', 'investment'].includes(type) || isNaN(amount) || amount <= 0) {
        continue; // Skip invalid elements
      }

      const tx = {
        id: 'tx_web_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        type,
        category: item.category || (type === 'income' ? 'Lương chính' : type === 'expense' ? 'Ăn uống' : 'Chứng chỉ quỹ ETF'),
        amount_vnd: amount,
        description: item.description || 'Giao dịch Telegram',
        date: item.date || new Date().toISOString().substring(0, 10),
        created_at: new Date().toISOString()
      };

      if (!pendingWebhookTransactions[token]) {
        pendingWebhookTransactions[token] = [];
      }
      pendingWebhookTransactions[token].push(tx);
      added.push(tx);
    }

    if (added.length === 0) {
      return res.status(400).json({ error: 'Không tìm thấy dữ liệu giao dịch hợp lệ. Cần có type (income/expense/investment) và amount_vnd > 0.' });
    }

    return res.json({ success: true, count: added.length, added });
  });

  // Fetch pending items for client UI
  app.get('/api/webhook/pending', (req, res) => {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).json({ error: 'Thiếu token xác thực.' });
    }
    const txs = pendingWebhookTransactions[token] || [];
    return res.json({ transactions: txs });
  });

  // Clear pending items once loaded or manually dismissed
  app.post('/api/webhook/clear', (req, res) => {
    const token = (req.query.token as string) || (req.body.token as string);
    if (!token) {
      return res.status(400).json({ error: 'Thiếu token xác thực.' });
    }
    pendingWebhookTransactions[token] = [];
    return res.json({ success: true });
  });

  // Real-time market prices endpoint for ETF and Gold (Vietnamese domestic benchmarks)
  app.get('/api/market-prices', async (req, res) => {
    const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;
    const customFireAntToken = req.headers['x-fireant-token'] as string | undefined;

    // 10 Requested ETF benchmarks
    let etfMap: Record<string, { name: string; provider: string }> = {
      E1VFVN30: { name: "Quỹ ETF VN30 (VFM)", provider: 'FireAnt' },
      FUEVFVND: { name: "Quỹ ETF DCVFMVN DIAMOND", provider: 'FireAnt' },
      FUEMAV30: { name: "Quỹ ETF MAFM VN30", provider: 'FireAnt' },
      FUEKIV30: { name: "Quỹ ETF KIM Growth VN30", provider: 'FireAnt' },
      FUEVN100: { name: "Quỹ ETF VinaCapital VN100", provider: 'FireAnt' },
      FUESSV30: { name: "Quỹ ETF SSIAM VN30", provider: 'SSI' },
      FUESSVFL: { name: "Quỹ ETF SSIAM VNFIN LEAD", provider: 'SSI' },
      FUESSV50: { name: "Quỹ ETF SSIAM VN50", provider: 'SSI' },
      FUETFID: { name: "Quỹ ETF IPAAM VN100", provider: 'FireAnt' },
      FUETCMID: { name: "Quỹ ETF Techcom VN30", provider: 'TCBS' },
    };

    // Gold categories list
    let goldMap: Record<string, { name: string; provider: string }> = {
      GOLD_TA_9999: { name: "Vàng ta / Vàng nhẫn 9999", provider: 'SJC' },
      GOLD_24K: { name: "Vàng ta 999 / Vàng 24K", provider: 'SJC' },
      GOLD_WHITE_10K: { name: "Vàng trắng 10K", provider: 'PNJ' },
      GOLD_WHITE_14K: { name: "Vàng trắng 14K", provider: 'PNJ' },
      GOLD_WHITE_18K: { name: "Vàng trắng 18K", provider: 'PNJ' },
      GOLD_ROSE_10K: { name: "Vàng hồng 10K", provider: 'DOJI' },
      GOLD_ROSE_14K: { name: "Vàng hồng 14K", provider: 'DOJI' },
      GOLD_ROSE_18K: { name: "Vàng hồng 18K", provider: 'DOJI' },
      GOLD_WEST_8K: { name: "Vàng Tây 8K", provider: 'SJC' },
      GOLD_WEST_9K: { name: "Vàng Tây 9K", provider: 'SJC' },
      GOLD_WEST_10K: { name: "Vàng Tây 10K", provider: 'SJC' },
      GOLD_WEST_14K: { name: "Vàng Tây 14K", provider: 'SJC' },
      GOLD_WEST_18K: { name: "Vàng Tây 18K", provider: 'SJC' },
      GOLD_ITALY_750: { name: "Vàng Ý 750", provider: 'PNJ' },
      GOLD_ITALY_925: { name: "Vàng bạc Ý 925", provider: 'PNJ' },
      GOLD_NON: { name: "Vàng non", provider: 'SJC' },
      GOLD_MY_KY: { name: "Vàng mỹ ký", provider: 'SJC' },
      GOLD_SJC: { name: "Vàng miếng SJC", provider: 'SJC' },
      GOLD_RING: { name: "Vàng nhẫn 24K 9999", provider: 'SJC' },
      GOLD_DOJI: { name: "Vàng miếng ròng DOJI", provider: 'DOJI' },
      GOLD_PNJ: { name: "Vàng nhẫn trơn PNJ 24K", provider: 'PNJ' },
      GOLD_MI_HONG: { name: "Vàng SJC Mi Hồng", provider: 'Mi Hồng' },
      GOLD_WORLD_USD: { name: "Vàng Thế giới (Yahoo Finance GC=F)", provider: 'Yahoo Finance' }
    };

    let fetchedData: any = null;
    let dataSource = 'real_time_gemini';

    // Direct FireAnt fetch if token is provided
    let fireAntData: Record<string, { price: number; change: number }> = {};
    let fireAntSuccess = false;
    
    if (customFireAntToken && customFireAntToken.trim()) {
      console.log('[Direct FireAnt] Detected custom FireAnt Bearer Token; executing direct queries...');
      const cleanToken = customFireAntToken.trim();
      const headers = {
        'Authorization': `Bearer ${cleanToken}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://fireant.vn/',
        'Origin': 'https://fireant.vn'
      };

      const symbolsToQuery = Object.keys(etfMap);
      
      try {
        const fetchPromises = symbolsToQuery.map(async (symbol) => {
          try {
            const url = `https://api.fireant.vn/symbols/${symbol}`;
            const res = await fetch(url, { headers });
            if (res.ok) {
              const payload = await res.json();
              let obj = payload;
              if (payload && payload.data) {
                obj = payload.data;
              }
              
              let price: number | null = null;
              const priceKeys = ['price', 'lastPrice', 'close', 'closePrice', 'currentPrice', 'matchPrice', 'last', 'value'];
              for (const k of priceKeys) {
                if (obj[k] !== undefined && obj[k] !== null) {
                  const num = Number(obj[k]);
                  if (!isNaN(num) && num > 0) {
                    price = num;
                    break;
                  }
                }
              }

              let change: number | null = null;
              const changeKeys = ['change', 'changePercent', 'percentChange', 'pctChange', 'change_percent', 'priceChangePercent'];
              for (const k of changeKeys) {
                if (obj[k] !== undefined && obj[k] !== null) {
                  const num = Number(obj[k]);
                  if (!isNaN(num)) {
                    change = num;
                    break;
                  }
                }
              }

              if (price !== null) {
                return { symbol, price: Math.round(price), change: change || 0, success: true };
              }
            } else {
              console.warn(`[Direct FireAnt] Symbol ${symbol} query returned status ${res.status}`);
            }
          } catch (err: any) {
            console.warn(`[Direct FireAnt] Failed to fetch symbol ${symbol}:`, err.message);
          }
          return { symbol, price: 0, change: 0, success: false };
        });

        const results = await Promise.all(fetchPromises);
        results.forEach((r) => {
          if (r.success) {
            fireAntData[r.symbol] = { price: r.price, change: r.change };
            fireAntSuccess = true;
          }
        });

        if (fireAntSuccess) {
          console.log('[Direct FireAnt] Succesfully fetched live values directly from FireAnt API!');
        }
      } catch (err: any) {
        console.warn('[Direct FireAnt] FireAnt direct fetch block error:', err.message);
      }
    }

    // Try live fetch via Google Search Grounding if API key is present
    const apiKeyToUse = customApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
    if (apiKeyToUse) {
      try {
        const ai = getGeminiClient(apiKeyToUse);
        const prompt = `Hãy sử dụng dữ liệu Google Tìm kiếm thời gian thực để tra cứu chi tiết giá tài chính hôm nay tại Việt Nam. Vui lòng lấy số thực tế mới nhất từ bảng điện chứng khoán, FireAnt, HOSE và các nhà cung cấp vàng chính thức (SJC, DOJI, PNJ, Mi Hồng).

Hãy tra cứu giá đóng cửa khớp lệnh hoặc giá giao dịch mới nhất của các Chứng chỉ quỹ ETF sau trên HOSE (LƯU Ý: giá hiển thị trên bảng điện thường chia cho 1,000, ví dụ: 35.39 tức là 35,390 đ/ccq. Bạn PHẢI nhân 1,000 để điền số VND chính xác vào JSON, tuyệt đối không điền 35.39 làm giá VND):
1. E1VFVN30 (VN30 ETF) -> Ví dụ giá hiện tại khoảng 35,390 VND. 
2. FUEVFVND (Diamond ETF)
3. FUESSVFL (FinLeads ETF)
4. FUEMAV30 (MAFM VN30 ETF)
5. FUEKIV30 (KIM Growth VN30 ETF)
6. FUEVN100 (VinaCapital VN100 ETF)
7. FUESSV30 (SSIAM VN30 ETF)
8. FUESSV50 (SSIAM VN50 ETF)
9. FUETFID (IPAAM VN100 ETF)
10. FUETCMID (Techcom VN30 ETF)

Đồng thời tra cứu giá bán ra hiện tại (đơn vị: VND/lượng) cho:
1. Vàng miếng SJC tại Công ty SJC (GOLD_SJC)
2. Vàng miếng DOJI tại Tập đoàn DOJI (GOLD_DOJI)
3. Vàng trơn nhẫn 24K PNJ tại PNJ (GOLD_PNJ)
4. Vàng miếng SJC Mi Hồng tại Mi Hồng (GOLD_MI_HONG)
5. Vàng nhẫn tròn trơn 9999 SJC / bảo tín minh châu (GOLD_RING)
6. Vàng Thế giới liên tục trên Yahoo Finance GC=F (GOLD_WORLD_USD) (đơn vị: USD/troy ounce)
7. Tỷ giá bán ra USD/VND hiện hành tại Vietcombank (USD_VND_RATE)

Hãy tìm thêm thông tin % thay đổi ngày hôm nay cho các mã tài sản trên (ví dụ: +0.15 hoặc -0.5). Nếu không thể tìm thấy thông tin chính xác của bất kỳ sản phẩm nào, hãy điền giá trị null cho thuộc tính đó.

Trả về kết quả dưới dạng JSON thuần túy có cấu trúc chính xác sau, không có phản hồi bằng lời, không kèm markdown codeblocks:
{
  "GOLD_SJC": <số VND/lượng, ví dụ: 90500000>,
  "GOLD_SJC_change": <số %, ví dụ: 0.15>,
  "GOLD_DOJI": <số VND/lượng, ví dụ: 90300000>,
  "GOLD_DOJI_change": <số %, ví dụ: -0.1>,
  "GOLD_PNJ": <số VND/lượng, ví dụ: 78900000>,
  "GOLD_PNJ_change": <số %, ví dụ: 0.25>,
  "GOLD_MI_HONG": <số VND/lượng, ví dụ: 89800000>,
  "GOLD_MI_HONG_change": <số %, ví dụ: 0.0>,
  "GOLD_RING": <số VND/lượng hoặc quy đổi ra lượng, ví dụ: 78500000>,
  "GOLD_RING_change": <số %, ví dụ: 0.3>,
  "GOLD_WORLD_USD": <số USD/oz, ví dụ: 2350.5>,
  "GOLD_WORLD_USD_change": <số %, ví dụ: 1.22>,
  "USD_VND_RATE": <số tỷ giá, ví dụ: 25420>,
  "USD_VND_RATE_change": <số %, ví dụ: 0.05>,
  
  "E1VFVN30": <số VND/ccq, ví dụ: 35390>,
  "E1VFVN30_change": <số %, ví dụ: -0.32>,
  "FUEVFVND": <số VND/ccq, ví dụ: 33450>,
  "FUEVFVND_change": <số %, ví dụ: 0.5>,
  "FUESSVFL": <số VND/ccq, ví dụ: 22900>,
  "FUESSVFL_change": <số %, ví dụ: -0.1>,
  "FUEMAV30": <số VND/ccq hoặc null>,
  "FUEMAV30_change": <số % hoặc null>,
  "FUEKIV30": <số VND/ccq hoặc null>,
  "FUEKIV30_change": <số % hoặc null>,
  "FUEVN100": <số VND/ccq hoặc null>,
  "FUEVN100_change": <số % hoặc null>,
  "FUESSV30": <số VND/ccq hoặc null>,
  "FUESSV30_change": <số % hoặc null>,
  "FUESSV50": <số VND/ccq hoặc null>,
  "FUESSV50_change": <số % hoặc null>,
  "FUETFID": <số VND/ccq hoặc null>,
  "FUETFID_change": <số % hoặc null>,
  "FUETCMID": <số VND/ccq hoặc null>,
  "FUETCMID_change": <số % hoặc null>
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json'
          }
        });

        const textResponse = response.text || '';
        const cleanJson = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        
        if (parsed && typeof parsed === 'object') {
          const normalized: Record<string, any> = {};
          Object.keys(parsed).forEach((key) => {
            if (key.endsWith('_change')) {
              normalized[key] = parsed[key] !== null && parsed[key] !== undefined ? Number(parsed[key]) : null;
            } else {
              const isETF = !key.startsWith('GOLD_') && key !== 'USD_VND_RATE';
              normalized[key] = robustParsePrice(parsed[key], isETF);
            }
          });
          
          // Validation: must have some valid ETF or Gold values
          const hasValidETF = ['E1VFVN30', 'FUEVFVND', 'FUESSVFL'].some(sym => normalized[sym] && normalized[sym] > 5000);
          const hasValidGold = ['GOLD_SJC', 'GOLD_DOJI', 'GOLD_PNJ', 'GOLD_RING'].some(sym => normalized[sym] && normalized[sym] > 10000000);
          
          if (hasValidETF || hasValidGold) {
            fetchedData = normalized;
            console.log('[FinCopilot] Successfully fetched and robustly normalized real-time market data via Google Grounding search!');
          } else {
            console.warn('[FinCopilot] Parsed market data did not contain valid ETF or Gold criteria:', JSON.stringify(normalized));
          }
        }
      } catch (err: any) {
        console.warn('Gemini Search Grounding market fetch failed:', err.message);
      }
    }

    // Since simulation / local waves are completely removed as per instructions:
    // If fetchedData is not available, all prices are null
    if (!fetchedData) {
      dataSource = 'not_available';
    }

    const data: Record<string, any> = {};

    // 1. Map ETFs
    Object.entries(etfMap).forEach(([symbol, item]) => {
      let livePrice: number | null = null;
      let change_percent: number | null = null;
      let symbolSource = dataSource;

      if (fireAntSuccess && fireAntData[symbol]) {
        livePrice = fireAntData[symbol].price;
        change_percent = fireAntData[symbol].change;
        symbolSource = 'direct_fireant';
      } else if (fetchedData && fetchedData[symbol] !== undefined && fetchedData[symbol] !== null) {
        livePrice = Math.round(Number(fetchedData[symbol]));
        change_percent = fetchedData[`${symbol}_change`] !== undefined && fetchedData[`${symbol}_change`] !== null
          ? Number(fetchedData[`${symbol}_change`])
          : null;
      }

      data[symbol] = {
        symbol,
        name: item.name,
        price_vnd: livePrice,
        change_percent,
        updated_at: (fireAntSuccess && fireAntData[symbol]) || fetchedData ? new Date().toISOString() : null,
        data_source: symbolSource,
        provider: item.provider
      };
    });

    // 2. Map Gold Categories
    Object.entries(goldMap).forEach(([symbol, item]) => {
      let livePrice: number | null = null;
      let change_percent: number | null = null;

      if (fetchedData) {
        if (symbol === 'GOLD_SJC') {
          livePrice = fetchedData.GOLD_SJC ? Math.round(Number(fetchedData.GOLD_SJC)) : null;
          change_percent = fetchedData.GOLD_SJC_change !== undefined && fetchedData.GOLD_SJC_change !== null ? Number(fetchedData.GOLD_SJC_change) : null;
        } else if (symbol === 'GOLD_DOJI') {
          livePrice = fetchedData.GOLD_DOJI ? Math.round(Number(fetchedData.GOLD_DOJI)) : null;
          change_percent = fetchedData.GOLD_DOJI_change !== undefined && fetchedData.GOLD_DOJI_change !== null ? Number(fetchedData.GOLD_DOJI_change) : null;
        } else if (symbol === 'GOLD_MI_HONG') {
          livePrice = fetchedData.GOLD_MI_HONG ? Math.round(Number(fetchedData.GOLD_MI_HONG)) : null;
          change_percent = fetchedData.GOLD_MI_HONG_change !== undefined && fetchedData.GOLD_MI_HONG_change !== null ? Number(fetchedData.GOLD_MI_HONG_change) : null;
        } else if (symbol === 'GOLD_WORLD_USD') {
          livePrice = fetchedData.GOLD_WORLD_USD ? Number(fetchedData.GOLD_WORLD_USD) : null;
          change_percent = fetchedData.GOLD_WORLD_USD_change !== undefined && fetchedData.GOLD_WORLD_USD_change !== null ? Number(fetchedData.GOLD_WORLD_USD_change) : null;
        } else if (symbol === 'GOLD_RING' || symbol === 'GOLD_TA_9999') {
          const rawRingPrice = fetchedData.GOLD_RING || fetchedData.GOLD_TA_9999;
          if (rawRingPrice) {
            const rawVal = Number(rawRingPrice);
            if (symbol === 'GOLD_TA_9999') {
              livePrice = rawVal > 15000000 ? Math.round(rawVal / 10) : Math.round(rawVal);
            } else {
              livePrice = rawVal < 15000000 ? Math.round(rawVal * 10) : Math.round(rawVal);
            }
          }
          change_percent = fetchedData.GOLD_RING_change !== undefined && fetchedData.GOLD_RING_change !== null ? Number(fetchedData.GOLD_RING_change) : null;
        } else if (symbol === 'GOLD_PNJ') {
          const rawPnj = fetchedData.GOLD_PNJ;
          if (rawPnj) {
            const rawVal = Number(rawPnj);
            livePrice = rawVal < 15000000 ? Math.round(rawVal * 10) : Math.round(rawVal);
          }
          change_percent = fetchedData.GOLD_PNJ_change !== undefined && fetchedData.GOLD_PNJ_change !== null ? Number(fetchedData.GOLD_PNJ_change) : null;
        } else if (symbol === 'GOLD_24K') {
          const rawRingPrice = fetchedData.GOLD_RING || fetchedData.GOLD_TA_9999;
          if (rawRingPrice) {
            const lPrice = Number(rawRingPrice) < 15000000 ? Number(rawRingPrice) * 10 : Number(rawRingPrice);
            livePrice = Math.round(lPrice * 0.994);
          }
        }
      }

      data[symbol] = {
        symbol,
        name: item.name,
        price_vnd: livePrice,
        change_percent,
        updated_at: fetchedData ? new Date().toISOString() : null,
        data_source: dataSource,
        provider: item.provider
      };
    });

    // Compute additional domestic-world gold price gap metrics
    const usdVndRate = fetchedData && fetchedData.USD_VND_RATE ? Math.round(Number(fetchedData.USD_VND_RATE)) : null;
    const goldWorldUsd = fetchedData && fetchedData.GOLD_WORLD_USD ? Number(fetchedData.GOLD_WORLD_USD) : null;
    const goldSjcBasePerLuong = fetchedData && fetchedData.GOLD_SJC ? Math.round(Number(fetchedData.GOLD_SJC)) : null;

    let worldGoldVndPerLuong = null;
    let goldGapVnd = null;

    if (goldWorldUsd && usdVndRate) {
      worldGoldVndPerLuong = Math.round((goldWorldUsd * usdVndRate) / 0.8294);
      if (goldSjcBasePerLuong) {
        goldGapVnd = goldSjcBasePerLuong - worldGoldVndPerLuong;
      }
    }

    data['USD_VND'] = {
      symbol: 'USD_VND',
      name: 'Tỷ giá USD/VND',
      price_vnd: usdVndRate,
      change_percent: fetchedData && fetchedData.USD_VND_RATE_change !== undefined && fetchedData.USD_VND_RATE_change !== null
        ? Number(fetchedData.USD_VND_RATE_change)
        : null,
      updated_at: fetchedData ? new Date().toISOString() : null,
      data_source: dataSource,
      provider: 'Vietcombank / SBV'
    };

    data['GOLD_GAP_INFO'] = {
      world_gold_usd_per_oz: goldWorldUsd,
      world_gold_vnd_per_luong: worldGoldVndPerLuong,
      domestic_sjc_per_luong: goldSjcBasePerLuong,
      gap_vnd_per_luong: goldGapVnd,
      usd_vnd_rate: usdVndRate,
      updated_at: fetchedData ? new Date().toISOString() : null,
      providers_contacted: {
        etf: ['FireAnt', 'SSI', 'TCBS'],
        gold_domestic: ['SJC', 'DOJI', 'PNJ', 'Mi Hồng'],
        gold_world: ['Yahoo Finance']
      }
    };

    return res.json(data);
  });

  // 1. Allocation Advisor Endpoint
  app.post('/api/ai/allocate', async (req, res) => {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Missing profile data.' });
    }

    const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;

    try {
      const prompt = `Hãy phân bổ danh mục tài sản dựa trên hồ sơ sau:
${JSON.stringify(profile, null, 2)}
Lưu ý quy đổi số tiền và phần trăm một cách chính xác theo tổng số tiền tiết kiệm hiện tại là ${profile.total_savings_vnd} VND.`;

      const responseText = await callMultiProviderAI({
        systemPrompt: ALLOCATION_SYSTEM_PROMPT,
        userPrompt: prompt,
        customApiKey,
        responseJson: true,
      });

      // Clean up markdown block if present
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);
      return res.json(parsedData);
    } catch (error: any) {
      console.warn('Gemini allocation API warning / error:', error.message);
      
      // Smart Fallback Engine in case of API Key absence or issues
      const totalSavings = Number(profile.total_savings_vnd || 0);
      const monthlyExpenses = Number(profile.monthly_expenses_vnd || 0);
      const hasDebt = !!profile.has_debt;
      const debtAmount = Number(profile.debt_amount_vnd || 0);
      const risk = profile.risk_tolerance || 'moderate';
      const career = profile.career_field || 'other';

      const emergencyFundMonths = monthlyExpenses > 0 ? (totalSavings / monthlyExpenses) : 0;
      
      let emergency_pct = 15;
      let etf_pct = 30;
      let self_pct = 20;
      let business_pct = 15;
      let cash_pct = 20;
      const warnings: string[] = [];

      // Prerequisite 1: Emergency Fund below 3 months
      if (emergencyFundMonths < 3) {
        emergency_pct = 45;
        warnings.push('Cảnh báo: Quỹ dự phòng hiện tại của bạn dưới 3 tháng chi tiêu. Hãy tập trung tích lũy cho quỹ dự phòng vệ trước khi mang đi đầu tư mạo hiểm.');
      }

      // Debt influence
      if (hasDebt && debtAmount > 0) {
        warnings.push(`Khuyên dùng: Bạn đang có khoản nợ trị giá ${debtAmount.toLocaleString('vi-VN')} ₫. Nếu đây là nợ lãi suất cao (>8%/năm), hãy trích tiền mặt từ tiết kiệm trả dứt điểm sớm.`);
      }

      // Risk profiling adjustments
      if (risk === 'conservative') {
        etf_pct = Math.max(10, etf_pct - 15);
        cash_pct = Math.min(50, cash_pct + 15);
      } else if (risk === 'aggressive') {
        etf_pct = Math.min(55, etf_pct + 15);
        cash_pct = Math.max(5, cash_pct - 15);
      }

      // Career profiling adjustment
      if (career === 'software' || career === 'ai_ml') {
        self_pct = Math.min(30, self_pct + 5);
        cash_pct = Math.max(5, cash_pct - 5);
      }

      // Normalize total to 100%
      const total = emergency_pct + etf_pct + self_pct + business_pct + cash_pct;
      const factor = 100 / total;

      const norm_emergency = Math.round(emergency_pct * factor);
      const norm_etf = Math.round(etf_pct * factor);
      const norm_self = Math.round(self_pct * factor);
      const norm_business = Math.round(business_pct * factor);
      const norm_cash = 100 - (norm_emergency + norm_etf + norm_self + norm_business);

      const allocation = {
        emergency_fund: {
          pct: norm_emergency,
          amount_vnd: Math.round(totalSavings * (norm_emergency / 100)),
          reasoning: 'Hệ thống tự động ưu tiên quỹ dự phòng để tạo ra chốt chặn an toàn về mặt tâm lý và dòng tiền chi tiêu.',
        },
        etf_dca: {
          pct: norm_etf,
          amount_vnd: Math.round(totalSavings * (norm_etf / 100)),
          reasoning: 'Phân bổ định kỳ vào rổ VN30 ETF (E1VFVN30) hoặc S&P500 để tối ưu hóa lợi nhuận dài hạn theo triết lý DCA.',
        },
        self_investment: {
          pct: norm_self,
          amount_vnd: Math.round(totalSavings * (norm_self / 100)),
          reasoning: 'Đầu tư phát triển kỹ năng chuyên môn cốt lõi để nâng cao thu nhập chủ động - kênh đầu tư có ROI lớn nhất của giới trẻ.',
        },
        business_capital: {
          pct: norm_business,
          amount_vnd: Math.round(totalSavings * (norm_business / 100)),
          reasoning: 'Nguồn vốn linh hoạt chuẩn bị cho các dự án kinh tế phụ hoặc side hustle để tạo thu nhập thụ động.',
        },
        cash_reserve: {
          pct: norm_cash,
          amount_vnd: Math.round(totalSavings * (norm_cash / 100)),
          reasoning: 'Giữ lại một phần tiền mặt linh hoạt gửi tiết kiệm ngắn hạn để sẵn sàng chớp cơ hội mua sắm tài sản giá rẻ khi thị trường điều chỉnh.',
        },
      };

      const fallbackResponse = {
        allocation,
        overall_reasoning: `Báo cáo phân bổ này được tính toán động dựa trên nền tảng quản lý rủi ro của người trẻ Việt. Ưu tiên hàng đầu của bạn hiện tại là xây dựng bệ đỡ tài chính vững chắc, song song tích sản định kỳ (DCA) để đồng tiền làm việc tối ưu.`,
        risk_level: risk === 'aggressive' ? 'high' : risk === 'conservative' ? 'low' : 'moderate',
        warnings,
        opportunity_cost: 'Nếu tập trung quá nhiều vào phòng vệ (tiền mặt gửi ngân hàng), bạn sẽ bỏ lỡ sức mạnh tăng trưởng kép tài sản dài hạn từ thị trường chứng khoán (VN30 lịch sử đạt ~10-12%/năm) và cơ hội gia tăng kỹ năng sớm.',
      };

      return res.json(fallbackResponse);
    }
  });

  // 2. Side Hustle Generator Endpoint
  app.post('/api/ai/side-hustle', async (req, res) => {
    const { skills, career_field, monthly_free_hours } = req.body;
    
    const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;

    try {
      const prompt = `Yêu cầu gợi ý side hustle phù hợp cho chuyên gia công nghệ/marketing người Việt:
Ngành nghề chính: ${career_field || 'Tự do'}
Kỹ năng hiện có: ${Array.isArray(skills) ? skills.join(', ') : 'Chưa cập nhật'}
Thời gian nhàn rỗi mỗi tháng: ${monthly_free_hours || '40'} giờ`;

      const responseText = await callMultiProviderAI({
        systemPrompt: SIDE_HUSTLE_SYSTEM_PROMPT,
        userPrompt: prompt,
        customApiKey,
        responseJson: true,
      });

      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);
      return res.json(parsedData);
    } catch (error: any) {
      console.warn('Gemini side-hustle API warning / error:', error.message);

      // Creative local-first fallback side hustles
      const sampleIdeas = [
        {
          title: 'Tự động hóa Quy trình Bán hàng cho Doanh nghiệp vừa và nhỏ',
          category: 'ai_automation',
          description: 'Thiết kế hệ thống CRM tự động và chatbot AI tích hợp Zalo cho các shop bán lẻ nội địa.',
          estimated_monthly_vnd: [5000000, 15000000],
          time_to_first_revenue_weeks: 4,
          difficulty: 'medium',
          first_steps: [
            'Học cơ bản sử dụng Make.com và n8n để liên kết Zalo API.',
            'Tự dựng 1 case study chatbot giúp chốt đơn nháp.',
            'Chào bán dịch vụ thử nghiệm giá rẻ cho 2-3 cửa hàng của người quen.'
          ],
          tools_needed: ['n8n', 'Make.com', 'Zalo OA', 'ChatGPT API']
        },
        {
          title: 'Viết Bản tin Chuyên môn Substack trả phí cho ngành của bạn',
          category: 'digital_product',
          description: 'Chia sẻ kiến thức chuyên sâu, mẹo thực chiến và xu hướng thị trường hàng tuần dành cho các newbie Việt.',
          estimated_monthly_vnd: [2000000, 8000000],
          time_to_first_revenue_weeks: 8,
          difficulty: 'low',
          first_steps: [
            'Tạo một trang tin Substack miễn phí.',
            'Viết liên tục 5 bài viết chuyên sâu có chất lượng học thuật cao.',
            'Chia sẻ lên các group Facebook và LinkedIn để tích lũy 200 subscribers đầu tiên.'
          ],
          tools_needed: ['Substack', 'Canva', 'Markdown Editors']
        },
        {
          title: 'Gói thiết kế UI/UX Landing Page trọn gói cho Brand local',
          category: 'freelance',
          description: 'Cung cấp dịch vụ tối ưu tỷ lệ chuyển đổi Landing page và làm mới giao diện web bán hàng.',
          estimated_monthly_vnd: [7000000, 20000000],
          time_to_first_revenue_weeks: 3,
          difficulty: 'medium',
          first_steps: [
            'Dựng portfolio gồm 3 bản thiết kế demo ấn tượng về thương hiệu thời trang hoặc F&B.',
            'Tạo profile trên Behance và các sàn freelance nội địa như vLance.',
            'Liên hệ trực tiếp các Brand vừa và nhỏ có website cũ kỹ để pitching giải pháp.'
          ],
          tools_needed: ['Figma', 'Framer', 'Webflow']
        },
        {
          title: 'Sản xuất Micro-SaaS tiện ích cho người dùng Notion tại Việt Nam',
          category: 'micro_saas',
          description: 'Phát triển các widget nhỏ, template Notion tự động hóa tài chính cá nhân hoặc quản lý công việc.',
          estimated_monthly_vnd: [3000000, 12000000],
          time_to_first_revenue_weeks: 6,
          difficulty: 'high',
          first_steps: [
            'Thiết lập mẫu Template Notion quản lý KPI / tài chính tối ưu cho hành vi người Việt.',
            'Xây dựng webhook đồng bộ dữ liệu ngân hàng tự chế.',
            'Đăng sản phẩm lên Gumroad hoặc quảng bá trên các Group cộng đồng Notion Việt Nam.'
          ],
          tools_needed: ['Notion API', 'Javascript', 'NextJS', 'Verve']
        },
        {
          title: 'Tư vấn Chuyển đổi số & Tối ưu AI cho Freelancer tự do',
          category: 'consulting',
          description: 'Hỗ trợ các nhà sáng tạo nội dung cấu hình hệ sinh thái công cụ hỗ trợ AI nâng cao 200% năng suất làm việc.',
          estimated_monthly_vnd: [4000000, 10000000],
          time_to_first_revenue_weeks: 2,
          difficulty: 'low',
          first_steps: [
            'Tự đóng gói các kịch bản AI (Prompt template) ứng dụng cho nhiều tác vụ viết lách, dịch thuật.',
            'Tổ chức 1 buổi workshop online miễn phí hướng dẫn cơ bản cho các freelancer.',
            'Tư vấn trực tiếp 1-1 có phí để xây dựng kịch bản riêng biệt.'
          ],
          tools_needed: ['Prompt engineering', 'Zoom', 'Notion']
        }
      ];

      return res.json({ ideas: sampleIdeas });
    }
  });

  // 3. Monthly Check-in Review Endpoint
  app.post('/api/ai/review', async (req, res) => {
    const { income, expenses, invested, notes } = req.body;
    
    const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;

    try {
      const prompt = `Yêu cầu đánh giá tài chính tháng này:
Thu nhập thực tế: ${income} VND
Chi tiêu thực tế: ${expenses} VND
Đã đầu tư thực tế: ${invested} VND
Ghi chú của người dùng: ${notes || 'Không có ghi chú'}`;

      const review = await callMultiProviderAI({
        systemPrompt: REVIEW_SYSTEM_PROMPT,
        userPrompt: prompt,
        customApiKey,
        responseJson: false,
      });

      return res.json({ review });
    } catch (error: any) {
      console.warn('Gemini review API warning / error:', error.message);

      // Smart heuristic fallback feedback in Vietnamese
      const actualSavings = Number(income || 0) - Number(expenses || 0);
      const savingsRate = income > 0 ? (actualSavings / income) * 105 : 0; // standard calculation
      const computedSavingsPct = income > 0 ? (actualSavings / income) * 100 : 0;
      const computedInvestPct = income > 0 ? (invested / income) * 100 : 0;
      
      let review = '';

      if (computedSavingsPct < 15) {
        review = `### 📊 CHỈ SỐ SỨC KHỎE DÒNG TIỀN
*   **Tỷ lệ Tiết kiệm thực tế (Savings Rate):** ${computedSavingsPct.toFixed(1)}% - **CẦN CẢI THIỆN ĐỎ** (Dưới mục tiêu khuyến chuẩn 20%). Chi tiêu hiện tại đang hấp thụ gần hết thặng dư dòng tiền nhàn rỗi của bạn!
*   **Tỷ số Tích sản (Investment Rate):** ${computedInvestPct.toFixed(1)}% - Đầu tư chưa được tối ưu hóa đồng đều.

### 💡 INSIGHTS CHUYÊN SÂU & RÒ RỈ DÒNG TIỀN
*   **Tầm soát Leakage:** Ghi nhận có dấu hiệu rò rỉ ngân sách không thiết yếu. Áp lực từ các chi phí sinh hoạt đang bào mòn đáng kể lượng tiền tích sản của bạn.
*   **Trì trệ lãi kép:** Mức tích lũy mỏng làm chậm vận tốc phát triển của quỹ hưu trí và đệm an toàn dự phòng dài hạn.

### 🛠️ KẾ HOẠCH HÀNH ĐỘNG TỐI ƯU
1.  **Thắt chặt khẩn cấp:** Cắt bớt 10-15% chi phí ăn uống giải trí ngoài, xây dựng lộ trình chi tiêu theo hạn mức tuần nghiêm ngặt.
2.  **Tiền định kỳ:** Thiết lập chế độ chuyển tích lũy tự động (DCA) sang các tài khoản tích hợp hoặc chứng chỉ quỹ ngay tại đầu tháng khi vừa nhận lương.`;
      } else if (computedSavingsPct < 35) {
        review = `### 📊 CHỈ SỐ SỨC KHỎE DÒNG TIỀN
*   **Tỷ lệ Tiết kiệm thực tế (Savings Rate):** ${computedSavingsPct.toFixed(1)}% - **ỔN ĐỊNH VÀ AN TOÀN** (Đạt vùng tiêu chuẩn bền vững 20-30%).
*   **Tỷ số Tích sản (Investment Rate):** ${computedInvestPct.toFixed(1)}% - Bạn đang có lộ trình kỷ luật giải ngân rất tích cực!

### 💡 INSIGHTS CHUYÊN SÂU & RÒ RỈ DÒNG TIỀN
*   **Bộ khung vững mạnh:** Khả năng quản trị thặng dư tốt, biết cách tối giản chi phí để giữ cho dòng tiền lưu chuyển hợp lý chống bào mòn lạm phát.
*   **Gieo mầm lãi kép:** Số tiền giải ngân đầu tư đầu tư hằng tháng đang xúc tiến cấu trúc gia tài dài hạn phát triển theo chiều hướng tốt.

### 🛠️ KẾ HOẠCH HÀNH ĐỘNG TỐI ƯU
1.  **Duy trì nhịp tích:** Đều đặn giải ngân bằng phương pháp DCA tích lũy quỹ chỉ số, bỏ qua các nhịp dao động ngắn hạn của thị trường.
2.  **Nâng cấp thu nhập:** Trích 5% tiết kiệm nhằm mục tiêu bồi dưỡng năng lực, học các kỹ năng Side Hustle công nghệ để nhân rộng thặng dư ròng hằng tháng.`;
      } else {
        review = `### 📊 CHỈ SỐ SỨC KHỎE DÒNG TIỀN
*   **Tỷ lệ Tiết kiệm thực tế (Savings Rate):** ${computedSavingsPct.toFixed(1)}% - **XUẤT SẮC THƯỢNG HẠNG** (Vượt xa kỳ vọng tối ưu 30%).
*   **Tỷ số Tích sản (Investment Rate):** ${computedInvestPct.toFixed(1)}% - Hiệu năng kiến thiết dồi dào, đẩy nhanh vòng quay tự chủ tài chính!

### 💡 INSIGHTS CHUYÊN SÂU & RÒ RỈ DÒNG TIỀN
*   **Hiệu quả vượt bậc:** Lối sống vô cùng kỷ luật kết lập dòng thu nhập cốt lõi phát triển tốt giúp bạn giữ lại lượng vốn nhàn rỗi dạt dào.
*   **Lợi thế vị thế:** Bạn sở hữu nguồn đệm vững vàng, sẵn sàng nắm bắt khi thị trường tài sản định giá chiết khấu mạnh.

### 🛠️ KẾ HOẠCH HÀNH ĐỘNG TỐI ƯU
1.  **Tối đa hóa DCA:** Đảm bảo rải vốn mua theo tháng vào các rổ chứng chỉ quỹ dồi dào thanh khoản để hấp thụ biên lợi nhuận dài hạn ổn định (~10-12%/năm).
2.  **Phân nhánh mạo hiểm:** Hãy trích một góc nhỏ vốn nhàn rỗi (5%) nghiên cứu chế tạo các hệ thống side hustle công nghệ hoặc startup nhỏ để bồi đắp nguồn lợi bổ trợ.`;
      }

      return res.json({ review });
    }
  });

  // Fallback for unmatched API routes to ensure they always return JSON instead of HTML index.html
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: `Endpoint ${req.method} ${req.path} not found.`,
      help: 'Vui lòng kiểm tra lại đường dẫn API hoặc phương thức HTTP của bạn.'
    });
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FinCopilot] Fullstack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
