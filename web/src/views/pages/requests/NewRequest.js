import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import CreateRequest from './CreateRequest';
import { addRequest } from '../../../services/requests/requests.service';
import { useParams } from 'react-router-dom';

export default function NewRequest() {
  const { orgId, projectId } = useParams();

  const handleSubmit = async (request) => {
    return await addRequest(orgId, projectId, request);
  };

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6">
        <Row>
          <Col>
            <div className="card-wrapper">
              <CreateRequest onSubmit={handleSubmit} />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
