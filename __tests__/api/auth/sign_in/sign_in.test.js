import { signIn } from '@/auth';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/auth', () => ({
  signIn: jest.fn(),
}));

describe('SignIn functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign in successfully with valid credentials', async () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    signIn.mockResolvedValue({ ok: true });

    const response = await signIn('credentials', mockCredentials);
    expect(response.ok).toBe(true);
  });

  it('should fail sign in with invalid credentials', async () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    signIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' });

    const response = await signIn('credentials', mockCredentials);
    expect(response.ok).toBe(false);
    expect(response.error).toBe('Invalid credentials');
  });
});
