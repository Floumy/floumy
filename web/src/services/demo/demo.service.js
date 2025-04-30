import api from "../api/api.service";

export async function createDemoProject(orgId, projectId, objectives) {
    try {
        await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/demo`, { objectives });
    } catch (e) {
        throw new Error(e.message);
    }
}

export async function completeDemoProject(orgId, projectId) {
    try {
        await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/demo/complete`);
    } catch (e) {
        throw new Error(e.message);
    }
}