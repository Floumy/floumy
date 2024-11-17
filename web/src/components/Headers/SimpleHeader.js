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
// nodejs library to set properties for components
import PropTypes from "prop-types";
// reactstrap components
import { Button, Col, Container, Row } from "reactstrap";
import ShortcutIcon from "../Shortcuts/ShortcutIcon";

function TimelineHeader({ headerButtons }) {
  return (
    <>
      <div className="header header-dark bg-gray pb-6 content__title content__title--calendar">
        <Container fluid>
          <div className="header-body">
            <Row className="align-items-center py-4">
              <Col className="mt-3 mt-md-0 text-md-right" lg="12" xs="12">
                {headerButtons && headerButtons.map((button, index) => (
                  <Button
                    key={button.id}
                    className="btn-neutral"
                    color="default"
                    size="sm"
                    id={button.id}
                    onClick={button.action}
                  >
                    {button.shortcut ?
                      <ShortcutIcon shortcutKey={button.shortcut} itemName={button.name} /> : button.name}
                  </Button>
                ))}
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </>
  );
}

TimelineHeader.propTypes = {
  newButtonAction: PropTypes.func,
  newButtonName: PropTypes.string
};

export default TimelineHeader;
