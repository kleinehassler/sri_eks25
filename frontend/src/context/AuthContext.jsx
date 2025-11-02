import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../config/axios'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Configurar axios con el token
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const response = await axios.get('/api/auth/perfil')
      setUser(response.data.data)
    } catch (error) {
      console.error('Error al cargar usuario:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { accessToken, refreshToken, usuario } = response.data.data

      // Guardar tokens (el interceptor de axios los usará automáticamente)
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      // Guardar usuario
      setUser(usuario)

      return { success: true }
    } catch (error) {
      console.error('Error en login:', error)
      console.error('Error response:', error.response)

      let errorMessage = 'Error al iniciar sesión'

      if (error.response?.data) {
        // El backend puede devolver el error en diferentes formatos
        errorMessage = error.response.data.mensaje ||
                      error.response.data.error ||
                      error.response.data.message ||
                      errorMessage
      } else if (error.message) {
        errorMessage = error.message
      }

      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const value = {
    user,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
