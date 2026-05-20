const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const masterRoutes = require('./routes/masterRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const menuRoutes = require('./routes/menuRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
