import api from '../api/api.service';
import axios from 'axios';
import { apiUrl } from '../../config';

axios.defaults.withCredentials = true;

function handleAuthentication(response) {
  if (response.data.lastSignedIn) {
    localStorage.setItem('lastSignedIn', response.data.lastSignedIn);
  } else {
    localStorage.removeItem('lastSignedIn');
  }
}

export async function orgSignUp(
  name,
  email,
  password,
  orgName,
  invitationToken,
) {
  const requestData = { name, email, password, orgName, invitationToken };

  try {
    await axios.post(`${apiUrl}/auth/org/sign-up`, requestData);
  } catch (e) {
    throw new Error('Your user could not be created');
  }
}

export async function signIn(email, password) {
  const requestData = { email, password };

  try {
    const response = await axios.post(`${apiUrl}/auth/sign-in`, requestData);
    return handleAuthentication(response);
  } catch (e) {
    throw new Error(
      e?.response?.data?.message || 'You could not be authenticated',
    );
  }
}

export async function activateAccount(activationToken) {
  try {
    await axios.post(`${apiUrl}/auth/activate`, {
      activationToken,
    });
  } catch (e) {
    throw new Error('Your account could not be activated');
  }
}

export async function sendResetPasswordLink(email) {
  try {
    await axios.post(`${apiUrl}/auth/send-reset-password-link`, { email });
  } catch (e) {
    throw new Error('Your reset password link could not be sent');
  }
}

export async function resetPassword(password, resetToken) {
  try {
    await axios.post(`${apiUrl}/auth/reset-password`, {
      password,
      resetToken,
    });
  } catch (e) {
    throw new Error('Your password could not be reset');
  }
}

export async function signUp(name, email, password) {
  try {
    await axios.post(`${apiUrl}/auth/sign-up`, {
      name,
      email,
      password,
    });
  } catch (e) {
    throw new Error('Your user could not be created');
  }
}

export async function logout() {
  try {
    await api.post(`${apiUrl}/auth/logout`);
  } catch (e) {
    throw new Error('You could not be logged out');
  }
}

export async function isAuthenticated() {
  try {
    const response = await axios.get(`${apiUrl}/auth/is-authenticated`, {
      withCredentials: true,
    });
    return response.data.isAuthenticated;
  } catch (e) {
    return false;
  }
}
