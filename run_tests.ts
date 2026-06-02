import fetch from 'node-fetch';

async function runTests() {
  const baseUrl = 'http://127.0.0.1:3000';
  const testToken = 'fc_test_token_12345';
  let passedCount = 0;
  let failedCount = 0;

  function printResult(testName: string, success: boolean, detail: string = '') {
    if (success) {
      console.log(`\x1b[32m[PASS]\x1b[0m ${testName} ${detail ? `(${detail})` : ''}`);
      passedCount++;
    } else {
      console.error(`\x1b[31m[FAIL]\x1b[0m ${testName} - ${detail}`);
      failedCount++;
    }
  }

  console.log('\n=========================================');
  console.log('  STARTING FINCOPILOT AUTOMATED TESTS   ');
  console.log('=========================================\n');

  // Test 1: Check server health / connection
  try {
    const res = await fetch(`${baseUrl}/api/market-prices`);
    if (res.ok) {
      printResult('Server Connectivity', true, 'Connected successfully to dev server.');
    } else {
      printResult('Server Connectivity', false, `Status code: ${res.status}`);
    }
  } catch (error: any) {
    printResult('Server Connectivity', false, `Cannot talk to dev server: ${error.message}`);
    console.log('Make sure dev server is running.');
    return;
  }

  // Test 2: Market Prices Shape & Inclusions
  try {
    const res = await fetch(`${baseUrl}/api/market-prices`);
    const data = await res.json() as any;
    
    // Check key ETFs
    const hasETFs = ['E1VFVN30', 'FUEVFVND', 'FUESSVFL'].every(sym => data[sym] && data[sym].price_vnd > 0);
    // Check Gold Categories
    const hasGold = ['GOLD_TA_9999', 'GOLD_SJC'].every(sym => data[sym] && data[sym].price_vnd > 0);

    if (hasETFs && hasGold) {
      printResult('Market Prices API Data Scheme', true, 'Contains both ETF and Gold benchmarks with non-zero prices.');
    } else {
      printResult('Market Prices API Data Scheme', false, 'Missing key ETF or Gold symbol details.');
    }
  } catch (error: any) {
    printResult('Market Prices API Data Scheme', false, error.message);
  }

  // Test 3: Webhook Endpoint - Validation checking
  try {
    const res = await fetch(`${baseUrl}/api/webhook/transaction?token=${testToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'invalid_type', // Invalid category/type
        amount_vnd: 5000000
      })
    });
    if (res.status === 400 || res.status === 401) {
      printResult('Webhook Input Validation - Invalid Type', true, 'Correctly flagged bad transaction type as error.');
    } else {
      printResult('Webhook Input Validation - Invalid Type', false, `Returned unexpected status code: ${res.status}`);
    }
  } catch (error: any) {
    printResult('Webhook Input Validation - Invalid Type', false, error.message);
  }

  // Test 4: Webhook Endpoint - Valid transaction submission
  try {
    const payload = [
      { type: 'income', amount_vnd: 25000000, description: 'Lương tháng 6', category: 'Lương' },
      { type: 'investment', amount_vnd: 5000000, description: 'Mua ETF E1VFVN30', category: 'Chứng chỉ quỹ ETF' }
    ];
    const res = await fetch(`${baseUrl}/api/webhook/transaction?token=${testToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json() as any;
    if (res.ok && data.success && data.count === 2) {
      printResult('Webhook Transaction Queue Addition', true, 'Added 2 valid transactions to token queue.');
    } else {
      printResult('Webhook Transaction Queue Addition', false, `Submit failed: ${JSON.stringify(data)}`);
    }
  } catch (error: any) {
    printResult('Webhook Transaction Queue Addition', false, error.message);
  }

  // Test 5: Webhook Queue retrieval
  try {
    const res = await fetch(`${baseUrl}/api/webhook/pending?token=${testToken}`);
    const data = await res.json() as any;
    if (res.ok && data.transactions && data.transactions.length === 2) {
      printResult('Webhook Queue Fetching', true, 'Retrieved active pending queue correctly.');
    } else {
      printResult('Webhook Queue Fetching', false, `Retrieved incorrect queue size: ${data.transactions?.length}`);
    }
  } catch (error: any) {
    printResult('Webhook Queue Fetching', false, error.message);
  }

  // Test 6: Webhook Queue clear
  try {
    const resClear = await fetch(`${baseUrl}/api/webhook/clear?token=${testToken}`, { method: 'POST' });
    const resGet = await fetch(`${baseUrl}/api/webhook/pending?token=${testToken}`);
    const dataGet = await resGet.json() as any;
    if (resClear.ok && dataGet.transactions && dataGet.transactions.length === 0) {
      printResult('Webhook Queue Clearance', true, 'Cleared active token queue successfully.');
    } else {
      printResult('Webhook Queue Clearance', false, 'Failed to wipe token transaction queue.');
    }
  } catch (error: any) {
    printResult('Webhook Queue Clearance', false, error.message);
  }

  // Test 7: Advisor AI Allocation Model
  try {
    const profile = {
      total_savings_vnd: 50000000,
      monthly_expenses_vnd: 12000000,
      has_debt: false,
      risk_tolerance: 'moderate',
      career_field: 'software'
    };
    const res = await fetch(`${baseUrl}/api/ai/allocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    const data = await res.json() as any;
    const hasKeys = data.allocation && data.allocation.emergency_fund && data.overall_reasoning;
    if (res.ok && hasKeys) {
      printResult('AI Advisor Allocation Generator', true, 'Returns correct asset structure with reasoning.');
    } else {
      printResult('AI Advisor Allocation Generator', false, 'Missing overall reasoning or target category percentages.');
    }
  } catch (error: any) {
    printResult('AI Advisor Allocation Generator', false, error.message);
  }

  // Test 8: Side Hustle Idea Generator
  try {
    const res = await fetch(`${baseUrl}/api/ai/side-hustle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skills: ['Typescript', 'React', 'Framer'],
        career_field: 'software',
        monthly_free_hours: 40
      })
    });
    const data = await res.json() as any;
    if (res.ok && data.ideas && data.ideas.length > 0) {
      printResult('AI Side Hustle Suggestion Engine', true, 'Suggested valid side business opportunities.');
    } else {
      printResult('AI Side Hustle Suggestion Engine', false, 'No suggestions generated.');
    }
  } catch (error: any) {
    printResult('AI Side Hustle Suggestion Engine', false, error.message);
  }

  // Test 9: Monthly review tracker
  try {
    const res = await fetch(`${baseUrl}/api/ai/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        income: 30000000,
        expenses: 12000000,
        invested: 8000000,
        notes: 'Tháng này có du lịch bụi'
      })
    });
    const data = await res.json() as any;
    if (res.ok && data.review && data.review.length > 100) {
      printResult('AI Personal Monthly Advisor', true, 'Gave thorough Vietnamese advice analysis.');
    } else {
      printResult('AI Personal Monthly Advisor', false, 'Failed or short response.');
    }
  } catch (error: any) {
    printResult('AI Personal Monthly Advisor', false, error.message);
  }

  console.log('\n=========================================');
  console.log(`  TEST RUN STATUS: Passed ${passedCount} / Failed ${failedCount} `);
  console.log('=========================================\n');
}

runTests();
