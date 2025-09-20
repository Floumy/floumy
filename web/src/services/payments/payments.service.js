import api from '../api/api.service';
import { setCurrentOrg } from '../org/orgs.service';
import { apiUrl } from '../../config';
export async function cancelSubscription() {
  try {
    await api.delete(`${apiUrl}/payments/subscription`);
    await setCurrentOrg();
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getInvoices() {
  try {
    const response = await api.get(`${apiUrl}/payments/invoices`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
