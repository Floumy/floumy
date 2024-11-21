import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getBuildInPublicSettings } from "../services/bip/build-in-public.service";

const BuildInPublicContext = createContext({});

export const BuildInPublicProvider = ({ children, orgId, projectId }) => {

  const [settings, setSettings] = useState({
    isObjectivesPagePublic: false,
    isRoadmapPagePublic: false,
    isIterationsPagePublic: false,
    isActiveIterationsPagePublic: false,
    isFeedPagePublic: false,
    isIssuesPagePublic: false,
    isFeatureRequestsPagePublic: false,
    isBuildInPublicEnabled: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const fetchedSettings = await getBuildInPublicSettings(orgId, projectId);
        setSettings(fetchedSettings);
      } catch (error) {
        console.error("Failed to fetch build in public settings", error);
      }
    };
    fetchSettings();
  }, [orgId, projectId]);

  const value = useMemo(() => ({ settings, setSettings }), [settings]);

  return (
    <BuildInPublicContext.Provider value={value}>
      {children}
    </BuildInPublicContext.Provider>
  );
};

export const useBuildInPublic = () => useContext(BuildInPublicContext);