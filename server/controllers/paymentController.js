const axios = require('axios');
const pool = require('../config/database');
require('dotenv').config();

// Mpesa OAuth Token
const getAccessToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    
    if (!consumerKey || !consumerSecret) {
        console.error('MPESA credentials missing in .env file');
        throw new Error('Mpesa credentials missing');
    }

    const auth = Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString('base64');

    try {
        console.log('Fetching M-Pesa access token...');
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        console.log('M-Pesa access token retrieved successfully');
        return response.data.access_token;
    } catch (err) {
        const errorData = err.response?.data;
        console.error('Mpesa Auth Error Details:', JSON.stringify(errorData, null, 2) || err.message);
        throw new Error(`Failed to get Mpesa access token: ${errorData?.errorMessage || err.message}`);
    }
};

exports.getAccessToken = getAccessToken;

// Trigger STK Push
exports.initiateSTKPush = async (req, res) => {
    const { phoneNumber, amount } = req.body;
    const userId = req.user.id;

    try {
        const accessToken = await getAccessToken();
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        const password = Buffer.from(
            `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
        ).toString('base64');

        const callbackUrl = `${process.env.BASE_URL}/api/payments/callback`;

        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                BusinessShortCode: process.env.MPESA_SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount.toString(),
                PartyA: phoneNumber,
                PartyB: process.env.MPESA_SHORTCODE,
                PhoneNumber: phoneNumber,
                CallBackURL: callbackUrl,
                AccountReference: `User_${userId}`,
                TransactionDesc: 'Tabora AgriDairy Access Fee',
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const checkoutRequestID = response.data.CheckoutRequestID;

        // Store CheckoutID in users table to track this payment
        await pool.query('UPDATE users SET mpesaCheckoutId = ? WHERE id = ?', [checkoutRequestID, userId]);

        res.json({ message: 'STK Push initiated. Check your phone.', data: response.data });
    } catch (err) {
        console.error('STK Push Error:', err.response?.data || err.message);
        res.status(500).json({ error: `Failed to initiate STK Push: ${err.message}` });
    }
};

// Mpesa Callback
exports.mpesaCallback = async (req, res) => {
    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
        return res.status(400).json({ message: 'Invalid callback payload' });
    }

    const resultCode = Body.stkCallback.ResultCode;
    const checkoutRequestID = Body.stkCallback.CheckoutRequestID;

    console.log(`M-Pesa Callback received for ID: ${checkoutRequestID}, ResultCode: ${resultCode}`);

    if (resultCode === 0) {
        // Success
        try {
            // 1. Check if it's a Marketplace Order
            const [orders] = await pool.query('SELECT id FROM orders WHERE mpesaCheckoutId = ?', [checkoutRequestID]);
            if (orders.length > 0) {
                await pool.query('UPDATE orders SET status = "paid" WHERE mpesaCheckoutId = ?', [checkoutRequestID]);
                console.log(`Order ${orders[0].id} marked as PAID`);
            }

            // 2. Check if it's a User Access Fee
            const [users] = await pool.query('SELECT id FROM users WHERE mpesaCheckoutId = ?', [checkoutRequestID]);
            if (users.length > 0) {
                await pool.query('UPDATE users SET paymentStatus = "paid" WHERE mpesaCheckoutId = ?', [checkoutRequestID]);
                console.log(`User ${users[0].id} marked as PAID (Access Fee)`);
            }
        } catch (err) {
            console.error('Error updating payment status in callback:', err.message);
        }
    } else {
        console.log(`Payment failed or cancelled for ID: ${checkoutRequestID}. Code: ${resultCode}`);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
};

// Simple success simulation for testing
exports.simulateSuccess = async (req, res) => {
    try {
        // 1. Mark user as paid
        await pool.query('UPDATE users SET paymentStatus = "paid" WHERE id = ?', [req.user.id]);
        
        // 2. Mark latest pending order as paid
        await pool.query('UPDATE orders SET status = "paid" WHERE buyerId = ? AND status = "pending" ORDER BY createdAt DESC LIMIT 1', [req.user.id]);
        
        res.json({ message: 'Payment simulated successfully. Order and Account updated.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
