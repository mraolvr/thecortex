# Cortex - Personal Productivity Platform

A full-stack application for managing projects, tasks, books, and creative content.

## Features

- Project Management
- Task Tracking
- Book Library
- Creative Hub
- Secure Vault
- AI Integration

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Auth0
- **Deployment**: Netlify (Frontend), Railway/Render (Backend)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Auth0 account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cortex.git
   cd cortex
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both `server/` and `client/` directories
   - See `.env.example` files for required variables

4. Start development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd client
   npm run dev
   ```

## Development

- Frontend runs on `http://localhost:5176`
- Backend runs on `http://localhost:3000`

## Deployment

### Frontend (Netlify)
1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```
2. Deploy to Netlify using the Netlify CLI or dashboard

### Backend (Railway/Render)
1. Build the backend:
   ```bash
   cd server
   npm run build
   ```
2. Deploy to your chosen platform

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 