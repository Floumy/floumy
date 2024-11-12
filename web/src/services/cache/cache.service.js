export function cacheData(key, data, time) {
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(`${key}-time`, Date.now().toString());
  localStorage.setItem(`${key}-expiry`, time.toString());
}

export function getCachedData(key) {
  const cachedData = localStorage.getItem(key);
  const cachedTime = localStorage.getItem(`${key}-time`);
  const expiry = localStorage.getItem(`${key}-expiry`);
  if (cachedData && cachedTime && expiry && Date.now() - parseInt(cachedTime) < parseInt(expiry)) {
    return JSON.parse(cachedData);
  }
  return null;
}

export function clearCache(key) {
  localStorage.removeItem(key);
  localStorage.removeItem(`${key}-time`);
  localStorage.removeItem(`${key}-expiry`);
}
