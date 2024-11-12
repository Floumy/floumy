import api from "../api/api.service";
import axios from "axios";

export async function fetchFeedItems(page) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/feed?page=${page}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function fetchPublicFeedItems(orgId, page) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feed?page=${page}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addTextFeedItem(feedItemText) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/feed`, { tex: feedItemText });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}