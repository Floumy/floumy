import api from '../api/api.service';
import { setCurrentOrg } from '../org/orgs.service';
export async function cancelSubscription() {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/payments/subscription`);
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
