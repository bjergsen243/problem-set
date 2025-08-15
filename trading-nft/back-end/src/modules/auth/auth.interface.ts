import { Request } from 'express';

export interface IJwtToken {
  accessToken: string;
  refreshToken: string;
}

export interface IJwtPayload {
  uid: string;
  email: string;
  exp?: number;
  iat?: number;
}

export interface IJwtTokenWithPayload extends IJwtToken {
  payload: IJwtPayload | Record<string, any>;
}

export interface AuthRequest extends Request {
  user: {
    uid: string;
    email: string;
  };
}
