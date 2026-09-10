# DevBlog Deployment Guide

## Frontend (Vite / React)
- **Platform Target:** Netlify
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **SPA Redirect Requirement:** The `client/public/_redirects` file is included, containing `/* /index.html 200` to properly fall back client-side React routes to the single page application.
- **Environment Variables:**
  - `VITE_API_URL`: Set this to your production backend URL (e.g., `https://your-backend-api.com/api`). Do not include trailing slashes.

## Backend (Node / Express)
- **Hosting Requirements:** Any Node.js-compatible host (e.g., Render, Railway, DigitalOcean, Heroku).
- **Startup:**
  - `npm install`
  - `npm start` (Runs `node server.js`)
- **Required Environment Variables:**
  - `PORT`: (Provided by your host)
  - `MONGO_URI`: Your MongoDB connection string.
  - `JWT_SECRET`: A secure, randomly generated string for signing authentication tokens.
  - `JWT_EXPIRES_IN`: E.g., `7d`.
  - `CLIENT_URL`: The URL of your deployed frontend (e.g., `https://your-frontend.netlify.app`). This is strictly required for CORS.

## MongoDB
- **Target:** MongoDB Atlas will be used for production.
- **Requirements:** 
  - Retrieve the connection string for Node.js (`MONGO_URI`).
  - Ensure the IP access list on MongoDB Atlas allows connections from your backend host's IP addresses.

## CORS
- The backend uses the `CLIENT_URL` environment variable to explicitly authorize incoming requests from the deployed frontend. Ensure this exactly matches the Netlify domain.
