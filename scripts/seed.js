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
      { type: 'terminal', name: 'Terminal 1 - International Concourse', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 50, y: 50 }, description: 'Primary international departures terminal' },
      { type: 'terminal', name: 'Terminal 2 - Domestic Hub', terminal: 'T2', floor: 'Floor 1', coordinates: { x: 50, y: 150 }, description: 'Regional and domestic connections' },
      { type: 'gate', name: 'Gate A1 (SkyPriority)', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 180, y: 40 }, description: 'Widebody international departures' },
      { type: 'gate', name: 'Gate A2', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 220, y: 40 }, description: 'European flight departures' },
      { type: 'gate', name: 'Gate B1', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 180, y: 120 }, description: 'Transatlantic corridor' },
      { type: 'checkpoint', name: 'Security Checkpoint A (FastTrack & Biometric)', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 90, y: 40 }, description: 'Optical turnstile and biometric gate' },
      { type: 'checkpoint', name: 'TSA PreCheck Checkpoint Alpha', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 90, y: 80 }, description: 'Expedited screening for pre-cleared travelers' },
      { type: 'shop', name: 'World Duty Free Plaza & Fragrance', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 130, y: 45 }, description: 'Tax-free perfumes, spirits, and luxury items', tags: ['shopping', 'luxury', 'duty-free'] },
      { type: 'shop', name: 'Hudson News & Travel Essentials', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 110, y: 30 }, description: 'Magazines, electronics chargers, travel snacks', tags: ['essentials', 'books', 'electronics'] },
      { type: 'restaurant', name: 'Skyline Artisan Cafe & Roastery', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 140, y: 65 }, description: 'Specialty espresso, fresh pastries, and breakfast', tags: ['coffee', 'cafe', 'breakfast'] },
      { type: 'restaurant', name: 'Caviar & Seafood Oyster Bar', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 160, y: 35 }, description: 'Fine champagne, fresh oysters, and gourmet dishes', tags: ['fine-dining', 'alcohol', 'seafood'] },
      { type: 'lounge', name: 'SkyPriority First & Business Lounge', terminal: 'T1', floor: 'Floor 3', coordinates: { x: 170, y: 20 }, description: 'Complimentary buffet, private showers, and quiet work pods', tags: ['lounge', 'quiet', 'wifi'] },
      { type: 'atm', name: 'Global Forex Currency Exchange & ATM', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 75, y: 55 }, description: 'Multi-currency ATM and travel cards', tags: ['atm', 'money', 'banking'] },
      { type: 'restroom', name: 'Executive Restrooms & Family Room', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 125, y: 20 }, description: 'Accessible touchless restrooms with baby changing amenities', tags: ['restroom', 'accessible'] },
      { type: 'amenity', name: 'Rapid Baggage Drop Counter 04', terminal: 'T1', floor: 'Floor 1', coordinates: { x: 60, y: 30 }, description: 'Automated self-service bag drop and weighing scale', tags: ['baggage', 'check-in'] },
      { type: 'amenity', name: 'Airport Medical & First Aid Station', terminal: 'T1', floor: 'Floor 2', coordinates: { x: 80, y: 70 }, description: '24/7 EMT staff and travel pharmacy', tags: ['medical', 'emergency', 'pharmacy'] },
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
