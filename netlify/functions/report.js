exports.handler = async function(event, context) {
  if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    const fetch = (await import('node-fetch')).default;
    // Your Discord webhook URL
    const discordWebhookUrl = 'https://discord.com/api/webhooks/1284559062859518014/kac428QnDZZlEnJxL-WSEvx1WOrNKjLPg4cNhKAL4xmkIjI4DkqJ0BlI-wi0YsXcn8ah';

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
