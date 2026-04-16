const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
 
// Create checkout session
router.post('/checkout', async (req, res) => {
  try {
    const { userId, plan } = req.body;
 
    const prices = {
      starter: 'price_starter_monthly',
      professional: 'price_professional_monthly',
      enterprise: 'price_enterprise_monthly',
    };
 
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: req.body.email,
      line_items: [
        {
          price: prices[plan],
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        userId,
        plan,
      },
    });
 
    res.json({ url: session.url });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(400).json({ error: error.message });
  }
});
 
// Webhook for payment confirmation
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
 
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
 
      // Update user subscription in database
      await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          subscription_plan: subscription.metadata?.plan,
          stripe_customer_id: subscription.customer,
        })
        .eq('id', subscription.metadata?.userId);
    }
 
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
 
module.exports = router;