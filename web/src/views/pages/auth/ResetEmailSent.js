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
import React from "react";
// nodejs library that concatenates classes
// reactstrap components
// core components
import { Col, Container, Row } from "reactstrap";

function ResetEmailSent() {

  return (
    <>
      <div className="bg-gradient-info py-7 py-lg-8 pt-lg-9 min-vh-100 min-vw-100">
        <Container className="pb-5">
          <Row className="justify-content-center">
            <Col sm={12}>
              <div className="header-body text-center mb-7">
                <Row className="justify-content-center">
                  <Col className="px-5" lg="6" md="8" xl="5">
                    <h1 className="text-white">Email on the Way! 🚀</h1>
                    <h2 className="text-white">Almost There...</h2>
                    <p className="text-lead text-white">We've sent a password reset link to your email. It's your ticket
                      back to the Floumy universe! If it doesn't appear within a few moments, don't forget to check your
                      spam or promotions folder. Ready to reset and resume your creative journey?</p>
                    <h3><a href="/auth/sign-in" className="text-primary">Sign in here.</a></h3>
                    <br />
                    <i className="fas fa-envelope fa-7x text-white"></i>
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

export default ResetEmailSent;
