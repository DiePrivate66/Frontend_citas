export const apiBaseUrl = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status)
  }

  return response.json() as Promise<T>
}

export function authApiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)

  return apiFetch<T>(path, {
    ...options,
    headers,
  })
}

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] }
    if (Array.isArray(body.message)) {
      return body.message.join(' ')
    }

    return body.message ?? `API request failed: ${response.status}`
  } catch {
    return `API request failed: ${response.status}`
  }
}
