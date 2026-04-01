
async function testApis() {
  console.log("Starting API tests...");
  
  const baseUrl = "http://localhost:3000";

  // Test 1: Track Event
  try {
    const trackRes = await fetch(`${baseUrl}/api/trackEvent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: { email: "test@example.com" } }),
    });
    console.log(`TrackEvent Status: ${trackRes.status}`);
  } catch (e) {
    console.error("TrackEvent failed:", e);
  }

  // Test 2: Simulate Payment Failure
  try {
    const payRes = await fetch(`${baseUrl}/api/simulatePaymentFailure`, { method: "POST" });
    const payData = await payRes.json();
    console.log(`SimulatePaymentFailure Status: ${payRes.status}, Actions:`, payData.actions);
  } catch (e) {
    console.error("SimulatePaymentFailure failed:", e);
  }

  // Test 3: Send SMS
  try {
    const smsRes = await fetch(`${baseUrl}/api/sendSms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: {
          recipient: "6179554170",
          content: "Test SMS from Aura"
        }
      }),
    });
    const smsData = await smsRes.json();
    console.log(`SendSMS Status: ${smsRes.status}, Data:`, smsData);
  } catch (e) {
    console.error("SendSMS failed:", e);
  }
}

testApis();
