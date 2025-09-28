import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { UpdateVehicleLocationUseCase } from '../../../app/use-cases/vehicle/vehicle.use-case';

interface LocationUpdateData {
  vehicleId: string;
  latitude: number;
  longitude: number;
}

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/tracking',
})
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  private connectedClients = new Map<string, Socket>();
  private activeVehicles = new Set<string>(); // Simple tracking state

  constructor(
    private readonly updateVehicleLocationUseCase: UpdateVehicleLocationUseCase,
  ) {
    this.logger.log('TrackingGateway initialized');
  }

  handleConnection(client: Socket) {
    try {
      this.logger.log(`Client attempting to connect: ${client.id}`);
      this.connectedClients.set(client.id, client);

      client.emit('connected', {
        clientId: client.id,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(
        `Client successfully connected: ${client.id}. Total clients: ${this.connectedClients.size}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle connection for client ${client.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  handleDisconnect(client: Socket) {
    try {
      this.logger.log(`Client attempting to disconnect: ${client.id}`);
      this.connectedClients.delete(client.id);
      this.logger.log(
        `Client successfully disconnected: ${client.id}. Total clients: ${this.connectedClients.size}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle disconnection for client ${client.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  @SubscribeMessage('start_tracking')
  async handleStartTracking(
    @MessageBody() data: { vehicleId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Starting tracking request from client ${client.id} for vehicle: ${data?.vehicleId}`,
    );

    try {
      const { vehicleId } = data;

      if (!vehicleId) {
        this.logger.warn(`Invalid vehicleId received from client ${client.id}`);
        throw new Error('Vehicle ID is required');
      }

      // Add to active vehicles
      this.activeVehicles.add(vehicleId);
      this.logger.debug(
        `Added vehicle ${vehicleId} to active vehicles. Total active: ${this.activeVehicles.size}`,
      );

      // Join vehicle room
      client.join(`vehicle:${vehicleId}`);
      this.logger.debug(
        `Client ${client.id} joined room: vehicle:${vehicleId}`,
      );

      // Notify all subscribers
      // send tracking_started
      this.server.to(`vehicle:${vehicleId}`).emit('tracking_started', {
        vehicleId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(
        `Successfully started tracking for vehicle: ${vehicleId}`,
      );
      return { success: true, message: 'Tracking started' };
    } catch (error) {
      this.logger.error(
        `Failed to start tracking for client ${client.id}: ${error.message}`,
        error.stack,
      );
      client.emit('error', { message: error.message });
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('location_update')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleLocationUpdate(
    @MessageBody() data: LocationUpdateData,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(
      `Location update received from client ${client.id} for vehicle: ${data?.vehicleId}`,
    );

    try {
      const { vehicleId, latitude, longitude } = data;

      if (!vehicleId || latitude === undefined || longitude === undefined) {
        this.logger.warn(
          `Invalid location data received from client ${client.id}: ${JSON.stringify(data)}`,
        );
        throw new Error('Vehicle ID, latitude, and longitude are required');
      }

      this.logger.debug(
        `Updating database location for vehicle ${vehicleId}: lat=${latitude}, lng=${longitude}`,
      );

      // Update vehicle location in database
      await this.updateVehicleLocationUseCase.execute(
        vehicleId,
        latitude,
        longitude,
      );

      this.logger.debug(
        `Database updated successfully for vehicle ${vehicleId}`,
      );

      // Broadcast to all clients tracking this vehicle
      const updatePayload = {
        vehicleId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      };

      this.server
        .to(`vehicle:${vehicleId}`)
        .emit('location_updated', updatePayload);
      this.logger.debug(
        `Location broadcasted to subscribers for vehicle ${vehicleId}`,
      );

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to update location from client ${client.id}: ${error.message}`,
        error.stack,
      );
      client.emit('error', { message: error.message });
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('stop_tracking')
  async handleStopTracking(
    @MessageBody() data: { vehicleId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Stop tracking request from client ${client.id} for vehicle: ${data?.vehicleId}`,
    );

    try {
      const { vehicleId } = data;

      if (!vehicleId) {
        this.logger.warn(
          `Invalid vehicleId received from client ${client.id} for stop tracking`,
        );
        throw new Error('Vehicle ID is required');
      }

      // Remove from active vehicles
      const wasActive = this.activeVehicles.delete(vehicleId);
      this.logger.debug(
        `Vehicle ${vehicleId} ${wasActive ? 'removed from' : 'was not in'} active vehicles. Total active: ${this.activeVehicles.size}`,
      );

      // Notify all subscribers
      this.server.to(`vehicle:${vehicleId}`).emit('tracking_stopped', {
        vehicleId,
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(
        `Stop tracking notification sent for vehicle ${vehicleId}`,
      );

      // Remove all clients from vehicle room
      this.server
        .in(`vehicle:${vehicleId}`)
        .socketsLeave(`vehicle:${vehicleId}`);

      this.logger.log(
        `Successfully stopped tracking for vehicle: ${vehicleId}`,
      );
      return { success: true, message: 'Tracking stopped' };
    } catch (error) {
      this.logger.error(
        `Failed to stop tracking for client ${client.id}: ${error.message}`,
        error.stack,
      );
      client.emit('error', { message: error.message });
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('get_stats')
  handleGetStats(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Stats request from client ${client.id}`);

    try {
      const stats = this.getStats();
      client.emit('stats_data', stats);
      this.logger.debug(`Sent stats to client ${client.id}`);
      return stats;
    } catch (error) {
      this.logger.error(
        `Failed to send stats to client ${client.id}: ${error.message}`,
        error.stack,
      );
      client.emit('error', { message: error.message });
      return { error: error.message };
    }
  }

  // Admin methods
  getStats() {
    this.logger.debug('Stats requested');

    try {
      const stats = {
        connectedClients: this.connectedClients.size,
        activeVehicles: this.activeVehicles.size,
        vehicles: Array.from(this.activeVehicles),
        timestamp: new Date().toISOString(),
      };

      this.logger.debug(`Current stats: ${JSON.stringify(stats)}`);
      return stats;
    } catch (error) {
      this.logger.error(`Failed to get stats: ${error.message}`, error.stack);
      return {
        connectedClients: 0,
        activeVehicles: 0,
        vehicles: [],
        error: error.message,
      };
    }
  }
}
