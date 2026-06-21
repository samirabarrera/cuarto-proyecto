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

/* ── Transactions ───────────────────── */
export const getTransactions = (params = {}) =>
  api.get('/transactions', { params })

export const createTransaction = (data) =>
  api.post('/transactions', data)

export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, data)

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`)

/* ── Summary  */
export const getSummary = (month) =>
  api.get('/summary', { params: { month } })

export const getSummaryByCategory = (month, type = 'expense') =>
  api.get('/summary/by-category', { params: { month, type } })

export const getMonthlyTrend = () =>
  api.get('/summary/monthly-trend')

/*TIPS*/
export const getDailyTip = () =>
  api.get('/tips')

export const getRandomTip = () =>
  api.get('/tips/random')

export default api
