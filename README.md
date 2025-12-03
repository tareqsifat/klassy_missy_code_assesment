# Flash Sale Stock Reservation System

A full-stack reservation system where users can reserve products for 2 minutes. If they don't complete the purchase, the reservation automatically expires and stock is restored.

## 🏗️ Tech Stack

- **Backend**: NestJS with TypeORM and Bull Queue
- **Frontend**: Next.js 15 with React and TypeScript
- **Database**: SQLite (easily swappable to PostgreSQL/MySQL)
- **Queue**: Bull with Redis for background job processing
- **Styling**: TailwindCSS with custom animations

## ✨ Features

### Backend
- ✅ Automatic reservation expiration after 2 minutes using background jobs
- ✅ Atomic stock operations to prevent overselling
- ✅ Transaction-based stock management
- ✅ Concurrent reservation handling
- ✅ Auto-seeding with sample products
- ✅ RESTful API with validation

### Frontend
- ✅ Real-time countdown timers
- ✅ Timer persistence across page refresh (localStorage)
- ✅ Automatic stock synchronization
- ✅ Toast notifications
- ✅ Responsive premium UI design
- ✅ Visual status indicators
- ✅ Loading states and error handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Redis** - [Download](https://redis.io/download)
  - **Windows**: Use [Memurai](https://www.memurai.com/get-memurai) or [Redis on WSL](https://redis.io/docs/getting-started/installation/install-redis-on-windows/)
  - **macOS**: `brew install redis`
  - **Linux**: `sudo apt-get install redis-server`

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd coding_assesment_klassy_missy
```

### 2. Start Redis Server

**Windows (Memurai):**
```bash
# Start Memurai service (runs as Windows service after installation)
# Or run from command line:
memurai
```

**macOS/Linux:**
```bash
redis-server
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
# OR on Mac/Linux:
# cp .env.example .env

# The database will be automatically created and seeded on first run
```

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
copy .env.local.example .env.local
# OR on Mac/Linux:
# cp .env.local.example .env.local
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

The backend will start on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3001`

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:3001
```

## 🗄️ Database Seeding

The database is automatically seeded with 10 sample products on first run. The sample products include:

- iPhone 15 Pro - $999.99 (50 in stock)
- Samsung Galaxy S24 - $899.99 (45 in stock)
- MacBook Pro M3 - $2499.99 (30 in stock)
- Sony WH-1000XM5 - $399.99 (100 in stock)
- iPad Air - $599.99 (75 in stock)
- Apple Watch Series 9 - $429.99 (60 in stock)
- Sony PlayStation 5 - $499.99 (25 in stock)
- Nintendo Switch OLED - $349.99 (80 in stock)
- Dell XPS 15 - $1799.99 (40 in stock)
- LG OLED TV 55" - $1299.99 (20 in stock)

## 🧪 Testing the System

### Test Scenarios

1. **Creating a Reservation**
   - Select a product
   - Choose quantity
   - Click "Reserve Now"
   - Watch the 2-minute countdown timer

2. **Completing a Purchase**
   - Create a reservation
   - Click "Complete Purchase" before timer expires
   - Verify stock is permanently deducted

3. **Reservation Expiration**
   - Create a reservation
   - Wait for 2 minutes
   - Watch timer expire
   - Verify stock is automatically restored

4. **Concurrent Reservations**
   - Open multiple browser tabs
   - Create reservations simultaneously
   - Verify stock never goes negative
   - Check that all timers work independently

5. **Page Refresh Persistence**
   - Create a reservation
   - Refresh the page
   - Verify timer continues from correct time

6. **Stock Synchronization**
   - Create reservation in one tab
   - Watch stock update in other tabs
   - Verify real-time sync

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=3000                       # Backend server port
NODE_ENV=development            # Environment mode
FRONTEND_URL=http://localhost:3001  # Frontend URL for CORS
REDIS_HOST=localhost            # Redis host
REDIS_PORT=6379                 # Redis port
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000  # Backend API URL
```

## 📡 API Endpoints

### Products

- `GET /products` - List all products with current stock

### Reservations

- `POST /reservations` - Create a new reservation
  ```json
  {
    "productId": 1,
    "quantity": 2
  }
  ```

- `POST /reservations/:id/complete` - Complete a reservation (mock payment)

- `GET /reservations` - List all reservations

- `GET /reservations/:id` - Get specific reservation details

## 🛠️ Development

### Backend Development

```bash
cd backend

# Development mode with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm run test

# Lint
npm run lint
```

### Frontend Development

```bash
cd frontend

# Development mode
npm run dev

# Production build
npm run build
npm run start

# Lint
npm run lint
```

## 📦 Project Structure

```
coding_assesment_klassy_missy/
├── backend/
│   ├── src/
│   │   ├── entities/          # TypeORM entities
│   │   ├── dto/               # Data transfer objects
│   │   ├── products/          # Products module
│   │   ├── reservations/      # Reservations module
│   │   ├── seed/              # Database seeding
│   │   ├── app.module.ts      # Main app module
│   │   └── main.ts            # Application entry point
│   ├── .env.example           # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and API client
│   ├── types/                 # TypeScript types
│   ├── .env.local.example     # Environment variables template
│   └── package.json
│
├── ARCHITECTURE.md            # Architecture documentation
└── README.md                  # This file
```

## 🚨 Troubleshooting

### Redis Connection Issues

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution**:
- Ensure Redis is running: `redis-server`
- Check Redis is accessible: `redis-cli ping` (should return PONG)
- Verify REDIS_HOST and REDIS_PORT in backend/.env

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
- Change PORT in backend/.env to a different port
- Or kill the process using the port:
  - Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
  - Mac/Linux: `lsof -ti:3000 | xargs kill -9`

### Database Issues

**Problem**: Database errors or schema issues

**Solution**:
- Delete `backend/database.sqlite` file
- Restart the backend - database will be recreated and seeded automatically

### Timer Not Working After Refresh

**Problem**: Timer doesn't persist across page refresh

**Solution**:
- Clear browser localStorage
- Ensure you're using the same browser (localStorage is browser-specific)

## 📝 Notes

- The system uses SQLite for easy setup. For production, consider PostgreSQL or MySQL.
- Mock payment implementation - no actual payment processing.
- Redis is required for background job processing (expiration).
- Reservations are stored in localStorage for demo purposes.

## 🎯 Key Implementation Details

- **Atomic Operations**: Stock updates use database-level atomic operations
- **Transactions**: All critical operations wrapped in transactions
- **Background Jobs**: Bull queue processes expiration independently
- **Concurrency**: Handled at database level with row-level locking
- **Timer Sync**: Frontend polls backend every 3 seconds for stock updates

## 📄 License

This project is created for the Klassy Missy Backend Engineer position coding assessment.

---

**Built with ❤️ using NestJS and Next.js**
