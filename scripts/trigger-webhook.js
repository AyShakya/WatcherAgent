import dotenv from 'dotenv';
dotenv.config();

const payload = {
  service: "checkout-service",
  error: "Error: ECONNREFUSED 127.0.0.1:5432",
  message: "Failed to connect to postgres database. Checkout process failing for all users.",
  stack: "Error: ECONNREFUSED 127.0.0.1:5432\n    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1605:16)",
  metadata: {
    env: "production",
    region: "us-east-1",
    timestamp: new Date().toISOString()
  }
};

async function trigger() {
  const port = process.env.PORT || 3000;
  const url = `http://localhost:${port}/webhook`;
  
  console.log(`🚀 Sending test webhook to ${url}...`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ Webhook failed with status ${response.status}: ${text}`);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Webhook accepted!');
    console.log('Incident ID:', data.incident_id);
    console.log('Severity:', data.severity);
    console.log('\nNext steps:');
    console.log('1. Check your Discord channel for the alert.');
    console.log('2. Click "Accept & Fix" to trigger the GitHub PR.');
    console.log('3. Or click "Ignore" to terminate the incident.');
  } catch (error) {
    console.error('❌ Error sending webhook:', error.message);
  }
}

trigger();
