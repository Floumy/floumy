import React, { useEffect, useState } from "react";
import { Item, Menu, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { listIterations } from "../../services/iterations/iterations.service";
import { Badge, Spinner } from "reactstrap";
import {
  updateWorkItemIteration,
  updateWorkItemPriority,
  updateWorkItemStatus
} from "../../services/backlog/backlog.service";
import { formatHyphenatedString, priorityColor, workItemStatusColorClassName } from "../../services/utils/utils";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";

function WorkItemsContextMenu({ menuId, onChangeIteration, onChangeStatus, onChangePriority, onChange }) {
  const [isLoadingIterations, setIsLoadingIterations] = useState(false);
  const [iterations, setIterations] = useState([]);
  const { orgId, productId } = useParams();

  useEffect(() => {
    async function fetchIterations() {
      try {
        setIsLoadingIterations(true);
        const iterations = await listIterations(orgId, productId);
        setIterations(iterations.filter((iteration) => (iteration.status === "active" || iteration.status === "planned")));
      } catch (e) {
        console.error("The iterations could not be loaded");
      } finally {
        setIsLoadingIterations(false);
      }
    }

    fetchIterations();
  }, []);

  const handleChangeIteration = async ({ id: iterationId, event, props }) => {
    try {
      event.preventDefault();
      for (const workItem of props.workItems) {
        await updateWorkItemIteration(orgId, productId, workItem.id, iterationId);
      }
      callChangeIterationCallbacks(iterationId, props.workItems);
      toast.success("The work items have been moved to the iteration");
    } catch (e) {
      toast.error("The work items could not be moved to the iteration");
    }
  };

  const callChangeIterationCallbacks = (iterationId, workItems) => {
    try {
      if (onChangeIteration) {
        onChangeIteration(workItems, iterationId);
      }
      if (onChange) {
        onChange(workItems.map(workItem => workItem.id), { iteration: iterationId });
      }
    } catch (e) {
      console.error("The callbacks could not be called");
    }
  };

  const handleChangeStatus = async ({ id: status, event, props }) => {
    try {
      event.preventDefault();
      for (const workItem of props.workItems) {
        await updateWorkItemStatus(orgId, productId, workItem.id, status);
      }
      callChangeStatusCallbacks(status, props.workItems);
      toast.success("The work items have been updated");
    } catch (e) {
      toast.error("The work items could not be updated");
    }
  };

  const callChangeStatusCallbacks = (status, workItems) => {
    try {
      if (onChangeStatus) {
        onChangeStatus(workItems, status);
      }
      if (onChange) {
        onChange(workItems.map(workItem => workItem.id), { status });
      }
    } catch (e) {
      console.error("The callbacks could not be called");
    }
  };

  const handleChangePriority = async ({ id: priority, event, props }) => {
    try {
      event.preventDefault();
      for (const workItem of props.workItems) {
        await updateWorkItemPriority(orgId, productId, workItem.id, priority);
      }
      callChangePriorityCallbacks(priority, props.workItems);
      toast.success("The work items have been updated");
    } catch (e) {
      toast.error("The work items could not be updated");
    }
  };

  const callChangePriorityCallbacks = (priority, workItems) => {
    try {
      if (onChangePriority) {
        onChangePriority(workItems, priority);
      }
      if (onChange) {
        onChange(workItems.map(workItem => workItem.id), { priority });
      }
    } catch (e) {
      console.error("The callbacks could not be called");
    }
  };

  const workItemStatuses = [
    "planned",
    "ready-to-start",
    "in-progress",
    "blocked",
    "code-review",
    "testing",
    "revisions",
    "ready-for-deployment",
    "deployed",
    "done",
    "closed"
  ];

  const priorities = [
    "low",
    "medium",
    "high"
  ];

  return (
    <Menu id={menuId} theme="dark">
      <Submenu label={"Change status"} style={{ maxHeight: "200px", overflowY: "scroll" }}>
        {workItemStatuses.map(status => (
          <Item key={status} id={status} onClick={handleChangeStatus}>
            <Badge color="" className="badge-dot mr-4">
              <i className={workItemStatusColorClassName(status)} />
              <span className="status">{formatHyphenatedString(status)}</span>
            </Badge>
          </Item>
        ))}
      </Submenu>
      <Submenu label={"Change priority"} style={{ maxHeight: "200px", overflowY: "scroll" }}>
        {priorities.map(priority => (
          <Item key={priority} id={priority} onClick={handleChangePriority}>
            <Badge color={priorityColor(priority)} pill={true}>
              {priority}
            </Badge>
          </Item>
        ))}
      </Submenu>
      {isLoadingIterations &&
        <Item disabled className="text-center"><Spinner className="m-auto" color="primary" /></Item>}
      {!isLoadingIterations && iterations.length === 0 && <Item disabled>Move to sprint</Item>}
      {!isLoadingIterations && iterations.length > 0 &&
        <Submenu label={"Move to sprint"} style={{ maxHeight: "200px", overflowY: "scroll" }}>
          {iterations.map(iteration => (
            <Item key={iteration.id} id={iteration.id}
                  onClick={handleChangeIteration}
                  style={{ maxWidth: "300px", overflowX: "hidden", whiteSpace: "nowrap" }}>
              {iteration.title} [{iteration.status}]
            </Item>
          ))}
          <Item key={"null"} id={null} onClick={handleChangeIteration}>None</Item>
        </Submenu>}

    </Menu>
  );
}

WorkItemsContextMenu.propTypes = {
  menuId: PropTypes.string.isRequired,
  onChangeIteration: PropTypes.func,
  onChangePriority: PropTypes.func,
  onChangeStatus: PropTypes.func,
  onChange: PropTypes.func
};

export default WorkItemsContextMenu;
