async function testFireAntDirect() {
  const url = 'https://api.fireant.vn/instruments';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Length: ${text.length}`);
    console.log(`Sample:`, text.substring(0, 500));
  } catch (e: any) {
    console.error('Error detail:', e);
  }
}
testFireAntDirect();
