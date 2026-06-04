import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import axios from "axios"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { ApiError, OpenAPI } from "./client"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import "./index.css"
import { routeTree } from "./routeTree.gen"

OpenAPI.BASE = import.meta.env.VITE_API_URL ?? ""
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || ""
}

const clearAuth = () => {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  window.location.href = "/login"
}

// Axios response interceptor: auto-refresh on 401
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error)
    } else {
      p.resolve(token!)
    }
  })
  failedQueue = []
}

axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const req = error.config
    if (
      !error.response ||
      error.response.status !== 401 ||
      req._retry ||
      req.url?.includes("/refresh_token") ||
      req.url?.includes("/login")
    ) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) {
      clearAuth()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        req.headers.Authorization = `Bearer ${token}`
        return axios(req)
      })
    }

    req._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.get("/api/v1/auth/refresh_token", {
        headers: { Authorization: `Bearer ${refreshToken}` },
        baseURL: OpenAPI.BASE,
      })
      localStorage.setItem("access_token", data.access_token)
      processQueue(null, data.access_token)
      req.headers.Authorization = `Bearer ${data.access_token}`
      return axios(req)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuth()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

const handleApiError = (error: Error) => {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      clearAuth()
    }
  }
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
