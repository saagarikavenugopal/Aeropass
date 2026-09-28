const { success, failure } = require('../../utils/apiResponse');
const Flight = require('../../models/Flight');

async function addFlight(req, res, next) {
  try {
    const flight = await Flight.create({ ...req.body, passenger: req.user.id });
    return success(res, flight, 'Flight added', 201);
  } catch (err) {
    next(err);
  }
}

async function listMyFlights(req, res, next) {
  try {
    const flights = await Flight.find({ passenger: req.user.id }).sort({ departureTime: 1 });
    return success(res, flights, 'Flights fetched');
  } catch (err) {
    next(err);
  }
}

async function getFlight(req, res, next) {
  try {
    const flight = await Flight.findOne({ _id: req.params.id, passenger: req.user.id });
    if (!flight) return failure(res, 'Flight not found', 404);
    return success(res, flight, 'Flight fetched');
  } catch (err) {
    next(err);
  }
}

async function updateFlight(req, res, next) {
  try {
    const flight = await Flight.findOneAndUpdate(
      { _id: req.params.id, passenger: req.user.id },
      req.body,
      { new: true }
    );
    if (!flight) return failure(res, 'Flight not found', 404);
    return success(res, flight, 'Flight updated');
  } catch (err) {
    next(err);
  }
}

module.exports = { addFlight, listMyFlights, getFlight, updateFlight };
