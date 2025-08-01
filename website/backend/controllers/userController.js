const { UserStats, UserSettings } = require('../models/User');

// Dummy data for development
const dummyScreamTimeline = [
  { time: "9:00", decibels: 45 },
  { time: "9:30", decibels: 78 },
  { time: "10:00", decibels: 92 },
  { time: "10:30", decibels: 67 },
  { time: "11:00", decibels: 105 },
  { time: "11:30", decibels: 89 },
  { time: "12:00", decibels: 112 },
  { time: "12:30", decibels: 95 },
  { time: "13:00", decibels: 87 },
  { time: "13:30", decibels: 98 }
];

// Get user stats
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // For now, return dummy data
    // In production, you would fetch from MongoDB
    const userStats = {
      userId: userId,
      maxVolume: 112,
      totalScreams: 1337,
      adsDefeated: 2420,
      peakTime: "12:00 PM",
      screamTimeline: dummyScreamTimeline
    };

    res.status(200).json({
      success: true,
      data: userStats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user settings
const getUserSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    // For now, return dummy data
    // In production, you would fetch from MongoDB
    const userSettings = {
      micSensitivity: 75,
      isEnabled: true
    };

    res.status(200).json({
      success: true,
      data: userSettings
    });

  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update user settings
const updateUserSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { micSensitivity, isEnabled } = req.body;

    // For now, just return success
    // In production, you would update MongoDB
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        micSensitivity: micSensitivity || 75,
        isEnabled: isEnabled !== undefined ? isEnabled : true
      }
    });

  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Record a new scream (for future use)
const recordScream = async (req, res) => {
  try {
    const { userId } = req.params;
    const { decibels, timestamp } = req.body;

    // For now, just return success
    // In production, you would save to MongoDB
    res.status(200).json({
      success: true,
      message: 'Scream recorded successfully',
      data: {
        decibels: decibels || 85,
        timestamp: timestamp || new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error recording scream:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getUserStats,
  getUserSettings,
  updateUserSettings,
  recordScream
}; 