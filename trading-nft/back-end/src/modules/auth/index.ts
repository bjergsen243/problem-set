import { AuthGuard } from '@nestjs/passport';
import { JWT_STRATEGY } from './auth.constant';

export { AuthGuard } from '@nestjs/passport';
export const JwtGuard = AuthGuard([JWT_STRATEGY]);
export * from './dtos/request.dto';
export * from './auth.constant';
export * from './auth.interface';
export * from './auth.service';
export * from './strategies';
