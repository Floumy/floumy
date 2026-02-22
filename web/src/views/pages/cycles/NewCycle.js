import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Col, Container, Row } from 'reactstrap';
import React, { useEffect } from 'react';
import CreateUpdateDeleteCycle from './CreateUpdateDeleteCycle';
import { addCycle } from '../../../services/cycles/cycles.service';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectsContext';

function NewSprint() {
  const { orgId, projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject } = useProjects();
  const cyclesEnabled = currentProject?.cyclesEnabled ?? false;

  useEffect(() => {
    if (!cyclesEnabled) {
      navigate(`/admin/orgs/${orgId}/projects/${projectId}/active-cycle`);
    }
  }, [cyclesEnabled, navigate, orgId, projectId]);

  if (!cyclesEnabled) return null;

  const handleSubmit = async (sprint) => {
    return await addCycle(orgId, projectId, sprint);
  };

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <div className="card-wrapper">
              <CreateUpdateDeleteCycle onSubmit={handleSubmit} />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default NewSprint;
