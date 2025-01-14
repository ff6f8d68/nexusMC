exports.handler = async function(event, context) {
  if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    const fetch = (await import('node-fetch')).default;
    // Your Discord webhook URL

    const wht = "a2FjNDI4UW5EWlpsRW5KeEwtV1NFdngxV09yTktqTFBnNGNOaEtBTDR4bWtJakk0RGtxSjBCbEktd2kwWXNYY244YWg=";
    const whId = "MTI4NDU1OTA2Mjg1OTUxODAxNC8=";
    const base = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3Mv";
    const discordWebhookUrl = Buffer.from(base+whId+wht, 'base64').toString('utf-8');

    // Prepare the payload for Discord
    const payload = {
      content: `Type: ${data.Type}\nEmail: ${data.email}\nMessage: ${data.Report}`
    };

    // Send the message to Discord
    try {
      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send report' })
      };
    }

    // Redirect to the mailto link
    return {
      statusCode: 302,
      headers: {
        Location: `mailto:nexusmcreports@proton.me?subject=Support%20Query&body=${encodeURIComponent(data.Report)}`
      }
    };
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
};
