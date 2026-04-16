import React from 'react';
import { useNavigate } from 'react-router-dom';
 
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
              <button onClick={() => navigate('/')}>Get Started</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
 
export default Pricing;