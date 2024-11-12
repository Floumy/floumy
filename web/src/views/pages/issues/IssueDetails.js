import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardBody, CardHeader, Col, Container, Form, FormGroup, Input, Row } from "reactstrap";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import {
  addIssueComment,
  deleteIssueComment,
  getIssue,
  updateIssueComment
} from "../../../services/issues/issues.service";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import Comments from "../../../components/Comments/Comments";
import { toast } from "react-toastify";
import CardHeaderDetails from "../components/CardHeaderDetails";
import { formatHyphenatedString } from "../../../services/utils/utils";
import WorkItemsList from "../backlog/WorkItemsList";

export default function IssueDetails() {
  const { orgId, issueId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [issue, setIssue] = useState(null);

  useEffect(() => {
    document.title = "Floumy | Issue Details";

    async function fetchIssue(orgId, issueId) {
      try {
        setIsLoading(true);
        const issue = await getIssue(orgId, issueId);
        setIssue(issue);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load issue details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchIssue(orgId, issueId);
  }, [orgId, issueId]);

  async function handleCommentAdd(comment) {
    try {
      const addedComment = await addIssueComment(orgId, issue.id, comment);
      setIssue({ ...issue, comments: [...issue.comments, addedComment] });
      toast.success("Comment added successfully");
    } catch (e) {
      toast.error("Failed to add comment");
    }
  }

  async function handleCommentUpdate(commentId, content) {
    try {
      const updatedComment = await updateIssueComment(orgId, issue.id, commentId, content);
      const updatedComments = issue.comments.map(c => c.id === updatedComment.id ? updatedComment : c);
      setIssue({ ...issue, comments: updatedComments });
      toast.success("Comment updated successfully");
    } catch (e) {
      toast.error("Failed to update comment");
    }
  }

  async function handleCommentDelete(commentId) {
    try {
      await deleteIssueComment(orgId, issue.id, commentId);
      const updatedComments = issue.comments.filter(c => c.id !== commentId);
      setIssue({ ...issue, comments: updatedComments });
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
            action: () => window.history.back()
          }
        ]}
      />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <div className="card-wrapper">
              {isLoading ? (
                <Card>
                  <CardHeader>
                    <h2>Issue</h2>
                  </CardHeader>
                  <LoadingSpinnerBox />
                </Card>
              ) : issue && (
                <Card>
                  <CardHeader>
                    <h3 className="mb-0">Issue</h3>
                    <CardHeaderDetails createdAt={issue.createdAt} updatedAt={issue.updatedAt} />
                  </CardHeader>
                  <CardBody>
                    <Form className="needs-validation" noValidate>
                      <Row>
                        <Col>
                          <FormGroup>
                            <label className="form-control-label">Title</label>
                            <Input
                              type="text"
                              value={issue.title}
                              className="bg-white"
                              disabled
                              readOnly
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <FormGroup>
                            <label className="form-control-label">Status</label>
                            <Input
                              type="text"
                              className="bg-white"
                              value={formatHyphenatedString(issue.status)}
                              disabled
                              readOnly
                            />
                          </FormGroup>
                        </Col>
                        <Col>
                          <FormGroup>
                            <label className="form-control-label">Priority</label>
                            <Input
                              type="text"
                              className="bg-white"
                              value={formatHyphenatedString(issue.priority)}
                              disabled
                              readOnly
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <FormGroup>
                            <label className="form-control-label">Description</label>
                            <Input
                              type="textarea"
                              rows={5}
                              className="bg-white"
                              value={issue.description}
                              disabled
                              readOnly
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
              )}
            </div>
          </Col>
        </Row>
        {issue && issue.workItems && <Row>
          <Col>
            <Card>
              <CardHeader>
                <h3 className="mb-0">Related Work Items</h3>
              </CardHeader>
              <WorkItemsList
                workItems={issue?.workItems}
              />
            </Card>
          </Col>
        </Row>}
        <Row>
          <Col>
            <Comments
              comments={issue?.comments}
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