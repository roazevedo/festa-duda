import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { AuthContext } from './AuthContext'

const API = import.meta.env.VITE_API_URL

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const tokenRef = useRef(token)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  const logout = useCallback(async () => {
    try {
      await axios.delete(`${API}/logout`)
    } catch { /* ignora */ }
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }, [])

  useEffect(() => {
    const verify = async () => {
      if (!tokenRef.current) { setLoading(false); return }
      try {
        const { data } = await axios.get(`${API}/profile`)
        setUser(data)
      } catch {
        await logout()
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [logout])

  // ── Guarda um token JWT recebido externamente (Google OAuth, etc.) ──
  const storeToken = useCallback((jwt, userData) => {
    localStorage.setItem('token', jwt)
    setToken(jwt)
    setUser(userData)
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`
  }, [])

  // ── Login manual ──
  const login = async (email, password) => {
    const response = await axios.post(
      `${API}/login`,
      { user: { email, password } },
      { withCredentials: false }
    )
    const jwt = response.headers['authorization']?.replace('Bearer ', '')
    if (!jwt) throw new Error('Token não recebido')
    storeToken(jwt, response.data.user)
    return response.data.user
  }

  // ── Cadastro manual ──
  const signup = async (email, password, passwordConfirmation) => {
    const response = await axios.post(
      `${API}/signup`,
      { user: { email, password, password_confirmation: passwordConfirmation } },
      { withCredentials: false }
    )
    const jwt = response.headers['authorization']?.replace('Bearer ', '')
    if (!jwt) throw new Error('Token não recebido')
    storeToken(jwt, response.data.user)
    return response.data.user
  }

  // ── Login / cadastro com Google ──
  // Recebe o credential (Google ID Token) retornado pelo @react-oauth/google
  const loginWithGoogle = async (credential) => {
    const response = await axios.post(
      `${API}/auth/google`,
      { credential },
      { withCredentials: false }
    )
    const jwt = response.headers['authorization']?.replace('Bearer ', '')
    if (!jwt) throw new Error('Token não recebido')
    storeToken(jwt, response.data.user)
    return response.data.user
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
