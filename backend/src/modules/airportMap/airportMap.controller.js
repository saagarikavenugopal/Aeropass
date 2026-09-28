const { success, failure } = require('../../utils/apiResponse');
const AirportLocation = require('../../models/AirportLocation');

async function listLocations(req, res, next) {
  try {
    const { type, terminal, search } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (terminal) filter.terminal = terminal;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const locations = await AirportLocation.find(filter).sort({ terminal: 1, name: 1 });
    return success(res, locations, 'Locations fetched');
  } catch (err) {
    next(err);
  }
}

async function getLocation(req, res, next) {
  try {
    const location = await AirportLocation.findById(req.params.id);
    if (!location) return failure(res, 'Location not found', 404);
    return success(res, location, 'Location fetched');
  } catch (err) {
    next(err);
  }
}

/**
 * Naive straight-line "navigation": returns an ordered waypoint list from
 * a source location to a destination (e.g. current position -> gate).
 * Swap for a real pathfinding graph over terminal corridors when available.
 */
async function navigate(req, res, next) {
  try {
    const { fromId, toId } = req.query;
    const from = await AirportLocation.findById(fromId);
    const to = await AirportLocation.findById(toId);
    if (!from || !to) return failure(res, 'Invalid fromId or toId', 404);

    const distance = Math.sqrt(
      Math.pow(to.coordinates.x - from.coordinates.x, 2) +
        Math.pow(to.coordinates.y - from.coordinates.y, 2)
    );

    return success(res, {
      from: { id: from._id, name: from.name },
      to: { id: to._id, name: to.name },
      waypoints: [from.coordinates, to.coordinates],
      estimatedDistanceMeters: Math.round(distance),
      estimatedWalkMinutes: Math.max(1, Math.round(distance / 80)), // ~80m/min walking pace
    }, 'Navigation route computed');
  } catch (err) {
    next(err);
  }
}

async function createLocation(req, res, next) {
  try {
    const location = await AirportLocation.create(req.body);
    return success(res, location, 'Location created', 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { listLocations, getLocation, navigate, createLocation };
