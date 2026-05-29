import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import { Company } from './models/Company.js';
import { Lead } from './models/Lead.js';
import { Task } from './models/Task.js';
import { User } from './models/User.js';

dotenv.config();

await connectDb();

await Promise.all([User.deleteMany({}), Company.deleteMany({}), Lead.deleteMany({}), Task.deleteMany({})]);

const [admin, john, anita] = await User.create([
  { name: 'Admin User', email: 'admin@minicrm.com', password: 'Password@123', role: 'admin' },
  { name: 'John Sales', email: 'john@minicrm.com', password: 'Password@123', role: 'sales' },
  { name: 'Anita Rao', email: 'anita@minicrm.com', password: 'Password@123', role: 'sales' }
]);

const [abc, zen, pixel] = await Company.create([
  { name: 'ABC Corp', industry: 'IT', location: 'Chennai', website: 'https://abc.example' },
  { name: 'Zen Retail', industry: 'Retail', location: 'Bengaluru', website: 'https://zen.example' },
  { name: 'Pixel Works', industry: 'Design', location: 'Hyderabad', website: 'https://pixel.example' }
]);

const [ravi, meera, arun] = await Lead.create([
  {
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    phone: '9876543210',
    status: 'New',
    assignedTo: john._id,
    company: abc._id
  },
  {
    name: 'Meera Shah',
    email: 'meera@example.com',
    phone: '9876501234',
    status: 'Qualified',
    assignedTo: anita._id,
    company: zen._id
  },
  {
    name: 'Arun Nair',
    email: 'arun@example.com',
    phone: '9123456780',
    status: 'Contacted',
    assignedTo: john._id,
    company: pixel._id
  }
]);

const today = new Date();
today.setHours(10, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

await Task.create([
  { title: 'Call Ravi', lead: ravi._id, assignedTo: john._id, dueDate: today, status: 'Pending' },
  { title: 'Send proposal', lead: meera._id, assignedTo: anita._id, dueDate: tomorrow, status: 'In Progress' },
  { title: 'Demo follow-up', lead: arun._id, assignedTo: john._id, dueDate: today, status: 'Completed' }
]);

console.log('Seed complete');
console.log('Admin:', admin.email, 'Password@123');
console.log('Sales:', john.email, 'Password@123');
console.log('Sales:', anita.email, 'Password@123');

await mongoose.disconnect();
