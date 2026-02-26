import { useParams } from 'react-router-dom';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { getPublicWorkItem } from '../../../services/backlog/backlog.service';
import { getPublicProject } from '../../../services/projects/projects.service';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import NotFoundCard from '../components/NotFoundCard';
import PublicWorkItem from './PublicWorkItem';

function PublicDetailWorkItem() {
  const [loading, setLoading] = useState(true);
  const [workItem, setWorkItem] = useState(null);
  const [project, setProject] = useState(null);
  const { orgId, projectId, workItemId } = useParams();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [workItemData, projectData] = await Promise.all([
          getPublicWorkItem(orgId, projectId, workItemId),
          getPublicProject(orgId, projectId).catch(() => null),
        ]);
        setWorkItem(workItemData);
        setProject(projectData);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    fetchData();
  }, [orgId, projectId, workItemId]);

  return (
    <>
      {loading && <InfiniteLoadingBar />}
      <SimpleHeader breadcrumbs={workItem?.breadcrumbs} isPublic={true} />
      <Container className="mt--6" fluid>
        <Row>
          <div className="col">
            <div className="card-wrapper">
              {loading && (
                <Card>
                  <LoadingSpinnerBox />
                </Card>
              )}
              {workItem && (
                <PublicWorkItem
                  workItem={workItem}
                  cyclesEnabled={project?.cyclesEnabled ?? false}
                />
              )}
              {!workItem && !loading && (
                <NotFoundCard message={'Work item not found'} />
              )}
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default PublicDetailWorkItem;
