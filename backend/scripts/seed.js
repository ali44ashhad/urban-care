require('dotenv').config();
const { connectDB } = require('../src/config/db');
const Service = require('../src/models/service.model');
const User = require('../src/models/user.model');
const Provider = require('../src/models/provider.model');
const bcrypt = require('bcryptjs');

async function seed() {
  await connectDB(process.env.MONGO_URI);
  
  const services = [
    // AC Services
    { title: 'Split AC Service & Repair', slug: 'split-ac-service', description: 'Complete service and repair for split AC units', basePrice: 799, category: 'AC Repair', isActive: true, durationMin: 60, pricingOptions: [{ name: 'Basic Service', price: 799 }, { name: 'Deep Clean', price: 1299 }, { name: 'Gas Refill + Service', price: 2499 }] },
    { title: 'Window AC Repair', slug: 'window-ac-repair', description: 'Window AC repair and maintenance service', basePrice: 599, category: 'AC Repair', isActive: true, durationMin: 45, pricingOptions: [{ name: 'Standard Repair', price: 599 }, { name: 'Full Service', price: 999 }] },
    { title: 'AC Installation', slug: 'ac-installation', description: 'Professional AC installation with warranty', basePrice: 1499, category: 'AC Repair', isActive: true, durationMin: 120, pricingOptions: [{ name: 'Split AC', price: 1499 }, { name: 'Window AC', price: 999 }] },
    { title: 'AC Gas Refilling', slug: 'ac-gas-refill', description: 'AC gas refilling and pressure check', basePrice: 1999, category: 'AC Repair', isActive: true, durationMin: 30 },
    { title: 'Central AC Maintenance', slug: 'central-ac-maintenance', description: 'Complete maintenance for central AC systems', basePrice: 2999, category: 'AC Repair', isActive: true, durationMin: 180 },
    
    // Plumbing Services
    { title: 'Tap & Mixer Repair', slug: 'tap-mixer-repair', description: 'Repair and replacement of taps and mixers', basePrice: 299, category: 'Plumbing', isActive: true, durationMin: 30, pricingOptions: [{ name: 'Single Tap', price: 299 }, { name: 'Multiple Taps', price: 599 }] },
    { title: 'Bathroom Leak Repair', slug: 'bathroom-leak-repair', description: 'Fix leaks in bathroom pipes and fittings', basePrice: 499, category: 'Plumbing', isActive: true, durationMin: 60 },
    { title: 'Toilet Installation', slug: 'toilet-installation', description: 'Complete toilet installation and fitting', basePrice: 899, category: 'Plumbing', isActive: true, durationMin: 90 },
    { title: 'Drainage Cleaning', slug: 'drainage-cleaning', description: 'Professional drainage cleaning and unclogging', basePrice: 699, category: 'Plumbing', isActive: true, durationMin: 45 },
    { title: 'Water Tank Cleaning', slug: 'water-tank-cleaning', description: 'Underground and overhead tank cleaning', basePrice: 1299, category: 'Plumbing', isActive: true, durationMin: 120 },
    
    // Electrician Services
    { title: 'Switch & Socket Repair', slug: 'switch-socket-repair', description: 'Repair and replacement of switches and sockets', basePrice: 199, category: 'Electrician', isActive: true, durationMin: 30, pricingOptions: [{ name: 'Single Point', price: 199 }, { name: 'Multiple Points', price: 499 }] },
    { title: 'Fan Installation & Repair', slug: 'fan-repair', description: 'Ceiling fan installation and repair', basePrice: 299, category: 'Electrician', isActive: true, durationMin: 45 },
    { title: 'Light Fixture Installation', slug: 'light-fixture', description: 'Installation of lights, chandeliers and fixtures', basePrice: 399, category: 'Electrician', isActive: true, durationMin: 60 },
    { title: 'MCB Tripping Issues', slug: 'mcb-tripping', description: 'Diagnose and fix MCB tripping problems', basePrice: 499, category: 'Electrician', isActive: true, durationMin: 45 },
    { title: 'Home Wiring', slug: 'home-wiring', description: 'Complete home wiring and rewiring services', basePrice: 2999, category: 'Electrician', isActive: true, durationMin: 240 },
    
    // Salon Services
    { title: 'Hair Cut & Styling', slug: 'haircut-styling', description: 'Professional hair cut and styling at home', basePrice: 399, category: 'Salon at Home', isActive: true, durationMin: 45, pricingOptions: [{ name: 'Basic Cut', price: 399 }, { name: 'Cut + Style', price: 699 }] },
    { title: 'Facial & Cleanup', slug: 'facial-cleanup', description: 'Complete facial and skin cleanup service', basePrice: 799, category: 'Salon at Home', isActive: true, durationMin: 60 },
    { title: 'Manicure & Pedicure', slug: 'mani-pedi', description: 'Professional nail care and grooming', basePrice: 599, category: 'Salon at Home', isActive: true, durationMin: 90 },
    { title: 'Bridal Makeup', slug: 'bridal-makeup', description: 'Professional bridal makeup at home', basePrice: 4999, category: 'Salon at Home', isActive: true, durationMin: 180 },
    { title: 'Hair Spa & Treatment', slug: 'hair-spa', description: 'Deep conditioning hair spa treatment', basePrice: 999, category: 'Salon at Home', isActive: true, durationMin: 90 },
    
    // Cleaning Services
    { title: 'Deep Home Cleaning', slug: 'deep-home-cleaning', description: 'Complete deep cleaning of your home', basePrice: 1499, category: 'Home Cleaning', isActive: true, durationMin: 180, pricingOptions: [{ name: '2 BHK', price: 1499 }, { name: '3 BHK', price: 1999 }, { name: '4 BHK', price: 2999 }] },
    { title: 'Bathroom Cleaning', slug: 'bathroom-cleaning', description: 'Professional bathroom deep cleaning', basePrice: 499, category: 'Home Cleaning', isActive: true, durationMin: 60 },
    { title: 'Kitchen Cleaning', slug: 'kitchen-cleaning', description: 'Deep kitchen cleaning and chimney service', basePrice: 699, category: 'Home Cleaning', isActive: true, durationMin: 90 },
    { title: 'Sofa & Carpet Cleaning', slug: 'sofa-carpet-cleaning', description: 'Professional upholstery cleaning', basePrice: 899, category: 'Home Cleaning', isActive: true, durationMin: 120 },
    { title: 'Full Home Sanitization', slug: 'home-sanitization', description: 'Complete home sanitization and disinfection', basePrice: 1999, category: 'Home Cleaning', isActive: true, durationMin: 150 }
  ];

  for (const s of services) {
    await Service.updateOne({ slug: s.slug }, { $set: s }, { upsert: true });
  }

  // Create provider users and link them to services
  const providerData = [
    { 
      name: 'CoolCare Experts', 
      email: 'coolcare@example.com', 
      companyName: 'CoolCare AC Services',
      categories: ['AC Repair']
    },
    { 
      name: 'AquaFix Plumbers', 
      email: 'aquafix@example.com', 
      companyName: 'AquaFix Plumbing Services',
      categories: ['Plumbing']
    },
    { 
      name: 'SparkPro Electric', 
      email: 'sparkpro@example.com', 
      companyName: 'SparkPro Electricians',
      categories: ['Electrician']
    },
    { 
      name: 'GlamHome Beauticians', 
      email: 'glamhome@example.com', 
      companyName: 'GlamHome Salon',
      categories: ['Salon at Home']
    },
    { 
      name: 'CleanCo Services', 
      email: 'cleanco@example.com', 
      companyName: 'CleanCo Professional Cleaning',
      categories: ['Home Cleaning']
    }
  ];

  for (const p of providerData) {
    // Create/update user
    const userData = {
      name: p.name,
      email: p.email,
      password: await bcrypt.hash('password', 10),
      role: 'provider',
      companyName: p.companyName,
      phone: '9876543210',
      isActive: true
    };
    
    const user = await User.findOneAndUpdate(
      { email: p.email },
      { $set: userData },
      { upsert: true, new: true }
    );

    // Get all services for this provider's categories
    const providerServices = await Service.find({ 
      category: { $in: p.categories },
      isActive: true 
    });
    
    const serviceIds = providerServices.map(s => s._id);

    // Create/update Provider document
    await Provider.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          companyName: p.companyName,
          serviceIds: serviceIds,
          isActive: true,
          address: {
            line1: '123 Service Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          }
        }
      },
      { upsert: true, new: true }
    );

    console.log(`✓ Created provider ${p.name} with ${serviceIds.length} services`);
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
