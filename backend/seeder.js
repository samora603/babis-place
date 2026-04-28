const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Models
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Category.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        console.log('🗑️ Existing data cleared.');

        // 1. Create Admin User
        const adminUser = await User.create({
            name: 'Admin Samora',
            phone: '+254700000000',
            email: 'admin@babis.place',
            passwordHash: 'password123',
            role: 'admin',
            isVerified: true,
            isActive: true,
        });
        console.log('👤 Admin user created.');

        // 2. Create Categories
        const createdCategories = await Category.insertMany([
            {
                name: 'Men',
                slug: 'men',
                description: 'Luxury menswear and accessories',
                image: { url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80', publicId: 'mens_cat' },
                order: 1
            },
            {
                name: 'Women',
                slug: 'women',
                description: 'Elegant womenswear collections',
                image: { url: 'https://images.unsplash.com/photo-1550614000-4b95d4ed79ea?auto=format&fit=crop&q=80', publicId: 'womens_cat' },
                order: 2
            },
            {
                name: 'Accessories',
                slug: 'accessories',
                description: 'Premium matching accessories',
                image: { url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80', publicId: 'accs_cat' },
                order: 3
            }
        ]);

        console.log('🏷️ Categories created.');

        const menCatId = createdCategories[0]._id;
        const womenCatId = createdCategories[1]._id;
        const accsCatId = createdCategories[2]._id;

        // 3. Create Products
        const sampleProducts = [
            {
                name: 'The Golden Bee Signature Suit',
                description: 'A masterpiece of tailoring, featuring premium Italian wool and subtle gold bee embroidery on the lapel.',
                shortDescription: 'Premium Italian wool suit with gold bee embroidery.',
                price: 120000,
                discountPrice: 110000,
                images: [
                    { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80', isPrimary: true },
                    { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80', isPrimary: false }
                ],
                category: menCatId,
                tags: ['suit', 'menswear', 'signature', 'gold'],
                stock: 15,
                variations: [
                    {
                        name: 'Size',
                        options: [
                            { label: '38R', priceModifier: 0, stock: 5 },
                            { label: '40R', priceModifier: 0, stock: 5 },
                            { label: '42R', priceModifier: 0, stock: 5 }
                        ]
                    }
                ],
                faqs: [
                    { question: 'What is the material?', answer: '100% Premium Italian Wool.' },
                    { question: 'How do I care for this suit?', answer: 'Dry clean only.' }
                ],
                weight: 1500,
                isFeatured: true,
                createdBy: adminUser._id
            },
            {
                name: 'Midnight Onyx Evening Gown',
                description: 'Elegance redefined. This exquisite gown cascades beautifully, accented with a delicate gold belt link.',
                shortDescription: 'Deep black evening gown with gold accents.',
                price: 95000,
                images: [
                    { url: 'https://images.unsplash.com/photo-1566160983863-78f9f8c6ca09?auto=format&fit=crop&q=80', isPrimary: true }
                ],
                category: womenCatId,
                tags: ['gown', 'evening', 'womenswear', 'black'],
                stock: 8,
                variations: [
                    {
                        name: 'Size',
                        options: [
                            { label: 'S', priceModifier: 0, stock: 3 },
                            { label: 'M', priceModifier: 0, stock: 3 },
                            { label: 'L', priceModifier: 0, stock: 2 }
                        ]
                    }
                ],
                weight: 800,
                isFeatured: true,
                createdBy: adminUser._id
            },
            {
                name: 'Aurelia Crown Cufflinks',
                description: 'The definitive accessory. Solid brass with 24k gold plating, stamped with the Babis Place insignia.',
                shortDescription: '24k gold plated brass cufflinks.',
                price: 15000,
                images: [
                    { url: 'https://images.unsplash.com/photo-1582236372134-2e232ef6bd9f?auto=format&fit=crop&q=80', isPrimary: true }
                ],
                category: accsCatId,
                tags: ['cufflinks', 'accessories', 'gold'],
                stock: 50,
                weight: 50,
                isFeatured: false,
                createdBy: adminUser._id
            }
        ];

        await Product.create(sampleProducts);
        console.log('🛍️ Products created.');

        console.log('✨ Data Import Successful!');
        process.exit();

    } catch (error) {
        console.error(`❌ Error importing data: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();
        await Category.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        console.log('🗑️ Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error destroying data: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
