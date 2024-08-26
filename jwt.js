const jwt = require('jsonwebtoken');

// Clave secreta para encriptar el token
const secretKey = 'your_super_secret_key'; // Reemplaza con tu clave secreta real

// Datos que quieres incluir en el token
const payload = {
  userId: '123456',
  username: 'exampleUser',
  email: 'user@example.com',
  isAdmin: true,
};

// Opciones del token
const options = {
  expiresIn: '1h', // El token expirará en 1 hora
  algorithm: 'HS256', // Algoritmo de encriptación
};

// Generar el token
const token = jwt.sign(payload, secretKey, options);

console.log('Encrypted JWT:', token);
