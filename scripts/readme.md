What This Simulator Does:
1. Creates 10 Real Users
   Makes POST requests to /auth/register
   Creates users: user1@simulator.com to user10@simulator.com
   Handles duplicate user scenarios gracefully
2. Authenticates Users
   Makes POST requests to /auth/login
   Obtains JWT tokens for each user
   Stores tokens for subsequent API calls
3. Creates 10 Real Vehicles
   Makes POST requests to /vehicles for each user
   Uses JWT authentication headers
   Creates vehicles with realistic data (plate numbers, brands, etc.)
   Each vehicle gets a unique UUID from your backend
4. Starts Real Tracking
   Connects to WebSocket /tracking namespace
   Sends start_tracking with real vehicle IDs from database
   Sends location_update events every 3-5 seconds
   All data goes through your TrackingGateway
