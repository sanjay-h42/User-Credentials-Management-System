const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'db.json');

// --- Security Middleware ---
app.use(helmet()); // Secure HTTP headers
app.use(cors({
    origin: (origin, callback) => {
        // Allow all localhost origins in dev
        if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Rate Limiting to prevent brute-force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});
app.use('/api/', limiter);

// --- Database Helpers ---
async function readDB() {
    try {
        return await fs.readJson(DB_PATH);
    } catch (err) {
        return { users: [], sessions: [] };
    }
}

async function writeDB(data) {
    await fs.writeJson(DB_PATH, data, { spaces: 2 });
}

// --- API Routes ---

// Get all users
app.get('/api/users', async (req, res) => {
    const db = await readDB();
    res.json(db.users);
});

// Add a user
app.post('/api/users', async (req, res) => {
    const { name, age, email, phone, id } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and Email are required" });

    const db = await readDB();
    db.users.push({ id, name, age, email, phone });
    await writeDB(db);
    res.status(201).json({ message: "User added successfully" });
});

// Update a user
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    const db = await readDB();

    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: "User not found" });

    db.users[index] = { ...db.users[index], ...updatedUser };
    await writeDB(db);
    res.json({ message: "User updated successfully" });
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const db = await readDB();

    db.users = db.users.filter(u => u.id !== id);
    await writeDB(db);
    res.json({ message: "User deleted successfully" });
});

// --- Mock OAuth Endpoint ---
app.post('/api/auth/google', async (req, res) => {
    // In a real app, this would verify the Google token
    // For local dev, we simulate a successful login
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token required" });

    const mockUserData = {
        id: "google-123",
        name: "Test User",
        email: "test@example.com",
        picture: "https://via.placeholder.com/150"
    };

    res.json({
        user: mockUserData,
        accessToken: "mock-jwt-token-xyz"
    });
});

app.listen(PORT, () => {
    console.log(`Server running securely on http://localhost:${PORT}`);
});
