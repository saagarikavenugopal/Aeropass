const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const User = require('../../models/User');
const Passenger = require('../../models/Passenger');

async function register({ fullName, email, password, phone }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email, passwordHash, phone });
  await Passenger.create({ user: user._id });

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

module.exports = {
  register,
  validateCredentials,
  issueTokens,
  storeRefreshToken,
  rotateRefreshToken,
};
