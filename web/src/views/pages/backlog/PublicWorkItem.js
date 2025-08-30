import { Card, CardBody, CardHeader, Col, Form, Input, Row } from 'reactstrap';
import ReactQuill from 'react-quill';
import React, { useEffect } from 'react';
import CardHeaderDetails from '../components/CardHeaderDetails';
import {
  priorityName,
  workItemStatusName,
  workItemTypeName,
} from '../../../services/utils/utils';
import {
  addComment,
  deleteComment,
  updateComment,
} from '../../../services/backlog/backlog.service';
import { toast } from 'react-toastify';
import Comments from '../../../components/Comments/Comments';
import { Link, useParams } from 'react-router-dom';

function PublicWorkItem({ workItem = defaultWorkItem }) {
  const [comments, setComments] = React.useState(workItem.comments || []);
  const { orgId, projectId } = useParams();

  useEffect(() => {
    document.title = 'Floumy | Work Item';
  });

  const handleCommentSubmit = async (comment) => {
    try {
      const addedComment = await addComment(
        orgId,
        projectId,
        workItem.id,
        comment,
      );
      setComments([...comments, addedComment]);
      toast.success('The comment has been saved');
    } catch (e) {
      toast.error('The comment could not be saved');
    }
  };

  const handleCommentEditSubmit = async (commentId, comment) => {
    try {
      const updatedComment = await updateComment(
        orgId,
        projectId,
        workItem.id,
        commentId,
        comment,
      );
      setComments(
        comments.map((c) => (c.id === commentId ? updatedComment : c)),
      );
      toast.success('The comment has been updated');
    } catch (e) {
      toast.error('The comment could not be updated');
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await deleteComment(orgId, projectId, workItem.id, commentId);
      setComments(comments.filter((comment) => comment.id !== commentId));
      toast.success('The comment has been deleted');
    } catch (e) {
      toast.error('The comment could not be deleted');
    }
  };

  return (
    <>
      <Row>
        <Col lg={8} md={12}>
          <Card>
            <CardHeader>
              <h3 className="mb-0">Work Item {workItem.reference}</h3>
              <CardHeaderDetails
                createdAt={workItem.createdAt}
                updatedAt={workItem.updatedAt}
              />
            </CardHeader>
            <CardBody>
              <Form className="needs-validation" noValidate>
                <Row className="mb-3">
                  <Col>
                    <label className="form-control-label">Title</label>
                    <Input
                      disabled={true}
                      id="title"
                      name="title"
                      type="text"
                      className="bg-white"
                      value={workItem.title}
                      autoComplete="off"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={3} className="mb-3">
                    <label className="form-control-label">Type</label>
                    <Input
                      type="text"
                      disabled={true}
                      className="bg-white"
                      defaultValue={workItemTypeName(workItem.type)}
                      name="type"
                    />
                  </Col>
                  <Col xs={12} sm={3} className="mb-3">
                    <label className="form-control-label">Priority</label>
                    <Input
                      disabled={true}
                      className="bg-white"
                      defaultValue={priorityName(workItem.priority)}
                      name="priority"
                    />
                  </Col>
                  <Col xs={12} sm={3} className="mb-3">
                    <label className="form-control-label">Status</label>
                    <Input
                      type="text"
                      disabled={true}
                      className="bg-white"
                      defaultValue={workItemStatusName(workItem.status)}
                      name="status"
                    />
                  </Col>
                  <Col xs={12} sm={3} className="mb-3">
                    <label className="form-control-label">Estimation</label>
                    <Input
                      disabled={true}
                      className="bg-white"
                      id="estimation"
                      name="estimation"
                      type="text"
                      value={workItem.estimation || ''}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <label className="form-control-label">
                      {workItem && workItem.initiative ? (
                        <Link
                          to={`/public/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/detail/${workItem.initiative.id}`}
                        >
                          Initiative
                          <i className="fa fa-link ml-2" />
                        </Link>
                      ) : (
                        'Initiative'
                      )}
                    </label>
                    <Input
                      type="text"
                      disabled={true}
                      className="bg-white"
                      defaultValue={workItem.initiative?.title || 'None'}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <label className="form-control-label">
                      {workItem && workItem.sprint ? (
                        <Link
                          to={`/public/orgs/${orgId}/projects/${projectId}/sprints/detail/${workItem.sprint.id}`}
                        >
                          Sprint
                          <i className="fa fa-link ml-2" />
                        </Link>
                      ) : (
                        'Sprint'
                      )}
                    </label>
                    <Input
                      type="text"
                      disabled={true}
                      className="bg-white"
                      defaultValue={workItem.sprint?.title || 'None'}
                      placeholder="Select a sprint"
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <label className="form-control-label">
                      {workItem && workItem.issue ? (
                        <Link
                          to={`/public/orgs/${orgId}/projects/${projectId}/issues/${workItem.issue.id}`}
                        >
                          Issue
                          <i className="fa fa-link ml-2" />
                        </Link>
                      ) : (
                        'Issue'
                      )}
                    </label>
                    <Input
                      type="text"
                      disabled={true}
                      className="bg-white"
                      defaultValue={workItem.issue?.title || 'None'}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <label className="form-control-label">Description</label>
                    <ReactQuill
                      value={workItem.description}
                      readOnly={true}
                      theme="snow"
                      modules={{
                        toolbar: false,
                      }}
                    />
                  </Col>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </Col>
        <Col lg={4} md={12}>
          <Comments
            comments={comments}
            onCommentAdd={handleCommentSubmit}
            onCommentDelete={handleCommentDelete}
            onCommentEdit={handleCommentEditSubmit}
          />
        </Col>
      </Row>
    </>
  );
}

const defaultWorkItem = {
  title: '',
  description: '',
  priority: 'medium',
  type: 'user-story',
  estimation: '',
  status: 'planned',
  initiative: { id: '' },
  sprint: { id: '' },
};

export default PublicWorkItem;
