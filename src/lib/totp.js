// src/lib/totp.js
import { authenticator } from 'otplib';

export function generateSecret() {
  return authenticator.generateSecret();
}

export function verifyToken(secret, token) {
  return authenticator.verify({
    token,
    secret
  });
}

// Configure authenticator options
authenticator.options = {
  window: 1,
  step: 30
};