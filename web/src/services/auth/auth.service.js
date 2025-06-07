import axios from 'axios';
import api from '../api/api.service';

function handleAuthentication(response) {
  const accessToken = response.data.accessToken;
  const refreshToken = response.data.refreshToken;

  if (accessToken && refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    return true;
  }

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  api.defaults.headers.common['Authorization'] = null;
  return false;
}

export async function orgSignUp(name, email, password, orgName, invitationToken) {
  const requestData = { name, email, password, orgName, invitationToken };

  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/auth/org/sign-up`, requestData);
  } catch (e) {
    throw new Error('Your user could not be created');
  }
}

export async function signIn(email, password) {
  const requestData = { email, password };

  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/sign-in`, requestData);
    return handleAuthentication(response);
  } catch (e) {
    throw new Error(e?.response?.data?.message || 'You could not be authenticated');
  }
}

export async function activateAccount(activationToken) {
  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/auth/activate`, { activationToken });
  } catch (e) {
    throw new Error('Your account could not be activated');
  }
}

export async function sendResetPasswordLink(email) {
  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/auth/send-reset-password-link`, { email });
  } catch (e) {
    throw new Error('Your reset password link could not be sent');
  }
}

export async function resetPassword(password, resetToken) {
  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset-password`, { password, resetToken });
  } catch (e) {
    throw new Error('Your password could not be reset');
  }
}

export async function signUp(name, email, password) {
  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/auth/sign-up`, { name, email, password });
  } catch (e) {
    throw new Error('Your user could not be created');
  }
}

export async function isAuthenticated() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return !!(accessToken && refreshToken);
}