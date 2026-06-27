// Vercel serverless function — creates a Plisio invoice

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { amount, order_id, order_description, success_url, fail_url } = req.body;

  if (!amount || !order_id) {
    return res.status(400).json({ message: 'Missing required fields: amount, order_id' });
  }

  const apiKey = process.env.PLISIO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'Plisio API key not configured.' });
  }

  const params = new URLSearchParams({
    api_key:         apiKey,
    source_currency: 'USD',
    source_amount:   String(parseFloat(amount).toFixed(2)),
    currency:        'USDT_TRX',
    order_number:    String(order_id),
    order_name:      order_description || 'AOTR Shop order',
    callback_url:    'https://aotrshop.vercel.app/api/plisio-webhook',
    success_url:     success_url || 'https://aotrshop.vercel.app/success',
    fail_url:        fail_url    || 'https://aotrshop.vercel.app/failed',
  });

  try {
    const response = await fetch(
      `https://plisio.net/api/v1/invoices/new?${params.toString()}`
    );

    const data = await response.json();

    if (data.status !== 'success') {
      console.error('Plisio error:', data);
      return res.status(400).json({
        message: data.data?.message || data.message || 'Plisio error',
        details: data,
      });
    }

    return res.status(200).json({
      payment_url: data.data.invoice_url,
      invoice_id:  data.data.txn_id,
      order_id,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
