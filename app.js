/**
 * Vedic Palmistry & Astrology Consultation Platform
 * Direct Client-Side Razorpay Integration (Zero Serverless Dependency)
 * Pure ₹251 Shagun Dakshina (25,100 Paise)
 * Triple Deduplication Meta Pixel Tracking & Clean WhatsApp Auto-Redirection
 */

// ================= GLOBAL CONFIGURATION =================
const APP_CONFIG = {
  RAZORPAY_KEY_ID: "rzp_live_Tof2RpwJEWMNx9", // Live Razorpay Key
  META_PIXEL_ID: "1111594184953741",
  CONSULTATION_AMOUNT: 251.00, // एकमुश्त ₹251 शुभ दक्षिणा (No autopay)
  CURRENCY: "INR",
  BUSINESS_NAME: "वैदिक हस्तरेखा एवं ज्योतिष अनुसंधान केंद्र",
  WHATSAPP_SUPPORT_NUMBER: "919116497140"
};

// ================= META PIXEL HELPER =================
function initMetaPixel() {
  if (APP_CONFIG.META_PIXEL_ID) {
    try {
      if (typeof window.fbq === 'function') {
        window.fbq('init', APP_CONFIG.META_PIXEL_ID);
        window.fbq('track', 'PageView');
        console.log("✅ [Meta Pixel] PageView Event active.");
      }
    } catch (err) {}
  }
}

function trackMetaEvent(eventName, params = {}, options = {}) {
  console.log(`📡 [Meta Pixel Event]: ${eventName}`, params);
  if (typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params, options);
    } catch (e) {}
  }
}

// ================= PERSISTENT COUNTDOWN TIMER (REAL URGENCY) =================
function startCountdown() {
  const timerElement = document.getElementById("countdownTimer");
  const stickyTimer = document.getElementById("stickyTimer");
  if (!timerElement && !stickyTimer) return;

  const DURATION_SECONDS = 14 * 60 + 59;
  const STORAGE_KEY = "astro_timer_end";
  let endTime = localStorage.getItem(STORAGE_KEY);

  const now = Date.now();
  if (!endTime || parseInt(endTime, 10) < now) {
    endTime = now + DURATION_SECONDS * 1000;
    localStorage.setItem(STORAGE_KEY, endTime.toString());
  } else {
    endTime = parseInt(endTime, 10);
  }

  function updateDisplay() {
    const current = Date.now();
    let remaining = Math.max(0, Math.floor((endTime - current) / 1000));
    if (remaining <= 0) {
      endTime = Date.now() + DURATION_SECONDS * 1000;
      localStorage.setItem(STORAGE_KEY, endTime.toString());
      remaining = DURATION_SECONDS;
    }
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (timerElement) timerElement.textContent = formatted;
    if (stickyTimer) stickyTimer.textContent = formatted;
  }

  updateDisplay();
  setInterval(updateDisplay, 1000);
}

// ================= FAQ ACCORDION =================
function toggleFaq(index) {
  const answer = document.getElementById(`faq-ans-${index}`);
  const icon = document.getElementById(`faq-icon-${index}`);
  if (!answer) return;
  const isHidden = answer.classList.contains("hidden");

  for (let i = 1; i <= 6; i++) {
    const a = document.getElementById(`faq-ans-${i}`);
    const ic = document.getElementById(`faq-icon-${i}`);
    if (a) a.classList.add("hidden");
    if (ic) ic.classList.remove("rotate-180");
  }

  if (isHidden) {
    answer.classList.remove("hidden");
    if (icon) icon.classList.add("rotate-180");
  }
}

