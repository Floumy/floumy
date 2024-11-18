import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, CardHeader, Col, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addFeatureRequestComment,
  deleteFeatureRequest,
  deleteFeatureRequestComment,
  getFeatureRequest,
  updateFeatureRequest,
  updateFeatureRequestComment
} from "../../../services/feature-requests/feature-requests.service";
import UpdateFeatureRequest from "./UpdateFeatureRequest";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import { toast } from "react-toastify";
import Comments from "../../../components/Comments/Comments";

export default function EditFeatureRequest() {
  const { orgId, productId, featureRequestId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [featureRequest, setFeatureRequest] = useState(null);

  useEffect(() => {
    document.title = "Floumy | Edit Feature Request";

    async function fetchFeatureRequest(orgId, productId, featureRequestId) {
      try {
        setIsLoading(true);
        const featureRequest = await getFeatureRequest(orgId, productId, featureRequestId);
        setFeatureRequest(featureRequest);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeatureRequest(orgId, productId, featureRequestId);
  }, [orgId, productId, featureRequestId]);

  async function handleCommentAdd(comment) {
    try {
      const addedComment = await addFeatureRequestComment(orgId, productId, featureRequest.id, comment);
      featureRequest.comments.push(addedComment);
      setFeatureRequest({ ...featureRequest });
      toast.success("Comment added successfully");
    } catch (e) {
      toast.error("Failed to add comment");
    }
  }

  async function handleCommentUpdate(commentId, content) {
    try {
      const updatedComment = await updateFeatureRequestComment(orgId, productId, featureRequest.id, commentId, content);
      const index = featureRequest.comments.findIndex((c) => c.id === updatedComment.id);
      featureRequest.comments[index] = updatedComment;
      setFeatureRequest({ ...featureRequest });
      toast.success("Comment updated successfully");
    } catch (e) {
      toast.error("Failed to update comment");
    }
  }

  async function handleCommentDelete(commentId) {
    try {
      await deleteFeatureRequestComment(orgId, productId, featureRequest.id, commentId);
      const index = featureRequest.comments.findIndex((c) => c.id === commentId);
      featureRequest.comments.splice(index, 1);
      setFeatureRequest({ ...featureRequest });
      toast.success("Comment deleted successfully");
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  }

  const handleUpdate = async (updatedFeatureRequest) => {
    await updateFeatureRequest(orgId, productId, featureRequestId, updatedFeatureRequest);
  };

  const handleDelete = async (featureRequestId) => {
    await deleteFeatureRequest(orgId, productId, featureRequestId);
  };

  return (<>
    <SimpleHeader headerButtons={[
      {
        name: "Back",
        shortcut: "←",
        action: () => {
          window.history.back();
        }
      }
    ]} />
    <Container className="mt--6" fluid>
      <Row>
        <Col>
          <div className="card-wrapper">
            {isLoading && <Card><CardHeader><h2>Feature Request</h2></CardHeader><LoadingSpinnerBox /></Card>}
            {!isLoading && featureRequest &&
              <UpdateFeatureRequest
                featureRequest={featureRequest}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />}
          </div>
        </Col>
      </Row>
      <Row>
        {!isLoading &&
          <Col>
            <Comments comments={featureRequest?.comments}
                      onCommentAdd={handleCommentAdd}
                      onCommentEdit={handleCommentUpdate}
                      onCommentDelete={handleCommentDelete} />
          </Col>
        }
      </Row>
    </Container>
  </>);
}