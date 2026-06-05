async function testSSI() {
  const url = 'https://iboardquery.ssi.com.vn/stock/realtime?symbols=E1VFVN30,FUEVFVND,FUESSVFL,FUEMAV30,FUEKIV30,FUEVN100,FUESSV30,FUESSV50,FUETFID,FUETCMID';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://iboard.ssi.com.vn/',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response length: ${text.length}`);
    console.log(`Response sample:`, text.substring(0, 1000));
  } catch (e: any) {
    console.error('Error detail:', e);
    if (e.cause) console.error('Cause:', e.cause);
  }
}
testSSI();
