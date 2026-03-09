const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// In-memory database (in production, use a real database)
let usersData = {};

// Helper to get or create user data
function getUserData(userId) {
    if (!usersData[userId]) {
        usersData[userId] = {
            activities: [],
            reminders: [],
            completedToday: [],
            lastReset: new Date().toDateString()
        };
    }
    return usersData[userId];
}

// Routes

// Get all data for a user
app.get('/api/user/:userId/data', (req, res) => {
    const { userId } = req.params;
    const userData = getUserData(userId);
    
    // Reset completed if new day
    const today = new Date().toDateString();
    if (userData.lastReset !== today) {
        userData.completedToday = [];
        userData.lastReset = today;
    }
    
    res.json(userData);
});

// Add activity
app.post('/api/user/:userId/activities', (req, res) => {
    const { userId } = req.params;
    const { name, frequency } = req.body;
    
    if (!name || !frequency) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    
    const userData = getUserData(userId);
    const activity = {
        id: Date.now(),
        name,
        frequency,
        createdAt: new Date().toLocaleString()
    };
    
    userData.activities.push(activity);
    res.json(activity);
});

// Delete activity
app.delete('/api/user/:userId/activities/:activityId', (req, res) => {
    const { userId, activityId } = req.params;
    const userData = getUserData(userId);
    
    userData.activities = userData.activities.filter(a => a.id != activityId);
    res.json({ success: true });
});

// Mark activity as completed
app.post('/api/user/:userId/activities/:activityId/complete', (req, res) => {
    const { userId, activityId } = req.params;
    const userData = getUserData(userId);
    
    if (!userData.completedToday.includes(parseInt(activityId))) {
        userData.completedToday.push(parseInt(activityId));
    }
    
    res.json({ success: true });
});

// Add reminder
app.post('/api/user/:userId/reminders', (req, res) => {
    const { userId } = req.params;
    const { time, message, frequency } = req.body;
    
    if (!time || !message || !frequency) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    
    const userData = getUserData(userId);
    const reminder = {
        id: Date.now(),
        time,
        message,
        frequency,
        createdAt: new Date().toLocaleString()
    };
    
    userData.reminders.push(reminder);
    res.json(reminder);
});

// Delete reminder
app.delete('/api/user/:userId/reminders/:reminderId', (req, res) => {
    const { userId, reminderId } = req.params;
    const userData = getUserData(userId);
    
    userData.reminders = userData.reminders.filter(r => r.id != reminderId);
    res.json({ success: true });
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`MindFlow server running on http://localhost:${PORT}`);
});