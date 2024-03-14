import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './refresh-token.entity';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class RefreshTokensCleanerService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  // This method will be called every day at midnight
  @Cron('0 0 * * *')
  async cleanTokens() {
    // Delete all the expired tokens
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .from(RefreshToken)
      .where('expirationDate < :currentDate', { currentDate: new Date() })
      .execute();
  }
}
