import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import app from './app.js';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';
import Bookmark from './models/Bookmark.js';
import http from 'http';

dotenv.config();

const PORT = 5006;
let server;
let adminUser, normalUser, targetUser;
let adminToken, normalToken;
let testPost, testComment, testBookmark;

const startTestServer = () => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(PORT, () => resolve());
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

const makeRequest = (method, path, body = null, token = null) => {
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

    if (body) {
      const bodyData = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const setupData = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await User.deleteMany({ email: { $in: ['admin@test.com', 'normal@test.com', 'target@test.com'] } });
  
  adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
  });
  
  normalUser = await User.create({
    name: 'Normal User',
    email: 'normal@test.com',
    password: 'password123',
    role: 'user', // Explicit default
  });

  targetUser = await User.create({
    name: 'Target User',
    email: 'target@test.com',
    password: 'password123',
    role: 'user',
  });

  adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  normalToken = jwt.sign({ id: normalUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  testPost = await Post.create({
    title: 'Test Admin Post',
    content: 'Content',
    category: 'Test',
    author: targetUser._id,
    status: 'published',
  });

  testComment = await Comment.create({
    post: testPost._id,
    author: normalUser._id,
    content: 'Test comment by normal user',
  });

  testBookmark = await Bookmark.create({
    user: normalUser._id,
    post: testPost._id,
  });
};

const cleanupData = async () => {
  await User.deleteMany({ email: { $in: ['admin@test.com', 'normal@test.com', 'target@test.com'] } });
  await Post.deleteMany({ author: { $in: [adminUser?._id, normalUser?._id, targetUser?._id] } });
  await Comment.deleteMany({ author: { $in: [adminUser?._id, normalUser?._id, targetUser?._id] } });
  await Bookmark.deleteMany({ user: { $in: [adminUser?._id, normalUser?._id, targetUser?._id] } });
  await mongoose.connection.close();
};

const runTests = async () => {
  console.log('--- Starting Stage 16A Admin Backend Tests ---\n');
  let passed = 0; let failed = 0;

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

    // SECURITY: Unauthenticated
    const res1 = await makeRequest('GET', '/api/admin/stats');
    assert(res1.status === 401, 'Unauthenticated user gets 401 on admin routes');

    // SECURITY: Normal User
    const res2 = await makeRequest('GET', '/api/admin/stats', null, normalToken);
    assert(res2.status === 403, 'Normal user gets 403 on admin routes');

    // STATS
    const res3 = await makeRequest('GET', '/api/admin/stats', null, adminToken);
    assert(res3.status === 200 && res3.body.data.users > 0, 'Admin can fetch stats');

    // USERS
    const res4 = await makeRequest('GET', '/api/admin/users?limit=10', null, adminToken);
    assert(res4.status === 200 && res4.body.data.users.length > 0 && !res4.body.data.users[0].password, 'Admin can list users (passwords excluded)');

    // ROLE UPDATE
    const res5 = await makeRequest('PUT', `/api/admin/users/${targetUser._id}/role`, { role: 'admin' }, adminToken);
    assert(res5.status === 200 && res5.body.data.role === 'admin', 'Admin can promote another user');

    // INVALID ROLE
    const res6 = await makeRequest('PUT', `/api/admin/users/${targetUser._id}/role`, { role: 'superadmin' }, adminToken);
    assert(res6.status === 400, 'Admin cannot assign invalid role (returns 400)');

    // SELF DEMOTION
    const res7 = await makeRequest('PUT', `/api/admin/users/${adminUser._id}/role`, { role: 'user' }, adminToken);
    assert(res7.status === 400, 'Admin cannot demote themselves (returns 400)');

    // POST LISTING
    const res8 = await makeRequest('GET', '/api/admin/posts', null, adminToken);
    assert(res8.status === 200 && res8.body.data.posts.length > 0, 'Admin can list posts');

    // POST DELETION WITH CLEANUP
    const res9 = await makeRequest('DELETE', `/api/admin/posts/${testPost._id}`, null, adminToken);
    assert(res9.status === 200, 'Admin can delete post');
    
    // Check cleanup
    const remainingComments = await Comment.find({ post: testPost._id });
    const remainingBookmarks = await Bookmark.find({ post: testPost._id });
    assert(remainingComments.length === 0 && remainingBookmarks.length === 0, 'Post deletion correctly cascades to comments and bookmarks');

    // COMMENTS
    const res10 = await makeRequest('GET', '/api/admin/comments', null, adminToken);
    assert(res10.status === 200 && Array.isArray(res10.body.data.comments), 'Admin can list comments');

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
