import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import CreateUpdateDeleteCycle from './CreateUpdateDeleteCycle';
import { useParams, useNavigate } from 'react-router-dom';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { getCycle, updateCycle } from '../../../services/cycles/cycles.service';
import NotFoundCard from '../components/NotFoundCard';
import { useProjects } from '../../../contexts/ProjectsContext';

function EditCycle() {
  const { orgId, projectId, id } = useParams();
  const navigate = useNavigate();
  const { currentProject } = useProjects();
  const cyclesEnabled = currentProject?.cyclesEnabled ?? false;
  const [sprint, setSprint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!cyclesEnabled) {
      navigate(`/admin/orgs/${orgId}/projects/${projectId}/active-cycle`);
      return;
    }
  }, [cyclesEnabled, navigate, orgId, projectId]);

  useEffect(() => {
    async function fetchSprint() {
      setIsLoading(true);
      try {
        const sprint = await getCycle(orgId, projectId, id);
        setSprint(sprint);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSprint();
  }, [orgId, projectId, id, cyclesEnabled]);

  const handleSubmit = async (sprint) => {
    return await updateCycle(orgId, projectId, id, sprint);
  };

  if (!cyclesEnabled) return null;

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <div className="card-wrapper">
              {isLoading && (
                <Card>
                  <LoadingSpinnerBox />
                </Card>
              )}
              {sprint && (
                <CreateUpdateDeleteCycle
                  cycle={sprint}
                  onSubmit={handleSubmit}
                />
              )}
              {!sprint && !isLoading && (
                <NotFoundCard message={'Cycle not found'} />
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default EditCycle;
