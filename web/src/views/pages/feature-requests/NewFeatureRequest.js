import React from "react";
import { Col, Container, Row } from "reactstrap";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import CreateFeatureRequest from "./CreateFeatureRequest";
import { addFeatureRequest } from "../../../services/feature-requests/feature-requests.service";
import { useParams } from "react-router-dom";

export default function NewFeatureRequest() {
  const { orgId, projectId } = useParams();

  const handleSubmit = async (featureRequest) => {
    return await addFeatureRequest(orgId, projectId, featureRequest);
  };

  return (<>
    <SimpleHeader/>
    <Container className="mt--6">
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