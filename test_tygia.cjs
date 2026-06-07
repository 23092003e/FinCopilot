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

function normalizeToVndPerLuong(val) {
  if (!val || isNaN(val) || val <= 0) return 0;
  if (val > 3000000 && val < 5500000) {
    return val * 20;
  }
  if (val >= 6000000 && val < 11000000) {
    return val * 10;
  }
  if (val >= 12000000 && val < 22000000) {
    return val * 5;
  }
  if (val >= 30000000 && val < 55000000) {
    return val * 2;
  }
  return val;
}

async function run() {
  try {
    const text = await fetchSecureText('https://www.tygia.com/json.php?db=gold');
    console.log("Raw Tygia content length:", text.length);
    if (text.startsWith('{')) {
      const parsed = JSON.parse(text);
      let found = [];
      if (parsed && parsed.golds) {
        parsed.golds.forEach(g => {
          const items = g.items || g.value || [];
          items.forEach(item => {
            const name = item.name || item.type || '';
            const sellRaw = String(item.sell || item.sell_price || '').replace(/[^\d]/g, '');
            const sellVal = parseFloat(sellRaw) * 1000;
            const normalized = normalizeToVndPerLuong(sellVal);
            found.push({ name, sellRaw, sellVal, normalized });
          });
        });
      }
      console.log("Parsed items from tygia.com:", found.slice(0, 30));
    } else {
      console.log("Response does not start with {", text.slice(0, 200));
    }
  } catch (err) {
    console.error("Error fetching tygia.com:", err);
  }
}

run();
