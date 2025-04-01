// Mock API endpoint for admin metrics
const express = require('express');
const router = express.Router();

// Generate realistic mock data
function generateMockData() {
    const now = new Date();
    const hour = now.getHours();
    
    return {
        onlineUsers: Math.floor(1000 + Math.random() * 500),
        activeCalls: Math.floor(200 + Math.random() * 150),
        totalConnections: Math.floor(5000 + Math.random() * 1000),
        revenue: Math.floor(8000 + Math.random() * 1000),
        onlineUsersChange: Math.floor(Math.random() * 20) - 5,
        activeCallsChange: Math.floor(Math.random() * 15) - 5,
        connectionsChange: Math.floor(Math.random() * 25) - 5,
        revenueChange: Math.floor(Math.random() * 30) - 5,
        avgDuration: (12 + Math.random() * 5).toFixed(1),
        peakHours: hour > 12 && hour < 18 ? '2:00 PM - 5:00 PM' : '9:00 AM - 12:00 PM',
        busiestDay: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()],
        userCountries: 15 + Math.floor(Math.random() * 10),
        uptime: (99.9 + Math.random() * 0.1).toFixed(2),
        latency: Math.floor(30 + Math.random() * 30),
        storage: Math.floor(70 + Math.random() * 20)
    };
}

router.get('/', (req, res) => {
    res.json(generateMockData());
});

module.exports = router;