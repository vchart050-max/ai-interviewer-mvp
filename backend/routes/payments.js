const express = require('express');
const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create subscription
router.post('/subscribe', async (req, res) => {
  try {
    const { email, planId, plan } = req.body;

    // Plan prices in paise (₹200 = 20000 paise)
    const planPrices = {
      starter: 5000, // ₹50
      professional: 20000, // ₹200
      enterprise: 50000, // ₹500
    };

    // Create subscription on Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId, // You need to create plans in Razorpay dashboard
      customer_notify: 1,
      email: email,
    });

    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Handle payment success
router.post('/success', async (req, res) => {
  try {
    const { userId, subscriptionId, plan } = req.body;

    // Verify subscription with Razorpay
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);

    // Update user in database
    await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        subscription_plan: plan,
        razorpay_subscription_id: subscriptionId,
      })
      .eq('id', userId);

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;