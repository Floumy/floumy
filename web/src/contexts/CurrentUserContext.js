import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from '../services/users/users.service';

const CurrentUserContext = createContext({});

export function CurrentUserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoading(true);
        const userData = await getCurrentUser();
        setCurrentUser(userData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch current user', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      isLoading,
      error,
    }),
    [currentUser, isLoading, error],
  );

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export const useCurrentUser = () => useContext(CurrentUserContext);

export default CurrentUserContext;
