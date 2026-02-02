import { createServer } from 'http';
import { Server } from 'socket.io';
import { verifyToken } from './src/utils/jwt.js';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import connectDB from './src/config/database.js';

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://hotel-resturant-mangement-system.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Amulya Resturant API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Import Routes
import authRoutes from './src/modules/auth/routes/auth.routes.js';
import hotelRoutes from './src/modules/hotels/routes/hotel.routes.js';
import userRoutes from './src/modules/users/routes/user.routes.js';
import roomRoutes from './src/modules/rooms/routes/room.routes.js';
import bookingRoutes from './src/modules/rooms/routes/booking.routes.js';
import posRoutes from './src/modules/pos/routes/pos.routes.js';
import inventoryRoutes from './src/modules/inventory/routes/inventory.routes.js';
import billingRoutes from './src/modules/billing/routes/billing.routes.js';
import reportsRoutes from './src/modules/reports/routes/reports.routes.js';
import tableRoutes from './src/modules/tables/routes/table.routes.js';

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/tables', tableRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server Configuration
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

// 🔥 POS namespace
const posNamespace = io.of('/pos');

// 🔐 Socket auth (JWT)
posNamespace.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));

    const decoded = verifyToken(token);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
});

posNamespace.on('connection', (socket) => {
  console.log('✅ POS socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ POS socket disconnected:', socket.id);
  });
});

// 🔗 Make io available in controllers
app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled at /pos`);
});

// Graceful Shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));