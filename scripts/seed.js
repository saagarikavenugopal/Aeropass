/**
 * Seed script: creates a demo admin, a checkpoint officer, and a handful of
 * airport map locations so the frontend has something to render immediately.
 *
 * Run with: npm run seed  (from backend/)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const config = require('../backend/src/config');
const User = require('../backend/src/models/User');
const AirportLocation = require('../backend/src/models/AirportLocation');

async function seed() {
  await mongoose.connect(config.mongoUri);
  console.log('[seed] connected to DB');

  const adminEmail = 'admin@airport-platform.local';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      fullName: 'Platform Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash('Admin@12345', 10),
      role: 'admin',
    });
    console.log(`[seed] created admin -> ${adminEmail} / Admin@12345`);
  }

  const officerEmail = 'officer@airport-platform.local';
  const existingOfficer = await User.findOne({ email: officerEmail });
  if (!existingOfficer) {
    await User.create({
      fullName: 'Checkpoint Officer',
      email: officerEmail,
      passwordHash: await bcrypt.hash('Officer@12345', 10),
      role: 'checkpoint_officer',
    });
    console.log(`[seed] created checkpoint officer -> ${officerEmail} / Officer@12345`);
  }

  const locationCount = await AirportLocation.countDocuments();
  if (locationCount === 0) {
    await AirportLocation.insertMany([
      { type: 'terminal', name: 'Terminal 1', terminal: 'T1', coordinates: { x: 0, y: 0 } },
      { type: 'gate', name: 'Gate A1', terminal: 'T1', coordinates: { x: 120, y: 40 } },
      { type: 'gate', name: 'Gate A2', terminal: 'T1', coordinates: { x: 160, y: 40 } },
      { type: 'checkpoint', name: 'Security Checkpoint A', terminal: 'T1', coordinates: { x: 60, y: 20 } },
      { type: 'shop', name: 'Duty Free Plaza', terminal: 'T1', coordinates: { x: 80, y: 30 } },
      { type: 'restaurant', name: 'Skyline Cafe', terminal: 'T1', coordinates: { x: 100, y: 35 } },
    ]);
    console.log('[seed] created sample airport map locations');
  }

  console.log('[seed] done');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
