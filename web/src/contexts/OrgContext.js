import React, { createContext, useContext, useEffect, useState } from 'react';
import { getOrg } from '../services/org/orgs.service';

const OrgContext = createContext({});

export function OrgProvider({ children, orgId }) {
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        setLoading(true);
        const currentOrg = await getOrg();
        if (currentOrg) {
          setCurrentOrg(currentOrg);
        }
      } catch (error) {
        console.error('Error fetching org:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orgId) {
      fetchOrg();
    }
  }, [orgId]);

  const value = {
    orgId,
    currentOrg,
    loading,
  };

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
