import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { getPublicCycle } from '../../../services/cycles/cycles.service';
import NotFoundCard from '../components/NotFoundCard';
import PublicCycleDetail from './PublicCycleDetail';

function PublicSprint() {
  const { orgId, projectId, cycleId } = useParams();
  const [sprint, setSprint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchSprint() {
      setIsLoading(true);
      try {
        const sprint = await getPublicCycle(orgId, projectId, cycleId);
        setSprint(sprint);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSprint();
  }, [orgId, projectId, cycleId]);

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
              {sprint && <PublicCycleDetail orgId={orgId} sprint={sprint} />}
              {!sprint && !isLoading && (
                <NotFoundCard message={'Sprint not found'} />
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default PublicSprint;
