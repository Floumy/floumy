import { Card, CardHeader, Col, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFeature, updateFeature } from "../../../services/roadmap/roadmap.service";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import { sortByPriority } from "../../../services/utils/utils";
import WorkItemsList from "../backlog/WorkItemsList";
import NotFoundCard from "../components/NotFoundCard";
import { addWorkItem } from "../../../services/backlog/backlog.service";
import CreateUpdateDeleteFeature from "./CreateUpdateDeleteFeature";
import ExecutionStats from "../components/stats/ExecutionStats";
import Comments from "../../../components/Comments/Comments";
import { toast } from "react-toastify";
import useFeatureComments from "../../../hooks/useFeatureComments";

export function DetailFeature() {
  const { orgId, productId } = useParams();
  const [feature, setFeature] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const {
    addComment,
    updateComment,
    deleteComment
  } = useFeatureComments(feature, setFeature, toast);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const feature = await getFeature(orgId, productId, id);
        setFeature(feature);
      } catch (e) {
        toast.error("Failed to fetch initiative");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  async function handleAddWorkItem(workItem) {
    workItem.feature = feature.id;
    const savedWorkItem = await addWorkItem(orgId, productId, workItem);
    feature.workItems.push(savedWorkItem);
    sortByPriority(feature.workItems);
    setFeature({ ...feature });
  }

  const handleSubmit = async (feature) => {
    await updateFeature(orgId, productId, id, feature);
  };

  function updateWorkItemsChangeStatus(workItems, status) {
    const updatedWorkItems = [];
    for (const workItem of feature.workItems) {
      if (workItems.some((wi) => (wi.id === workItem.id))) {
        workItem.status = status;
      }
      updatedWorkItems.push(workItem);
    }
    feature.workItems = updatedWorkItems;
    setFeature({ ...feature });
  }

  function updateWorkItemsPriority(workItems, priority) {
    const updatedWorkItems = [];
    for (const workItem of feature.workItems) {
      if (workItems.some((wi) => (wi.id === workItem.id))) {
        workItem.priority = priority;
      }
      updatedWorkItems.push(workItem);
    }
    feature.workItems = updatedWorkItems;
    setFeature({ ...feature });
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
        {feature && feature.workItems && feature.workItems.length > 0 &&
          <ExecutionStats workItems={feature.workItems} dueDate={feature?.milestone?.dueDate} />}
        <Row>
          <Col>
            {!isLoading && !feature && <NotFoundCard message="Initiative not found" />}
            {!isLoading && feature && <CreateUpdateDeleteFeature onSubmit={handleSubmit} feature={feature} />}
            <Card>
              {isLoading && <LoadingSpinnerBox />}
              {!isLoading && feature &&
                <>
                  <CardHeader className="border-1">
                    <div className="row">
                      <div className="col-12">
                        <h3 className="mb-0">Related Work Items</h3>
                      </div>
                    </div>
                  </CardHeader>
                  <WorkItemsList
                    workItems={sortByPriority(feature.workItems)}
                    showFeature={false}
                    onAddNewWorkItem={handleAddWorkItem}
                    onChangeStatus={updateWorkItemsChangeStatus}
                    onChangePriority={updateWorkItemsPriority}
                  />
                </>
              }
            </Card>
          </Col>
        </Row>
        <Row>
          {!isLoading &&
            <Col>
              <Comments comments={feature?.comments}
                        onCommentAdd={addComment}
                        onCommentEdit={updateComment}
                        onCommentDelete={deleteComment} />
            </Col>
          }
        </Row>
      </Container>
    </>
  );
}
