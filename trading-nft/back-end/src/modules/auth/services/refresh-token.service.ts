import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshToken, RefreshTokenDocument } from '../../../schemas/refresh-token.schema';
import { customAlphabet } from 'nanoid/async';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21);

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async createRefreshToken(userId: string): Promise<RefreshTokenDocument> {
    const token = await nanoid();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    return this.refreshTokenModel.create({
      userId,
      token,
      expiresAt,
      isRevoked: false,
    });
  }

  async validateRefreshToken(token: string): Promise<RefreshTokenDocument | null> {
    const refreshToken = await this.refreshTokenModel.findOne({
      token,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    return refreshToken;
  }

  async rotateRefreshToken(oldToken: RefreshTokenDocument): Promise<RefreshTokenDocument> {
    // Revoke the old token
    await this.refreshTokenModel.findByIdAndUpdate(oldToken._id, {
      isRevoked: true,
    });

    // Create a new token
    return this.createRefreshToken(oldToken.userId.toString());
  }

  async revokeRefreshToken(token: RefreshTokenDocument): Promise<void> {
    await this.refreshTokenModel.findByIdAndUpdate(token._id, {
      isRevoked: true,
    });
  }
} 