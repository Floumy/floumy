import api from "../api/api.service";
import axios from "axios";

export async function fetchFeedItems(orgId, productId, page) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/feed?page=${page}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function fetchPublicFeedItems(orgId, productId, page) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/products/${productId}/feed?page=${page}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}