import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_ACTIVE_SUBSCRIPTION_REQUIRED_KEY =
  'isActiveSubscriptionRequired';
export const ActiveSubscriptionNotRequired = () =>
  SetMetadata(IS_ACTIVE_SUBSCRIPTION_REQUIRED_KEY, false);
