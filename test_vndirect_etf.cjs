const https = require('https');

function fetchSecureText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false, timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', reject);
  });
}

async function run() {
  try {
    const url = 'https://finfo-api.vndirect.com.vn/v4/stock_prices?q=code:E1VFVN35,FUEVFVND,FUESSVFL,E1VFVN30&size=100';
    const text = await fetchSecureText(url);
    const json = JSON.parse(text);
    console.log("VNDirect raw response for ETFs:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("VNDirect error:", err);
  }
}

run();
