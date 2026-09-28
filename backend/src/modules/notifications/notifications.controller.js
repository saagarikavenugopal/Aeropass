const { success, failure } = require('../../utils/apiResponse');
const Notification = require('../../models/Notification');

async function listMyNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 });
    return success(res, notifications, 'Notifications fetched');
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return failure(res, 'Notification not found', 404);
    return success(res, notification, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
}

module.exports = { listMyNotifications, markRead };
