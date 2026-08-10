// app.js
//
// This file builds the Express "app" — middleware, routes, error handling —
// but does NOT start listening for connections. That happens in server.js.
// Splitting it this way makes the app easy to test later without needing to
// actually open a network port.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./common/middleware/errorHandler');

const app = express();

// --- Security & logging middleware (run on every request) ---
app.use(helmet());                 // sets safer HTTP headers by default
app.use(cors());                   // allows the Flutter app (different origin) to call this API
app.use(morgan('dev'));            // logs each request to the console, e.g. "POST /api/v1/auth/login 201"
app.use(express.json());           // parses JSON request bodies into req.body

// --- Routes ---
app.use('/api/v1', apiRoutes);

// --- Error handling (must be LAST) ---
app.use(notFoundHandler);          // catches requests to routes that don't exist
app.use(errorHandler);             // catches every error passed via next(err)

module.exports = app;
