const fetch = require('node-fetch'); // Ensure node-fetch is installed

exports.handler = async function(event, context) {
  // Check if there's a content query parameter
  const url = new URL(event.rawUrl, `https://${event.headers.host}`);
  const content = url.searchParams.get('content');

  if (!content) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No content parameter provided' })
    };
  }

  // Replace this URL with your actual Discord webhook URL
  const discordWebhookUrl = 'https://discord.com/api/webhooks/1284559062859518014/kac428QnDZZlEnJxL-WSEvx1WOrNKjLPg4cNhKAL4xmkIjI4DkqJ0BlI-wi0YsXcn8ah';

  // Prepare the payload for Discord
  const payload = {
    content: content
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
      body: JSON.stringify({ error: 'Failed to send message to Discord' })
    };
  }

  // Construct the mailto link
  const mailtoLink = `mailto:nexusmcreports@proton.me?subject=Support%20Query&body=${encodeURIComponent(content)}`;
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Message sent to Discord', mailtoLink })
  };
};
