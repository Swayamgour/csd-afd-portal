import { createSlice } from '@reduxjs/toolkit'

const getStoredUser = () => {
  try {
    const token = localStorage.getItem('csd_auth_token')
    if (!token || token === 'csd_demo_token_active') return null
    const userStr = localStorage.getItem('csd_auth_user')
    if (!userStr) return null
    const user = JSON.parse(userStr)
    if (user?.id === 'USR-BEN-001' || user?.username === 'JC-765432X') return null
    return user
  } catch {
    return null
  }
}

const getStoredToken = () => {
  const token = localStorage.getItem('csd_auth_token')
  if (!token || token === 'csd_demo_token_active' || !getStoredUser()) return null
  return token
}

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredUser() && !!getStoredToken(),
  loading: false,
}

const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload

      state.user = user
      state.token = token
      state.isAuthenticated = true

      if (user) {
        localStorage.setItem(
          'csd_auth_user',
          JSON.stringify(user)
        )
      }

      if (token) {
        localStorage.setItem('csd_auth_token', token)
      }
    },

    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      }

      localStorage.setItem(
        'csd_auth_user',
        JSON.stringify(state.user)
      )
    },

    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false

      localStorage.removeItem('csd_auth_user')
      localStorage.removeItem('csd_auth_role')
      localStorage.removeItem('csd_auth_token')
    },
  },
})

export const {
  setCredentials,
  updateUser,
  logout,
} = authSlice.actions

export default authSlice.reducer