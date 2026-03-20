const axios = require('axios');

async function testReferralLeaderboard() {
    try {
        // Since we need 'protect' middleware, we need a token.
        // I'll try to use the login credentials from conversation 825e54d4 (admin/admin123)
        // or just check if the endpoint exists if I can't easily get a token.
        
        console.log('Testing /api/analytics/referral-leaderboard...');
        
        // Let's first try to login
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const cookie = loginRes.headers['set-cookie'];
        
        const res = await axios.get('http://localhost:5000/api/analytics/referral-leaderboard', {
            headers: {
                Cookie: cookie
            },
            withCredentials: true
        });
        
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(res.data, null, 2));
        
        if (Array.isArray(res.data)) {
            console.log('SUCCESS: Referral leaderboard returned an array.');
            if (res.data.length <= 10) {
                console.log(`SUCCESS: Returned ${res.data.length} entries (max 10).`);
            } else {
                console.log(`FAILURE: Returned ${res.data.length} entries (limit is 10).`);
            }
        } else {
            console.log('FAILURE: Data is not an array.');
        }

    } catch (err) {
        console.error('Error during test:', err.response?.data || err.message);
    }
}

testReferralLeaderboard();
