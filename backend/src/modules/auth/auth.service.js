const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const User = require('../../models/User');
const Passenger = require('../../models/Passenger');

async function register({ fullName, email, password, phone, role = 'passenger' }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userRole = ['checkpoint_officer', 'admin'].includes(role) ? role : 'passenger';
  const user = await User.create({ fullName, email, passwordHash, phone, role: userRole });
  if (userRole === 'passenger') {
    await Passenger.create({ user: user._id });
  }

  return user;
}

async function validateCredentials(email, password) {
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  return user;
}

function issueTokens(user) {
  const payload = { id: user._id, role: user.role, email: user.email };
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
}

async function storeRefreshToken(user, refreshToken) {
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();
}

async function rotateRefreshToken(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch (err) {
    const e = new Error('Invalid or expired refresh token');
    e.statusCode = 401;
    throw e;
  }

  const user = await User.findById(payload.id);
  if (!user || !user.refreshTokenHash) {
    const e = new Error('Refresh token not recognized');
    e.statusCode = 401;
    throw e;
  }

  const match = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!match) {
    const e = new Error('Refresh token not recognized');
    e.statusCode = 401;
    throw e;
  }

  const tokens = issueTokens(user);
  await storeRefreshToken(user, tokens.refreshToken);
  return { user, tokens };
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) {
    const err = new Error('Current password does not match existing record');
    err.statusCode = 400;
    throw err;
  }
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return { success: true };
}

async function getMe(userId) {
  const user = await User.findById(userId).select('-passwordHash -refreshTokenHash');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
}

async function logout(userId) {
  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }
  return { success: true };
}

async function forgotPassword(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const err = new Error('No account found with this email address');
    err.statusCode = 404;
    throw err;
  }
  // Generate a friendly 6-digit cryptographic security code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const resetToken = `SEC-${code}`;
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  try {
    const { notify } = require('../notifications/notifications.service');
    await notify(user._id, {
      title: 'Password Reset Token Requested',
      message: `Your verification code is ${resetToken}. It expires in 60 minutes.`,
      type: 'warning',
    });
  } catch (e) {}

  return { email: user.email, resetToken };
}

async function resetPassword({ email, resetToken, newPassword }) {
  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordToken: resetToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    const err = new Error('Invalid or expired password reset token');
    err.statusCode = 400;
    throw err;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.refreshTokenHash = null;
  await user.save();

  try {
    const { notify } = require('../notifications/notifications.service');
    await notify(user._id, {
      title: 'Password Successfully Reset',
      message: 'Your account security credentials were changed. Please log in with your new password.',
      type: 'success',
    });
  } catch (e) {}

  return { success: true };
}

module.exports = {
  register,
  validateCredentials,
  issueTokens,
  storeRefreshToken,
  rotateRefreshToken,
  changePassword,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
};
