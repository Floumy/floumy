import {
  formatHyphenatedString,
  formatOKRsProgress,
  formatTimeline,
  formatWorkItemStatusName,
  formatWorkItemTypeName,
  priorityName
} from "../../../services/utils/utils";
import api from "../../../services/api/api.service";

export function getWorkItemUpdates(item) {
  const updates = [];
  const current = item.content.current;
  const previous = item.content.previous;

  if (current.title !== previous.title) {
    updates.push(`Title changed from "${previous.title}" to "${current.title}"`);
  }

  if (current.description !== previous.description) {
    updates.push(`Description changed`);
  }

  if (current.status !== previous.status) {
    updates.push(`Status changed from "${formatWorkItemStatusName(previous.status)}" to "${formatWorkItemStatusName(current.status)}"`);
  }

  if (current.type !== previous.type) {
    updates.push(`Type changed from "${formatWorkItemTypeName(previous.type)}" to "${formatWorkItemTypeName(current.type)}"`);
  }

  if (current.priority !== previous.priority) {
    updates.push(`Priority changed from "${priorityName(previous.priority)}" to "${priorityName(current.priority)}"`);
  }

  if (current.estimation !== previous.estimation) {
    updates.push(`Estimation changed from ${previous?.estimation || "None"} to ${current?.estimation || "None"}`);
  }

  if (current?.assignedTo?.id !== previous?.assignedTo?.id) {
    updates.push(`Asignee changed to "${current?.assignedTo?.name || "None"}"`);
  }

  if (current?.sprint?.id !== previous?.sprint?.id) {
    updates.push(`Sprint changed to "${current?.sprint?.title || "None"}"`);
  }

  if (current?.initiative?.id !== previous?.initiative?.id) {
    updates.push(`Initiative changed to "${current?.initiative?.title || "None"}"`);
  }

  if (updates.length === 0) {
    updates.push("No changes");
  }

  return updates;
}

export function getOkrUpdates(item) {
  const updates = [];
  const current = item.content.current;
  const previous = item.content.previous;

  if (current.objective.title !== previous.objective.title) {
    updates.push(`Title changed from "${previous.objective.title}" to "${current.objective.title}"`);
  }

  if (current.objective.status !== previous.objective.status) {
    updates.push(`Status changed from "${formatHyphenatedString(previous.objective.status)}" to "${formatHyphenatedString(current.objective.status)}"`);
  }

  if (current.objective.progress !== previous.objective.progress) {
    updates.push(`Progress changed from ${formatOKRsProgress(previous.objective.progress)}% to ${formatOKRsProgress(current.objective.progress)}%`);
  }

  if (current.objective.timeline !== previous.objective.timeline) {
    updates.push(`Timeline changed from "${formatTimeline(previous.objective.timeline)}" to "${formatTimeline(current.objective.timeline)}"`);
  }

  if (current.keyResults.map(kr => kr.id).sort().join(",") !== previous.keyResults.map(kr => kr.id).sort().join(",")) {
    updates.push(`Key results changed`);
  }

  if (current.objective.assignedTo !== previous.objective.assignedTo) {
    updates.push(`Asignee changed to "${current.objective.assignedTo?.name || "None"}"`);
  }

  if (updates.length === 0) {
    updates.push("No changes");
  }

  return updates;
}

export function getKeyResultUpdates(item) {
  const updates = [];
  const current = item.content.current;
  const previous = item.content.previous;

  if (current.title !== previous.title) {
    updates.push(`Title changed from "${previous.title}" to "${current.title}"`);
  }

  if (current.status !== previous.status) {
    updates.push(`Status changed from "${formatHyphenatedString(previous.status)}" to "${formatHyphenatedString(current.status)}"`);
  }

  if (current.progress !== previous.progress) {
    updates.push(`Progress changed from ${formatOKRsProgress(previous.progress)}% to ${formatOKRsProgress(current.progress)}%`);
  }

  if (current.timeline !== previous.timeline) {
    updates.push(`Timeline changed from "${formatTimeline(previous.timeline)}" to "${formatTimeline(current.timeline)}"`);
  }

  if (updates.length === 0) {
    updates.push("No changes");
  }

  return updates;

}

export function getInitiativeUpdates(item) {
  const updates = [];
  const current = item.content.current;
  const previous = item.content.previous;

  if (current.title !== previous.title) {
    updates.push(`Title changed from "${previous.title}" to "${current.title}"`);
  }

  if (current.status !== previous.status) {
    updates.push(`Status changed from "${formatHyphenatedString(previous.status)}" to "${formatHyphenatedString(current.status)}"`);
  }

  if (current.priority !== previous.priority) {
    updates.push(`Priority changed from "${priorityName(previous.priority)}" to "${priorityName(current.priority)}"`);
  }

  if (current.keyResult?.id !== previous.keyResult?.id) {
    updates.push(`Key result changed to "${current.keyResult?.title || "None"}"`);
  }

  if (current.milestone?.id !== previous.milestone?.id) {
    updates.push(`Milestone changed to "${current.milestone?.title || "None"}"`);
  }

  if (current.description !== previous.description) {
    updates.push(`Description changed`);
  }

  if (current.assignedTo !== previous.assignedTo) {
    updates.push(`Asignee changed to "${current.assignedTo?.name || "None"}"`);
  }

  if (updates.length === 0) {
    updates.push("No changes");
  }

  return updates;
}

export function getOkrTitle(item) {
  if (item.action === "updated") {
    return `${item.content.current.objective.reference}: ${item.content.current.objective.title}`;
  }

  return `${item.content.objective.reference}: ${item.content.objective.title}`;
}

export function getTitle(item) {
  if (item.action === "updated") {
    return `${item.content.current.reference}: ${item.content.current.title}`;
  }

  return `${item.content.reference}: ${item.content.title}`;
}

export function getInitiativeTitle(item) {
  if (item.action === "updated") {
    return `${item.content.current.reference}: ${item.content.current.title}`;
  }

  return `${item.content.reference}: ${item.content.title}`;
}

export async function addTextFeedItem(orgId, projectId, feedItemText) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feed`, { text: feedItemText });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}