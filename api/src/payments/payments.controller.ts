import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/public.guard';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { Request } from 'express';
import { BasicAuthGuard } from '../auth/basic-auth.guard';
import { PaymentPlan } from '../auth/payment.plan';
import { AuthGuard } from '../auth/auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentService: PaymentsService) {}

  @Public()
  @Post('/webhook')
  async webhook(@Req() request: RawBodyRequest<Request>) {
    const sig = request.headers['stripe-signature'].toString();
    let event: Stripe.Event;
    try {
      event = this.paymentService.constructEvent(
        sig,
        request.rawBody.toString(),
      );
    } catch (err) {
      return { error: `Webhook Error: ${err.message}` };
    }

    await this.paymentService.handleWebhook(event);

    return { received: true };
  }

  @UseGuards(BasicAuthGuard)
  @Post('/checkout-session')
  async createCheckoutSession(@Req() request: any) {
    const org = request.user.org;
    const paymentPlan = request.body.paymentPlan;
    if (
      !paymentPlan ||
      [PaymentPlan.BUILD_IN_PRIVATE, PaymentPlan.BUILD_IN_PUBLIC].indexOf(
        paymentPlan,
      ) === -1
    ) {
      throw new BadRequestException('Payment Plan is required');
    }

    try {
      return {
        url: await this.paymentService.createCheckoutSessionUrl(
          org,
          paymentPlan,
        ),
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/subscription')
  async cancelSubscription(@Req() request: any) {
    try {
      const org = request.user.org;
      await this.paymentService.cancelSubscription(org);
      return { success: true };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @UseGuards(AuthGuard)
  @Put('/subscription')
  async updateSubscription(@Req() request: any) {
    try {
      const org = request.user.org;
      await this.paymentService.updateSubscription(
        org,
        request.body.paymentPlan,
      );
      return { success: true };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(BasicAuthGuard)
  @Get('/invoices')
  async getInvoices(@Req() request: any) {
    const org = request.user.org;
    return await this.paymentService.getInvoices(org);
  }
}
