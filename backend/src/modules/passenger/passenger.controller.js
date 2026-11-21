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
    const { fullName, phone, dateOfBirth, nationality, passportNumber, address, emergencyContact } = req.body;

    const profile = await Passenger.findOneAndUpdate(
      { user: req.user.id },
      { dateOfBirth, nationality, passportNumber, address, emergencyContact },
      { new: true, upsert: true }
    );

    const userUpdate = {};
    if (fullName) userUpdate.fullName = fullName;
    if (phone) userUpdate.phone = phone;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(req.user.id, userUpdate);
    }

    const updatedProfile = await Passenger.findOne({ user: req.user.id }).populate(
      'user',
      'fullName email phone role'
    );

    return success(res, updatedProfile, 'Profile updated');
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
