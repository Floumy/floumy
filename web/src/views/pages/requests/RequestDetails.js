import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardHeader, Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  addRequestComment,
  deleteRequestComment,
  getRequest,
  getPublicRequest,
  updateRequestComment,
} from '../../../services/requests/requests.service';
import PublicRequestDetails from './PublicRequestDetails';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import Comments from '../../../components/Comments/Comments';
import { toast } from 'react-toastify';
import PublicInitiativesList from '../initiatives/PublicInitiativesList';

export default function RequestDetails() {
  const { orgId, projectId, requestId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [request, setRequest] = useState(null);
  const isPublicPage = window.location.pathname.startsWith('/public');

  useEffect(() => {
    document.title = 'Floumy | Request';

    async function fetchRequest(orgId, projectId, requestId) {
      try {
        setIsLoading(true);
        const request = isPublicPage
          ? await getPublicRequest(orgId, projectId, requestId)
          : await getRequest(orgId, projectId, requestId);
        setRequest(request);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequest(orgId, projectId, requestId);
  }, [isPublicPage, orgId, projectId, requestId]);

  async function handleCommentAdd(comment) {
    try {
      const addedComment = await addRequestComment(
        orgId,
        projectId,
        request.id,
        comment,
      );
      request.comments.push(addedComment);
      setRequest({ ...request });
      toast.success('Comment added successfully');
    } catch (e) {
      toast.error('Failed to add comment');
    }
  }

  async function handleCommentUpdate(commentId, content) {
    try {
      const updatedComment = await updateRequestComment(
        orgId,
        projectId,
        request.id,
        commentId,
        content,
      );
      const index = request.comments.findIndex(
        (c) => c.id === updatedComment.id,
      );
      request.comments[index] = updatedComment;
      setRequest({ ...request });
      toast.success('Comment updated successfully');
    } catch (e) {
      toast.error('Failed to update comment');
    }
  }

  async function handleCommentDelete(commentId) {
    try {
      await deleteRequestComment(orgId, projectId, request.id, commentId);
      const index = request.comments.findIndex((c) => c.id === commentId);
      request.comments.splice(index, 1);
      setRequest({ ...request });
      toast.success('Comment deleted successfully');
    } catch (e) {
      toast.error('Failed to delete comment');
    }
  }

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid>
        <Row>
          <Col lg={8} md={12}>
            <Row>
              <Col>
                <div className="card-wrapper">
                  {isLoading && (
                    <Card>
                      <CardHeader>
                        <h2>Request</h2>
                      </CardHeader>
                      <LoadingSpinnerBox />
                    </Card>
                  )}
                  {!isLoading && request && (
                    <PublicRequestDetails request={request} />
                  )}
                </div>
              </Col>
            </Row>
            {request?.initiatives && (
              <Row>
                <Col>
                  <Card>
                    <CardHeader>
                      <h3 className="mb-0">Related Initiatives</h3>
                    </CardHeader>
                    <PublicInitiativesList
                      showAssignedTo={false}
                      orgId={orgId}
                      projectId={projectId}
                      initiatives={request?.initiatives}
                      headerClassName={'thead'}
                    />
                  </Card>
                </Col>
              </Row>
            )}
          </Col>
          <Col lg={4} md={12}>
            <Comments
              comments={request?.comments}
              onCommentAdd={handleCommentAdd}
              onCommentEdit={handleCommentUpdate}
              onCommentDelete={handleCommentDelete}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}
