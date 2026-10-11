import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Enquiry from './models/Enquiry.js';

const sampleEnquiries = [
  {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 9876543210',
    courseInterest: 'Full Stack Web Development',
    notes: 'Inquired through web campaign. Looking to start batch next month.',
    source: 'online_form',
    status: 'unclaimed',
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 9811223344',
    courseInterest: 'UI/UX Design Masterclass',
    notes: 'Working professional looking for weekend batches.',
    source: 'online_form',
    status: 'unclaimed',
  },
  {
    name: 'Aman Verma',
    email: 'aman.verma@example.com',
    phone: '+91 9922334455',
    courseInterest: 'Data Science & Machine Learning',
    notes: 'Final year CS student looking for placement-assisted program.',
    source: 'counselor_call',
    status: 'unclaimed',
  },
  {
    name: 'Sneha Rao',
    email: 'sneha.rao@example.com',
    phone: '+91 9733445566',
    courseInterest: 'React Native & Mobile App Development',
    notes: 'Requested a callback tomorrow morning.',
    source: 'online_form',
    status: 'unclaimed',
  },
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Enquiry.deleteMany();

    console.log('Creating demo counselor...');
    const demoCounselor = await User.create({
      name: 'Sarthak Singh Tomar',
      email: 'counselor@fastor.ai',
      password: 'Password123',
      role: 'counselor',
    });

    console.log(`Demo counselor created: ${demoCounselor.email} (Password: Password123)`);

    console.log('Seeding sample public enquiries...');
    const createdEnquiries = await Enquiry.insertMany(sampleEnquiries);
    console.log(`Seeded ${createdEnquiries.length} public enquiries successfully!`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
