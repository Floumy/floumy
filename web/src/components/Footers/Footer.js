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
                <NavLink href="https://floumy.com/privacy" target="_blank">
                  Privacy Policy
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="https://floumy.com/terms" target="_blank">
                  Terms of Service
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
