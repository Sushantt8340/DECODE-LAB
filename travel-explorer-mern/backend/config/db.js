const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travel-explorer');
        console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
        
        // Auto-seed database if empty
        await seedDatabase();
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        // Resolve models inside function to avoid circular dependencies
        const User = require('../models/User');
        const Destination = require('../models/Destination');

        // 1. Seed Users if empty
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('🌱 Database is empty. Seeding users from users.json...');
            const usersPath = path.join(__dirname, '../data/users.json');
            
            if (fs.existsSync(usersPath)) {
                const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
                const formattedUsers = usersData.map(u => {
                    const formatted = {
                        name: u.name,
                        email: u.email.toLowerCase().trim(),
                        phone: u.phone || '',
                        password: u.password,
                        role: u.role || 'user',
                        wishlist: u.wishlist || []
                    };
                    // Preserve original IDs if possible for JWT/history references
                    // Wait, if it's admin_default, we can keep it, but standard ObjectIds are preferred. 
                    // To ensure standard Mongoose compatibility, we can let Mongoose generate ObjectIds but we can map them,
                    // or since MongoDB allows custom string IDs, we can set _id to the custom string (like usr_1782200846679_f0shx).
                    // Yes! Setting _id to the existing string ID ensures that the frontend's stored tokens and user histories are not broken!
                    if (u.id) {
                        formatted._id = u.id;
                    }
                    return formatted;
                });
                
                await User.insertMany(formattedUsers);
                console.log(`✅ Seeded ${formattedUsers.length} users successfully!`);
            } else {
                console.warn('⚠️ users.json file not found for seeding.');
            }
        }

        // 2. Seed Destinations if empty
        const destCount = await Destination.countDocuments();
        if (destCount === 0) {
            console.log('🌱 Database is empty. Seeding destinations from destinations.json...');
            const destPath = path.join(__dirname, '../data/destinations.json');
            
            if (fs.existsSync(destPath)) {
                const destData = JSON.parse(fs.readFileSync(destPath, 'utf8'));
                const formattedDests = destData.map(d => {
                    const formatted = {
                        title: d.name,
                        country: d.country || "India",
                        description: d.desc || "",
                        image: d.img || "",
                        price: d.price,
                        rating: d.rating || "4.5"
                    };
                    if (d.id) {
                        formatted._id = d.id;
                    }
                    return formatted;
                });
                
                await Destination.insertMany(formattedDests);
                console.log(`✅ Seeded ${formattedDests.length} destinations successfully!`);
            } else {
                console.warn('⚠️ destinations.json file not found for seeding.');
            }
        }
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
    }
};

module.exports = connectDB;
