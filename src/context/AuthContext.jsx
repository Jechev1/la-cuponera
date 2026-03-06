import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)  
  const [perfil, setPerfil] = useState(null)     
  const [cargando, setCargando] = useState(true) 

  const cargarPerfil = () => {
    const user = getCurrentUser()
    
    if (!user) {
      setUsuario(null)
      setPerfil(null)
      setCargando(false)
      return
    }
    
    // Configurar usuario y perfil desde localStorage
    setUsuario({
      id: user.id,
      email: user.email
    })
    
    setPerfil({
      id: user.id,
      email: user.email,
      nombre: user.name,
      rol: user.type, // 'cliente', 'admin_empresa', 'empleado'
      empresaId: user.empresaId
    })
    
    setCargando(false)
  }

  useEffect(() => {
    // Cargar usuario al montar
    cargarPerfil()
    
    // Escuchar cambios en localStorage (para login/logout en otras pestañas)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        cargarPerfil()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Role helpers
  const esCliente = perfil?.rol === 'cliente'
  const esAdminEmpresa = perfil?.rol === 'admin_empresa'
  const esEmpleado = perfil?.rol === 'empleado'
  const estaAutenticado = !!usuario

  const value = {
    usuario,
    perfil,
    cargando,
    estaAutenticado,
    esCliente,
    esAdminEmpresa,
    esEmpleado,
    refrescarPerfil: cargarPerfil,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para consumir el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}