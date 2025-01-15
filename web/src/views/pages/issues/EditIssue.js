import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, CardHeader, Col, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addIssueComment,
  deleteIssue,
  deleteIssueComment,
  getIssue,
  updateIssue,
  updateIssueComment
} from "../../../services/issues/issues.service";
import UpdateIssue from "./UpdateIssue";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import Comments from "../../../components/Comments/Comments";
import { toast } from "react-toastify";
import { addWorkItem } from "../../../services/backlog/backlog.service";
import WorkItemsList from "../backlog/WorkItemsList";
import { generateWorkItemsForIssue } from '../../../services/ai/ai.service';
import AIButton from '../../../components/AI/AIButton';

export default function EditIssue() {
  const { orgId, projectId, issueId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [issue, setIssue] = useState(null);

  useEffect(() => {
    document.title = "Floumy | Edit Issue";

    async function fetchIssue(orgId, projectId, issueId) {
      try {
        setIsLoading(true);
        const issue = await getIssue(orgId, projectId, issueId);
        setIssue(issue);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchIssue(orgId, projectId, issueId);
  }, [orgId, projectId, issueId]);

  async function handleAddWorkItem(workItem) {
    workItem.issue = issue.id;
    const savedWorkItem = await addWorkItem(orgId, projectId, workItem);
    issue.workItems.push(savedWorkItem);
    issue.workItems.sort(sortWorkItems);
    setIssue({ ...issue });
  }

  function updateWorkItemsStatus(workItems, status) {
    const updatedWorkItems = [];
    issue.workItems.forEach(workItem => {
      if (workItems.some(w => w.id === workItem.id)) {
        workItem.status = status;
      }
      updatedWorkItems.push(workItem);
    });
    setIssue({ ...issue, workItems: updatedWorkItems });
  }

  function sortWorkItems(a, b) {
    const priorityMap = ["high", "medium", "low"];
    return priorityMap.indexOf(a.priority) - priorityMap.indexOf(b.priority) || a.createdAt - b.createdAt;
  }

  function updateWorkItemsPriority(workItems, priority) {
    const updatedWorkItems = [];
    issue.workItems.forEach(workItem => {
      if (workItems.some(w => w.id === workItem.id)) {
        workItem.priority = priority;
      }
      updatedWorkItems.push(workItem);
    });
    updatedWorkItems.sort(sortWorkItems);
    setIssue({ ...issue, workItems: updatedWorkItems });
  }

  function updateWorkItemsIteration(workItems, iterationId) {
    const updatedWorkItems = [];
    issue.workItems.forEach(workItem => {
      if (workItems.some(w => w.id === workItem.id)) {
        workItem.iteration = iterationId;
      }
      updatedWorkItems.push(workItem);
    });
    setIssue({ ...issue, workItems: updatedWorkItems });
  }

  async function handleCommentAdd(comment) {
    try {
      const addedComment = await addIssueComment(orgId, projectId, issueId, comment);
      issue.comments.push(addedComment);
      setIssue({ ...issue });
      toast.success("Comment added successfully");
    } catch (e) {
      toast.error("Failed to add comment");
    }
  }

  async function handleCommentUpdate(commentId, content) {
    try {
      const updatedComment = await updateIssueComment(orgId, projectId, issueId, commentId, content);
      const index = issue.comments.findIndex((c) => c.id === updatedComment.id);
      issue.comments[index] = updatedComment;
      setIssue({ ...issue });
      toast.success("Comment updated successfully");
    } catch (e) {
      toast.error("Failed to update comment");
    }
  }

  async function handleCommentDelete(commentId) {
    try {
      await deleteIssueComment(orgId, projectId, issueId, commentId);
      const index = issue.comments.findIndex((c) => c.id === commentId);
      issue.comments.splice(index, 1);
      setIssue({ ...issue });
      toast.success("Comment deleted successfully");
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  }

  const handleUpdate = async (updatedIssue) => {
    await updateIssue(orgId, projectId, issueId, updatedIssue);
  };

  const handleDelete = async (issueId) => {
    await deleteIssue(orgId, projectId, issueId);
  };

  function isPlaceholderWorkItemOnly() {
    return issue && (!issue.workItems || issue.workItems.length === 1 || !issue.workItems[0]?.title);
  }

  const addWorkItemsWithAi = async () => {
    try {
      const workItemsToAdd = (await generateWorkItemsForIssue(issue.title, issue.description))
        .map(workItem => {
          return { title: workItem.title, type: workItem.type, priority: workItem.priority, description: workItem.description };
        });
      const savedWorkItems = [];
      for (const workItem of workItemsToAdd) {
        workItem.issue = issue.id;
        savedWorkItems.push(await addWorkItem(orgId, projectId, workItem));
      }
      setIssue({ ...issue, workItems: savedWorkItems });
      toast.success('The work items have been added');
    } catch (e) {
      toast.error('The work items could not be saved');
      console.error(e);
    }
  }

  return (
    <>
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
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <div className="card-wrapper">
              {isLoading && (
                <Card>
                  <CardHeader>
                    <h2>Issue</h2>
                  </CardHeader>
                  <LoadingSpinnerBox />
                </Card>
              )}
              {!isLoading && issue && (
                <UpdateIssue
                  issue={issue}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </Col>
        </Row>
        {issue && issue.workItems && <Row>
          <Col>
            <Card>
              <CardHeader>
                <h3 className="mb-0">Related Work Items {isPlaceholderWorkItemOnly() && <AIButton
                  disabled={issue?.title?.length === 0 || issue?.description?.length === 0}
                  onClick={addWorkItemsWithAi}
                />}
                </h3>
              </CardHeader>
              <WorkItemsList
                workItems={issue?.workItems}
                showAssignedTo={true}
                onAddNewWorkItem={handleAddWorkItem}
                onChangeStatus={updateWorkItemsStatus}
                onChangePriority={updateWorkItemsPriority}
                onChangeIteration={updateWorkItemsIteration}
              />
            </Card>
          </Col>
        </Row>}
        <Row>
          <Col>
            <Comments comments={issue?.comments}
                      onCommentAdd={handleCommentAdd}
                      onCommentEdit={handleCommentUpdate}
                      onCommentDelete={handleCommentDelete} />
          </Col>
        </Row>
      </Container>
    </>
  );
}