// ================= SAMPLE REPORT TABS =================
function switchSampleTab(tabName) {
  const tabs = ['palm', 'timeline', 'questions', 'remedies'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const content = document.getElementById(`tab-content-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.classList.add('bg-amber-500', 'text-slate-950', 'font-bold');
        btn.classList.remove('bg-amber-500/10', 'text-amber-300');
      } else {
        btn.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold');
        btn.classList.add('bg-amber-500/10', 'text-amber-300');
      }
    }
    if (content) {
      if (t === tabName) {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    }
  });
}

// ================= BOOKING MODAL CONTROL =================
function openBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    modal.scrollTop = 0;
    trackMetaEvent('InitiateCheckout', {
      value: APP_CONFIG.CONSULTATION_AMOUNT,
      currency: APP_CONFIG.CURRENCY,
      content_name: '₹251 Palmistry & Kundali Consultation'
    });
  }
}

function closeBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeBookingModal();
});

// ================= FORM SUBMISSION & CLIENT-SIDE RAZORPAY =================
function handleFormSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("custName")?.value.trim() || "";
  const rawPhone = document.getElementById("custPhone")?.value.trim() || "";
  const dob = document.getElementById("custDob")?.value || "";
  const problem = document.getElementById("custProblem")?.value || "general_guidance";

  if (!name) {
    alert("कृपया अपना पूरा नाम दर्ज करें।");
    return;
  }

  // Clean phone to exact 10 digits (strip +91, 0, spaces, dashes)
  const phone = rawPhone.replace(/[^0-9]/g, '').slice(-10);
  if (!phone || phone.length !== 10) {
    alert("कृपया 10 अंकों का सही व्हाट्सएप नंबर दर्ज करें।");
    return;
  }

  // Smooth Email: If user provided valid email use it, otherwise auto-generate so UPI is never blocked
  const inputEmail = document.getElementById("custEmail")?.value.trim() || "";
  const email = (inputEmail && inputEmail.includes('@')) ? inputEmail : `astro.${phone}@astromargdarshan.online`;

  const problemMap = {
    'general_guidance': 'हस्तरेखा का संपूर्ण जीवन मार्गदर्शन',
    'career_business': 'करियर, नौकरी में तरक्की व व्यापार में रुकावट',
    'marriage_love': 'विवाह में विलंब, वैवाहिक कलह व प्रेम संबंध',
    'finance_debt': 'आर्थिक तंगी, बचत न होना व कर्ज की समस्या',
    'health_family': 'स्वास्थ्य, मानसिक तनाव व पारिवारिक अशांति'
  };
  const selectedProblem = problemMap[problem] || 'हस्तरेखा का संपूर्ण जीवन मार्गदर्शन';

  // 1. Meta Pixel InitiateCheckout (₹251)
  trackMetaEvent('InitiateCheckout', {
    value: APP_CONFIG.CONSULTATION_AMOUNT,
    currency: APP_CONFIG.CURRENCY,
    content_name: '₹251 वैदिक हस्तरेखा विश्लेषण',
    customer_phone: phone,
    customer_name: name,
    customer_email: email
  });

  const payBtn = document.getElementById("payBtn");
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> UPI गेटवे खुल रहा है...';
  }

  // 2. Direct Client-Side Razorpay Standard Checkout (Zero Serverless Dependency)
  // Amount in Paise: 251 * 100 = 25100 paise (₹251.00 strictly)
  const options = {
    key: APP_CONFIG.RAZORPAY_KEY_ID,
    amount: Math.round(APP_CONFIG.CONSULTATION_AMOUNT * 100), // 25,100 paise = ₹251.00 strictly
    currency: APP_CONFIG.CURRENCY,
    name: APP_CONFIG.BUSINESS_NAME,
    description: "₹251 हस्तरेखा परामर्श (24 घंटे में WhatsApp PDF रिपोर्ट)",
    image: "https://cdn-icons-png.flaticon.com/512/3663/3663335.png",
    prefill: {
      name: name,
      contact: phone,
      email: email
    },
    notes: {
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      date_of_birth: dob || "हस्तरेखा द्वारा विश्लेषण",
      problem: selectedProblem,
      hand_rule: "पुरुष: दायाँ हाथ | महिला: बायाँ हाथ"
    },
    theme: {
      color: "#D97706"
    },
    modal: {
      ondismiss: function () {
        if (payBtn) {
          payBtn.disabled = false;
          payBtn.innerHTML = '<i class="fa-solid fa-lock"></i> <span>सुरक्षित भुगतान करें — मात्र ₹251 →</span>';
        }
      }
    },
    handler: function (response) {
      const paymentId = response.razorpay_payment_id || ('PAY_' + Date.now());
      console.log("✅ Payment Successful! Payment ID:", paymentId);

      // TRIPLE DEDUPLICATION GUARD: Prevent duplicate purchase recording on back/refresh
      const purchaseKey = 'meta_purchase_fired_' + paymentId;
      const isAlreadyRecorded = localStorage.getItem(purchaseKey) || sessionStorage.getItem(purchaseKey);

      if (!isAlreadyRecorded) {
        localStorage.setItem(purchaseKey, 'true');
        sessionStorage.setItem(purchaseKey, 'true');

        // Fire Meta Pixel: Purchase Event (Deduplicated via unique paymentId)
        trackMetaEvent('Purchase', {
          value: APP_CONFIG.CONSULTATION_AMOUNT,
          currency: APP_CONFIG.CURRENCY,
          content_name: '₹251 वैदिक हस्तरेखा विश्लेषण',
          content_type: 'product'
        }, { eventID: paymentId });

        // Trigger Server-Side Meta Conversions API (CAPI) with same eventID
        try {
          fetch('/api/track-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: phone,
              name: name,
              email: email,
              payment_id: paymentId,
              value: APP_CONFIG.CONSULTATION_AMOUNT
            }),
            keepalive: true
          }).catch(() => {});
        } catch (e) {}
      } else {
        console.warn("⚠️ Duplicate purchase event suppressed for:", paymentId);
      }

      // Store Order in LocalStorage
      try {
        localStorage.setItem('astro_booking_251', JSON.stringify({
          name, phone, email, dob: dob || 'उपलब्ध नहीं', problem: selectedProblem, paymentId, amount: 251, timestamp: Date.now()
        }));
      } catch (e) {}

      // WhatsApp Redirect URL (Clear instructions: Right hand for male, Left hand for female)
      const whatsappText = `जय श्री राम, मैंने ₹251 की दक्षिणा देकर हस्तरेखा परामर्श बुक कर लिया है।\n\n📌 *मेरे विवरण:*\n• नाम: ${name}\n• फ़ोन: ${phone}\n• ईमेल: ${email}\n• जन्म तिथि: ${dob || 'ज्ञात नहीं (हस्तरेखा फोटो संलग्न है)'}\n• मुख्य विषय: ${selectedProblem}\n• पेमेंट ID: ${paymentId}\n\nकृपया 24 घंटे में मेरी 6-पेज की विस्तृत समाधान PDF रिपोर्ट WhatsApp पर भेजें।\n(नोट: नियमानुसार पुरुष दायाँ हाथ / महिला बायाँ हाथ की साफ़ फ़ोटो भेज रहे हैं)`;

      const waUrl = `https://wa.me/${APP_CONFIG.WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent(whatsappText)}`;

      // Use location.replace() so pressing back from WhatsApp does not reload the checkout state
      window.location.replace(waUrl);
    }
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (pErr) {
      console.warn("Payment notice:", pErr);
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> <span>पुनः प्रयास करें — मात्र ₹251 →</span>';
      }
    });
    rzp.open();
  } catch (err) {
    console.error("Razorpay Launch Error:", err);
    alert("Razorpay गेटवे लोड नहीं हो सका। कृपया इंटरनेट कनेक्शन जांचें।");
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.innerHTML = '<i class="fa-solid fa-lock"></i> <span>सुरक्षित भुगतान करें — मात्र ₹251 →</span>';
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMetaPixel();
  startCountdown();
});
