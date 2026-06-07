const https = require('https');

function fetchSecureText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false, timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', reject);
  });
}

async function run() {
  try {
    const url = 'https://apipub.tcbs.com.vn/api/v1/stock/pre/homepage/list/realtime?tickers=E1VFVN30,FUEVFVND,FUESSVFL';
    const text = await fetchSecureText(url);
    console.log("TCBS raw response text:", text);
  } catch (err) {
    console.error("Error from TCBS:", err);
  }
}

run();
