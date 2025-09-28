const { io } = require('socket.io-client');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class MultiUserVehicleSimulator {
  constructor() {
    this.users = [];
    this.vehicles = [];
    this.simulators = [];
    this.baseUrl = 'http://localhost:3000';
    this.userCount = 10;

    this.initialize();
  }

  async initialize() {
    console.log('🚀 Starting Multi-User Vehicle Simulator...');
    console.log(`👥 Creating ${this.userCount} users...`);
    console.log('='.repeat(60));

    try {
      // Step 1: Create 10 users
      await this.createUsers();

      // Step 2: Login users and get tokens
      await this.loginUsers();

      // Step 3: Create vehicles for each user
      await this.createVehicles();

      // Step 4: Start tracking for all vehicles
      await this.startTracking();
    } catch (error) {
      console.error('❌ Failed to initialize simulator:', error.message);
      process.exit(1);
    }
  }

  async createUsers() {
    console.log('👤 Creating users...');

    for (let i = 1; i <= this.userCount; i++) {
      try {
        const userData = {
          name: `User ${i}`,
          email: `user${i}@simulator.com`,
          password: 'password123',
        };

        const response = await axios.post(
          `${this.baseUrl}/auth/register`,
          userData,
        );

        this.users.push({
          id: i,
          name: userData.name,
          email: userData.email,
          password: userData.password,
          data: response.data,
        });

        console.log(`✅ User ${i} created: ${userData.email}`);
        await this.delay(200); // Small delay to avoid overwhelming server
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️  User ${i} already exists, continuing...`);
          // Add existing user to array for login attempt
          this.users.push({
            id: i,
            name: `User ${i}`,
            email: `user${i}@simulator.com`,
            password: 'password123',
          });
        } else {
          console.error(
            `❌ Failed to create User ${i}:`,
            error.response?.data?.message || error.message,
          );
        }
      }
    }

    console.log(`✅ Created/verified ${this.users.length} users\n`);
  }

  async loginUsers() {
    console.log('🔐 Logging in users to get tokens...');

    for (const user of this.users) {
      try {
        const loginData = {
          email: user.email,
          password: user.password,
        };

        const response = await axios.post(
          `${this.baseUrl}/auth/login`,
          loginData,
        );

        user.token = response.data.data.accessToken;
        console.log(`✅ User ${user.id} logged in successfully`);

        await this.delay(100);
      } catch (error) {
        console.error(
          `❌ Failed to login User ${user.id}:`,
          error.response?.data?.message || error.message,
        );
      }
    }

    const loggedInUsers = this.users.filter((user) => user.token);
    console.log(`✅ ${loggedInUsers.length} users logged in successfully\n`);
  }

  async createVehicles() {
    console.log('🚗 Creating vehicles for users...');

    for (const user of this.users) {
      if (!user.token) continue;

      const letter = this.generateRandomLetters(3);
      try {
        const vehicleData = {
          plateNumber: `B100${user.id}${letter}`,
          brand: 'Toyota',
          model: 'Avanza',
          year: 2020 + (user.id % 5),
          type: 'car',
          status: 'active',
          description: `Simulator vehicle for User ${user.id}`,
        };

        const response = await axios.post(
          `${this.baseUrl}/vehicles`,
          vehicleData,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const vehicle = {
          id: response.data.data.id,
          userId: user.id,
          userEmail: user.email,
          plateNumber: vehicleData.plateNumber,
          data: response.data,
        };

        this.vehicles.push(vehicle);
        console.log(
          `✅ Vehicle created for User ${user.id}: ${vehicleData.plateNumber} (${vehicle.id})`,
        );

        await this.delay(200);
      } catch (error) {
        console.log(error.response?.data?.meta?.message, 'error');
        console.error(
          `❌ Failed to create vehicle for User ${user.id}:`,
          error.response?.data?.message || error.message,
        );
      }
    }

    console.log(`✅ Created ${this.vehicles.length} vehicles\n`);
  }

  async startTracking() {
    console.log('📡 Starting vehicle tracking...');
    console.log('='.repeat(60));

    // Jakarta area coordinates for different starting locations
    const startingCoordinates = [
      { lat: -6.2088, lng: 106.8456 }, // Central Jakarta
      { lat: -6.1751, lng: 106.865 }, // North Jakarta
      { lat: -6.2615, lng: 106.781 }, // West Jakarta
      { lat: -6.2297, lng: 106.8756 }, // East Jakarta
      { lat: -6.3047, lng: 106.8317 }, // South Jakarta
      { lat: -6.1944, lng: 106.8229 }, // Menteng
      { lat: -6.2383, lng: 106.8253 }, // Senayan
      { lat: -6.1598, lng: 106.8131 }, // Kelapa Gading
      { lat: -6.2754, lng: 106.8071 }, // Kebayoran
      { lat: -6.2441, lng: 106.8971 }, // Cawang
    ];

    for (let i = 0; i < this.vehicles.length; i++) {
      const vehicle = this.vehicles[i];
      const coords = startingCoordinates[i % startingCoordinates.length];

      // Create simulator for each vehicle with staggered start
      setTimeout(() => {
        const simulator = new VehicleTrackingSimulator(
          vehicle.id,
          coords.lat,
          coords.lng,
          vehicle.userId,
          vehicle.userEmail,
          vehicle.plateNumber,
        );

        this.simulators.push(simulator);

        // Start stats polling only for the first simulator
        if (i === 0) {
          setTimeout(() => {
            simulator.startStatsPolling();
          }, 2000);
        }
      }, i * 1000); // 1 second delay between each vehicle
    }

    // Summary
    setTimeout(
      () => {
        console.log('✅ All vehicles started tracking!');
        console.log('📊 Stats will be displayed every 10 seconds...');
        console.log(
          `🏃 ${this.vehicles.length} vehicles are now being tracked\n`,
        );

        // Display summary
        this.displaySummary();
      },
      this.vehicles.length * 1000 + 2000,
    );
  }

  displaySummary() {
    console.log('📋 SIMULATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`👥 Users Created: ${this.users.length}`);
    console.log(`🚗 Vehicles Created: ${this.vehicles.length}`);
    console.log(`📡 Active Simulators: ${this.simulators.length}`);
    console.log('='.repeat(60));
    console.log('🆔 Vehicle List:');
    this.vehicles.forEach((vehicle) => {
      console.log(
        `   User ${vehicle.userId}: ${vehicle.plateNumber} (${vehicle.id})`,
      );
    });
    console.log('='.repeat(60) + '\n');
  }

  generateRandomLetters(length) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  stop() {
    console.log('\n🛑 Stopping all simulators...');
    this.simulators.forEach((sim) => sim.stop());

    setTimeout(() => {
      console.log('✅ All simulators stopped!');
      process.exit(0);
    }, 2000);
  }
}

class VehicleTrackingSimulator {
  constructor(vehicleId, startLat, startLng, userId, userEmail, plateNumber) {
    this.vehicleId = vehicleId;
    this.userId = userId;
    this.userEmail = userEmail;
    this.plateNumber = plateNumber;
    this.lat = startLat;
    this.lng = startLng;
    this.socket = io('http://localhost:3000/tracking');
    this.isRunning = false;
    this.statsInterval = null;

    this.setupSocket();
  }

  setupSocket() {
    this.socket.on('connect', () => {
      console.log(
        `🚗 User ${this.userId} Vehicle (${this.plateNumber}) connected`,
      );
      this.start();
    });

    this.socket.on('tracking_started', () => {
      console.log(`✅ User ${this.userId} vehicle tracking started`);
      this.isRunning = true;
      this.sendUpdates();
    });

    this.socket.on('stats_data', (stats) => {
      // Only display from User 1's vehicle to avoid spam
      if (this.userId === 1) {
        this.displayStats(stats);
      }
    });

    this.socket.on('location_updated', (data) => {
      // Optional: log when location is broadcasted back
      // console.log(`📡 Location broadcast received for vehicle ${this.vehicleId}`);
    });

    this.socket.on('error', (error) => {
      console.error(`❌ Error for User ${this.userId} vehicle:`, error.message);
    });

    this.socket.on('disconnect', () => {
      console.log(`🔌 User ${this.userId} vehicle disconnected`);
      if (this.statsInterval) {
        clearInterval(this.statsInterval);
      }
    });
  }

  start() {
    this.socket.emit('start_tracking', { vehicleId: this.vehicleId });
  }

  sendUpdates() {
    if (!this.isRunning) return;

    // Simulate realistic movement
    const movementFactor = 0.0005 + Math.random() * 0.0005;
    this.lat += (Math.random() - 0.5) * movementFactor;
    this.lng += (Math.random() - 0.5) * movementFactor;

    console.log(
      `📍 User ${this.userId} (${this.plateNumber}): ${this.lat.toFixed(6)}, ${this.lng.toFixed(6)}`,
    );

    this.socket.emit('location_update', {
      vehicleId: this.vehicleId,
      latitude: this.lat,
      longitude: this.lng,
    });

    // Random interval 3-5 seconds
    const interval = 3000 + Math.random() * 2000;
    setTimeout(() => this.sendUpdates(), interval);
  }

  startStatsPolling() {
    this.requestStats();
    this.statsInterval = setInterval(() => {
      this.requestStats();
    }, 10000);
  }

  requestStats() {
    if (this.socket.connected) {
      this.socket.emit('get_stats');
    }
  }

  displayStats(stats) {
    const timestamp = new Date().toLocaleString();
    console.log('\n' + '='.repeat(60));
    console.log(`📊 TRACKING GATEWAY STATS - ${timestamp}`);
    console.log('='.repeat(60));
    console.log(`🔗 Connected Clients: ${stats.connectedClients}`);
    console.log(`🚗 Active Vehicles: ${stats.activeVehicles}`);

    if (stats.vehicles && stats.vehicles.length > 0) {
      console.log(`📋 Active Vehicle List:`);
      stats.vehicles.forEach((vehicleId, index) => {
        console.log(`   ${index + 1}. ${vehicleId}`);
      });
    } else {
      console.log(`📋 No active vehicles`);
    }

    console.log('='.repeat(60) + '\n');
  }

  stop() {
    this.isRunning = false;
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
    this.socket.emit('stop_tracking', { vehicleId: this.vehicleId });
    this.socket.disconnect();
  }
}

// Start the multi-user simulator
console.log('🌟 Multi-User Vehicle Tracking Simulator');
console.log('📅 Started at:', new Date().toLocaleString());
console.log('='.repeat(60));

const multiSim = new MultiUserVehicleSimulator();

// Graceful shutdown
process.on('SIGINT', () => {
  multiSim.stop();
});

process.on('SIGTERM', () => {
  multiSim.stop();
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  if (multiSim) {
    multiSim.stop();
  }
});
