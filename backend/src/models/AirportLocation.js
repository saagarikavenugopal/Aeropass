const mongoose = require('mongoose');

const airportLocationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['terminal', 'gate', 'shop', 'restaurant', 'checkpoint', 'amenity'], required: true },
    name: { type: String, required: true },
    terminal: { type: String },
    floor: { type: String },
    coordinates: { x: Number, y: Number }, // simple 2D map coordinates
    description: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AirportLocation', airportLocationSchema);
