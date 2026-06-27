// Vercel serverless function — Plisio payment webhook handler

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey        = process.env.PLISIO_API_KEY;
  const supabaseUrl   = process.env.SUPABASE_URL;
  const supabaseKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !supabaseKey) {
    console.error('Missing env vars: PLISIO_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ message: 'Server misconfiguration' });
  }

  const data = req.body;

  // Verify Plisio signature
  const verifyHash = data.verify_hash;
  if (!verifyHash) {
    return res.status(401).json({ message: 'Missing verify_hash' });
  }

  const payload = { ...data };
  delete payload.verify_hash;

  const sorted = Object.fromEntries(Object.entries(payload).sort(([a], [b]) => a.localeCompare(b)));
  const serialized = JSON.stringify(sorted);
  const expectedHash = crypto.createHash('md5').update(serialized + apiKey).digest('hex');

  if (expectedHash !== verifyHash) {
    console.error('Plisio signature mismatch');
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const { status, order_number } = data;

  if (!order_number) {
    return res.status(400).json({ message: 'Missing order_number' });
  }

  // Map Plisio statuses to internal statuses
  const statusMap = {
    new:        'pending',
    pending:    'waiting',
    completed:  'finished',
    expired:    'failed',
    cancelled:  'failed',
    error:      'failed',
    mismatch:   'failed',
  };

  const mappedStatus = statusMap[status] || status;

  const db = createClient(supabaseUrl, supabaseKey);

  const { error } = await db
    .from('orders')
    .update({ payment_status: mappedStatus })
    .eq('id', order_number);

  if (error) {
    console.error('Supabase update error:', error);
    return res.status(500).json({ message: 'Database update failed' });
  }

  console.log(`Order ${order_number} → payment_status=${mappedStatus}`);
  return res.status(200).json({ message: 'OK' });
}
