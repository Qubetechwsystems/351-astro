/**
 * Vedic Palmistry & Astrology Consultation Platform (₹351 One-Time Pure Order)
 * Standalone Application with Razorpay One-Time Orders & Direct WhatsApp Redirection
 */

// ================= GLOBAL CONFIGURATION =================
const APP_CONFIG = {
  RAZORPAY_KEY_ID: "rzp_live_Tof2RpwJEWMNx9",
  META_PIXEL_ID: "1111594184953741", // Astro Margdarshan New Dataset
  CONSULTATION_AMOUNT: 351.00,    // एकमुश्त ₹351 शुभ दक्षिणा
  CURRENCY: "INR",
  BUSINESS_NAME: "वैदिक हस्तरेखा एवं ज्योतिष अनुसंधान केंद्र",
  WHATSAPP_SUPPORT_NUMBER: "919116497140"
};

// ================= META PIXEL HELPER =================
function trackMetaEvent(eventName, params = {}, options = {}) {
  if (APP_CONFIG.META_PIXEL_ID && APP_CONFIG.META_PIXEL_ID !== "YOUR_PIXEL_ID" && typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params, options);
    } catch (e) {}
  }
}

// ================= COUNTDOWN TIMER (14:59) =================
function startCountdown() {
  const timerElement = document.getElementById("countdownTimer");
  if (!timerElement) return;

  let totalSeconds = 14 * 60 + 59;
  setInterval(() => {
    if (totalSeconds <= 0) totalSeconds = 15 * 60;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    totalSeconds--;
  }, 1000);
}

// ================= FAQ ACCORDION =================
function toggleFaq(index) {
  const answer = document.getElementById(`faq-ans-${index}`);
  const icon = document.getElementById(`faq-icon-${index}`);
  if (!answer) return;
  const isHidden = answer.classList.contains("hidden");

  for (let i = 1; i <= 5; i++) {
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

// ================= AUTO-SAVE LEAD ON 10-DIGIT PHONE INPUT =================
let autoSavedLeadKey = "";
let preloadedOrderData = null;

function setupAutoLeadCapture() {
  const phoneInput = document.getElementById("custPhone");
  const nameInput = document.getElementById("custName");
  const problemInput = document.getElementById("custProblem");
  if (!phoneInput) return;

  function triggerLeadAutoSave() {
    const rawPhone = phoneInput.value || "";
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '').slice(-10);

    if (cleanPhone.length !== 10) return;

    const rawName = (nameInput?.value || "").trim();
    const name = rawName || "जातक";
    const problem = problemInput?.value || "general_guidance";

    const leadKey = `${cleanPhone}_${name}_${problem}`;
    if (leadKey === autoSavedLeadKey) return; // avoid duplicate calls
    autoSavedLeadKey = leadKey;

    console.log("⚡ Auto-saving lead to Razorpay/Admin backend:", cleanPhone, name);

    fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone: cleanPhone, problem })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.order_id) {
        preloadedOrderData = {
          order_id: data.order_id,
          phone: cleanPhone,
          name: name,
          problem: problem,
          key_id: data.key_id,
          amount: data.amount,
          currency: data.currency
        };
        console.log("✅ Lead auto-saved in backend & Order preloaded:", data.order_id);
      }
    })
    .catch(err => {
      console.warn("Auto-save lead note:", err);
    });
  }

  // Instant capture as soon as 10th digit is entered
  phoneInput.addEventListener("input", () => {
    const cleanPhone = (phoneInput.value || "").replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length === 10) {
      triggerLeadAutoSave();
    }
  });

  // Also capture when focus leaves phone or name input or problem changes
  phoneInput.addEventListener("blur", triggerLeadAutoSave);
  phoneInput.addEventListener("change", triggerLeadAutoSave);
  if (nameInput) {
    nameInput.addEventListener("blur", () => {
      const cleanPhone = (phoneInput.value || "").replace(/[^0-9]/g, '').slice(-10);
      if (cleanPhone.length === 10) triggerLeadAutoSave();
    });
  }
  if (problemInput) {
    problemInput.addEventListener("change", () => {
      const cleanPhone = (phoneInput.value || "").replace(/[^0-9]/g, '').slice(-10);
      if (cleanPhone.length === 10) triggerLeadAutoSave();
    });
  }
}

