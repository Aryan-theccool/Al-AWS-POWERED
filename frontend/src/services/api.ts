import { Auth } from 'aws-amplify'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Helper to get the current authenticated user's access token
 */
const getAuthToken = async (): Promise<string | null> => {
    try {
        const session = await Auth.currentSession()
        return session.getAccessToken().getJwtToken()
    } catch (error) {
        console.warn('Could not get auth token', error)
        return null
    }
}

/**
 * Core API request wrapper that automatically attaches the auth token
 */
async function fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getAuthToken()

    const headers = new Headers(options.headers || {})
    headers.set('Content-Type', 'application/json')

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })

    // Parse JSON response if present, otherwise handle empty body
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
        data = await response.json()
    } else {
        data = await response.text()
    }

    if (!response.ok) {
        const errorMessage = data?.message || data?.error || response.statusText
        throw new Error(errorMessage)
    }

    return data as T
}

// API Service exported methods
export const api = {
    // Projects
    createProject: (projectData: any) =>
        fetchWithAuth('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData),
        }),

    getProjects: () =>
        fetchWithAuth('/projects', {
            method: 'GET',
        }),

    getProject: (projectId: string) =>
        fetchWithAuth(`/projects/${projectId}`, {
            method: 'GET',
        }),
}
