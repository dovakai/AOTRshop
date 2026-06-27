// Vercel serverless function — creates a NOWPayments invoice

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { amount, order_id, order_description, success_url, cancel_url } = req.body;

  if (!amount || !order_id) {
    return res.status(400).json({ message: 'Missing required fields: amount, order_id' });
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'NOWPayments API key not configured.' });
  }

  // Build payload — only include optional fields when non-empty
  const payload = {
    price_amount:    parseFloat(amount),
    price_currency:  'usd',
    order_id:        String(order_id),
    order_description: order_description || 'AOTR Shop order',
  };

  if (success_url) payload.success_url = success_url;
  if (cancel_url)  payload.cancel_url  = cancel_url;

  // Use SITE_URL env var for stable webhook URL (set this in Vercel settings)
  const siteUrl = process.env.SITE_URL || '';
  if (siteUrl) {
    payload.ipn_callback_url = `${siteUrl}/api/nowpayments-webhook`;
  }

  try {
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key':    apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.message || data.error || 'NOWPayments error',
        details: data,
      });
    }

    return res.status(200).json({
      payment_url: data.invoice_url,
      invoice_id:  data.id,
      order_id:    data.order_id,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
