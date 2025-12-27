require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const deliveryRoutes = require('./routes/deliveryRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/delivery', deliveryRoutes);
app.use('/api/auth', authRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Last-Mile Delivery API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
