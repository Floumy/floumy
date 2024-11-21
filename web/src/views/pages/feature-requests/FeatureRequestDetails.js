import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, CardHeader, Col, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addFeatureRequestComment,
  deleteFeatureRequestComment,
  getFeatureRequest,
  updateFeatureRequestComment
} from "../../../services/feature-requests/feature-requests.service";
import PublicFeatureRequestDetails from "./PublicFeatureRequestDetails";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import Comments from "../../../components/Comments/Comments";
import { toast } from "react-toastify";
import PublicFeaturesList from "../features/PublicFeaturesList";

export default function FeatureRequestDetails() {
  const { orgId, projectId, featureRequestId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [featureRequest, setFeatureRequest] = useState(null);

  useEffect(() => {
    document.title = "Floumy | Edit Feature Request";

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
      toast.success("Comment added successfully");
    } catch (e) {
      toast.error("Failed to add comment");
    }
  }

  async function handleCommentUpdate(commentId, content) {
    try {
      const updatedComment = await updateFeatureRequestComment(orgId, projectId, featureRequest.id, commentId, content);
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
      await deleteFeatureRequestComment(orgId, projectId, featureRequest.id, commentId);
      const index = featureRequest.comments.findIndex((c) => c.id === commentId);
      featureRequest.comments.splice(index, 1);
      setFeatureRequest({ ...featureRequest });
      toast.success("Comment deleted successfully");
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  }

  return (<>
    {isLoading && <InfiniteLoadingBar />}
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
            {!isLoading && featureRequest && <PublicFeatureRequestDetails featureRequest={featureRequest} />}
          </div>
        </Col>
      </Row>
      {featureRequest?.features && <Row>
        <Col>
          <Card>
            <CardHeader>
              <h3 className="mb-0">Related Initiatives</h3>
            </CardHeader>
            <PublicFeaturesList
              orgId={orgId}
              features={featureRequest?.features}
              headerClassName={"thead"}
            />
          </Card>
        </Col>
      </Row>}
      <Row>
        <Col>
          <Comments comments={featureRequest?.comments}
                    onCommentAdd={handleCommentAdd}
                    onCommentEdit={handleCommentUpdate}
                    onCommentDelete={handleCommentDelete} />
        </Col>
      </Row>
    </Container>
  </>);
}