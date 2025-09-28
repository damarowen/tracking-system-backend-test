import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../../domain/repositories/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; customerId: string }) {
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    // This object will be attached to request.user
    return {
      userId: payload.sub,
      email: payload.email,
      customerId: payload.customerId,
    };
  }
}
