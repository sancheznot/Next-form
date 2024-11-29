require('@testing-library/jest-dom');

// Agregar cualquier configuración global de Jest aquí
require('dotenv/config');

// Mock Next.js hooks
jest.mock('next/navigation', () => {
  let currentPathname = '/login';
  return {
    useRouter() {
      return {
        push: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn()
      }
    },
    usePathname() {
      return currentPathname;
    },
    __setPathname: (newPath) => {
      currentPathname = newPath;
    }
  }
});

// Mock de next-auth/react para el Form
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: () => ({
    data: null,
    status: 'unauthenticated'
  })
}));

// Actualizar el mock de next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ src, alt, ...props }) {
    // Manejar tanto objetos de imagen como strings
    const imgSrc = typeof src === 'object' ? src.src : src;
    return {
      type: 'img',
      props: {
        src: imgSrc,
        alt,
        ...props
      }
    }
  }
}));

// Supress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock global Request and Response
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.body = options.body;
    this.headers = new Headers(options.headers);
  }

  async json() {
    return JSON.parse(this.body);
  }
};

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body, options) => {
      return {
        json: async () => body,
        status: options?.status || 200,
      };
    },
  },
}));

// Actualizar el mock de Response global
global.Response = class Response {
  constructor(body, options = {}) {
    this._body = typeof body === 'string' ? body : JSON.stringify(body);
    this.status = options.status || 200;
    this.headers = new Headers(options.headers);
  }

  async json() {
    return JSON.parse(this._body);
  }
};

global.Headers = class Headers {
  constructor(init = {}) {
    this.headers = { ...init };
  }
  
  get(name) {
    return this.headers[name.toLowerCase()];
  }
  
  set(name, value) {
    this.headers[name.toLowerCase()] = value;
  }
};