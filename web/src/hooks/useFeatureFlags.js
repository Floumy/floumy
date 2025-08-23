export const FEATURES = {
  AI_CHAT_ASSISTANT: Symbol('AI_CHAT_ASSISTANT'),
  AI_SETTINGS: Symbol('AI_SETTINGS'),
};

// Map features to lists of enabled organization IDs
// If a feature has no orgIds or an empty array, it's disabled by default
// Use the special value '*' in the array to enable the feature for all organizations
const ENABLED_FEATURES_BY_ORG = {
  production: {
    // Example: [FEATURES.ORG_WIDE_APP_SECTION]: ['org1', 'org2']
    // Example to enable for all orgs: [FEATURES.ORG_WIDE_APP_SECTION]: ['*']
    [FEATURES.AI_CHAT_ASSISTANT]: ['*'],
    [FEATURES.AI_SETTINGS]: ['*'],
  },
  development: {
    // Example: [FEATURES.ORG_WIDE_APP_SECTION]: ['org1', 'org2']
    // Example to enable for all orgs: [FEATURES.ORG_WIDE_APP_SECTION]: ['*']
    [FEATURES.AI_CHAT_ASSISTANT]: ['*'],
    [FEATURES.AI_SETTINGS]: ['*'],
  },
};

export const useFeatureFlags = () => {
  const isFeatureEnabled = (feature, orgId) => {
    const envEnabledFeatures = ENABLED_FEATURES_BY_ORG[process.env.NODE_ENV];
    if (!envEnabledFeatures) {
      return false;
    }

    const enabledOrgIds = envEnabledFeatures[feature];
    if (!enabledOrgIds || enabledOrgIds.length === 0) {
      return false; // Feature is disabled by default if no orgIds are provided
    }

    // If orgId is not provided, feature is disabled
    if (!orgId) {
      return false;
    }

    // Check if the feature is enabled for all organizations
    if (enabledOrgIds.includes('*')) {
      return true;
    }

    // Check if the current orgId is in the list of enabled orgIds
    return enabledOrgIds.includes(orgId);
  };

  return {
    isFeatureEnabled,
  };
};
