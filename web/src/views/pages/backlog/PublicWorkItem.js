import { Card, CardBody, CardHeader, Col, Form, Input, Row } from "reactstrap";
import ReactQuill from "react-quill";
import React, { useEffect } from "react";
import CardHeaderDetails from "../components/CardHeaderDetails";
import { priorityName, workItemStatusName, workItemTypeName } from "../../../services/utils/utils";
import PublicShareButtons from "../../../components/PublicShareButtons/PublicShareButtons";
import { addComment, deleteComment, updateComment } from "../../../services/backlog/backlog.service";
import { toast } from "react-toastify";
import Comments from "../../../components/Comments/Comments";
import { getPublicOrg } from "../../../services/org/orgs.service";
import { useParams } from "react-router-dom";

function PublicWorkItem({ workItem = defaultWorkItem }) {
  const [comments, setComments] = React.useState(workItem.comments || []);
  const [org, setOrg] = React.useState(null);
  const { orgId, productId } = useParams();

  useEffect(() => {
    document.title = "Floumy | Work Item";
    getPublicOrg(orgId)
      .then((org) => {
        setOrg(org);
      })
      .catch((e) => {
        console.error(e.message);
        window.location.href = "/auth/sign-in";
      });
  });

  const handleCommentSubmit = async (comment) => {
    try {
      const addedComment = await addComment(orgId, productId, workItem.id, comment);
      setComments([...comments, addedComment]);
      toast.success("The comment has been saved");
    } catch (e) {
      toast.error("The comment could not be saved");
    }
  };

  const handleCommentEditSubmit = async (commentId, comment) => {
    try {
      const updatedComment = await updateComment(orgId, productId, workItem.id, commentId, comment);
      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      toast.success("The comment has been updated");
    } catch (e) {
      toast.error("The comment could not be updated");
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await deleteComment(orgId, productId, workItem.id, commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success("The comment has been deleted");
    } catch (e) {
      toast.error("The comment could not be deleted");
    }
  };

  return (
    <>
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <h3 className="mb-0">Work Item {workItem.reference}</h3>
              <CardHeaderDetails createdAt={workItem.createdAt} updatedAt={workItem.updatedAt} />
              {workItem && <div className="py-2"><PublicShareButtons title={workItem.title} /></div>}
            </CardHeader>
            <CardBody>
              <Form
                className="needs-validation"
                noValidate>
                <Row className="mb-3">
                  <Col>
                    <label
                      className="form-control-label"

                    >
                      Title
                    </label>
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
                    <label
                      className="form-control-label"
                    >
                      Type
                    </label>
                    <Input
                      type="text"
                      disabled={true}
                      className="bg-white"
                      defaultValue={workItemTypeName(workItem.type)}
                      name="type"
                    />
                  </Col>
                  <Col xs={12} sm={3} className="mb-3">
                    <label
                      className="form-control-label"
                    >
                      Priority
                    </label>
                    <Input
                      disabled={true}
                      className="bg-white"
                      defaultValue={priorityName(workItem.priority)}
                      name="priority"
                    />
                  </Col>
                  <Col xs={12} sm={3} className="mb-3">
                    <label
                      className="form-control-label"

                    >
                      Status
                    </label>
                    <Input
                      type="text"
                      disabled={true}
                      className="bg-white"
                      defaultValue={workItemStatusName(workItem.status)}
                      name="status" />
                  </Col>
                  <Col xs={12} sm={3} className="mb-3">
                    <label className="form-control-label">
                      Estimation
                    </label>
                    <Input
                      disabled={true}
                      className="bg-white"
                      id="estimation"
                      name="estimation"
                      type="text"
                      value={workItem.estimation || ""}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <label
                      className="form-control-label"

                    >
                      Initiative
                    </label>
                    <Input
                      type="text"
                      disabled={true}
                      className="bg-white"
                      defaultValue={workItem.feature?.title || "None"}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <label
                      className="form-control-label"
                    >
                      Sprint
                    </label>
                    <Input
                      type="text"
                      disabled={true}
                      className="bg-white"
                      defaultValue={workItem.iteration?.title || "None"}
                      placeholder="Select a sprint" />
                  </Col>
                </Row>
                {org?.paymentPlan === "premium" && <Row className="mb-3">
                  <Col>
                    <label
                      className="form-control-label"

                    >
                      Issue
                    </label>
                    <Input
                      type="text"
                      disabled={true}
                      className="bg-white"
                      defaultValue={workItem.issue?.title || "None"} />
                  </Col>
                </Row>}
                <Row className="mb-3">
                  <Col>
                    <label
                      className="form-control-label"

                    >
                      Description
                    </label>
                    <ReactQuill
                      value={workItem.description}
                      readOnly={true}
                      theme="snow"
                      modules={{
                        toolbar: false
                      }}
                    />
                  </Col>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Comments comments={comments}
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
  title: "",
  description: "",
  priority: "medium",
  type: "user-story",
  estimation: "",
  status: "planned",
  feature: { id: "" },
  iteration: { id: "" }
};

export default PublicWorkItem;
