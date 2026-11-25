// api/track-purchase.js - Meta Conversions API (CAPI) Server-Side Tracking for ₹251 Consultation
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Astro Margdarshan New Dataset
  const PIXEL_ID = '1111594184953741';
  const ACCESS_TOKEN = 'EAAQFaOjysW8BTNDRsSpvlNIHhctHBlkZBwM2ZAm2ReOFIFhqZBUWvcaQHZAc00GODVDssihnXzqvrA1ei72DxcV6XGWwub17yI6mbfJ9vXEkwSXgtsdQekwxnrGLbE6R6rPBBgLclfqDQ3m7JAZAkzZBUSvnm3JRr8xGSIJZC8ayvUp2oFa3QalY8soGH8vBPyWlgZDZD';

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { phone, name, email, payment_id, value } = body;

    const hash = (str) => {
      if (!str) return null;
      return crypto.createHash('sha256').update(str.trim().toLowerCase()).digest('hex');
    };

    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    const hashedPhone = cleanPhone ? hash(`91${cleanPhone}`) : hash('919116497140');
    const hashedName = name ? hash(name) : hash('astrologer_client');
    const hashedEmail = email ? hash(email) : null;

    const purchaseValue = parseFloat(value) || 251.00;

    const userData = {
      ph: [hashedPhone],
      fn: [hashedName]
    };
    if (hashedEmail) {
      userData.em = [hashedEmail];
    }

    const eventPayload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: 'https://astromargdarshan.online',
          event_id: payment_id || ('PAY_' + Date.now()),
          user_data: userData,
          custom_data: {
            currency: 'INR',
            value: purchaseValue,
            content_name: '₹251 वैदिक हस्तरेखा विश्लेषण',
            content_type: 'product'
          }
        }
      ],
      access_token: ACCESS_TOKEN
    };

    const response = await fetch(`https://graph.facebook.com/v20.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload)
    });

    const result = await response.json();
    return res.status(200).json({ success: true, meta_response: result });

  } catch (err) {
    console.error('CAPI Server Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
