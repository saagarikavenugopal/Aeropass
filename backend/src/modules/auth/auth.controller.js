const { success, failure } = require('../../utils/apiResponse');
const authService = require('./auth.service');

async function register(req, res, next) {
  try {
    const { fullName, email, password, phone, role } = req.body;
    if (!fullName || !email || !password) {
      return failure(res, 'fullName, email and password are required', 422);
    }
    const user = await authService.register({ fullName, email, password, phone, role });
    const tokens = authService.issueTokens(user);
    return success(res, {
      userId: user._id,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      email: user.email,
      role: user.role,
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokens,
    }, 'Registered successfully', 201);
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
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokens,
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

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return failure(res, 'currentPassword and newPassword are required', 422);
    }
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return success(res, null, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, user, 'Current user profile');
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user?.id);
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return failure(res, 'email is required', 422);
    const result = await authService.forgotPassword(email);
    return success(res, result, 'Password reset token generated. Code sent.');
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return failure(res, 'email, resetToken, and newPassword are required', 422);
    }
    await authService.resetPassword({ email, resetToken, newPassword });
    return success(res, null, 'Password successfully reset. Please log in.');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, me, logout, changePassword, forgotPassword, resetPassword };
