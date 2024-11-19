import React from "react";
import { Col, Container, Row } from "reactstrap";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import CreateFeatureRequest from "./CreateFeatureRequest";
import { addFeatureRequest } from "../../../services/feature-requests/feature-requests.service";
import { useParams } from "react-router-dom";

export default function NewFeatureRequest() {
  const { orgId, productId } = useParams();

  const handleSubmit = async (featureRequest) => {
    await addFeatureRequest(orgId, productId, featureRequest);
  };

  return (<>
    <SimpleHeader headerButtons={[
      {
        name: "Back",
        shortcut: "←",
        action: () => {
          window.history.back();
        }
      }
    ]} />
    <Container className="mt--6" fluid>
      <Row>
        <Col>
          <div className="card-wrapper">
            <CreateFeatureRequest onSubmit={handleSubmit} />
          </div>
        </Col>
      </Row>
    </Container>
  </>);
}