import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OrgsModule } from '../orgs/orgs.module';
import { StripeModule } from '../stripe/stripe.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    OrgsModule,
    StripeModule,
    AuthModule,
    TypeOrmModule.forFeature([Org, User]),
    CacheModule.register(),
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
