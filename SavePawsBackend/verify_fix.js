const http = require('http');

function makeRequest(path, headers) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: headers || {}
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: data ? JSON.parse(data) : {}
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
}

async function testAuthFallback() {
    const API_PATH = '/api/adoption/my-requests';
    const TEST_TOKEN = 'mydigitalid-token-abc123';
    const USER_ID = 1;

    console.log('🧪 Testing Auth Fallback Mechanism...');

    // 1. Valid User ID Fallback
    try {
        console.log(`\n1. Testing with Invalid Token + Valid User ID (Expect Success)`);
        const res = await makeRequest(API_PATH, {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'x-user-id': USER_ID.toString()
        });

        if (res.status === 200 || res.status === 201) {
            console.log('✅ Success! Fallback mechanism worked.');
            console.log('   Data received:', res.data.count, 'requests');
        } else {
            console.log('❌ Failed. Status:', res.status, 'Message:', res.data.message);
        }
    } catch (error) {
        console.log('❌ Connection Failed:', error.message);
    }

    // 2. Invalid Token No ID
    try {
        console.log(`\n2. Testing with Invalid Token + NO User ID (Expect 401)`);
        const res = await makeRequest(API_PATH, {
            'Authorization': `Bearer ${TEST_TOKEN}`
        });

        if (res.status === 401) {
            console.log('✅ Success! Request rejected as expected (401).');
        } else {
            console.log('❌ Failed. Expected 401, got:', res.status);
        }
    } catch (error) {
        console.log('❌ Connection Failed:', error.message);
    }
}

testAuthFallback();
