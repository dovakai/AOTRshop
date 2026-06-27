// Vercel serverless function — creates a NOWPayments invoice
// Keeps NOWPAYMENTS_API_KEY off the client

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { amount, currency, order_id, order_description, success_url, cancel_url } = req.body;

  if (!amount || !currency || !order_id) {
    return res.status(400).json({ message: 'Missing required fields: amount, currency, order_id' });
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_NOWPAYMENTS_API_KEY') {
    return res.status(500).json({ message: 'NOWPayments API key not configured.' });
  }

  try {
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: parseFloat(amount),
        price_currency: 'usd',
        pay_currency: currency || 'usdttrc20',
        order_id: String(order_id),
        order_description: order_description || 'AOTR Shop order',
        success_url: success_url || '',
        cancel_url: cancel_url || '',
        ipn_callback_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''}/api/nowpayments-webhook`
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ message: err.message || 'NOWPayments error' });
    }

    const data = await response.json();
    return res.status(200).json({
      payment_url: data.invoice_url,
      invoice_id: data.id,
      order_id: data.order_id
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
