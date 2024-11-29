import mongoose from 'mongoose';
import { connectMongoDB } from '@/infrastructure/database/mongodb';
import User from '@/infrastructure/database/models/User';
import { MongoDBAdapter } from '@/infrastructure/auth/nextauth/mongodb-adapter';
import bcrypt from 'bcryptjs';

describe('MongoDB Connection and Operations', () => {
  beforeAll(async () => {
    // Ensure we're using test database
    process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test_db';
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await User.deleteMany({});
  });

  // Test database connection
  describe('Database Connection', () => {
    it('should connect to MongoDB successfully', async () => {
      const connection = await connectMongoDB();
      expect(connection).toBeDefined();
      expect(mongoose.connection.readyState).toBe(1);
    });

    it('should reuse existing connection', async () => {
      const connection1 = await connectMongoDB();
      const connection2 = await connectMongoDB();
      expect(connection1).toBe(connection2);
    });
  });

  // Test User operations
  describe('User Operations', () => {
    const testUser = {
      email: 'test@example.com',
      name: 'Test',
      lastname: 'User',
      password: 'password123',
      image: 'https://example.com/image.jpg',
      accountStatus: 'active',
      rol: 'user',
      isAdmin: false
    };

    it('should create a new user', async () => {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(testUser.password, salt);
      
      const user = await User.create({
        ...testUser,
        password: hashedPassword
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
      expect(user.name).toBe(testUser.name);
      expect(await bcrypt.compare(testUser.password, user.password)).toBe(true);
    });

    it('should find user by email using adapter', async () => {
      // First create a user
      await User.create(testUser);

      // Then try to find it using the adapter
      const foundUser = await MongoDBAdapter.getUserByEmail(testUser.email);
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(testUser.email);
    });

    it('should create user from OAuth profile', async () => {
      const oAuthProfile = {
        email: 'oauth@example.com',
        given_name: 'OAuth',
        family_name: 'User',
        picture: 'https://example.com/oauth-image.jpg'
      };

      const user = await MongoDBAdapter.createUserFromOAuth(oAuthProfile);
      expect(user).toBeDefined();
      expect(user.email).toBe(oAuthProfile.email);
      expect(user.name).toBe(oAuthProfile.given_name);
      expect(user.lastname).toBe(oAuthProfile.family_name);
    });

    it('should verify user credentials', async () => {
      // Create user with hashed password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(testUser.password, salt);
      await User.create({
        ...testUser,
        password: hashedPassword
      });

      // Verify credentials
      const verifiedUser = await MongoDBAdapter.verifyCredentials({
        email: testUser.email
      });

      expect(verifiedUser).toBeDefined();
      expect(verifiedUser.email).toBe(testUser.email);
      expect(verifiedUser.password).toBeDefined();
    });
  });

  // Test error scenarios
  describe('Error Handling', () => {
    it('should handle duplicate email creation', async () => {
      await User.create({
        email: 'duplicate@example.com',
        name: 'Test',
        password: 'password123'
      });

      await expect(User.create({
        email: 'duplicate@example.com',
        name: 'Test2',
        password: 'password456'
      })).rejects.toThrow();
    });

    it('should handle user not found', async () => {
      const nonExistentUser = await MongoDBAdapter.getUserByEmail('nonexistent@example.com');
      expect(nonExistentUser).toBeNull();
    });
  });
});
