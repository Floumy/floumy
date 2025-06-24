import React from 'react';
// react library for routing
import { Navigate, Route, Routes } from 'react-router-dom';

// core components
import routes from 'routes.js';
import useLayoutHandler from './useLayoutHandler';
import Footer from '../components/Footers/Footer';

function Auth() {
  const { mainContentRef, getRoutes } = useLayoutHandler('auth');
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContentRef.current.scrollTop = 0;
    document.body.classList.add('bg-default');
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.remove('bg-default');
    };
  });

  return (
    <>
      <div className="main-content" ref={mainContentRef}>
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
        </Routes>
      </div>
      <Footer justifyContent="center" />
    </>
  );
}

export default Auth;
