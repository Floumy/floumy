import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Col, Container, Row } from 'reactstrap';
import React from 'react';
import { addInitiative } from '../../../services/roadmap/roadmap.service';
import CreateUpdateDeleteInitiative from '../initiatives/CreateUpdateDeleteInitiative';
import { useParams } from 'react-router-dom';

function NewInitiative() {
  const { orgId, projectId } = useParams();
  const handleSubmit = async (initiative) => {
    return await addInitiative(orgId, projectId, initiative);
  };

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <div className="card-wrapper">
              <CreateUpdateDeleteInitiative onSubmit={handleSubmit} />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default NewInitiative;
