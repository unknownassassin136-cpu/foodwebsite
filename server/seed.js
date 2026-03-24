/**
 * Seed script — populates the database with sample categories, menu items, and an admin user.
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');

dotenv.config();

const categories = [
    { name: 'Appetizers', slug: 'appetizers', description: 'Start your meal with our delicious appetizers', image: '🥗', displayOrder: 1 },
    { name: 'Main Course', slug: 'main-course', description: 'Hearty entrées made with the finest ingredients', image: '🍛', displayOrder: 2 },
    { name: 'Pizza & Pasta', slug: 'pizza-pasta', description: 'Handcrafted Italian favorites', image: '🍕', displayOrder: 3 },
    { name: 'Burgers & Sandwiches', slug: 'burgers-sandwiches', description: 'Stacked high and loaded with flavor', image: '🍔', displayOrder: 4 },
    { name: 'Desserts', slug: 'desserts', description: 'Sweet treats to end your meal perfectly', image: '🍰', displayOrder: 5 },
    { name: 'Beverages', slug: 'beverages', description: 'Refreshing drinks and cocktails', image: '🥤', displayOrder: 6 }
];

const menuItemsByCat = {
    appetizers: [
        { name: 'Crispy Calamari', description: 'Lightly battered calamari rings served with house-made marinara sauce and lemon aioli. Golden, crunchy, and irresistible.', price: 12.99, isVegetarian: false, tags: ['seafood', 'crispy', 'starter'], rating: 4.5, reviewCount: 128, preparationTime: 12, calories: 380, image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800' },
        { name: 'Bruschetta Trio', description: 'Three toasted ciabatta slices topped with diced tomatoes, fresh basil, mozzarella, and balsamic glaze. A classic Italian starter.', price: 10.99, isVegetarian: true, tags: ['italian', 'fresh', 'vegetarian'], rating: 4.3, reviewCount: 96, preparationTime: 10, calories: 290, image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800' },
        { name: 'Buffalo Chicken Wings', description: 'Crispy jumbo wings tossed in our signature buffalo sauce, served with celery sticks and blue cheese dip. Available in mild, medium, or hot.', price: 14.99, isVegetarian: false, isSpicy: true, tags: ['spicy', 'chicken', 'popular'], rating: 4.7, reviewCount: 234, preparationTime: 18, calories: 520, image: 'https://images.unsplash.com/photo-1608039829572-9479e1a58337?w=800' }
    ],
    'main-course': [
        { name: 'Grilled Ribeye Steak', description: '12oz USDA Prime ribeye grilled to perfection, served with roasted garlic mashed potatoes and seasonal vegetables. Includes your choice of sauce.', price: 34.99, isVegetarian: false, tags: ['steak', 'premium', 'grilled'], rating: 4.8, reviewCount: 312, preparationTime: 30, calories: 780, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800' },
        { name: 'Pan-Seared Salmon', description: 'Fresh Atlantic salmon fillet with crispy skin, served on a bed of quinoa with asparagus and lemon-dill sauce. Rich in omega-3.', price: 28.99, isVegetarian: false, tags: ['seafood', 'healthy', 'fish'], rating: 4.6, reviewCount: 187, preparationTime: 25, calories: 520, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800' },
        { name: 'Herb-Crusted Chicken', description: 'Free-range chicken breast with a golden herb crust, served with sweet potato purée and green beans almondine. Light and flavorful.', price: 22.99, isVegetarian: false, tags: ['chicken', 'healthy', 'herbs'], rating: 4.4, reviewCount: 156, preparationTime: 25, calories: 450, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800' }
    ],
    'pizza-pasta': [
        { name: 'Margherita Pizza', description: 'Hand-stretched dough with San Marzano tomato sauce, fresh mozzarella, basil, and extra virgin olive oil. Wood-fired to perfection.', price: 16.99, isVegetarian: true, tags: ['pizza', 'italian', 'vegetarian', 'classic'], rating: 4.5, reviewCount: 267, preparationTime: 20, calories: 680, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800' },
        { name: 'Truffle Mushroom Pasta', description: 'Al dente pappardelle pasta tossed with wild mushrooms, truffle oil, parmesan cream sauce, and fresh thyme. A luxurious dining experience.', price: 19.99, isVegetarian: true, tags: ['pasta', 'italian', 'truffle', 'vegetarian'], rating: 4.6, reviewCount: 198, preparationTime: 18, calories: 620, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800' },
        { name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce base, grilled chicken, red onions, cilantro, and smoked gouda cheese on our signature crispy thin crust.', price: 18.99, isVegetarian: false, tags: ['pizza', 'bbq', 'chicken'], rating: 4.4, reviewCount: 145, preparationTime: 22, calories: 740, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800' }
    ],
    'burgers-sandwiches': [
        { name: 'Classic Smash Burger', description: 'Double smashed beef patties with American cheese, pickles, caramelized onions, and our secret sauce on a toasted brioche bun. Served with seasoned fries.', price: 15.99, isVegetarian: false, tags: ['burger', 'beef', 'classic', 'popular'], rating: 4.7, reviewCount: 389, preparationTime: 15, calories: 850, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800' },
        { name: 'Spicy Chicken Sandwich', description: 'Crispy buttermilk fried chicken thigh with spicy mayo, coleslaw, and pickled jalapeños on a potato bun. Packs a punch!', price: 14.99, isVegetarian: false, isSpicy: true, tags: ['chicken', 'spicy', 'sandwich'], rating: 4.5, reviewCount: 213, preparationTime: 15, calories: 720, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800' },
        { name: 'Beyond Veggie Burger', description: 'Plant-based Beyond patty with avocado, roasted peppers, arugula, and vegan garlic aioli on a whole wheat bun. 100% vegan and delicious.', price: 16.99, isVegetarian: true, tags: ['vegan', 'plant-based', 'burger', 'healthy'], rating: 4.3, reviewCount: 98, preparationTime: 15, calories: 580, image: 'https://images.unsplash.com/photo-1520072959219-c595e6cdc07c?w=800' }
    ],
    desserts: [
        { name: 'Molten Chocolate Lava Cake', description: 'Warm dark chocolate cake with a gooey molten center, served with vanilla bean ice cream and fresh raspberry coulis. Pure indulgence.', price: 11.99, isVegetarian: true, tags: ['chocolate', 'warm', 'popular'], rating: 4.9, reviewCount: 412, preparationTime: 15, calories: 520, image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800' },
        { name: 'New York Cheesecake', description: 'Creamy classic cheesecake on a graham cracker crust, topped with fresh strawberry compote and whipped cream. A timeless favorite.', price: 9.99, isVegetarian: true, tags: ['cheesecake', 'classic', 'strawberry'], rating: 4.6, reviewCount: 278, preparationTime: 5, calories: 450, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800' },
        { name: 'Tiramisu', description: 'Layers of espresso-soaked ladyfingers and mascarpone cream, dusted with cocoa powder. Made fresh daily with Italian imports.', price: 10.99, isVegetarian: true, tags: ['italian', 'coffee', 'cream'], rating: 4.7, reviewCount: 189, preparationTime: 5, calories: 380, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800' }
    ],
    beverages: [
        { name: 'Fresh Mango Smoothie', description: 'Blended ripe Alphonso mangoes with Greek yogurt, a touch of honey, and ice. Refreshing, creamy, and naturally sweet.', price: 6.99, isVegetarian: true, tags: ['smoothie', 'fresh', 'fruit'], rating: 4.4, reviewCount: 167, preparationTime: 5, calories: 220, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800' },
        { name: 'Iced Caramel Latte', description: 'Double-shot espresso with caramel syrup, creamy milk, and ice. Topped with whipped cream and a caramel drizzle.', price: 5.99, isVegetarian: true, tags: ['coffee', 'iced', 'caramel'], rating: 4.5, reviewCount: 234, preparationTime: 5, calories: 280, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800' },
        { name: 'Berry Lemonade', description: 'House-made lemonade infused with fresh blueberries, raspberries, and mint. Served ice-cold for the perfect refreshment.', price: 4.99, isVegetarian: true, tags: ['lemonade', 'fresh', 'berries'], rating: 4.3, reviewCount: 145, preparationTime: 5, calories: 140, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800' }
    ]
};

const seedDB = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Promise.all([
            User.deleteMany(),
            Category.deleteMany(),
            MenuItem.deleteMany()
        ]);
        console.log('🗑️  Cleared existing data');

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@foodie.com',
            password: 'admin123',
            phone: '555-0100',
            role: 'admin',
            addresses: [{
                label: 'Restaurant',
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                isDefault: true
            }]
        });
        console.log(`👤 Admin user created: ${admin.email} / admin123`);

        // Create demo user
        const demoUser = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            phone: '555-0199',
            role: 'user',
            addresses: [{
                label: 'Home',
                street: '456 Oak Avenue',
                city: 'New York',
                state: 'NY',
                zipCode: '10002',
                isDefault: true
            }]
        });
        console.log(`👤 Demo user created: ${demoUser.email} / password123`);

        // Create categories
        const createdCategories = await Category.insertMany(categories);
        console.log(`📂 ${createdCategories.length} categories created`);

        // Build slug-to-id map
        const catMap = {};
        createdCategories.forEach(c => { catMap[c.slug] = c._id; });

        // Create menu items
        const allItems = [];
        for (const [slug, items] of Object.entries(menuItemsByCat)) {
            items.forEach(item => {
                allItems.push({ ...item, category: catMap[slug] });
            });
        }
        const createdItems = await MenuItem.insertMany(allItems);
        console.log(`🍽️  ${createdItems.length} menu items created`);

        console.log('\n✅ Database seeded successfully!');
        console.log('─'.repeat(40));
        console.log('Admin login:  admin@foodie.com / admin123');
        console.log('User login:   john@example.com / password123');
        console.log('─'.repeat(40));

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDB();
