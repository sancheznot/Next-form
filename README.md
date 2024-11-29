# Next.js Authentication Template

![Tests](https://github.com/sancheznot/Next-form/actions/workflows/test.yml/badge.svg)

A modern authentication template built with Next.js 14, featuring Google OAuth, Two-Factor Authentication (2FA), and MongoDB integration. This template provides a solid foundation for building secure web applications with advanced authentication features.

## Features

- 🔐 Complete authentication system
- 🌐 Google OAuth integration
- 📱 Two-Factor Authentication (2FA)
- 🗄️ MongoDB database integration
- 🎨 Modern UI with NextUI and Framer Motion
- 📱 Mobile-ready (iOS/Android) with Capacitor
- 🌓 Dark/Light mode support

## Demo

Here's a quick look at the authentication interfaces:

### Sign In
![Sign In Page](/public/git/img/signIn.png)
Clean and modern sign-in interface with social login options.

### Sign Up
![Sign Up Page](/public/git/img/signUp.png)
User-friendly registration process with form validation.

### 2fa-verify
![2fa-verify Page](/public/git/img/2fa.png)
User-friendly 2fa verification

### 2fa-verify-Backup Code
![2fa-verify with backup code Page](/public/git/img/2fabackupcode.png)
User-friendly 2fa verification

## Quick Start

### Prerequisites

- Node.js 16.x or later
- MongoDB database
- Google OAuth credentials
- (Optional) Xcode for iOS, Android Studio for Android

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sancheznot/Next-form.git
cd Next-form
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with the following variables:

```env
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_nextauth_secret_key
```

### Environment Variables Explained

- `GOOGLE_ID`: OAuth 2.0 Client ID from [Google Cloud Console](https://console.developers.google.com/apis/credentials)
- `GOOGLE_SECRET`: OAuth 2.0 Client Secret from Google Cloud Console
- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_SECRET`: A secure string for session encryption (e.g., generate with `openssl rand -base64 32`)

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

### Key Routes

- `/register` - User registration
- `/login` - User login
- `/dashboard/` - User Dashboard (protected route)
- `/dashboard/profile` - User profile (protected route)

## Mobile Development

This template supports mobile development through Capacitor. To build for mobile:

1. Build the web application:
```bash
npm run build
```

2. Sync with Capacitor:
```bash
npx cap sync
```

3. Open in IDE:
```bash
npx cap open ios
# or
npx cap open android
```

### Requirements for Mobile Development

- iOS: Xcode and CocoaPods installed
- Android: Android Studio with SDK tools

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/            # React components
├── infrastructure/        # External services setup
├── lib/                  # Utility functions
└── styles/               # Global styles
```

## Technical Stack

- **Framework**: Next.js 14
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **UI Libraries**: NextUI, Framer Motion
- **Mobile**: Capacitor
- **Styling**: Tailwind CSS

## Tests

This project includes a comprehensive test suite to ensure the reliability and stability of the application. The tests are organized into different categories:

### Setup Tests

These tests ensure that the basic setup of the project is correct.

## Connect With Me

Feel free to reach out if you need help or want to contribute:

- [📸 Instagram](https://www.instagram.com/sancheznotdev/)
- [🐦 Twitter/X](https://twitter.com/sancheznotdev)
- [🌐 Portfolio](https://www.sancheznot.com/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

Special thanks to all contributors and the open-source community for making this template possible.

---

Made with ❤️ by [SancheznotDev](https://www.sancheznot.com/)