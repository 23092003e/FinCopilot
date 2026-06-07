const http = require('http');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    const data = await fetchJson('http://localhost:3000/api/market-prices');
    console.log("Local API /api/prices:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error calling /api/prices:", err);
  }
}

run();
