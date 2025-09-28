import { Controller, Get, Inject } from '@nestjs/common';
import { TrackingGateway } from '../../websocket/tracking.gateway';

@Controller('tracking')
export class TrackingController {
  constructor(
    @Inject(TrackingGateway)
    private readonly trackingGateway: TrackingGateway,
  ) {}

  @Get('status')
  getTrackingStatus() {
    return this.trackingGateway.getStats();
  }
}
