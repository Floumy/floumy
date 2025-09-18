import api from '../api/api.service';
import { apiUrl } from '../../config';

export async function addWorkItem(orgId, projectId, workItem) {
  try {
    const response = await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items`,
      workItem,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listWorkItems(orgId, projectId, page = 1, limit = 50) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchWorkItemsWithOptions(
  orgId,
  projectId,
  searchOptions,
  page = 1,
  limit = 50,
) {
  try {
    const params = new URLSearchParams();

    // Add basic search params
    if (searchOptions.text) {
      params.append('q', searchOptions.text);
    }

    // Add pagination
    if (page) {
      params.append('page', page.toString());
    }
    if (limit) {
      params.append('limit', limit.toString());
    }

    // Build filters object
    const filters = {
      status:
        searchOptions.status !== 'all' ? [searchOptions.status] : undefined,
      assigneeIds:
        searchOptions.assignee !== 'all' ? [searchOptions.assignee] : undefined,
      priority:
        searchOptions.priority !== 'all' ? [searchOptions.priority] : undefined,
      type: searchOptions.type !== 'all' ? [searchOptions.type] : undefined,
      completedAt:
        searchOptions.completedAt?.start || searchOptions.completedAt?.end
          ? {
              start: searchOptions.completedAt.start || undefined,
              end: searchOptions.completedAt.end || undefined,
            }
          : undefined,
    };

    // Only add filters if there are any active ones
    if (Object.values(filters).some((v) => v !== undefined)) {
      params.append('f', JSON.stringify(filters));
    }

    const url = `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/search?${params.toString()}`;

    const response = await api.get(url);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listOpenWorkItems(orgId, projectId) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/open`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getWorkItem(orgId, projectId, id) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/${id}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicWorkItem(orgId, projectId, workItemId) {
  try {
    const response = await api.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}/work-items/${workItemId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItem(orgId, projectId, id, workItem) {
  try {
    const response = await api.put(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/${id}`,
      workItem,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteWorkItem(orgId, projectId, id) {
  try {
    await api.delete(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/${id}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItemSprint(orgId, projectId, id, sprintId) {
  try {
    await api.patch(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/${id}`,
      { sprint: sprintId },
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItemStatus(orgId, projectId, id, status) {
  try {
    await api.patch(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/${id}`,
      { status: status },
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItemPriority(orgId, projectId, id, priority) {
  try {
    await api.patch(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/${id}`,
      { priority: priority },
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addComment(orgId, projectId, workItemId, comment) {
  try {
    const response = await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/${workItemId}/comments`,
      { content: comment.content, mentions: comment.mentions },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateComment(
  orgId,
  projectId,
  workItemId,
  commentId,
  comment,
) {
  try {
    const response = await api.put(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/${workItemId}/comments/${commentId}`,
      { content: comment.content, mentions: comment.mentions },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteComment(orgId, projectId, workItemId, commentId) {
  try {
    await api.delete(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/${workItemId}/comments/${commentId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listComments(orgId, projectId, workItemId) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/${workItemId}/comments`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function changeWorkItemAssignee(
  orgId,
  projectId,
  workItemId,
  userId,
) {
  try {
    await api.patch(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/work-items/${workItemId}/assignee`,
      { assignee: userId },
    );
  } catch (e) {
    throw new Error(e.message);
  }
}
