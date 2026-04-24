const http = require('http');

const accounts = [
  { name: 'Standard User', email: 'user@smartcampus.com', password: 'password123', role: 'USER' },
  { name: 'Facility Admin', email: 'facility@smartcampus.com', password: 'password123', role: 'FACILITY_MANAGER' },
  { name: 'Booking Admin', email: 'booking@smartcampus.com', password: 'password123', role: 'BOOKING_OFFICER' },
  { name: 'Tech Support', email: 'tech@smartcampus.com', password: 'password123', role: 'TECHNICIAN' },
  { name: 'Super Admin', email: 'admin@smartcampus.com', password: 'password123', role: 'ADMIN' }
];

async function createAccounts() {
  console.log('Starting account creation...');
  
  for (const account of accounts) {
    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.request(
          'http://localhost:8080/api/auth/register',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
          }
        );
        
        req.on('error', reject);
        req.write(JSON.stringify(account));
        req.end();
      });

      if (response.status === 200) {
        console.log(`✅ Created account for ${account.role} (${account.email})`);
      } else {
        console.log(`❌ Failed to create ${account.email}: Status ${response.status}`);
        console.log(`Response body: ${response.data}`);
      }
    } catch (error) {
      console.log(`❌ Error connecting to backend: ${error.message}`);
      console.log(`\n⚠️ Make sure your Spring Boot backend has been RESTARTED so the new /api/auth endpoints exist!`);
      break;
    }
  }
}

createAccounts();
