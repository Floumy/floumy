import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Col, Container, Row } from 'reactstrap';
import React from 'react';
import CreateUpdateDeleteSprint from './CreateUpdateDeleteSprint';
import { addSprint } from '../../../services/sprints/sprints.service';
import { useParams } from 'react-router-dom';

function NewSprint() {
  const { orgId, projectId } = useParams();

  const handleSubmit = async (sprint) => {
    return await addSprint(orgId, projectId, sprint);
  };

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <div className="card-wrapper">
              <CreateUpdateDeleteSprint onSubmit={handleSubmit} />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default NewSprint;
