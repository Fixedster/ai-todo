import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'
import { message } from 'antd'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers!.Authorization = `Bearer ${token}`
            resolve(request(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const response = await axios.post(
          `${request.defaults.baseURL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        )

        const { accessToken, refreshToken: newRefreshToken } = response.data.data
        useAuthStore.getState().setToken(accessToken, newRefreshToken)
        onTokenRefreshed(accessToken)
        isRefreshing = false

        originalRequest.headers!.Authorization = `Bearer ${accessToken}`
        return request(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        useAuthStore.getState().logout()
        message.error('登录已过期，请重新登录')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    if (error.response?.data && (error.response.data as any).message) {
      message.error((error.response.data as any).message)
    }

    return Promise.reject(error)
  }
)

export default request
