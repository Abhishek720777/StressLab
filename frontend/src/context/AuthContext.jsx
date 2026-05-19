import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sl_token'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sl_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (data) => {
    localStorage.setItem('sl_token', data.token)
    localStorage.setItem('sl_user', JSON.stringify({ username: data.username, email: data.email }))
    setToken(data.token)
    setUser({ username: data.username, email: data.email })
  }

  const logout = () => {
    localStorage.removeItem('sl_token')
    localStorage.removeItem('sl_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
