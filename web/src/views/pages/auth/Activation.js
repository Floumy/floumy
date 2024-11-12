/*!

=========================================================
* Argon Dashboard PRO React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useEffect, useState } from "react";
// nodejs library that concatenates classes
// reactstrap components
import { Col, Container, Row } from "reactstrap";
import { useLocation } from "react-router-dom";
import { activateAccount } from "../../../services/auth/auth.service";

// core components

function Activation() {
  let location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activationToken = searchParams.get("token");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function activate() {
      try {
        await activateAccount(activationToken);
        setSuccess(true);
      } catch (e) {
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    }

    activate();
  }, [activationToken]);

  return (
    <>
      <div className="bg-gradient-info py-7 py-lg-8 pt-lg-9 min-vh-100 min-vw-100">
        <Container className="pb-5">
          <Row className="justify-content-center">
            <Col sm={12}>
              <div className="header-body text-center mb-7">
                <Row className="justify-content-center">
                  <Col className="px-5" lg="6" md="8" xl="5">
                    {loading && <i className="fas fa-spinner fa-spin fa-7x text-white"></i>}
                    {!loading && success && <>
                      <h1 className="text-white">You’re In! 🎉</h1>
                      <h2 className="text-white">Welcome to Floumy!</h2>
                      <p className="text-lead text-white">Your account’s live and ready. Jump into your dashboard and
                        start making those big ideas happen. Let’s do this!</p>
                      <h3><a href="/auth/sign-in" className="text-primary">Sign in here.</a></h3>
                      <br />
                      <i className="fas fa-check-circle fa-7x text-white"></i>
                    </>}
                    {!loading && !success && <>
                      <h1 className="text-white">Activation Failed 😢</h1>
                      <h2 className="text-white">Well, that didn’t work.</h2>
                      <p className="text-lead text-white"> Looks like the link is expired or broken. Check your email
                        for a new one or hit up support. Let’s sort this out and get you rolling on Floumy!
                      </p>
                      <br />
                      <i className="fas fa-exclamation-triangle fa-7x text-white"></i>
                    </>}
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default Activation;
