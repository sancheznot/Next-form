// This file is used to connect to MongoDB using mongoose
// It also caches the connection so as to avoid connecting to the database multiple times
// It exports a function called connectMongoDB that connects to the database and returns the connection
// It also exports a middleware function called databaseMiddleware that can be used in API routes to connect to the database
// It is important to use the databaseMiddleware in your API routes to connect to the database
// ./src/lib/mongodb.js
import mongoose from "mongoose";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectMongoDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Increase the time it takes to detect when the MongoDB server is down
        socketTimeoutMS: 45000, // Increase the time it takes for the MongoDB server to close the connection
        connectTimeoutMS: 30000, // Increase the time it takes to connect to the MongoDB server
      })
      .then((mongoose) => {
        return mongoose;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

// IMPORTANT:  Don't forget use this middleware in your api routes
//  Middleware for database connection use it in api routes
// 
// const databaseMiddleware = (handler) => async (req, res) => {
//   if (!global.mongoose) {
//     global.mongoose = await connectMongoDB();
//   }
//   return handler(req, res);
// };

// Example of using the databaseMiddleware in an API route
// POST method
// export const POST = databaseMiddleware(async (req) => {
//   try {

//     const { data } = await req.json();
//     const {  userID } = data;

//     if (!userID ) {
//       return NextResponse.json(
//         { message: "Bad Request" },
//         { status: 400 }
//       );
//     }

//     const db = await connectMongoDB();
//     if (!db) {
//       return NextResponse.json(
//         { message: "Failed to connect to the database" },
//         { status: 500 }
//       );
//     }

//   } catch (error) {
//     console.error('Database connection error:', error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// });
