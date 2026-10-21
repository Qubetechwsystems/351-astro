// api/admin-leads.js - Secret Admin Leads Endpoint (Protected by PIN 687502)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-pin');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const reqPin = req.query.pin || req.headers['x-admin-pin'] || (typeof req.body === 'object' ? req.body?.pin : null);
  const ADMIN_PIN = '687502';

  if (!reqPin || reqPin.toString().trim() !== ADMIN_PIN) {
    return res.status(401).json({ error: 'अनधिकृत प्रवेश: अमान्य पिन (Unauthorized: Invalid PIN)' });
  }

  const key_id = 'rzp_live_Tof2RpwJEWMNx9';
  const key_secret = 'BUG1LRSI1uHjxtz8k51eovT8';
  const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');

  try {
    // 1. Fetch Orders from Razorpay
    const ordersRes = await fetch('https://api.razorpay.com/v1/orders?count=100', {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    const ordersData = await ordersRes.json();
    const rawOrders = ordersData.items || [];

    // 2. Fetch Payments to match successful captures
    let successfulPaymentOrderIds = new Set();
    try {
      const payRes = await fetch('https://api.razorpay.com/v1/payments?count=100', {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      const payData = await payRes.json();
      if (payData.items) {
        payData.items.forEach(p => {
          if (p.status === 'captured' && p.order_id) {
            successfulPaymentOrderIds.add(p.order_id);
          }
        });
      }
    } catch (e) {
      console.warn("Payments fetch notice:", e);
    }

    const problemMap = {
      'marriage_love': 'विवाह में विलंब, वैवाहिक कलह व प्रेम संबंध',
      'career_business': 'करियर, नौकरी में तरक्की व व्यापार में रुकावट',
      'finance_debt': 'आर्थिक तंगी, बचत न होना व कर्ज मुक्ति',
      'health_family': 'स्वास्थ्य, मानसिक तनाव व पारिवारिक अशांति',
      'general_guidance': 'हस्तरेखा व कुंडली संपूर्ण मार्गदर्शन'
    };

    // Format all leads
    const leads = rawOrders.map(item => {
      const notes = item.notes || {};
      const rawName = notes.customer_name || 'अज्ञात जातक';
      const rawPhone = notes.customer_phone || '';
      const probKey = notes.problem || 'general_guidance';
      const cleanPhone = (rawPhone || '').replace(/[^0-9]/g, '').slice(-10);

      // Determine true payment status
      let paymentStatus = 'pending';
      if (item.status === 'paid' || successfulPaymentOrderIds.has(item.id)) {
        paymentStatus = 'paid';
      } else if (item.status === 'attempted' || item.attempts > 0) {
        paymentStatus = 'attempted';
      }

      // Format date in IST
      const dateObj = new Date(item.created_at * 1000);
      const istString = dateObj.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return {
        order_id: item.id,
        name: rawName,
        phone: cleanPhone,
        problem: problemMap[probKey] || probKey,
        amount: (item.amount || 35100) / 100,
        status: paymentStatus,
        created_at: istString,
        timestamp: item.created_at * 1000
      };
    });

    // Filter out dummy test pings if needed, and sort latest first
    leads.sort((a, b) => b.timestamp - a.timestamp);

    return res.status(200).json({
      success: true,
      count: leads.length,
      leads: leads
    });

  } catch (err) {
    console.error("Admin leads API error:", err);
    return res.status(500).json({ error: "लीड्स लोड नहीं हो सकीं।" });
  }
}
