import { Card, CardBody, CardHeader, Col, Container, Input, Progress, Row } from "reactstrap";
import React, { useEffect } from "react";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import { formatProgress, keyResultStatusName } from "../../../services/utils/utils";
import { useParams } from "react-router-dom";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import NotFoundCard from "../components/NotFoundCard";
import { toast } from "react-toastify";
import PublicFeaturesList from "../features/PublicFeaturesList";
import {
  addKeyResultComment,
  deleteKeyResultComment,
  getPublicKeyResult,
  updateKeyResultComment
} from "../../../services/okrs/okrs.service";
import PublicShareButtons from "../../../components/PublicShareButtons/PublicShareButtons";
import Comments from "../../../components/Comments/Comments";

function PublicDetailKeyResult() {
  const { orgId, productId, objectiveId, keyResultId } = useParams();
  const [keyResult, setKeyResult] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    document.title = "Floumy | Key Result";

    async function loadData() {
      try {
        setIsLoading(true);
        const keyResult = await getPublicKeyResult(orgId, productId, objectiveId, keyResultId);
        setKeyResult(keyResult);
      } catch (e) {
        toast.error("The key result could not be loaded");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [orgId, keyResultId, objectiveId]);

  async function handleCommentAdd(comment) {
    try {
      const addedComment = await addKeyResultComment(orgId, productId, keyResultId, comment);
      keyResult.comments.push(addedComment);
      setKeyResult({ ...keyResult });
      toast.success("Comment added successfully");
    } catch (e) {
      toast.error("Failed to add comment");
    }
  }

  async function handleCommentEditSubmit(commentId, content) {
    try {
      await updateKeyResultComment(orgId, productId, keyResultId, commentId, content);
      const updatedComment = keyResult.comments.find(c => c.id === commentId);
      updatedComment.content = content;
      setKeyResult({ ...keyResult });
      toast.success("Comment updated successfully");
    } catch (e) {
      toast.error("Failed to update comment");
    }
  }

  async function handCommentDelete(commentId) {
    try {
      await deleteKeyResultComment(orgId, productId, keyResultId, commentId);
      const index = keyResult.comments.findIndex(c => c.id === commentId);
      keyResult.comments.splice(index, 1);
      setKeyResult({ ...keyResult });
      toast.success("Comment deleted successfully");
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  }

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: "Back",
            shortcut: "←",
            action: () => {
              window.history.back();
            }
          }
        ]}
      />
      <Container className="mt--6" fluid id="OKRs">
        <Row>
          <Col>
            {!isLoading && !keyResult && <NotFoundCard message="Key result not be found" />}
            <Card>
              <CardHeader className="border-1">
                <div className="row">
                  <div className="col-12">
                    <h3 className="mb-0">Key Result {keyResult && keyResult.reference}</h3>
                    {keyResult && <div className="py-2"><PublicShareButtons title={keyResult.title} /></div>}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {isLoading && <LoadingSpinnerBox />}
                {!isLoading && keyResult && <>
                  <Row className="mb-3">
                    <Col xs={12} sm={8}>
                      <label className="form-control-label">
                        Title
                      </label>
                      <Input
                        disabled={true}
                        className="bg-white"
                        id="objective-title"
                        name="title"
                        type="text"
                        value={keyResult.title}
                      />
                    </Col>
                    <Col xs={12} sm={4} className="mb-3">
                      <label className="form-control-label">
                        Status
                      </label>
                      <Input
                        disabled={true}
                        className="bg-white"
                        id="objective-status"
                        name="status"
                        type="text"
                        value={keyResultStatusName(keyResult.status)} />
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} sm={12}>
                      <label className="form-control-label col-form-label">
                        Progress {formatProgress(keyResult.progress * 100)}%
                      </label>
                      <div className="my-1">
                        <Progress max="100" value={keyResult.progress * 100} color="primary" />
                      </div>
                    </Col>
                  </Row>
                </>}
              </CardBody>
            </Card>
            {!isLoading && keyResult && keyResult.features && <>
              <Card>
                <CardHeader className="border-1">
                  <div className="row">
                    <div className="col-12">
                      <h3 className="mb-0">Related Initiatives</h3>
                    </div>
                  </div>
                </CardHeader>
                <PublicFeaturesList
                  orgId={orgId}
                  productId={productId}
                  features={keyResult.features}
                />
              </Card>
            </>}
          </Col>
        </Row>
        <Row>
          {!isLoading &&
            <Col>
              <Comments
                comments={keyResult?.comments || []}
                onCommentAdd={handleCommentAdd}
                onCommentEdit={handleCommentEditSubmit}
                onCommentDelete={handCommentDelete}
              />
            </Col>
          }
        </Row>
      </Container>
    </>
  );
}

export default PublicDetailKeyResult;