// ================= HIGH-SPEED SERVER WARMING (ZERO COLD-START) =================
function prewarmRazorpayOrder() {
  // Pings serverless function in background so it's blazing fast on submit
  fetch('/api/create-order?ping=1').catch(() => {});
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
      content_name: '₹351 Palmistry & Kundali Consultation'
    });
    // ⚡ Warm up server function in background while user types
    prewarmRazorpayOrder();
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

// ================= FORM SUBMISSION & RAZORPAY ₹351 ONE-TIME ORDER =================
async function handleFormSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("custName")?.value.trim() || "";
  const rawPhone = document.getElementById("custPhone")?.value.trim() || "";
  const problem = document.getElementById("custProblem")?.value || "general_guidance";

  if (!name) {
    alert("कृपया अपना पूरा नाम दर्ज करें।");
    return;
  }

  const phone = rawPhone.replace(/[^0-9]/g, '').slice(-10);
  if (!phone || phone.length !== 10) {
    alert("कृपया 10 अंकों का सही व्हाट्सएप नंबर दर्ज करें।");
    return;
  }

  try {
    localStorage.setItem('astro_lead_351', JSON.stringify({ name, phone, problem, timestamp: Date.now() }));
  } catch (e) {}

  const payBtn = document.getElementById("payBtn");
  if (payBtn) {
    payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-amber-300"></i> <span>सुरक्षित UPI गेटवे खुल रहा है...</span>';
    payBtn.disabled = true;
  }

  trackMetaEvent('InitiateCheckout', {
    value: APP_CONFIG.CONSULTATION_AMOUNT,
    currency: APP_CONFIG.CURRENCY,
    content_name: '₹351 Palmistry & Kundali Consultation',
    customer_phone: phone,
    customer_name: name
  });

  try {
    // Check if order was already preloaded from auto-save
    let data = null;
    if (preloadedOrderData && preloadedOrderData.phone === phone && preloadedOrderData.order_id) {
      data = {
        success: true,
        order_id: preloadedOrderData.order_id,
        key_id: preloadedOrderData.key_id || APP_CONFIG.RAZORPAY_KEY_ID,
        amount: preloadedOrderData.amount || 35100,
        currency: preloadedOrderData.currency || "INR"
      };
      console.log("⚡ Using preloaded Razorpay Order for instant popup:", data.order_id);
    } else {
      // Creates Razorpay Order with Real Customer Details
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, problem })
      });
      data = await response.json();
    }

    if (data.success && data.order_id) {
      console.log("✅ Razorpay ₹351 Order Ready (Instant):", data.order_id);

      const problemMap = {
        'marriage_love': 'विवाह में विलंब, वैवाहिक कलह व प्रेम संबंध',
        'career_business': 'करियर, नौकरी में तरक्की व व्यापार में रुकावट',
        'finance_debt': 'आर्थिक तंगी, बचत न होना व कर्ज मुक्ति',
        'health_family': 'स्वास्थ्य, मानसिक तनाव व पारिवारिक अशांति',
        'general_guidance': 'हस्तरेखा व कुंडली का संपूर्ण जीवन मार्गदर्शन'
      };
      const selectedProblem = problemMap[problem] || 'हस्तरेखा व कुंडली विश्लेषण';

      // WhatsApp रीडायरेक्शन लिंक तैयार करें
      const getWhatsAppUrl = (paymentId) => {
        const text = `जय श्री राम, मैंने ₹351 की दक्षिणा देकर संपूर्ण हस्तरेखा व कुंडली परामर्श बुक कर लिया है।\n\n📌 *मेरे विवरण:*\n• नाम: ${name}\n• फ़ोन: ${phone}\n• मुख्य विषय: ${selectedProblem}\n• पेमेंट ID: ${paymentId || ''}\n\nकृपया 24 घंटे में मेरी विस्तृत समाधान रिपोर्ट व आचार्य जी का ऑडियो संदेश तैयार करें। यह मेरी दोनों हथेलियों की साफ फोटो है:`;
        return `https://wa.me/${APP_CONFIG.WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent(text)}`;
      };

      // Razorpay Standard One-Time Order Options (No AutoPay)
      const options = {
        key: data.key_id || APP_CONFIG.RAZORPAY_KEY_ID,
        amount: data.amount || 35100,
        currency: data.currency || "INR",
        name: APP_CONFIG.BUSINESS_NAME,
        description: "₹351 संपूर्ण हस्तरेखा व कुंडली विश्लेषण (24 घंटे में रिपोर्ट)",
        image: "https://cdn-icons-png.flaticon.com/512/3663/3663335.png",
        order_id: data.order_id,
        prefill: {
          name: name,
          contact: phone
        },
        theme: {
          color: "#D97706"
        },
        handler: function (resp) {
          console.log("✅ Payment Successful! Redirecting to WhatsApp...");
          const paymentId = resp.razorpay_payment_id || resp.razorpay_order_id || ('PAY_' + Date.now());

          // 1. Meta Pixel: Purchase Event Fire (₹351)
          trackMetaEvent('Purchase', {
            value: APP_CONFIG.CONSULTATION_AMOUNT,
            currency: APP_CONFIG.CURRENCY,
            content_name: '₹351 Palmistry & Kundali Consultation'
          }, { eventID: paymentId });

          // 2. Server-side Meta Conversions API (CAPI)
          try {
            fetch('/api/track-purchase', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phone: phone,
                name: name,
                payment_id: paymentId,
                value: APP_CONFIG.CONSULTATION_AMOUNT
              })
            }).catch(() => {});
          } catch (e) {}

          // 🚀 सीधे WhatsApp पर ऑटोमैटिक रीडायरेक्ट!
          window.location.href = getWhatsAppUrl(paymentId);
        },
        modal: {
          ondismiss: function () {
            preloadedOrderPromise = null;
            if (payBtn) {
              payBtn.disabled = false;
              payBtn.innerHTML = '<i class="fa-solid fa-lock"></i> <span>सुरक्षित भुगतान करें — मात्र ₹351 →</span>';
            }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (pErr) {
        console.warn("Payment notice:", pErr);
        preloadedOrderPromise = null;
        if (payBtn) {
          payBtn.disabled = false;
          payBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> <span>पुनः प्रयास करें — ₹351</span>';
        }
      });
      rzp.open();

    } else {
      throw new Error(data.error || "ऑर्डर नहीं बन सका। कृपया पुनः प्रयास करें।");
    }
  } catch (err) {
    console.error("Order Error:", err);
    alert("सूचना: " + err.message);
    if (payBtn) {
      payBtn.innerHTML = '<i class="fa-solid fa-lock"></i> <span>सुरक्षित भुगतान करें — मात्र ₹351 →</span>';
      payBtn.disabled = false;
    }
  }
}

