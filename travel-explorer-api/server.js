/**
 * Travel Explorer & Booking Platform Backend API
 * Server Entry Point
 */

require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const destinationRoutes = require('./routes/destinationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Body Parser Middleware
app.use(express.json());

// Enable Simple CORS (Allow all origins/methods for development/flexibility)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Simple Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.originalUrl} - ${new Date().toLocaleTimeString()}`);
    next();
});

// Root Route - Welcome Message
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to BharatSafar (Travel Explorer & Booking Platform) REST API",
        endpoints: {
            destinations: {
                list: "GET /api/destinations",
                search: "GET /api/destinations?search=query",
                details: "GET /api/destinations/:id"
            },
            bookings: {
                create: "POST /api/bookings",
                list: "GET /api/bookings"
            },
            contact: {
                submit: "POST /api/contact"
            }
        }
    });
});

// Register API Routes
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Live Weather API Route
app.get('/api/weather', async (req, res, next) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ success: false, message: 'City parameter is required' });
        }

        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            return res.status(200).json({
                success: true,
                live: false,
                data: getMockWeather(city)
            });
        }

        // Call OpenWeatherMap API
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&units=metric&appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            const errData = await response.json();
            console.error('Weather API error response:', errData);
            return res.status(200).json({
                success: true,
                live: false,
                data: getMockWeather(city)
            });
        }

        const data = await response.json();
        const temp = Math.round(data.main.temp);
        const cond = data.weather[0].main;
        const rain = data.rain ? '80%' : '15%';
        
        let advice = "Pleasant weather. Ideal for sightseeing and walking tours.";
        if (temp < 15) {
            advice = "Cold weather. Carry heavy woolens and thermal layers.";
        } else if (temp > 32) {
            advice = "Hot weather. Stay hydrated, wear sunscreen and light cotton clothes.";
        } else if (cond.toLowerCase().includes('rain') || cond.toLowerCase().includes('drizzle') || cond.toLowerCase().includes('thunderstorm')) {
            advice = "Expect rain. Bring an umbrella and waterproof jackets.";
        }

        res.status(200).json({
            success: true,
            live: true,
            data: {
                temp: `${temp}°C`,
                cond: `${cond} / ${data.weather[0].description}`,
                rain,
                advice
            }
        });
    } catch (error) {
        console.error('Weather fetch error:', error);
        res.status(200).json({
            success: true,
            live: false,
            data: getMockWeather(req.query.city)
        });
    }
});

function getMockWeather(city) {
    const WEATHER_DB = {
        'Taj Mahal': { temp: '32°C', cond: 'Sunny / Warm', rain: '5%', advice: 'Best visited early morning. Wear comfortable walking shoes and carry sunscreen.' },
        'Agra': { temp: '32°C', cond: 'Sunny / Warm', rain: '5%', advice: 'Best visited early morning. Wear comfortable walking shoes and carry sunscreen.' },
        'Kerala Backwaters': { temp: '29°C', cond: 'Humid / Light Rain', rain: '45%', advice: 'Bring an umbrella. Pack light, breathable linen clothes and mosquito repellent.' },
        'Kerala': { temp: '29°C', cond: 'Humid / Light Rain', rain: '45%', advice: 'Bring an umbrella. Pack light, breathable linen clothes and mosquito repellent.' },
        'Nubra Valley': { temp: '14°C', cond: 'Clear / Cold', rain: '2%', advice: 'Cold winds. Heavy woolen clothes, thermal layers, and hydration are essential.' },
        'Ladakh': { temp: '14°C', cond: 'Clear / Cold', rain: '2%', advice: 'Cold winds. Heavy woolen clothes, thermal layers, and hydration are essential.' },
        'Hawa Mahal': { temp: '35°C', cond: 'Sunny / Hot', rain: '8%', advice: 'Hot afternoons. Stay hydrated. Wear sunscreen and a wide-brimmed hat.' },
        'Jaipur': { temp: '35°C', cond: 'Sunny / Hot', rain: '8%', advice: 'Hot afternoons. Stay hydrated. Wear sunscreen and a wide-brimmed hat.' },
        'Calangute Beach': { temp: '30°C', cond: 'Pleasant / Breezy', rain: '15%', advice: 'Great beach weather. Pack sunscreen, swimwear, shorts, and flip-flops.' },
        'Goa': { temp: '30°C', cond: 'Pleasant / Breezy', rain: '15%', advice: 'Great beach weather. Pack sunscreen, swimwear, shorts, and flip-flops.' },
        'Varanasi Ghats': { temp: '31°C', cond: 'Humid / Clear', rain: '12%', advice: 'Modest clothing recommended. Best time for boat ride is sunrise or sunset.' },
        'Varanasi': { temp: '31°C', cond: 'Humid / Clear', rain: '12%', advice: 'Modest clothing recommended. Best time for boat ride is sunrise or sunset.' }
    };
    
    const cName = city || '';
    for (const key of Object.keys(WEATHER_DB)) {
        if (cName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cName.toLowerCase())) {
            return WEATHER_DB[key];
        }
    }
    return { temp: '26°C', cond: 'Mild / Clear', rain: '10%', advice: 'Pack comfortable clothes. Check local festival guidelines.' };
}

// 404 Handler (Not Found)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `API Route not found: ${req.method} ${req.originalUrl}`,
        data: null
    });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to terminate server`);
    console.log(`==================================================`);
});
