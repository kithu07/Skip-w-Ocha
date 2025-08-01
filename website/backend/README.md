# Skip-w-Ocha Backend API

Backend server for the Skip-w-Ocha Chrome extension dashboard, built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/skip-w-ocha
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start the server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 API Endpoints

### Health Check
- **GET** `/health` - Check if the API is running

### User Stats
- **GET** `/api/user-stats/:userId` - Get user statistics and scream timeline

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "1234",
    "maxVolume": 112,
    "totalScreams": 1337,
    "adsDefeated": 2420,
    "peakTime": "12:00 PM",
    "screamTimeline": [
      { "time": "9:00", "decibels": 45 },
      { "time": "9:30", "decibels": 78 }
    ]
  }
}
```

### User Settings
- **GET** `/api/settings/:userId` - Get user settings
- **PUT** `/api/settings/:userId` - Update user settings

**Response:**
```json
{
  "success": true,
  "data": {
    "micSensitivity": 75,
    "isEnabled": true
  }
}
```

### Record Scream
- **POST** `/api/scream/:userId` - Record a new scream event

**Request Body:**
```json
{
  "decibels": 85,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🏗️ Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── userController.js    # Business logic
├── middleware/
│   └── cors.js             # CORS configuration
├── models/
│   └── User.js             # MongoDB schemas
├── routes/
│   └── userRoutes.js       # API routes
├── app.js                  # Express app setup
├── server.js               # Server entry point
└── package.json
```

## 🔧 Development

### Current Status
- ✅ MongoDB connection setup
- ✅ User stats endpoint with dummy data
- ✅ User settings endpoint with dummy data
- ✅ CORS configuration
- ✅ Error handling
- ✅ Security middleware (helmet)
- ✅ Logging (morgan)

### Next Steps
- [ ] Connect to real MongoDB data
- [ ] Add authentication
- [ ] Add data validation
- [ ] Add rate limiting
- [ ] Add tests

## 🎤 Features

- **Voice Detection Stats**: Track scream volume and frequency
- **Ad Skipping Analytics**: Monitor ads defeated
- **User Settings**: Manage microphone sensitivity and extension status
- **Real-time Data**: Ready for real-time updates from Chrome extension

## 🔗 Integration

The backend is designed to work with:
- Chrome extension for data collection
- React dashboard for data visualization
- MongoDB for data persistence

---

**Made with ❤️ by Team Masala Dosa** 