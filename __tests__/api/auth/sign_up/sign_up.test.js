import { POST } from '@/app/api/auth/signup/route';
import { connectMongoDB } from '@/infrastructure/database/mongodb';
import User from '@/infrastructure/database/models/User';
import { NextResponse } from 'next/server';

jest.mock('@/infrastructure/database/mongodb', () => ({
  connectMongoDB: jest.fn(),
}));

jest.mock('@/infrastructure/database/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

describe('SignUp API', () => {
  const mockUser = {
    email: 'test@example.com',
    name: 'Test',
    lastname: 'User',
    password: 'password123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user successfully', async () => {
    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(mockUser),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ ...mockUser, id: '123' });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(201);
    expect(responseData.message).toBe('User created successfully');
    expect(responseData.user).toBeDefined();
  });

  it('should return error for existing email', async () => {
    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(mockUser),
    });

    User.findOne.mockResolvedValue({ email: mockUser.email });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.message).toBe('Email is already in use');
  });

  it('should validate email format', async () => {
    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ ...mockUser, email: 'invalid-email' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Please add a valid email');
  });
});
