/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient';

function Pricing() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: 50,
      interviews: 5,
      features: ['Basic fraud detection', 'Manual certificate review', 'Email support'],
    },
    {
      name: 'Professional',
      price: 200,
      interviews: 50,
      features: ['Full fraud detection', 'Auto certificate validation', 'Priority support', 'API access'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 500,
      interviews: 'Unlimited',
      features: ['Everything in Professional', 'Custom branding', 'Dedicated account manager', 'SLA'],
    },
  ];

  const handleSubscribe = async (plan) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payments/subscribe`,
        {
          email: session.user.email,
          plan: plan,
        }
      );

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        subscription_id: response.data.subscriptionId,
        name: 'ScoreBar',
        description: `ScoreBar ${plan} Plan`,
        handler: async function () {
          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/payments/success`,
            {
              userId: session.user.id,
              subscriptionId: response.data.subscriptionId,
              plan: plan,
            }
          );

          alert('Payment successful!');
          window.location.href = '/dashboard';
        },
        theme: {
          color: '#667eea',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Try again.');
    }
  };

  return (
    <div className="pricing-page">
      <nav className="navbar">
        <h2>ScoreBar</h2>
        <button onClick={() => navigate('/')}>Home</button>
      </nav>

      <div className="pricing-container">
        <h1>Simple, Transparent Pricing</h1>
        <p className="subtitle">Choose the plan that fits your hiring needs</p>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.name} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="amount">${plan.price}</span>
                <span className="period">/month</span>
              </div>
              <p className="interviews">{plan.interviews} interviews/month</p>
              <ul className="features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>

              <button onClick={() => handleSubscribe(plan.name)}>
                Subscribe Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pricing;