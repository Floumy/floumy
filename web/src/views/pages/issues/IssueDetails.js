import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Row,
} from 'reactstrap';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import {
  addIssueComment,
  deleteIssueComment,
  getIssue,
  updateIssueComment,
} from '../../../services/issues/issues.service';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import Comments from '../../../components/Comments/Comments';
import { toast } from 'react-toastify';
import CardHeaderDetails from '../components/CardHeaderDetails';
import { formatHyphenatedString } from '../../../services/utils/utils';
import WorkItemsList from '../backlog/WorkItemsList';
import PublicWorkItemsList from '../backlog/PublicWorkItemsList';

export default function IssueDetails() {
  const { orgId, projectId, issueId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [issue, setIssue] = useState(null);
  const isPublicPage = window.location.pathname.startsWith('/public');
  useEffect(() => {
    document.title = 'Floumy | Issue Details';

    async function fetchIssue(orgId, projectId, issueId) {
      try {
        setIsLoading(true);
        const issue = await getIssue(orgId, projectId, issueId);
        setIssue(issue);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load issue details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchIssue(orgId, projectId, issueId);
  }, [orgId, projectId, issueId]);

  async function handleCommentAdd(comment) {
    try {
      const addedComment = await addIssueComment(
        orgId,
        projectId,
        issueId,
        comment,
      );
      setIssue({ ...issue, comments: [...issue.comments, addedComment] });
      toast.success('Comment added successfully');
    } catch (e) {
      toast.error('Failed to add comment');
    }
  }

  async function handleCommentUpdate(commentId, content) {
    try {
      const updatedComment = await updateIssueComment(
        orgId,
        projectId,
        issueId,
        commentId,
        content,
      );
      const updatedComments = issue.comments.map((c) =>
        c.id === updatedComment.id ? updatedComment : c,
      );
      setIssue({ ...issue, comments: updatedComments });
      toast.success('Comment updated successfully');
    } catch (e) {
      toast.error('Failed to update comment');
    }
  }

  async function handleCommentDelete(commentId) {
    try {
      await deleteIssueComment(orgId, projectId, issueId, commentId);
      const updatedComments = issue.comments.filter((c) => c.id !== commentId);
      setIssue({ ...issue, comments: updatedComments });
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
          <Col>
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
                  ) : (
                    issue && (
                      <Card>
                        <CardHeader>
                          <h3 className="mb-0">Issue</h3>
                          <CardHeaderDetails
                            createdAt={issue.createdAt}
                            updatedAt={issue.updatedAt}
                          />
                        </CardHeader>
                        <CardBody>
                          <Form className="needs-validation" noValidate>
                            <Row>
                              <Col>
                                <FormGroup>
                                  <label className="form-control-label">
                                    Title
                                  </label>
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
                                  <label className="form-control-label">
                                    Status
                                  </label>
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
                                  <label className="form-control-label">
                                    Priority
                                  </label>
                                  <Input
                                    type="text"
                                    className="bg-white"
                                    value={formatHyphenatedString(
                                      issue.priority,
                                    )}
                                    disabled
                                    readOnly
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <FormGroup>
                                  <label className="form-control-label">
                                    Description
                                  </label>
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
                    )
                  )}
                </div>
              </Col>
            </Row>
            {issue && issue.workItems && (
              <Row>
                <Col>
                  <Card>
                    <CardHeader>
                      <h3 className="mb-0">Related Work Items</h3>
                    </CardHeader>
                    {isPublicPage ? (
                      <PublicWorkItemsList
                        showInitiative={false}
                        orgId={orgId}
                        workItems={issue?.workItems}
                        headerClassName={'thead'}
                      />
                    ) : (
                      <WorkItemsList workItems={issue?.workItems} />
                    )}
                  </Card>
                </Col>
              </Row>
            )}
          </Col>
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
