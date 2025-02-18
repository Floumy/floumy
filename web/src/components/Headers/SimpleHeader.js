
import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// reactstrap components
import { Button, Col, Container, Row } from "reactstrap";
import ShortcutIcon from "../Shortcuts/ShortcutIcon";
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

function TimelineHeader({ headerButtons, breadcrumbs = [], isPublic = false }) {
  return (
    <>
      <div className="header header-dark bg-gray pb-6 content__title content__title--calendar">
        <Container fluid>
          <div className="header-body">
            <Row className="align-items-center py-4">
              <Col className="mt-3 mt-md-0 text-md-right" lg="6" xs="12">
                {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs breadcrumbs={breadcrumbs} isPublic={isPublic} />}
              </Col>
              <Col className="mt-3 mt-md-0 text-md-right" lg="6" xs="12">
                {headerButtons && headerButtons.map((button) => (
                  <Button
                    key={button.id}
                    color="info"
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
