// Vercel serverless function — NOWPayments IPN webhook handler
// Verifies the signature and updates order status in Supabase

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!ipnSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars: NOWPAYMENTS_IPN_SECRET, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ message: 'Server misconfiguration' });
  }

  // Verify NOWPayments signature
  const signature = req.headers['x-nowpayments-sig'];
  if (!signature) {
    return res.status(401).json({ message: 'Missing signature' });
  }

  const sortedBody = sortObject(req.body);
  const bodyString = JSON.stringify(sortedBody);
  const hmac = crypto.createHmac('sha512', ipnSecret).update(bodyString).digest('hex');

  if (hmac !== signature) {
    console.error('IPN signature mismatch');
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const { order_id, payment_status, price_amount, actually_paid } = req.body;

  if (!order_id) {
    return res.status(400).json({ message: 'Missing order_id' });
  }

  const db = createClient(supabaseUrl, supabaseServiceKey);

  // Map NOWPayments status to our schema
  const statusMap = {
    waiting: 'waiting',
    confirming: 'confirming',
    confirmed: 'confirmed',
    sending: 'confirming',
    partially_paid: 'confirming',
    finished: 'finished',
    failed: 'failed',
    refunded: 'failed',
    expired: 'failed'
  };

  const mappedStatus = statusMap[payment_status] || payment_status;

  const { error } = await db.from('orders')
    .update({
      payment_status: mappedStatus,
      nowpayments_id: req.body.payment_id || null
    })
    .eq('id', order_id);

  if (error) {
    console.error('Supabase update error:', error);
    return res.status(500).json({ message: 'Database update failed' });
  }

  console.log(`Order ${order_id} updated to payment_status=${mappedStatus}`);
  return res.status(200).json({ message: 'OK' });
}

function sortObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObject);
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = sortObject(obj[key]);
    return acc;
  }, {});
}
