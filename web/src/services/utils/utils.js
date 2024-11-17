import React from "react";
import { colors } from "../../variables/charts";

export function formatHyphenatedString(str) {
  if (!str) return "";
  return str.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export function trimText(text, maxLength = 50) {
  if (!text) return "";

  return text && text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

export function priorityColor(priority) {
  const priorityMap = {
    "high": "danger",
    "medium": "warning",
    "low": "success"
  };
  return priorityMap[priority];
}

function padNumber(number) {
  return number < 10 ? "0" + number : number;
}

export function formatDate(date) {
  // Add leading zero to single digit numbers
  const dateObj = new Date(date);
  return dateObj.getFullYear() + "-" + padNumber(dateObj.getMonth() + 1) + "-" + padNumber(dateObj.getDate());
}

export function formatDateWithTime(date) {
  // Add leading zero to single digit numbers

  const dateObj = new Date(date);
  return dateObj.getFullYear() + "-" + padNumber(dateObj.getMonth() + 1) + "-" + padNumber(dateObj.getDate()) + " " + padNumber(dateObj.getHours()) + ":" + padNumber(dateObj.getMinutes());
}

export function workItemTypeIcon(type) {
  const typeMap = {
    "user-story": <i className="fas fa-user text-green pl-0 mr-2" />,
    "bug": <i className="fas fa-bug text-red pl-0 mr-2" />,
    "task": <i className="fas fa-tasks text-blue pl-0 mr-2" />,
    "technical-debt": <i className="fas fa-code text-warning pl-0 mr-2" />,
    "spike": <i className="fas fa-bolt text-info pl-0 mr-2" />
  };
  return typeMap[type];
}

export function workItemStatusColorClassName(status) {
  const statusMap = {
    "planned": "bg-warning",
    "ready-to-start": "bg-info",
    "in-progress": "bg-primary",
    "blocked": "bg-danger",
    "code-review": "bg-purple",
    "testing": "bg-purple",
    "revisions": "bg-purple",
    "ready-for-deployment": "bg-purple",
    "deployed": "bg-purple",
    "done": "bg-success",
    "closed": "bg-gray"
  };
  return statusMap[status];
}

export function workItemsColorVariable(status) {
  const statusMap = {
    "planned": colors.theme.warning,
    "ready-to-start": colors.theme.info,
    "in-progress": colors.theme.primary,
    "blocked": colors.theme.danger,
    "code-review": colors.purple["900"],
    "testing": colors.purple["900"],
    "revisions": colors.purple["900"],
    "ready-for-deployment": colors.purple["900"],
    "deployed": colors.purple["900"],
    "done": colors.theme.success,
    "closed": colors.gray["600"]
  };
  return statusMap[status];
}

export function workItemsTypeColorVariable(type) {
  const typeMap = {
    "user-story": colors.theme.success,
    "bug": colors.theme.danger,
    "task": colors.theme.info,
    "technical-debt": colors.theme.warning,
    "spike": colors.theme.primary
  };
  return typeMap[type];
}

export function formatWorkItemTypeName(type) {
  const typeMap = {
    "user-story": "User Story",
    "bug": "Bug",
    "task": "Task",
    "technical-debt": "Technical Debt",
    "spike": "Spike"
  };
  return typeMap[type];
}

export function formatWorkItemStatusName(status) {
  const statusMap = {
    "planned": "Planned",
    "ready-to-start": "Ready to Start",
    "in-progress": "In Progress",
    "blocked": "Blocked",
    "code-review": "Code Review",
    "testing": "Testing",
    "revisions": "Revisions",
    "ready-for-deployment": "Ready for Deployment",
    "deployed": "Deployed",
    "done": "Done",
    "closed": "Closed"
  };
  return statusMap[status];
}

export function featureStatusColorClassName(status) {
  const statusMap = {
    "pending": "bg-warning",
    "approved": "bg-info",
    "planned": "bg-info",
    "ready-to-start": "bg-info",
    "in-progress": "bg-primary",
    "completed": "bg-success",
    "closed": "bg-gray"
  };
  return statusMap[status];
}

export function okrStatusColorClassName(status) {
  const statusMap = {
    "on-track": "bg-success",
    "off-track": "bg-danger",
    "at-risk": "bg-warning",
    "ahead-of-schedule": "bg-info",
    "completed": "bg-success",
    "stalled": "bg-warning",
    "deferred": "bg-info",
    "canceled": "bg-danger",
    "under-review": "bg-info",
    "needs-attention": "bg-warning"
  };
  return statusMap[status];
}

export function sortByPriority(arr) {
  const priorityMap = {
    "high": 1,
    "medium": 2,
    "low": 3
  };
  return arr.sort((a, b) => {
    return priorityMap[a.priority] < priorityMap[b.priority] ? -1 : 1;
  });
}

export function formatOKRsProgress(progress) {
  return (progress * 100).toFixed(0);
}

export function formatProgress(progress) {
  return Math.round(progress).toFixed(0);
}

export function memberNameInitials(name) {
  return name.split(" ").map(word => word.charAt(0)).join("");
}

export function textToColor(inputText) {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < inputText.length; i++) {
    hash = inputText.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash into a color
  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ("00" + value.toString(16)).substr(-2);
  }

  return color;
}

function calculateEndDate(startDate, duration) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + duration * 7 - 1);
  return date;
}

