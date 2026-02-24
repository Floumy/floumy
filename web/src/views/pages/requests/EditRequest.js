import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardHeader, Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  addRequestComment,
  deleteRequest,
  deleteRequestComment,
  getRequest,
  updateRequest,
  updateRequestComment,
} from '../../../services/requests/requests.service';
import UpdateRequest from './UpdateRequest';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { toast } from 'react-toastify';
import Comments from '../../../components/Comments/Comments';

export default function EditRequest() {
  const { orgId, projectId, requestId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [featureRequest, setFeatureRequest] = useState(null);

  useEffect(() => {
    document.title = 'Floumy | Edit Request';

    async function fetchRequest(orgId, projectId, requestId) {
      try {
        setIsLoading(true);
        const request = await getRequest(orgId, projectId, requestId);
        setFeatureRequest(request);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequest(orgId, projectId, requestId);
  }, [orgId, projectId, requestId]);

  async function handleCommentAdd(comment) {
    try {
      const addedComment = await addRequestComment(
        orgId,
        projectId,
        featureRequest.id,
        comment,
      );
      featureRequest.comments.push(addedComment);
      setFeatureRequest({ ...featureRequest });
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
        featureRequest.id,
        commentId,
        content,
      );
      const index = featureRequest.comments.findIndex(
        (c) => c.id === updatedComment.id,
      );
      featureRequest.comments[index] = updatedComment;
      setFeatureRequest({ ...featureRequest });
      toast.success('Comment updated successfully');
    } catch (e) {
      toast.error('Failed to update comment');
    }
  }

  async function handleCommentDelete(commentId) {
    try {
      await deleteRequestComment(
        orgId,
        projectId,
        featureRequest.id,
        commentId,
      );
      const index = featureRequest.comments.findIndex(
        (c) => c.id === commentId,
      );
      featureRequest.comments.splice(index, 1);
      setFeatureRequest({ ...featureRequest });
      toast.success('Comment deleted successfully');
    } catch (e) {
      toast.error('Failed to delete comment');
    }
  }

  const handleUpdate = async (updatedRequest) => {
    await updateRequest(orgId, projectId, requestId, updatedRequest);
  };

  const handleDelete = async (requestId) => {
    await deleteRequest(orgId, projectId, requestId);
  };

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6" fluid>
        <Row>
          <Col lg={8} md={12}>
            <div className="card-wrapper">
              {isLoading && (
                <Card>
                  <CardHeader>
                    <h2>Request</h2>
                  </CardHeader>
                  <LoadingSpinnerBox />
                </Card>
              )}
              {!isLoading && featureRequest && (
                <UpdateRequest
                  featureRequest={featureRequest}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </Col>
          {!isLoading && (
            <Col lg={4} md={12}>
              <Comments
                comments={featureRequest?.comments}
                onCommentAdd={handleCommentAdd}
                onCommentEdit={handleCommentUpdate}
                onCommentDelete={handleCommentDelete}
              />
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
}
