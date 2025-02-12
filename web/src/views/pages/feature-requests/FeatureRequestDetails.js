import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardHeader, Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  addFeatureRequestComment,
  deleteFeatureRequestComment,
  getFeatureRequest,
  updateFeatureRequestComment,
} from '../../../services/feature-requests/feature-requests.service';
import PublicFeatureRequestDetails from './PublicFeatureRequestDetails';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import Comments from '../../../components/Comments/Comments';
import { toast } from 'react-toastify';
import PublicInitiativesList from '../initiatives/PublicInitiativesList';

export default function FeatureRequestDetails() {
  const { orgId, projectId, featureRequestId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [featureRequest, setFeatureRequest] = useState(null);

  useEffect(() => {
    document.title = 'Floumy | Edit Feature Request';

    async function fetchFeatureRequest(orgId, projectId, featureRequestId) {
      try {
        setIsLoading(true);
        const featureRequest = await getFeatureRequest(orgId, projectId, featureRequestId);
        setFeatureRequest(featureRequest);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeatureRequest(orgId, projectId, featureRequestId);
  }, [orgId, projectId, featureRequestId]);

  async function handleCommentAdd(comment) {
    try {
      const addedComment = await addFeatureRequestComment(orgId, projectId, featureRequest.id, comment);
      featureRequest.comments.push(addedComment);
      setFeatureRequest({ ...featureRequest });
      toast.success('Comment added successfully');
    } catch (e) {
      toast.error('Failed to add comment');
    }
  }

  async function handleCommentUpdate(commentId, content) {
    try {
      const updatedComment = await updateFeatureRequestComment(orgId, projectId, featureRequest.id, commentId, content);
      const index = featureRequest.comments.findIndex((c) => c.id === updatedComment.id);
      featureRequest.comments[index] = updatedComment;
      setFeatureRequest({ ...featureRequest });
      toast.success('Comment updated successfully');
    } catch (e) {
      toast.error('Failed to update comment');
    }
  }

  async function handleCommentDelete(commentId) {
    try {
      await deleteFeatureRequestComment(orgId, projectId, featureRequest.id, commentId);
      const index = featureRequest.comments.findIndex((c) => c.id === commentId);
      featureRequest.comments.splice(index, 1);
      setFeatureRequest({ ...featureRequest });
      toast.success('Comment deleted successfully');
    } catch (e) {
      toast.error('Failed to delete comment');
    }
  }

  return (<>
    {isLoading && <InfiniteLoadingBar />}
    <SimpleHeader />
    <Container className="mt--6" fluid>
      <Row>
        <Col lg={8} md={12}>
          <Row>
            <Col>
              <div className="card-wrapper">
                {isLoading && <Card><CardHeader><h2>Feature Request</h2></CardHeader><LoadingSpinnerBox /></Card>}
                {!isLoading && featureRequest && <PublicFeatureRequestDetails featureRequest={featureRequest} />}
              </div>
            </Col>
          </Row>
          {featureRequest?.initiatives && <Row>
            <Col>
              <Card>
                <CardHeader>
                  <h3 className="mb-0">Related Initiatives</h3>
                </CardHeader>
                <PublicInitiativesList
                  showAssignedTo={false}
                  orgId={orgId}
                  projectId={projectId}
                  initiatives={featureRequest?.initiatives}
                  headerClassName={'thead'}
                />
              </Card>
            </Col>
          </Row>}
        </Col>
        <Col lg={4} md={12}>
          <Comments comments={featureRequest?.comments}
                    onCommentAdd={handleCommentAdd}
                    onCommentEdit={handleCommentUpdate}
                    onCommentDelete={handleCommentDelete} />
        </Col>
      </Row>

    </Container>
  </>);
}