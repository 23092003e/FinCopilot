const https = require('https');

function fetchSecureText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      rejectUnauthorized: false,
      timeout: 8000
    }, (res) => {
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
    const xmlText = await fetchSecureText('https://sjc.com.vn/xml/tygiagold.xml');
    console.log("Raw SJC text preview:", xmlText.slice(0, 500));
    const itemRegex = /<item\s+([^>]+)>/gi;
    let match;
    let found = [];
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const attrs = match[1];
      const typeMatch = /type="([^"]+)"/i.exec(attrs);
      const buyMatch = /buy="([^"]+)"/i.exec(attrs);
      const sellMatch = /sell="([^"]+)"/i.exec(attrs);
      
      if (typeMatch && buyMatch && sellMatch) {
        const type = typeMatch[1].trim();
        const sellRaw = sellMatch[1].trim().replace(/\./g, ''); 
        const sellVal = parseFloat(sellRaw) * 1000;              
        const normalizedVal = normalizeToVndPerLuong(sellVal);
        found.push({ type, sellRaw, sellVal, normalizedVal });
      }
    }
    console.log("Parsed SJC values:", found);
  } catch (err) {
    console.error("Error fetching SJC XML:", err);
  }
}

run();
