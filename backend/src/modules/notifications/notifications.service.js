const config = require('../../config');
const Notification = require('../../models/Notification');

async function notify(userId, { title, message, type = 'info' }) {
  const notification = await Notification.create({ recipient: userId, title, message, type });

  if (config.providers.notifications === 'stub') {
    console.log(`[notify:stub] -> user ${userId}: [${type}] ${title} — ${message}`);
  }
  // Hook point: push via email/SMS/websocket/FCM here using config.providers.notifications.

  return notification;
}

module.exports = { notify };
