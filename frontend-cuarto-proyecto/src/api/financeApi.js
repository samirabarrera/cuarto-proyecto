import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
})

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

/* ── Transactions / Expenses ───────────────────── */
export const getTransactions = (params = {}) =>
  api.get('/expenses', { params })

export const createTransaction = (data) =>
  api.post('/expenses', data)

export const updateTransaction = (id, data) =>
  api.put(`/expenses/${id}`, data)

export const deleteTransaction = (id) =>
  api.delete(`/expenses/${id}`)

/* ── Categories */
export const getCategories = (params = {}) =>
  api.get('/category', { params })

/* ── Summary  */
export const getSummary = (month) =>
  api.get('/summary', { params: { month } })

export const getSummaryByCategory = (month, type = 'expense') =>
  api.get('/summary/by-category', { params: { month, type } })

export const getMonthlyTrend = () =>
  api.get('/summary/monthly-trend')

/* ── Goals */
export const getGoals = () =>
  api.get('/goals')

export const createGoal = (data) =>
  api.post('/goals', data)

export const updateGoal = (id, data) =>
  api.put(`/goals/${id}`, data)

export const deleteGoal = (id) =>
  api.delete(`/goals/${id}`)

/*TIPS*/
export const getDailyTip = () =>
  api.get('/tips')

export const getRandomTip = () =>
  api.get('/tips/random')

export default api
