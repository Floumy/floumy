/*!

=========================================================
* Argon Dashboard PRO React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useEffect, useState } from "react";
// javascript plugin that creates a sortable object from a dom object
// reactstrap components
import { Badge, Card, CardBody, CardHeader, Col, Container, Input, Progress, Row, Table } from "reactstrap";
// core components
import SimpleHeader from "components/Headers/SimpleHeader.js";
import { Link, useParams } from "react-router-dom";
import {
  addObjectiveComment,
  deleteObjectiveComment,
  getPublicOKR,
  updateObjectiveComment
} from "../../../services/okrs/okrs.service";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import NotFoundCard from "../components/NotFoundCard";
import DetailOKRStats from "./DetailOKRStats";
import {
  formatHyphenatedString,
  formatOKRsProgress,
  formatTimeline,
  okrStatusColorClassName
} from "../../../services/utils/utils";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import { toast } from "react-toastify";
import PublicShareButtons from "../../../components/PublicShareButtons/PublicShareButtons";
import Comments from "../../../components/Comments/Comments";

function PublicDetailOKR() {
  const { orgId, productId, okrId } = useParams();
  const [okr, setOKR] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchAndSetOKR() {
      try {
        const okr = await getPublicOKR(orgId, productId, okrId);
        setOKR(okr);
      } catch (e) {
        toast.error("The OKR could not be loaded");
      }
    }

    async function fetchData() {
      setIsLoading(true);
      await fetchAndSetOKR();
      setIsLoading(false);
    }

    fetchData();
  }, [orgId, okrId]);

  const handleAddComment = async (content) => {
    try {
      const addedComment = await addObjectiveComment(orgId, productId, okr.objective.id, content);
      okr.objective.comments.push(addedComment);
      setOKR({ ...okr });
      toast.success("The comment has been added");
    } catch (e) {
      toast.error("The comment could not be added");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteObjectiveComment(orgId, productId, okr.objective.id, commentId);
      okr.objective.comments = okr.objective.comments.filter(comment => comment.id !== commentId);
      setOKR({ ...okr });
      toast.success("The comment has been deleted");
    } catch (e) {
      toast.error("The comment could not be deleted");
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      const updatedComment = await updateObjectiveComment(orgId, productId, okr.objective.id, commentId, content);
      okr.objective.comments = okr.objective.comments.map(comment => {
        if (comment.id === commentId) {
          return updatedComment;
        }
        return comment;
      });
      setOKR({ ...okr });
      toast.success("The comment has been updated");
    } catch (e) {
      toast.error("The comment could not be updated");
    }
  };

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
        {okr && okr.keyResults && okr.keyResults.length > 0 && <DetailOKRStats okr={okr} />}
        <Row>
          <Col>
            {!isLoading && !okr && <NotFoundCard message="Objective not be found" />}
            <Card>
              <CardHeader>
                <h3 className="mb-0">
                  Objective {okr && okr.objective.reference}
                </h3>
                {okr && <div className="py-2"><PublicShareButtons title={okr.objective.title} /></div>}
              </CardHeader>
              <CardBody className="border-bottom">
                {isLoading && <LoadingSpinnerBox />}
                {!isLoading && okr &&
                  <>
                    <Row>
                      <Col s={12} md={12}>
                        <div className="form-group mb-3">
                          <label htmlFor="objective-status"
                                 className="form-control-label col-form-label">
                            Title
                          </label>
                          <Input
                            id="objective-title"
                            className="bg-white"
                            disabled={true}
                            name="title"
                            type="text"
                            value={okr.objective.title}
                          />
                        </div>
                      </Col>
                      <Col s={12} md={6}>
                        <div className="form-group mb-3">
                          <label htmlFor="objective-status"
                                 className="form-control-label col-form-label">
                            Status
                          </label>
                          <Input
                            id="objective-status"
                            className="bg-white"
                            disabled={true}
                            name="status"
                            type="text"
                            value={formatHyphenatedString(okr.objective.status)}
                          />
                        </div>
                      </Col>
                      <Col s={12} md={6}>
                        <div className="form-group mb-3">
                          <label htmlFor="objective-status"
                                 className="form-control-label col-form-label">
                            Timeline
                          </label>
                          <Input
                            id="objective-timeline"
                            className="bg-white"
                            disabled={true}
                            name="status"
                            type="text"
                            value={formatTimeline(okr.objective.timeline)}
                          />
                        </div>
                      </Col>
                    </Row>
                  </>}
              </CardBody>
            </Card>
            {!isLoading &&
              <Card>
                <CardHeader>
                  <h3 className="mb-0">
                    Related Key Results
                  </h3>
                </CardHeader>
                <Row>
                  <Col>
                    <div className="table-responsive">
                      <Table className="table align-items-center no-select" style={{ minWidth: "700px" }}>
                        <thead className="thead-light">
                        <tr>
                          <th className="sort" scope="col" width="5%">
                            Reference
                          </th>
                          <th className="sort" scope="col" width="60%">
                            Key Result
                          </th>
                          <th className="sort" scope="col" width="20%">
                            Progress
                          </th>
                          <th className="sort" scope="col" width="10%">
                            Status
                          </th>
                        </tr>
                        </thead>
                        <tbody className="list">
                        {okr && okr.keyResults && okr.keyResults.length === 0 &&
                          <tr>
                            <td colSpan={4}>
                              <div className="text-center text-muted">
                                No key results have been added yet
                              </div>
                            </td>
                          </tr>}
                        {okr && okr.keyResults && okr.keyResults.map((keyResult) => (
                          <tr key={keyResult.id}>
                            <td>
                              <Link
                                to={`/public/orgs/${orgId}/products/${productId}/objectives/${okrId}/kr/detail/${keyResult.id}`}
                                className={"okr-detail"}>
                                {keyResult.reference}
                              </Link>
                            </td>
                            <td className="title-cell">
                              <Link
                                to={`/public/orgs/${orgId}/products/${productId}/objectives/${okrId}/kr/detail/${keyResult.id}`}
                                className={"okr-detail"}>
                                {keyResult.title}
                              </Link>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="mr-2">{formatOKRsProgress(keyResult.progress)}%</span>
                                <div>
                                  <Progress max="100" value={formatOKRsProgress(keyResult.progress)} color="primary" />
                                </div>
                              </div>
                            </td>
                            <td>
                              <Badge color="" className="badge-dot mr-4">
                                <i className={okrStatusColorClassName(keyResult.status)} />
                                <span className="status">{formatHyphenatedString(keyResult.status)}</span>
                              </Badge>
                            </td>
                          </tr>))}
                        </tbody>
                      </Table>
                    </div>
                  </Col>
                </Row>
              </Card>}
          </Col>
        </Row>
        <Row>
          {!isLoading &&
            <Col>
              <Comments comments={okr?.objective?.comments}
                        onCommentAdd={handleAddComment}
                        onCommentDelete={handleDeleteComment}
                        onCommentEdit={handleUpdateComment}
              />
            </Col>
          }
        </Row>
      </Container>
    </>
  );
}

export default PublicDetailOKR;
