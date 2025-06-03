import { Card, CardHeader, Col, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInitiative, updateInitiative } from "../../../services/roadmap/roadmap.service";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import { sortByPriority } from "../../../services/utils/utils";
import WorkItemsList from "../backlog/WorkItemsList";
import NotFoundCard from "../components/NotFoundCard";
import { addWorkItem } from "../../../services/backlog/backlog.service";
import CreateUpdateDeleteInitiative from "./CreateUpdateDeleteInitiative";
import ExecutionStats from "../components/stats/ExecutionStats";
import Comments from "../../../components/Comments/Comments";
import { toast } from "react-toastify";
import useInitiativeComments from "../../../hooks/useInitiativeComments";
import AIButton from '../../../components/AI/AIButton';
import { generateWorkItemsForInitiative } from '../../../services/ai/ai.service';

export function DetailInitiative() {
  const { orgId, projectId } = useParams();
  const [initiative, setInitiative] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const {
    addComment,
    updateComment,
    deleteComment
  } = useInitiativeComments(initiative, setInitiative, toast);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const initiative = await getInitiative(orgId, projectId, id);
        setInitiative(initiative);
      } catch (e) {
        toast.error("Failed to fetch initiative");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id, orgId, projectId]);

  async function handleAddWorkItem(workItem) {
    workItem.initiative = initiative.id;
    const savedWorkItem = await addWorkItem(orgId, projectId, workItem);
    initiative.workItems.push(savedWorkItem);
    sortByPriority(initiative.workItems);
    setInitiative({ ...initiative });
  }

  const handleSubmit = async (initiative) => {
    await updateInitiative(orgId, projectId, id, initiative);
  };

  function updateWorkItemsChangeStatus(workItems, status) {
    const updatedWorkItems = [];
    for (const workItem of initiative.workItems) {
      if (workItems.some((wi) => (wi.id === workItem.id))) {
        workItem.status = status;
      }
      updatedWorkItems.push(workItem);
    }
    initiative.workItems = updatedWorkItems;
    setInitiative({ ...initiative });
  }

  function updateWorkItemsPriority(workItems, priority) {
    const updatedWorkItems = [];
    for (const workItem of initiative.workItems) {
      if (workItems.some((wi) => (wi.id === workItem.id))) {
        workItem.priority = priority;
      }
      updatedWorkItems.push(workItem);
    }
    initiative.workItems = updatedWorkItems;
    setInitiative({ ...initiative });
  }

  function handleDeleteWorkItem(deletedWorkItems) {
    const deletedIds = deletedWorkItems.map(wi => wi.id);
    initiative.workItems = initiative.workItems.filter(wi => !deletedIds.includes(wi.id));
    setInitiative({ ...initiative });
  }

  function isPlaceholderWorkItemOnly() {
    return initiative && (!initiative.workItems || initiative.workItems.length === 1 || !initiative.workItems[0]?.title);
  }

  const addWorkItemsWithAi = async () => {
    try {
      const workItemsToAdd = (await generateWorkItemsForInitiative(initiative.title, initiative.description))
        .map(workItem => {
          return { title: workItem.title, type: workItem.type, priority: workItem.priority, description: workItem.description };
        });
      const savedWorkItems = [];
      for (const workItem of workItemsToAdd) {
        workItem.initiative = initiative.id;
        savedWorkItems.push(await addWorkItem(orgId, projectId, workItem));
      }
      setInitiative({ ...initiative, workItems: savedWorkItems });
      toast.success('The work items have been added');
    } catch (e) {
      toast.error('The work items could not be saved');
      console.error(e);
    }
  }
  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader
        breadcrumbs={initiative?.breadcrumbs}
      />
      <Container className="mt--6" fluid id="OKRs">
        {initiative && initiative.workItems && initiative.workItems.length > 0 &&
          <ExecutionStats workItems={initiative.workItems} dueDate={initiative?.milestone?.dueDate} />}
        <Row>
          <Col lg={8} md={12}>
            {!isLoading && !initiative && <NotFoundCard message="Initiative not found" />}
            {!isLoading && initiative && <CreateUpdateDeleteInitiative onSubmit={handleSubmit} initiative={initiative} />}
            <Card>
              {isLoading && <LoadingSpinnerBox />}
              {!isLoading && initiative &&
                <>
                  <CardHeader className="border-1">
                    <div className="row">
                      <div className="col-12">
                        <h3 className="mb-0">Related Work Items {isPlaceholderWorkItemOnly() && <AIButton
                          disabled={initiative?.title?.length === 0 || initiative?.description?.length === 0}
                          onClick={addWorkItemsWithAi}
                        />}
                        </h3>
                      </div>
                    </div>
                  </CardHeader>
                  <WorkItemsList
                    workItems={sortByPriority(initiative.workItems)}
                    showInitiative={false}
                    onAddNewWorkItem={handleAddWorkItem}
                    onChangeStatus={updateWorkItemsChangeStatus}
                    onChangePriority={updateWorkItemsPriority}
                    onDelete={handleDeleteWorkItem}
                  />
                </>
              }
            </Card>
          </Col>
          {!isLoading &&
            <Col lg={4} md={12}>
              <Comments comments={initiative?.comments}
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
