const https = require('https');

function fetchSecureText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      rejectUnauthorized: false,
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', reject);
  });
}

async function run() {
  try {
    const symbol = 'GC=F';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const text = await fetchSecureText(url);
    const json = JSON.parse(text);
    const meta = json?.chart?.result?.[0]?.meta;
    console.log("Yahoo Finance response meta for GC=F:", meta);
  } catch (err) {
    console.error("Error from Yahoo:", err);
  }
}

run();
