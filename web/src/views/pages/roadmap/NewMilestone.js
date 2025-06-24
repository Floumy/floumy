import CreateUpdateDeleteMilestone from './CreateUpdateDeleteMilestone';
import { addMilestone } from '../../../services/roadmap/roadmap.service';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { useParams } from 'react-router-dom';

function NewMilestone() {
  const { orgId, projectId } = useParams();

  const handleSubmit = async (milestone) => {
    return await addMilestone(orgId, projectId, milestone);
  };

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <div className="card-wrapper">
              <CreateUpdateDeleteMilestone onSubmit={handleSubmit} />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default NewMilestone;