export function getIterationStartDate(iteration) {
  if (iteration.actualStartDate) {
    return new Date(iteration.actualStartDate);
  }
  return new Date(iteration.startDate);
}

export function getIterationEndDate(iteration) {
  if (iteration.actualEndDate) {
    return new Date(iteration.actualEndDate);
  }
  if (iteration.actualStartDate) {
    return calculateEndDate(iteration.actualStartDate, iteration.duration);
  }
  return new Date(iteration.endDate);
}

export function workItemTypeName(type) {
  if (!type) return "";
  const typeMap = {
    "user-story": "User Story",
    "bug": "Bug",
    "task": "Task",
    "technical-debt": "Technical Debt",
    "spike": "Spike"
  };
  return typeMap[type];
}

export function priorityName(priority) {
  if (!priority) return "";
  const priorityMap = {
    "high": "High",
    "medium": "Medium",
    "low": "Low"
  };
  return priorityMap[priority];
}

export function workItemStatusName(status) {
  if (!status) return "";
  const statusMap = {
    "planned": "Planned",
    "ready-to-start": "Ready to Start",
    "in-progress": "In Progress",
    "blocked": "Blocked",
    "code-review": "Code Review",
    "testing": "Testing",
    "revisions": "Revisions",
    "ready-for-deployment": "Ready for Deployment",
    "deployed": "Deployed",
    "done": "Done",
    "closed": "Closed"
  };
  return statusMap[status];
}

export function featureStatusName(status) {
  if (!status) return "";
  const statusMap = {
    "planned": "Planned",
    "ready-to-start": "Ready to Start",
    "in-progress": "In Progress",
    "completed": "Completed",
    "closed": "Closed"
  };
  return statusMap[status];
}

export function keyResultStatusName(status) {
  if (!status) return "";
  const statusMap = {
    "on-track": "On Track",
    "off-track": "Off Track",
    "at-risk": "At Risk",
    "ahead-of-schedule": "Ahead of Schedule",
    "completed": "Completed",
    "stalled": "Stalled",
    "deferred": "Deferred",
    "canceled": "Canceled",
    "under-review": "Under Review",
    "needs-attention": "Needs Attention"
  };
  return statusMap[status];
}

export function formatTimeline(timeline) {
  if (!timeline) return "";
  const timelineMap = {
    "past": "Past",
    "this-quarter": "This Quarter",
    "next-quarter": "Next Quarter",
    "later": "Later"
  };
  return timelineMap[timeline];
}

export function dateToQuarterAndYear(date) {
  const quarter = Math.floor((date.getMonth() + 3) / 3);
  return "Q" + quarter + " " + date.getFullYear();
}
