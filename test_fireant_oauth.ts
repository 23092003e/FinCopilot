async function testTokenEndpoint() {
  const url = 'https://api.fireant.vn/connect/token';
  try {
    const bodies = [
      'grant_type=client_credentials',
      'grant_type=password&username=test&password=test'
    ];
    for (const body of bodies) {
      console.log(`\nTesting: ${body}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://fireant.vn/'
        },
        body: body
      });
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Response:`, text);
    }
  } catch (e: any) {
    console.error('Error:', e);
  }
}
testTokenEndpoint();
