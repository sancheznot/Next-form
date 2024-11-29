import { signOut } from '@/auth';

jest.mock('@/auth', () => ({
  signOut: jest.fn(),
}));

describe('SignOut functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign out successfully', async () => {
    signOut.mockResolvedValue({ ok: true });

    const response = await signOut();
    expect(response.ok).toBe(true);
  });

  it('should handle sign out errors', async () => {
    const mockError = new Error('Session error');
    signOut.mockRejectedValue(mockError);

    await expect(signOut()).rejects.toThrow('Session error');
  });
});
