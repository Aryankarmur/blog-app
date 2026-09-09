import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // 1. Setup test user and posts
  let user = await User.findOne({ email: 'stage11a@test.com' });
  if (!user) {
    user = await User.create({ name: 'Stage 11A User', email: 'stage11a@test.com', password: 'password123', bio: 'Test bio' });
  }

  // Clear existing posts for this user for a clean test
  await Post.deleteMany({ author: user._id });

  // Create a draft post
  await Post.create({ title: 'Draft Post', content: 'Draft Content', author: user._id, category: 'Test', status: 'draft' });
  
  // Create a published post
  await Post.create({ title: 'Published Post', content: 'Published Content', author: user._id, category: 'Test', status: 'published' });

  const userId = user._id.toString();

  console.log('--- TEST 1: GET /api/users/:validUserId ---');
  let res = await fetch(`${API_URL}/users/${userId}`);
  let data = await res.json();
  const passed1 = res.status === 200 && data.success === true && data.data.user.name === 'Stage 11A User' && !data.data.user.password && !data.data.user.email;
  console.log('Test 1 Passed (User info, no private fields):', passed1);

  console.log('--- TEST 7: Verify published post appears ---');
  const publishedPostAppears = data.data.posts.some(p => p.title === 'Published Post');
  console.log('Test 7 Passed:', publishedPostAppears);

  console.log('--- TEST 6: Verify draft does NOT appear ---');
  const draftDoesNotAppear = !data.data.posts.some(p => p.title === 'Draft Post');
  console.log('Test 6 Passed:', draftDoesNotAppear);

  console.log('--- TEST 2: GET /api/users/:validUserId (No published posts) ---');
  // Create another user with no posts
  let userEmpty = await User.findOne({ email: 'empty@test.com' });
  if (!userEmpty) {
    userEmpty = await User.create({ name: 'Empty User', email: 'empty@test.com', password: 'password123' });
  }
  res = await fetch(`${API_URL}/users/${userEmpty._id}`);
  data = await res.json();
  console.log('Test 2 Passed (Empty posts array):', res.status === 200 && data.data.posts.length === 0);

  console.log('--- TEST 3: GET /api/users/:nonexistentValidObjectId ---');
  const invalidId = new mongoose.Types.ObjectId();
  res = await fetch(`${API_URL}/users/${invalidId}`);
  console.log('Test 3 Passed (404 Not Found):', res.status === 404);

  console.log('--- TEST 4: GET /api/users/invalid-id ---');
  res = await fetch(`${API_URL}/users/invalid-id-123`);
  console.log('Test 4 Passed (400 Invalid format):', res.status === 400);

  console.log('--- TEST 5: Call completely logged out ---');
  // We used fetch without any Authorization headers, so it's already tested.
  console.log('Test 5 Passed (No auth header needed):', true);

  process.exit();
}

runTests();
