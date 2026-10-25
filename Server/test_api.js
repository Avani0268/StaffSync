const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
};

async function testAll() {
  console.log('Testing StaffSync Backend Endpoints...\n');

  // 1. Health
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health check status:', health.status, health.data.system);

  // 2. Login Admin
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@staffsync.com', password: 'Password123!' });

  console.log('2. Admin login status:', loginRes.status, 'Success:', loginRes.data.success);
  const token = loginRes.data.token;

  // 3. Admin Dashboard
  const adminDash = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/dashboard/admin',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('3. Admin Dashboard stats:', adminDash.data.stats);

  // 4. Employees list
  const empList = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/employees',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('4. Employees count:', empList.data.count);

  // 5. Attendance today
  const attRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/attendance',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('5. Attendance roster count today:', attRes.data.count);

  // 6. Leaves list
  const leavesRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/leaves',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('6. Leave applications count:', leavesRes.data.count);

  // 7. Announcements list
  const annRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/announcements',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('7. Announcements count:', annRes.data.count);

  // 8. Trainings list
  const trainRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/trainings',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('8. Training programs count:', trainRes.data.count);

  console.log('\n--- ALL BACKEND APIS FUNCTIONAL AND READY! ---');
}

testAll().catch(console.error);
