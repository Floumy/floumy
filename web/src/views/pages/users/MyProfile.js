import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import React from "react";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import ChangeName from "./components/ChangeName";

export default function MyProfile() {

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader>
                <h3 className="mb-0">My Profile</h3>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col>
                    <ChangeName />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
