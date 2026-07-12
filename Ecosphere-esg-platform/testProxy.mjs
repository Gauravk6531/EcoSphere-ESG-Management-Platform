import http from 'http';
const body = JSON.stringify({ email: 'testuser@example.com', password: 'password123' });
const options = {
  hostname: 'localhost',
  port: 5177,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};
const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(data); });
});
req.on('error', (err) => { console.error('ERROR', err.message); });
req.write(body);
req.end();
