import api from '../api/api.service';
import { apiUrl } from '../../config';

export async function uploadFile(orgId, projectId, file, onUploadProgress) {
  try {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/files/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: function (progressEvent) {
          if (onUploadProgress)
            onUploadProgress(
              Math.round((progressEvent.loaded * 100) / progressEvent.total),
            );
        },
      },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function downloadFile(orgId, projectId, id) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/files/${id}`,
      {
        responseType: 'blob',
      },
    );
    const file = new Blob([response.data], {
      type: response.headers['content-type'],
    });

    // Create a URL for the file
    const fileURL = URL.createObjectURL(file);

    // Create a temporary anchor element and trigger the download
    const link = document.createElement('a');
    link.href = fileURL;
    const fileName = response.headers['content-disposition']
      .split('filename=')[1]
      .replace(/"/g, '');
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    // Clean up
    URL.revokeObjectURL(fileURL);
    document.body.removeChild(link);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteFile(orgId, projectId, id) {
  try {
    await api.delete(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/files/${id}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}
