// api/create-order.js - Razorpay Standard One-Time Order API (₹351 Consultation)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET' || req.query?.ping) return res.status(200).json({ status: 'warm' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { name, phone, problem } = body;

    const key_id = 'rzp_live_Tof2RpwJEWMNx9';
    const key_secret = 'BUG1LRSI1uHjxtz8k51eovT8';
    const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');

    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);

    // ₹351 एकमुश्त परामर्श दक्षिणा (35100 पैसे)
    const payload = {
      amount: 35100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        customer_name: name || 'Astro Seeker',
        customer_phone: cleanPhone || '',
        problem: problem || 'general_guidance',
        service_type: '₹351 संपूर्ण हस्तरेखा व कुंडली विश्लेषण (24 घंटे में रिपोर्ट)'
      }
    };

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay Order Error:', data);
      return res.status(response.status).json({ error: data.error?.description || 'ऑर्डर नहीं बन सका।' });
    }

    return res.status(200).json({
      success: true,
      order_id: data.id,
      amount: data.amount,
      currency: data.currency,
      key_id: key_id
    });

  } catch (err) {
    console.error('Server error in create-order:', err);
    return res.status(500).json({ error: 'सर्वर त्रुटि: कृपया पुनः प्रयास करें।' });
  }
}
