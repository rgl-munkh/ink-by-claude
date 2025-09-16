import { db } from './index';
import { users, tattooists, portfolios, availability } from './schema';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const [adminUser] = await db.insert(users).values({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@claudeink.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
    }).returning();

    console.log('✅ Admin user created:', adminUser.email);

    // Create sample tattooist user
    const tattooistPasswordHash = await bcrypt.hash('tattooist123', 10);
    const [tattooistUser] = await db.insert(users).values({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@claudeink.com',
      passwordHash: tattooistPasswordHash,
      role: 'tattooist',
    }).returning();

    console.log('✅ Tattooist user created:', tattooistUser.email);

    // Create tattooist profile
    const [tattooist] = await db.insert(tattooists).values({
      userId: tattooistUser.id,
      bio: 'Experienced tattoo artist specializing in realism and traditional styles. 10+ years of experience.',
      approved: true,
    }).returning();

    console.log('✅ Tattooist profile created for:', `${tattooistUser.firstName} ${tattooistUser.lastName}`);

    // Create sample portfolio items
    const portfolioItems = [
      {
        tattooistId: tattooist.id,
        imageUrl: 'https://example.com/portfolio/dragon-tattoo.jpg',
        description: 'Traditional dragon tattoo on forearm',
        styleTags: ['traditional', 'dragon', 'color'],
      },
      {
        tattooistId: tattooist.id,
        imageUrl: 'https://example.com/portfolio/rose-tattoo.jpg',
        description: 'Realistic rose with thorns',
        styleTags: ['realism', 'flowers', 'black-and-grey'],
      },
      {
        tattooistId: tattooist.id,
        imageUrl: 'https://example.com/portfolio/geometric-tattoo.jpg',
        description: 'Geometric mandala design',
        styleTags: ['geometric', 'mandala', 'linework'],
      },
    ];

    await db.insert(portfolios).values(portfolioItems);
    console.log('✅ Portfolio items created');

    // Create availability schedule (Monday to Friday, 9 AM to 5 PM)
    const availabilitySchedule = [
      { day: 1, startTime: '09:00:00', endTime: '17:00:00' }, // Monday
      { day: 2, startTime: '09:00:00', endTime: '17:00:00' }, // Tuesday
      { day: 3, startTime: '09:00:00', endTime: '17:00:00' }, // Wednesday
      { day: 4, startTime: '09:00:00', endTime: '17:00:00' }, // Thursday
      { day: 5, startTime: '09:00:00', endTime: '17:00:00' }, // Friday
    ];

    const availabilityData = availabilitySchedule.map(schedule => ({
      tattooistId: tattooist.id,
      ...schedule,
    }));

    await db.insert(availability).values(availabilityData);
    console.log('✅ Availability schedule created');

    // Create sample customer
    const customerPasswordHash = await bcrypt.hash('customer123', 10);
    const [customerUser] = await db.insert(users).values({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      passwordHash: customerPasswordHash,
      role: 'customer',
    }).returning();

    console.log('✅ Sample customer created:', customerUser.email);

    console.log('🎉 Database seed completed successfully!');
    console.log('\nSample accounts created:');
    console.log('Admin: admin@claudeink.com / admin123');
    console.log('Tattooist: jane@claudeink.com / tattooist123');
    console.log('Customer: john@example.com / customer123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { seed };