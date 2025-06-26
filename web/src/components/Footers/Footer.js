/*eslint-disable*/
import React from 'react';

// reactstrap components
import { Col, Container, Nav, NavItem, NavLink, Row } from 'reactstrap';

function Footer({ justifyContent = 'left' }) {
  return (
    <Container fluid>
      <footer className="footer bg-transparent ">
        <Row className="align-items-center justify-content-lg-between">
          <Col lg="12">
            <Nav className={`nav-footer justify-content-${justifyContent}`}>
              <NavItem>
                <NavLink
                  href="https://tyntar.com"
                  target="_blank"
                  className="copyright"
                >
                  © {new Date().getFullYear()}{' '}
                  <span className="font-weight-bold ml-1">Tyntar</span>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="https://app.termly.io/policy-viewer/policy.html?policyUUID=fb8deed6-e77a-43cd-aa76-1c655b357e4c"
                  target="_blank"
                >
                  Privacy Policy
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="https://app.termly.io/policy-viewer/policy.html?policyUUID=b76fc02b-bf3a-4da0-a77b-dcb50b8d37c2"
                  target="_blank"
                >
                  Terms of Service
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  href="https://app.termly.io/policy-viewer/policy.html?policyUUID=55201b2f-f6a3-4311-9d9e-1de781d15f55"
                  target="_blank"
                >
                  Cookie Policy
                </NavLink>
              </NavItem>
            </Nav>
          </Col>
        </Row>
      </footer>
    </Container>
  );
}

export default Footer;