// ================= LIVE SOCIAL PROOF TICKER =================
function startLiveProofTicker() {
  const toast = document.getElementById("liveProofToast");
  const textEl = document.getElementById("liveProofText");
  const timeEl = document.getElementById("liveProofTime");
  if (!toast || !textEl || !timeEl) return;

  const proofs = [
    { name: "संजय माथुर (जयपुर)", action: "ने ₹351 का परामर्श बुक किया", time: "2 मिनट पहले" },
    { name: "शालिनी कुलश्रेष्ठ (भोपाल)", action: "ने हस्तरेखा विश्लेषण बुक किया", time: "4 मिनट पहले" },
    { name: "विकास अग्रवाल (कानपुर)", action: "ने करियर परामर्श बुक किया", time: "7 मिनट पहले" },
    { name: "रोहित तोमर (इंदौर)", action: "ने कुंडली व हस्तरेखा बुक की", time: "11 मिनट पहले" },
    { name: "अनिता मिश्रा (लखनऊ)", action: "ने ₹351 परामर्श बुक किया", time: "14 मिनट पहले" },
    { name: "दीपक शर्मा (दिल्ली)", action: "ने विवाह विलंब समाधान बुक किया", time: "18 मिनट पहले" }
  ];

  let currentIndex = 0;

  function showNextProof() {
    const item = proofs[currentIndex];
    textEl.textContent = `${item.name} ${item.action}`;
    timeEl.textContent = `${item.time} • सत्यापित जातक`;

    toast.classList.remove("opacity-0", "translate-y-4");
    toast.classList.add("opacity-100", "translate-y-0");

    setTimeout(() => {
      toast.classList.remove("opacity-100", "translate-y-0");
      toast.classList.add("opacity-0", "translate-y-4");
    }, 4500);

    currentIndex = (currentIndex + 1) % proofs.length;
  }

  setTimeout(() => {
    showNextProof();
    setInterval(showNextProof, 12000);
  }, 3500);
}

document.addEventListener("DOMContentLoaded", () => {
  startCountdown();
  startLiveProofTicker();
  setupAutoLeadCapture();
});
