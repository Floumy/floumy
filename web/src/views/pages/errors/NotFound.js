import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'reactstrap';
import { motion } from 'framer-motion';


const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="container my-auto py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 text-center">
            <motion.h1 
              className="display-3 fw-bold text-primary mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Oops! Page Not Found
            </motion.h1>
            
            <motion.p 
              className="lead mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              The page you're looking for doesn't exist or has been moved.
              Let's get you back on track.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button
                color="primary"
                size="lg"
                className="px-4 py-2 rounded-pill shadow"
                onClick={() => navigate(-1)}
              >
                <i className="fas fa-arrow-left me-2 mr-2"></i>
                Go Back
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;