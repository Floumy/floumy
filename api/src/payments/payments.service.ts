import { Injectable } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { Repository } from 'typeorm';
import { PaymentPlan } from '../auth/payment.plan';
import { Invoice } from './invoice.entity';
import { BipService } from '../bip/bip.service';

@Injectable()
export class PaymentsService {
  constructor(
    private stripeService: StripeService,
    private bipService: BipService,
    @InjectRepository(Org) private orgRepository: Repository<Org>,
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>,
  ) {}

  async handleWebhook(event: any) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const stripeInvoice = await this.stripeService.getInvoice(
        session.invoice as string,
      );
      const nextPaymentDate = this.getNextPaymentDate();

      await this.saveSubscriptionDetailsForOrg(
        session.metadata.org,
        session.metadata.plan,
        session.customer as string,
        session.subscription as string,
        true,
        nextPaymentDate,
      );

      const org = await this.orgRepository.findOneBy({
        id: session.metadata.org,
      });

      await this.saveInvoice(stripeInvoice, org);
    }

    if (event.type === 'invoice.payment_succeeded') {
      const stripeInvoice = event.data.object as Stripe.Invoice;
      const customerId = stripeInvoice.customer as string;
      const subscriptionId = stripeInvoice.subscription as string;

      const org = await this.orgRepository.findOneBy({
        stripeCustomerId: customerId,
      });

      if (!org) {
        return;
      }

      const nextPaymentDate = this.getNextPaymentDate();

      await this.saveSubscriptionDetailsForOrg(
        org.id,
        org.paymentPlan,
        customerId,
        subscriptionId,
        true,
        nextPaymentDate,
      );

      await this.saveInvoice(stripeInvoice, org);
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const org = await this.orgRepository.findOneBy({
        stripeCustomerId: customerId,
      });

      if (!org) {
        return;
      }

      await this.cancelSubscription(org.id);
    }
  }

  constructEvent(sig: string, requestBody: string) {
    return this.stripeService.constructWebhookEvent(requestBody, sig);
  }

  async createCheckoutSessionUrl(
    orgId: string,
    paymentPlan: PaymentPlan,
  ): Promise<string> {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const users = await org.users;
    const usersCount = users.filter((user) => user.isActive).length;
    const stripeSession = await this.stripeService.createCheckoutSession(
      org.id,
      paymentPlan,
      this.stripeService.getPriceIdByPaymentPlan(paymentPlan),
      usersCount,
    );
    return stripeSession.url;
  }

  async saveSubscriptionDetailsForOrg(
    orgId: string,
    plan: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    isSubscribed: boolean,
    nextPaymentDate: Date,
  ) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    org.paymentPlan = plan as PaymentPlan;
    org.isSubscribed = isSubscribed;
    org.stripeCustomerId = stripeCustomerId;
    org.stripeSubscriptionId = stripeSubscriptionId;
    org.nextPaymentDate = nextPaymentDate;
    await this.orgRepository.save(org);
  }

  async cancelSubscription(orgId: string) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    await this.stripeService.cancelSubscription(org.stripeSubscriptionId);
    org.isSubscribed = false;
    await this.orgRepository.save(org);
  }

  async updateSubscription(orgId: string, plan: PaymentPlan) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const users = await org.users;
    await this.stripeService.updateSubscriptionPlan(
      org.stripeSubscriptionId,
      this.stripeService.getPriceIdByPaymentPlan(org.paymentPlan),
      this.stripeService.getPriceIdByPaymentPlan(plan),
      users.length,
    );
    org.paymentPlan = plan;
    await this.orgRepository.save(org);

    if (plan === PaymentPlan.BUILD_IN_PRIVATE) {
      await this.bipService.createOrUpdateBuildInPublicSettings(org, {
        isBuildInPublicEnabled: false,
        isObjectivesPagePublic: false,
        isRoadmapPagePublic: false,
        isIterationsPagePublic: false,
        isActiveIterationsPagePublic: false,
        isFeedPagePublic: false,
        isIssuesPagePublic: false,
        isFeatureRequestsPagePublic: false,
      });
    }
  }

  async updateSubscriptionCount(orgId: string) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const users = await org.users;

    await this.stripeService.updateSubscriptionQuantity(
      org.stripeSubscriptionId,
      this.stripeService.getPriceIdByPaymentPlan(org.paymentPlan),
      users.filter((user) => user.isActive).length,
    );
  }

  async getInvoices(orgId: string) {
    const invoices = await this.invoiceRepository.find({
      where: { org: { id: orgId } },
      order: { createdAt: 'DESC' },
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      pdf: invoice.pdf,
      amount: invoice.amount,
      createdAt: invoice.createdAt,
    }));
  }

  private async saveInvoice(stripeInvoice: Stripe.Invoice, org: Org) {
    const invoice = new Invoice();
    invoice.stripeInvoiceId = stripeInvoice.id;
    invoice.amount = stripeInvoice.amount_paid;
    invoice.pdf = stripeInvoice.invoice_pdf;
    invoice.org = Promise.resolve(org);

    await this.invoiceRepository.save(invoice);
  }

  private getNextPaymentDate() {
    const nextPaymentDate = new Date();
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    return nextPaymentDate;
  }
}
