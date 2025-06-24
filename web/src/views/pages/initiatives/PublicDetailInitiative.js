import { Card, CardHeader, Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicInitiative } from '../../../services/roadmap/roadmap.service';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import { sortByPriority } from '../../../services/utils/utils';
import NotFoundCard from '../components/NotFoundCard';
import ExecutionStats from '../components/stats/ExecutionStats';
import PublicInitiative from './PublicInitiative';
import PublicWorkItemsList from '../backlog/PublicWorkItemsList';
import { toast } from 'react-toastify';
import Comments from '../../../components/Comments/Comments';
import useInitiativeComments from '../../../hooks/useInitiativeComments';

export function PublicDetailInitiative() {
  const [initiative, setInitiative] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { orgId, projectId, initiativeId } = useParams();
  const { addComment, updateComment, deleteComment } = useInitiativeComments(
    initiative,
    setInitiative,
    toast,
  );

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const initiative = await getPublicInitiative(
          orgId,
          projectId,
          initiativeId,
        );
        setInitiative(initiative);
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [orgId, projectId, initiativeId]);

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader breadcrumbs={initiative?.breadcrumbs} isPublic={true} />
      <Container className="mt--6" fluid id="OKRs">
        {initiative &&
          initiative.workItems &&
          initiative.workItems.length > 0 && (
            <ExecutionStats
              workItems={initiative.workItems}
              dueDate={initiative?.milestone?.dueDate}
            />
          )}
        <Row>
          <Col lg={8} md={12}>
            {!isLoading && !initiative && (
              <NotFoundCard message="Initiative not found" />
            )}
            {!isLoading && initiative && (
              <PublicInitiative initiative={initiative} />
            )}
            <Card>
              {isLoading && <LoadingSpinnerBox />}
              {!isLoading && initiative && (
                <>
                  <CardHeader className="border-1">
                    <div className="row">
                      <div className="col-12">
                        <h3 className="mb-0">Related Work Items</h3>
                      </div>
                    </div>
                  </CardHeader>
                  <PublicWorkItemsList
                    orgId={orgId}
                    workItems={sortByPriority(initiative.workItems)}
                    showInitiative={false}
                  />
                </>
              )}
            </Card>
          </Col>
          {!isLoading && (
            <Col lg={4} md={12}>
              <Comments
                comments={initiative?.comments}
                onCommentAdd={addComment}
                onCommentEdit={updateComment}
                onCommentDelete={deleteComment}
              />
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
}
