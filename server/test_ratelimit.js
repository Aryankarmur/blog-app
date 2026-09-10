import dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
  console.log('--- TEST 1: Rate Limiting ---');
  let successCount = 0;
  let rateLimitedCount = 0;

  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      });

      if (res.status === 401 || res.status === 400) {
        successCount++;
      } else if (res.status === 429) {
        rateLimitedCount++;
      }
    } catch (e) {
      console.error(e);
    }
  }

  console.log(`Successful/Normal requests: ${successCount} (Expected: 10)`);
  console.log(`Rate limited (429) requests: ${rateLimitedCount} (Expected: 5)`);
  console.log('Test 1 Passed:', successCount === 10 && rateLimitedCount === 5);
};

runTest().catch(console.error).finally(() => process.exit(0));
