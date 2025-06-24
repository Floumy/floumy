import { Route, useLocation } from 'react-router-dom';
import React from 'react';

export default function useLayoutHandler(slug) {
  const location = useLocation();
  const mainContentRef = React.useRef(null);
  React.useEffect(() => {
    if (!mainContentRef.current) {
      return;
    }
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContentRef.current.scrollTop = 0;
  }, [location]);
  const getRoutes = (routes) => {
    return routes.map((prop) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      if (prop.layout === `/${slug}`) {
        return (
          <Route
            path={prop.path}
            element={prop.component}
            key={prop.path}
            exact
          />
        );
      } else {
        return null;
      }
    });
  };
  return { location, mainContentRef, getRoutes };
}
