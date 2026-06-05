async function testRootEndpoints() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://fireant.vn/',
    'Origin': 'https://fireant.vn'
  };

  const urls = [
    'https://api.fireant.vn/quotes?symbols=E1VFVN30,FUEVFVND',
    'https://api.fireant.vn/quotes/E1VFVN30',
    'https://api.fireant.vn/quote?symbol=E1VFVN30',
    'https://api.fireant.vn/quote/E1VFVN30',
    'https://api.fireant.vn/symbols/E1VFVN30',
    'https://api.fireant.vn/instruments/E1VFVN30',
    'https://api.fireant.vn/historical?symbol=E1VFVN30',
    'https://api.fireant.vn/historical/E1VFVN30',
    'https://api.fireant.vn/fundamental?symbol=E1VFVN30',
    'https://api.fireant.vn/fundamental/E1VFVN30'
  ];
  
  for (const url of urls) {
    console.log(`Querying: ${url}`);
    try {
      const res = await fetch(url, { headers });
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Response (first 200 chars):`, text.substring(0, 200));
    } catch (e: any) {
      console.error(`Failed:`, e.message);
    }
  }
}

testRootEndpoints();
