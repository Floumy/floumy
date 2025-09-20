export const apiUrl =
  process.env.NODE_ENV === 'production'
    ? window.REACT_APP_API_URL
    : process.env.REACT_APP_API_URL;
