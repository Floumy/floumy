import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OrgsModule } from '../orgs/orgs.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [OrgsModule, StripeModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
