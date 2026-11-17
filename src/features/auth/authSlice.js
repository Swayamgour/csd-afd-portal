import { createSlice } from '@reduxjs/toolkit'
import { getAccessToken, setTokens, clearTokens } from '../../utils/tokenStorage.js'

const getStoredUser = () => {
  try {
    const token = getAccessToken()
    if (!token) return null
    const userStr = localStorage.getItem('csd_auth_user')
    if (!userStr) return null
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

const getStoredToken = () => {
  const token = getAccessToken()
  if (!token || !getStoredUser()) return null
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
        setTokens({ accessToken: token })
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

      clearTokens()
      localStorage.removeItem('csd_auth_user')
      localStorage.removeItem('csd_auth_role')
    },
  },
})

export const {
  setCredentials,
  updateUser,
  logout,
} = authSlice.actions

export default authSlice.reducer