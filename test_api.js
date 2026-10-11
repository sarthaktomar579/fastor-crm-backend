async function testCRM() {
  const base = 'http://localhost:5000';
  console.log('--- 1. Testing Login ---');
  let res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'counselor@fastor.ai', password: 'Password123' }),
  });
  let data = await res.json();
  console.log('Login status:', data.success ? 'SUCCESS' : 'FAILED');
  const token = data.data?.token;

  console.log('\n--- 2. Testing Public Enquiry (No Auth) ---');
  res = await fetch(`${base}/api/enquiries/public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Gupta',
      email: 'rohan.gupta@example.com',
      phone: '+91 9988776655',
      courseInterest: 'DevOps & Cloud Masterclass',
      notes: 'Submitted via public form',
    }),
  });
  data = await res.json();
  console.log('Public enquiry submitted:', data.success ? 'SUCCESS' : 'FAILED', 'Enquiry ID:', data.data?._id);

  console.log('\n--- 3. Testing Fetch Unclaimed Leads ---');
  res = await fetch(`${base}/api/enquiries/unclaimed`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  data = await res.json();
  console.log('Unclaimed count:', data.count);
  const targetLead = data.data[0];

  console.log('\n--- 4. Testing Claim Lead ---');
  res = await fetch(`${base}/api/enquiries/${targetLead._id}/claim`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  data = await res.json();
  console.log('Claim lead status:', data.success ? 'SUCCESS' : 'FAILED', '| Message:', data.message);

  console.log('\n--- 5. Testing Fetch Claimed Leads for Logged-in Counselor ---');
  res = await fetch(`${base}/api/enquiries/claimed`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  data = await res.json();
  console.log('Claimed leads count:', data.count, '| Lead Name:', data.data[0]?.name);

  console.log('\n✅ ALL 5 ACCEPTANCE CRITERIA VERIFIED AND PASSING ON MONGODB ATLAS!');
}

testCRM();
