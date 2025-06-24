const statusOrder = [
  'planned',
  'ready-to-start',
  'in-progress',
  'blocked',
  'code-review',
  'testing',
  'revisions',
  'ready-for-deployment',
  'deployed',
  'done',
  'closed',
];

const priorityOrder = ['high', 'medium', 'low'];

export function sortWorkItemsByStatusOrder(workItemsByStatusAcc) {
  const sortedWorkItemsByStatusAcc = {};
  statusOrder.forEach((status) => {
    if (workItemsByStatusAcc[status]) {
      sortedWorkItemsByStatusAcc[status] = workItemsByStatusAcc[status];
    }
  });
  return sortedWorkItemsByStatusAcc;
}

export function sortWorkItemsByPriority(workItemsByStatusAcc) {
  Object.keys(workItemsByStatusAcc).forEach((status) => {
    workItemsByStatusAcc[status].sort((a, b) => {
      if (
        priorityOrder.indexOf(a.priority) < priorityOrder.indexOf(b.priority)
      ) {
        return -1;
      }
      if (
        priorityOrder.indexOf(a.priority) > priorityOrder.indexOf(b.priority)
      ) {
        return 1;
      }
      return 0;
    });

    // Within priority, sort by estimation ascending
    workItemsByStatusAcc[status].sort((a, b) => {
      if (a.priority === b.priority) {
        return a.estimation - b.estimation;
      }
      return 0;
    });
  });
}

export function groupWorkItemsByStatus(workItems) {
  return workItems.reduce((acc, workItem) => {
    if (!acc[workItem.status]) {
      acc[workItem.status] = [];
    }
    acc[workItem.status].push(workItem);
    return acc;
  }, {});
}

export function getWorkItemsGroupedByStatus(workItems) {
  let workItemsByStatus = groupWorkItemsByStatus(workItems);
  sortWorkItemsByPriority(workItemsByStatus);
  return sortWorkItemsByStatusOrder(workItemsByStatus);
}

export function filterWorkItems(
  workItems,
  filterByPriority,
  filterByType,
  filterByStatus,
) {
  return workItems
    .filter(
      (workItem) =>
        filterByPriority === 'all' || workItem.priority === filterByPriority,
    )
    .filter(
      (workItem) => filterByType === 'all' || workItem.type === filterByType,
    )
    .filter(
      (workItem) =>
        filterByStatus === 'all' || workItem.status === filterByStatus,
    );
}
