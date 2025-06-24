import api from '../api/api.service';
import { setCurrentOrg } from '../org/orgs.service';

export async function getCheckoutSessionUrl(paymentPlan) {
  try {
    const response = await api.post(
      `${process.env.REACT_APP_API_URL}/payments/checkout-session`,
      {
        paymentPlan,
      },
    );
    return response.data.url;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function cancelSubscription() {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/payments/subscription`);
    await setCurrentOrg();
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateSubscription(paymentPlan) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/payments/subscription`, {
      paymentPlan,
    });
    await setCurrentOrg();
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getInvoices() {
  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/payments/invoices`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
