import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardHeader, Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  addFeatureRequestComment,
  deleteFeatureRequest,
  deleteFeatureRequestComment,
  getFeatureRequest,
  updateFeatureRequest,
  updateFeatureRequestComment,
} from '../../../services/feature-requests/feature-requests.service';
import UpdateFeatureRequest from './UpdateFeatureRequest';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { toast } from 'react-toastify';
import Comments from '../../../components/Comments/Comments';

export default function EditFeatureRequest() {
  const { orgId, projectId, featureRequestId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [featureRequest, setFeatureRequest] = useState(null);

  useEffect(() => {
    document.title = 'Floumy | Edit Feature Request';

    async function fetchFeatureRequest(orgId, projectId, featureRequestId) {
      try {
        setIsLoading(true);
        const featureRequest = await getFeatureRequest(
          orgId,
          projectId,
          featureRequestId,
        );
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
      const addedComment = await addFeatureRequestComment(
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
      const updatedComment = await updateFeatureRequestComment(
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
      await deleteFeatureRequestComment(
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

  const handleUpdate = async (updatedFeatureRequest) => {
    await updateFeatureRequest(
      orgId,
      projectId,
      featureRequestId,
      updatedFeatureRequest,
    );
  };

  const handleDelete = async (featureRequestId) => {
    await deleteFeatureRequest(orgId, projectId, featureRequestId);
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
                    <h2>Feature Request</h2>
                  </CardHeader>
                  <LoadingSpinnerBox />
                </Card>
              )}
              {!isLoading && featureRequest && (
                <UpdateFeatureRequest
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
