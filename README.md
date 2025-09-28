# Real-Time Tracking System Backend

A robust backend system for real-time vehicle/asset tracking built with NestJS, following Domain-Driven Design (DDD) and Hexagonal Architecture principles.

## 🚀 Features

- **Clean Architecture**: Domain-Driven Design with Hexagonal Architecture
- **Real-time Tracking**: WebSocket-based live location updates
- **CRUD Operations**: Complete Customer and Vehicle management
- **High Performance**: Optimized for high-frequency location updates
- **Scalable Design**: Built for multiple concurrent connections

## 🏗️ Architecture

```
src/
├── app/                  # Application Layer (Use Cases)
│   ├── use-cases/        # Business logic orchestration
│   └── ports/            # DTOs and interfaces
├── domain/               # Domain Layer (Business Logic)
│   ├── models/           # Entities and Value Objects
│   ├── repositories/     # Repository interfaces
│   └── services/         # Domain services
├── infrastructure/       # Infrastructure Layer (Adapters)
│   ├── adapters/
│   │   ├── persistence/  # Database implementations
│   │   ├── http/         # REST Controllers
│   │   └── websocket/    # WebSocket Gateway
│   ├── config/           # Configuration
│   └── main.ts          # Application entry point
```

## 🛠️ Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **WebSocket**: Socket.IO
- **Validation**: class-validator, class-transformer
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest

## 📋 Prerequisites

- Node.js 18+ or Docker
- PostgreSQL 15+ (or use Docker)
- Redis (optional, for scaling)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd real-time-tracking-system

# Start development environment
npm run docker:dev

# Or start production environment
npm run docker:prod
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env-example .env
# Edit .env with your database credentials

# Start PostgreSQL (if not using Docker)
# Create database: live_tracking

# Run migrations (auto with DB_SYNC=true)
npm run start:dev
```

## 🌐 API Endpoints

### Customer Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create customer |
| GET | `/customers` | Get all customers |
| GET | `/customers/:id` | Get customer by ID |
| PATCH | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |

**Example Request:**
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

### Vehicle Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/vehicles` | Create vehicle |
| GET | `/vehicles` | Get all vehicles |
| GET | `/vehicles/:id` | Get vehicle by ID |
| GET | `/vehicles/customer/:customerId` | Get vehicles by customer |
| PATCH | `/vehicles/:id` | Update vehicle |
| PATCH | `/vehicles/:id/location` | Update vehicle location |
| DELETE | `/vehicles/:id` | Delete vehicle |

**Example Request:**
```bash
curl -X POST http://localhost:3000/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "plateNumber": "B1234XYZ",
    "brand": "Toyota",
    "model": "Avanza",
    "year": 2022,
    "type": "car",
    "customerId": "uuid-here"
  }'
```

### Tracking Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tracking/status` | Get WebSocket connection stats |

## 🔌 WebSocket API

Connect to: `ws://localhost:3000/tracking`

### Events

#### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `start_tracking` | `{ vehicleId: string }` | Start tracking vehicle |
| `location_update` | `{ vehicleId, latitude, longitude, speed?, heading? }` | Send location update |
| `stop_tracking` | `{ vehicleId: string }` | Stop tracking vehicle |
| `subscribe_vehicle` | `{ vehicleId: string }` | Subscribe to vehicle updates |
| `unsubscribe_vehicle` | `{ vehicleId: string }` | Unsubscribe from vehicle |
| `get_active_vehicles` | `{}` | Get list of active vehicles |

#### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `connected` | `{ clientId, timestamp }` | Connection confirmed |
| `tracking_started` | `{ vehicleId, timestamp }` | Tracking session started |
| `location_updated` | `{ vehicleId, latitude, longitude, speed, timestamp }` | Location update broadcast |
| `tracking_stopped` | `{ vehicleId, timestamp }` | Tracking session ended |
| `subscribed` | `{ vehicleId, message }` | Subscription confirmed |
| `active_vehicles` | `{ vehicles: [], count }` | Active vehicles list |
| `error` | `{ message, code }` | Error occurred |

### WebSocket Example

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3000/tracking');

// Connect and subscribe
socket.on('connect', () => {
  socket.emit('subscribe_vehicle', { vehicleId: 'vehicle-uuid' });
  socket.emit('start_tracking', { vehicleId: 'vehicle-uuid' });
});

// Handle location updates
socket.on('location_updated', (data) => {
  console.log('Vehicle moved:', data);
});

// Send location update
socket.emit('location_update', {
  vehicleId: 'vehicle-uuid',
  latitude: -6.2088,
  longitude: 106.8456,
  speed: 30
});
```


## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Test WebSocket connection
node scripts/test-websocket.js
```

## 📈 Performance Considerations

- **Database Indexing**: Indexes on frequently queried fields (email, plate_number)
- **Real-time Optimization**: Efficient WebSocket room management
- **Caching Strategy**: Ready for Redis integration

## 🔒 Security Features

- **Input Validation**: Comprehensive DTO validation
- **Error Handling**: Secure error responses
- **SQL Injection Prevention**: TypeORM query protection

## 🏛️ Architecture Decisions

### Why Clean Architecture?
- **Testability**: Clear separation of concerns
- **Maintainability**: Easy to modify and extend
- **Independence**: Framework and database agnostic core
- **Scalability**: Easy to add new features and adapters

### Why WebSockets?
- **Real-time Updates**: Sub-second location broadcasting
- **Efficiency**: Persistent connections reduce overhead
- **Scalability**: Room-based broadcasting to relevant clients
- **Bidirectional**: Two-way communication support

### Why TypeORM?
- **Type Safety**: Full TypeScript integration
- **Migrations**: Database schema management
- **Relations**: Easy entity relationship handling
- **Query Builder**: Complex query support

## 📜 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support, please contact the development team.

---
**Demo Features:**
- Customer CRUD operations
- Vehicle CRUD operations
- Real-time GPS tracking via WebSocket
- Multi-client subscription support
- Location history and tracking sessions
- Performance monitoring and health checks
- TO RUN DEMO with 10 user USE node scripts/simple-simulator.js
