import React from 'react';
// nodejs library to set properties for components
// reactstrap components
import { Button, Col, Container, Row } from 'reactstrap';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { ShortcutIcon } from '../Shortcuts';

function SimpleHeader({
  headerButtons,
  title,
  breadcrumbs = [],
  isPublic = false,
}) {
  return (
    <>
      <div className="header pb-6 content__title content__title--calendar">
        <Container fluid>
          <div className="header-body">
            <Row className="align-items-center py-4">
              {title && (
                <Col className="mt-3 mt-md-0 text-md-left" lg="6" xs="12">
                  <h1 className="my-1">{title}</h1>
                </Col>
              )}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <Col className="mt-3 mt-md-0 text-md-right" lg="6" xs="12">
                  <Breadcrumbs breadcrumbs={breadcrumbs} isPublic={isPublic} />
                </Col>
              )}
              <Col
                className="mt-3 mt-md-0 text-md-right"
                lg={
                  (!breadcrumbs || breadcrumbs.length === 0) && !title ? 12 : 6
                }
                xs="12"
              >
                {headerButtons &&
                  headerButtons.map((button) => (
                    <Button
                      key={button.id}
                      color="info"
                      size="sm"
                      id={button.id}
                      onClick={button.action}
                    >
                      {button.shortcut ? (
                        <ShortcutIcon
                          shortcutKey={button.shortcut}
                          itemName={button.name}
                        />
                      ) : (
                        button.name
                      )}
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

export default SimpleHeader;
