import {
  registerUser,
  loginUser,
  getAuthCookieOptions,
  updateUserProfile,
} from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await registerUser({ name, email, password });

    res.cookie('token', token, getAuthCookieOptions());

    res.status(201).json({
      success: true,
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser({ email, password });

    res.cookie('token', token, getAuthCookieOptions());

    res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('token', { path: '/' });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: req.user,
  });
}

export async function patchProfile(req, res, next) {
  try {
    const { name, avatar } = req.body;
    const updated = await updateUserProfile(req.user.id, { name, avatar });

    res.status(200).json({
      success: true,
      user: updated,
    });
  } catch (err) {
    next(err);
  }
}
