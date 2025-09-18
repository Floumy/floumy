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

export async function generateInitiativesForFeatureRequest(
  featureRequest,
  featureRequestDescription,
) {
  try {
    const response = await api.get(
      `${apiUrl}/ai/feature-requests-initiatives?featureRequest=${featureRequest}&description=${featureRequestDescription}`,
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
  featureRequestId,
) {
  try {
    const response = await api.get(
      `${apiUrl}/ai/initiative-description?initiative=${initiative}&keyResultId=${keyResultId}&milestoneId=${milestoneId}&featureRequestId=${featureRequestId}`,
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
