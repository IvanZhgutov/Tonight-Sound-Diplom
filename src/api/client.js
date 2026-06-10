import axios from 'axios';

export const TOKEN_KEY = 'ts-token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
});

/* ------------------------------------------------------------------
   Интерцептор запросов: подставляем Bearer-токен из localStorage
------------------------------------------------------------------ */
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ------------------------------------------------------------------
   Интерцептор ответов: протух токен (401) → чистим сессию.
   Обработчик регистрирует authStore, чтобы избежать циклического импорта.
------------------------------------------------------------------ */
let onUnauthorized = null;
export const setOnUnauthorized = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

/* ------------------------------------------------------------------
   Нормализация ошибок Laravel:
   422 → первое сообщение валидации, иначе message, иначе заглушка
------------------------------------------------------------------ */
export function apiError(error) {
  const response = error.response;

  if (!response) {
    return {
      message: 'Сервер недоступен. Проверь, что API запущен.',
      errors: {},
      status: 0,
    };
  }

  const data = response.data ?? {};
  const errors = data.errors ?? {};
  const firstError = Object.values(errors)[0]?.[0];

  return {
    message: firstError || data.message || 'Что-то пошло не так. Попробуй ещё раз.',
    errors,
    status: response.status,
  };
}

export default api;
