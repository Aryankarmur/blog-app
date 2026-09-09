import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import app from './app.js';
import User from './models/User.js';
import Post from './models/Post.js';
import Bookmark from './models/Bookmark.js';
import http from 'http';

dotenv.config();

const PORT = 5005; // Use a different port for testing to avoid conflicts
let server;
let userA, userB, tokenA, tokenB, postA, draftA;

// Mock database connection setup for tests if not using real DB
// For this project, we test against the real connection configured in .env but we clean up our test data.

const startTestServer = () => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(PORT, () => {
      resolve();
    });
  });
};

const stopTestServer = () => {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
};

const makeRequest = (method, path, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : {},
          });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
};

const setupData = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Clear existing test data
  await User.deleteMany({ email: { $in: ['testa@example.com', 'testb@example.com'] } });
  
  // Create Test Users
  userA = await User.create({
    name: 'Test User A',
    email: 'testa@example.com',
    password: 'password123',
  });
  
  userB = await User.create({
    name: 'Test User B',
    email: 'testb@example.com',
    password: 'password123',
  });

  // Generate Tokens
  tokenA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  tokenB = jwt.sign({ id: userB._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Create Posts for User A
  postA = await Post.create({
    title: 'Test Published Post A',
    content: 'Content A',
    excerpt: 'Excerpt A',
    category: 'Test',
    author: userA._id,
    status: 'published',
  });

  draftA = await Post.create({
    title: 'Test Draft Post A',
    content: 'Content Draft A',
    excerpt: 'Excerpt Draft A',
    category: 'Test',
    author: userA._id,
    status: 'draft',
  });

  // Clear bookmarks
  await Bookmark.deleteMany({ user: { $in: [userA._id, userB._id] } });
};

const cleanupData = async () => {
  await User.deleteMany({ email: { $in: ['testa@example.com', 'testb@example.com'] } });
  await Post.deleteMany({ author: { $in: [userA._id, userB._id] } });
  await Bookmark.deleteMany({ user: { $in: [userA._id, userB._id] } });
  await mongoose.connection.close();
};

const runTests = async () => {
  console.log('--- Starting Stage 14A Backend Bookmarks API Tests ---\n');
  
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`✅ ${message}`);
      passed++;
    } else {
      console.error(`❌ ${message}`);
      failed++;
    }
  };

  try {
    await startTestServer();
    await setupData();

    console.log('Data initialized...\n');

    // TEST 1: Missing authentication
    const res1 = await makeRequest('POST', `/api/bookmarks/${postA._id}`);
    assert(res1.status === 401, 'TEST 1: Missing authentication returns 401');

    // TEST 2: Invalid post ID
    const res2 = await makeRequest('POST', `/api/bookmarks/invalid-id`, tokenA);
    assert(res2.status === 400, 'TEST 2: Invalid post ID returns 400');

    // TEST 3: Nonexistent post
    const res3 = await makeRequest('POST', `/api/bookmarks/${new mongoose.Types.ObjectId()}`, tokenA);
    assert(res3.status === 404, 'TEST 3: Nonexistent post returns 404');

    // TEST 4: Bookmark published post
    const res4 = await makeRequest('POST', `/api/bookmarks/${postA._id}`, tokenA);
    assert(res4.status === 201 && res4.body.data.bookmarked === true, 'TEST 4: Bookmarking published post succeeds');

    // TEST 5: Duplicate bookmark
    const res5 = await makeRequest('POST', `/api/bookmarks/${postA._id}`, tokenA);
    assert(res5.status === 200 && res5.body.data.bookmarked === true, 'TEST 5: Duplicate bookmark handled gracefully (200 OK)');

    // TEST 6: Check bookmark
    const res6 = await makeRequest('GET', `/api/bookmarks/${postA._id}`, tokenA);
    assert(res6.status === 200 && res6.body.data.bookmarked === true, 'TEST 6: Check bookmark returns true');

    // TEST 7: Get bookmarks
    const res7 = await makeRequest('GET', `/api/bookmarks`, tokenA);
    assert(
      res7.status === 200 && 
      res7.body.data.bookmarks.length === 1 && 
      res7.body.data.bookmarks[0].post._id.toString() === postA._id.toString(), 
      'TEST 7: Get bookmarks returns the bookmarked post'
    );

    // TEST 8: Remove bookmark
    const res8 = await makeRequest('DELETE', `/api/bookmarks/${postA._id}`, tokenA);
    assert(res8.status === 200 && res8.body.data.bookmarked === false, 'TEST 8: Remove bookmark succeeds');

    // TEST 9: Check after removal
    const res9 = await makeRequest('GET', `/api/bookmarks/${postA._id}`, tokenA);
    assert(res9.status === 200 && res9.body.data.bookmarked === false, 'TEST 9: Check bookmark after removal returns false');

    // TEST 10: Bookmark another user's post
    const res10 = await makeRequest('POST', `/api/bookmarks/${postA._id}`, tokenB);
    assert(res10.status === 201 && res10.body.data.bookmarked === true, "TEST 10: User B successfully bookmarks User A's post");

    // TEST 11: User isolation
    const res11 = await makeRequest('GET', `/api/bookmarks`, tokenA);
    assert(
      res11.status === 200 && res11.body.data.bookmarks.length === 0, 
      "TEST 11: User A cannot see User B's bookmarks"
    );

    // TEST 12: Draft protection
    const res12 = await makeRequest('POST', `/api/bookmarks/${draftA._id}`, tokenB);
    assert(res12.status === 400, 'TEST 12: Cannot bookmark a draft post (Returns 400)');

    // TEST 13: Logged-out access
    const res13a = await makeRequest('DELETE', `/api/bookmarks/${postA._id}`);
    const res13b = await makeRequest('GET', `/api/bookmarks/${postA._id}`);
    const res13c = await makeRequest('GET', `/api/bookmarks`);
    assert(
      res13a.status === 401 && res13b.status === 401 && res13c.status === 401, 
      'TEST 13: Logged-out access properly returns 401 for DELETE/GET requests'
    );

    // TEST 14: Delete ownership
    // User B currently has postA bookmarked. User A tries to delete it.
    const res14 = await makeRequest('DELETE', `/api/bookmarks/${postA._id}`, tokenA);
    const checkB = await makeRequest('GET', `/api/bookmarks/${postA._id}`, tokenB);
    assert(
      checkB.body.data.bookmarked === true, 
      "TEST 14: User A attempting to delete their post's bookmark does not delete User B's bookmark"
    );

  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await cleanupData();
    await stopTestServer();
    
    console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
    else process.exit(0);
  }
};

runTests();
