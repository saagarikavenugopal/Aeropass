const { success, failure } = require('../../utils/apiResponse');
const authService = require('./auth.service');

async function register(req, res, next) {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password) {
      return failure(res, 'fullName, email and password are required', 422);
    }
    const user = await authService.register({ fullName, email, password, phone });
    return success(res, { userId: user._id, email: user.email }, 'Registered successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return failure(res, 'email and password are required', 422);
    }
    const user = await authService.validateCredentials(email, password);
    const tokens = authService.issueTokens(user);
    await authService.storeRefreshToken(user, tokens.refreshToken);
    return success(res, {
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      ...tokens,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return failure(res, 'refreshToken is required', 422);
    const { tokens } = await authService.rotateRefreshToken(refreshToken);
    return success(res, tokens, 'Token refreshed');
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  return success(res, { user: req.user }, 'Current user');
}

module.exports = { register, login, refresh, me };
