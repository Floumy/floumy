export const FEATURES = {
  ORG_WIDE_APP_SECTION: Symbol('ORG_WIDE_APP_SECTION')
}

const DISABLED_FEATURES = {
  production: [
  ],
  development: [],
};

export const useFeatureFlags = () => {
  const isFeatureEnabled = (feature) => {
    const envDisabledFeatures = DISABLED_FEATURES[process.env.NODE_ENV];
    if (envDisabledFeatures) {
      return !envDisabledFeatures.includes(feature);
    }
    return false;
  };

  return {
    isFeatureEnabled,
  };
};