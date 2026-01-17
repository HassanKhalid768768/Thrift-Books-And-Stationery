const path = require('path');
const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
// Load .env from backend directory so script works when run from project root or backend
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

const categories = [
    { name: 'Books', description: 'Books and reading materials', displayOrder: 1 },
    { name: 'Stationary', description: 'Office and school supplies', displayOrder: 2 },
    { name: 'Gadgets', description: 'Kitchen and household gadgets', displayOrder: 3 },
    { name: 'Water Bottles & Lunch Boxes', description: 'Water bottles and lunch boxes', displayOrder: 4 },
    { name: 'Novels', description: 'Fiction and non-fiction novels', displayOrder: 5 },
    { name: 'Course Books', description: 'Educational course books and textbooks', displayOrder: 6 },
    { name: 'School bags', description: 'School bags and backpacks', displayOrder: 7 },
    { name: 'Ladies bags', description: 'Ladies handbags and purses', displayOrder: 8 },
    { name: 'Abayas', description: 'Traditional abayas and modest wear', displayOrder: 9 },
    { name: 'Newborn', description: 'Baby and newborn items', displayOrder: 10 },
    { name: 'Household', description: 'Household items and essentials', displayOrder: 11 },
    { name: 'Lunchbox/water bottle', description: 'Lunch boxes and water bottles', displayOrder: 12 },
    { name: 'Customized items', description: 'Customized and personalized items', displayOrder: 13 }
];

const seedCategories = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE);
        console.log('Connected to database');

        // Clear existing categories (optional - comment out if you want to keep existing)
        // await Category.deleteMany({});
        // console.log('Cleared existing categories');

        // Insert categories
        for (const categoryData of categories) {
            const slug = categoryData.name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            
            const existingCategory = await Category.findOne({ 
                $or: [
                    { name: categoryData.name },
                    { slug: slug }
                ]
            });

            if (!existingCategory) {
                await Category.create({
                    ...categoryData,
                    slug: slug,
                    isActive: true
                });
                console.log(`Created category: ${categoryData.name}`);
            } else {
                console.log(`Category already exists: ${categoryData.name}`);
            }
        }

        console.log('Categories seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
