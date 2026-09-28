const { success, failure } = require('../../utils/apiResponse');
const Passenger = require('../../models/Passenger');
const User = require('../../models/User');

async function getProfile(req, res, next) {
  try {
    const profile = await Passenger.findOne({ user: req.user.id }).populate(
      'user',
      'fullName email phone role'
    );
    if (!profile) return failure(res, 'Profile not found', 404);
    return success(res, profile, 'Profile fetched');
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { dateOfBirth, nationality, passportNumber, address, emergencyContact, phone } = req.body;

    const profile = await Passenger.findOneAndUpdate(
      { user: req.user.id },
      { dateOfBirth, nationality, passportNumber, address, emergencyContact },
      { new: true, upsert: true }
    );

    if (phone) {
      await User.findByIdAndUpdate(req.user.id, { phone });
    }

    return success(res, profile, 'Profile updated');
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
