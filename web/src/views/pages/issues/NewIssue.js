import React from "react";
import { Col, Container, Row } from "reactstrap";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import CreateIssue from "./CreateIssue";
import { addIssue } from "../../../services/issues/issues.service";
import { useParams } from "react-router-dom";

export default function NewIssue() {
  const { orgId, projectId } = useParams();

  const handleSubmit = async (issue) => {
    await addIssue(orgId, projectId, issue);
  };

  return (
    <>
      <SimpleHeader/>
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <div className="card-wrapper">
              <CreateIssue onSubmit={handleSubmit} />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}