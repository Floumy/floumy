import api from '../api/api.service';
import { apiUrl } from '../../config';

export async function generateKeyResults(objective) {
  try {
    const response = await api.get(
      `${apiUrl}/ai/key-results?objective=${objective}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function generateInitiativesForOKR(objective, keyResult) {
  try {
    const response = await api.get(
      `${apiUrl}/ai/okrs-initiatives?objective=${objective}&keyResult=${keyResult}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function generateInitiativesForRequest(
  request,
  requestDescription,
) {
  try {
    const response = await api.get(
      `${apiUrl}/ai/requests-initiatives?request=${request}&description=${requestDescription}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function generateWorkItemsForInitiative(initiative, description) {
  try {
    const response = await api.get(
      `${apiUrl}/ai/initiatives-work-items?initiative=${initiative}&description=${description}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function generateWorkItemsForIssue(issue, description) {
  try {
    const response = await api.get(
      `${apiUrl}/ai/issues-work-items?issue=${issue}&description=${description}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getWorkItemDescription(
  workItem,
  workItemType,
  initiativeId,
  issueId,
) {
  try {
    const response = await api.get(
      `${apiUrl}/ai/work-item-description?workItem=${workItem}&workItemType=${workItemType}&initiativeId=${initiativeId}&issueId=${issueId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getInitiativeDescription(
  initiative,
  keyResultId,
  milestoneId,
  requestId,
) {
  try {
    const response = await api.get(
      `${apiUrl}/ai/initiative-description?initiative=${initiative}&keyResultId=${keyResultId}&milestoneId=${milestoneId}&requestId=${requestId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function generateDemoProjectItems(description) {
  try {
    const response = await api.get(
      `${apiUrl}/ai/demo-project-items?description=${description}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
