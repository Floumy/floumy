import React, { useEffect, useState } from "react";
import { Item, Menu, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { Badge, Spinner } from "reactstrap";
import {
  featureStatusColorClassName,
  formatDate,
  formatHyphenatedString,
  priorityColor
} from "../../services/utils/utils";
import {
  listMilestones,
  updateFeatureKeyResult,
  updateFeatureMilestone,
  updateFeaturePriority,
  updateFeatureStatus
} from "../../services/roadmap/roadmap.service";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { listKeyResults } from "../../services/okrs/okrs.service";
import { useParams } from "react-router-dom";

function FeaturesContextMenu({
                               menuId,
                               onChangeMilestone,
                               onChangeKeyResult,
                               onChangeStatus,
                               onChangePriority,
                               onChange
                             }) {
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [isLoadingKeyResults, setIsLoadingKeyResults] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [keyResults, setKeyResults] = useState([]);
  const { productId, orgId } = useParams();

  useEffect(() => {
    async function fetchMilestones() {
      try {
        setIsLoadingMilestones(true);
        const milestones = await listMilestones(orgId, productId);
        setMilestones(milestones.filter((milestone) => new Date(milestone.dueDate) >= new Date()));
      } catch (e) {
        console.error("The milestones could not be loaded");
      } finally {
        setIsLoadingMilestones(false);
      }
    }

    async function fetchKeyResults() {
      try {
        setIsLoadingKeyResults(true);
        const keyResults = await listKeyResults(orgId, productId);
        setKeyResults(keyResults.filter((keyResult) => keyResult.timeline !== "past"));
      } catch (e) {
        console.error("The key results could not be loaded");
      } finally {
        setIsLoadingKeyResults(false);
      }
    }

    fetchMilestones();
    fetchKeyResults();
  }, []);

  function callChangeMilestoneCallbacks(milestoneId, features) {
    try {
      if (onChangeMilestone) {
        onChangeMilestone(features, milestoneId);
      }
      if (onChange) {
        onChange(features.map(feature => feature.id), { milestone: milestoneId });
      }
    } catch (e) {
      console.error("The callbacks could not be called");
    }
  }

  const handleChangeMilestone = async ({ id: milestoneId, event, props }) => {
    try {
      event.preventDefault();
      for (const feature of props.features) {
        await updateFeatureMilestone(orgId, productId, feature.id, milestoneId);
      }
      callChangeMilestoneCallbacks(milestoneId, props.features);
      toast.success("The features have been moved to the milestone");
    } catch (e) {
      toast.error("The features could not be moved to the milestone");
    }
  };

  function callChangeKeyResultCallbacks(keyResultId, features) {
    try {
      if (onChangeKeyResult) {
        onChangeKeyResult(features, keyResultId);
      }
      if (onChange) {
        onChange(features.map(feature => feature.id), { keyResult: keyResultId });
      }
    } catch (e) {
      console.error("The callbacks could not be called");
    }
  }

  const handleChangeKeyResult = async ({ id: keyResultId, event, props }) => {
    try {
      event.preventDefault();
      for (const feature of props.features) {
        await updateFeatureKeyResult(orgId, productId, feature.id, keyResultId);
      }
      callChangeKeyResultCallbacks(keyResultId, props.features);
      toast.success("The features have been moved to the key result");
    } catch (e) {
      toast.error("The features could not be moved to the key result");
    }
  };

  function callChangeStatusCallbacks(status, features) {
    try {
      if (onChangeStatus) {
        onChangeStatus(features, status);
      }
      if (onChange) {
        onChange(features.map(feature => feature.id), { status });
      }
    } catch (e) {
      console.error("The callbacks could not be called");
    }
  }

  const handleChangeStatus = async ({ id: status, event, props }) => {
    try {
      event.preventDefault();
      for (const feature of props.features) {
        await updateFeatureStatus(orgId, productId, feature.id, status);
      }
      callChangeStatusCallbacks(status, props.features);
      toast.success("The features have been updated");
    } catch (e) {
      toast.error("The features could not be updated");
    }
  };

  function callChangePriorityCallbacks(priority, features) {
    try {
      if (onChangePriority) {
        onChangePriority(features, priority);
      }
      if (onChange) {
        onChange(features.map(feature => feature.id), { priority });
      }
    } catch (e) {
      console.error("The callbacks could not be called");
    }
  }

  const handleChangePriority = async ({ id: priority, event, props }) => {
    try {
      event.preventDefault();
      for (const feature of props.features) {
        await updateFeaturePriority(orgId, productId, feature.id, priority);
      }
      callChangePriorityCallbacks(priority, props.features);
      toast.success("The features have been updated");
    } catch (e) {
      toast.error("The features could not be updated");
    }
  };

  const featureStatuses = [
    "planned",
    "ready-to-start",
    "in-progress",
    "completed",
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
        {featureStatuses.map(status => (
          <Item key={status} id={status} onClick={handleChangeStatus}>
            <Badge color="" className="badge-dot mr-4">
              <i className={featureStatusColorClassName(status)} />
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
      {(isLoadingMilestones || isLoadingKeyResults) &&
        <Item disabled className="text-center"><Spinner className="m-auto" color="primary" /></Item>}
      {!isLoadingMilestones && milestones.length === 0 && <Item disabled>Move to sprint</Item>}
      {!isLoadingMilestones && milestones.length > 0 &&
        <Submenu label={"Move to milestone"} style={{ maxHeight: "200px", overflowY: "scroll" }}>
          {milestones.map(milestone => (
            <Item key={milestone.id} id={milestone.id}
                  onClick={handleChangeMilestone}
                  style={{ maxWidth: "300px", overflowX: "hidden", whiteSpace: "nowrap" }}>
              {formatDate(milestone.dueDate)} | {milestone.title}
            </Item>
          ))}
          <Item key={"null"} id={null} onClick={handleChangeMilestone}>None</Item>
        </Submenu>}
      {!isLoadingKeyResults && keyResults.length === 0 && <Item disabled>Move to key result</Item>}
      {!isLoadingKeyResults && keyResults.length > 0 &&
        <Submenu label={"Move to key result"} style={{ maxHeight: "200px", overflowY: "scroll" }}>
          {keyResults.map(keyResult => (
            <Item key={keyResult.id} id={keyResult.id}
                  onClick={handleChangeKeyResult}
                  style={{ maxWidth: "300px", overflowX: "hidden", whiteSpace: "nowrap" }}>
              {keyResult.reference}: {keyResult.title}
            </Item>
          ))}
          <Item key={"null"} id={null} onClick={handleChangeKeyResult}>None</Item>
        </Submenu>}
    </Menu>
  );
}

FeaturesContextMenu.propTypes = {
  menuId: PropTypes.string.isRequired,
  onChangeMilestone: PropTypes.func,
  onChangeKeyResult: PropTypes.func,
  onChangeStatus: PropTypes.func,
  onChangePriority: PropTypes.func,
  onChange: PropTypes.func
};

export default FeaturesContextMenu;
