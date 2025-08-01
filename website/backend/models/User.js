const mongoose = require('mongoose');

const screamTimelineSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  decibels: {
    type: Number,
    required: true
  }
});

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  maxVolume: {
    type: Number,
    default: 0
  },
  totalScreams: {
    type: Number,
    default: 0
  },
  adsDefeated: {
    type: Number,
    default: 0
  },
  peakTime: {
    type: String,
    default: "12:00 PM"
  },
  screamTimeline: [screamTimelineSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  micSensitivity: {
    type: Number,
    default: 75,
    min: 0,
    max: 100
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
userStatsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserStats = mongoose.model('UserStats', userStatsSchema);
const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

module.exports = {
  UserStats,
  UserSettings
}; 