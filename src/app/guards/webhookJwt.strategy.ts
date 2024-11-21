import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

@Injectable()
export class WebhookJwtStrategy extends PassportStrategy(Strategy, 'webhookJwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'WebHook2020!Colissimo',
      passReqToCallback: true,
    });
  }

  async validate(req, payload: any, done: VerifiedCallback) {
    if (payload.iss !== 'DSIColissimo' || payload.company !== 'Colissimo') {
      done(new UnauthorizedException(`The access token provided is expired`), null);
    }
    return done(null, payload);
  }
}
