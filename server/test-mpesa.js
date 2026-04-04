const axios = require('axios');
require('dotenv').config();

const testMpesaAuth = async () => {
    const consumerKey = process.env.QtO4p9A902CLdEdMXfJKkUSBtoiCQ85JvTDAdDkqWldoN8pW;
    const consumerSecret = process.env.uwR9jCzXUUAwbYmbkHI79xcpsvQnRhCOAmzDDONNBciikZHfIGjGqlH8DPg0rC3A;
    
    if (!consumerKey || !consumerSecret) {
        console.error('❌ MPESA credentials missing in .env file');
        return;
    }

    console.log('--- Testing M-Pesa Authentication ---');
    console.log(`Key: ${consumerKey.substring(0, 5)}...`);
    console.log(`Secret: ${consumerSecret.substring(0, 5)}...`);

    const auth = Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString('base64');

    try {
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        console.log('✅ Auth Successful!');
        console.log('Access Token:', response.data.access_token.substring(0, 10) + '...');
    } catch (err) {
        console.error('❌ Auth Failed with status:', err.response?.status);
        console.error('Error Body:', JSON.stringify(err.response?.data, null, 2));
        console.error('Message:', err.message);
    }
};

testMpesaAuth();