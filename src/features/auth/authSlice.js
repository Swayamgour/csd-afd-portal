import { createSlice } from '@reduxjs/toolkit'

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('csd_auth_user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

const initialState = {
  user: getStoredUser(),
  token: localStorage.getItem('csd_auth_token'),
  isAuthenticated:
    !!localStorage.getItem('csd_auth_token') &&
    !!getStoredUser(),
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