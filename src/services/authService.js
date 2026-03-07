import { supabase } from '../config/supabaseClient'

/**
 * SERVICIO DE AUTENTICACIÓN UNIFICADO - FASE 2
 * Maneja login para clientes, admin empresa y empleados
 */

// Login unificado (detecta automáticamente el tipo de usuario)
export const login = async (email, password) => {
  try {
    const { data, error } = await supabase
      .rpc('login_usuario', {
        p_email: email,
        p_password: password
      })

    if (error) throw error

    const result = data[0]

    if (result.success) {
      // Guardar en localStorage
      const userData = {
        id: result.user_id,
        type: result.user_type, // 'cliente', 'admin_empresa', o 'empleado'
        name: result.user_name,
        empresaId: result.empresa_id,
        email: email
      }
      localStorage.setItem('user', JSON.stringify(userData))
      return { data: userData, error: null }
    } else {
      return { data: null, error: result.mensaje }
    }
  } catch (error) {
    console.error('Error en login:', error)
    return { data: null, error: 'Error al iniciar sesión' }
  }
}

// Registro de cliente
export const registrarCliente = async (clienteData) => {
  try {
    const { data, error } = await supabase
      .rpc('registrar_cliente', {
        p_nombres: clienteData.nombres,
        p_apellidos: clienteData.apellidos,
        p_email: clienteData.email,
        p_telefono: clienteData.telefono,
        p_direccion: clienteData.direccion,
        p_dui: clienteData.dui,
        p_password: clienteData.password
      })

    if (error) throw error

    const result = data[0]

    if (result.success) {
      return { data: result, error: null }
    } else {
      return { data: null, error: result.mensaje }
    }
  } catch (error) {
    console.error('Error en registro:', error)
    return { data: null, error: 'Error al registrar cliente' }
  }
}

// Recuperar contraseña (placeholder)
export const recuperarContrasena = async (email) => {
  // TODO: Implementar recuperación de contraseña en fase futura
  console.log('Recuperar contraseña para:', email)
  return { error: null, mensaje: 'Se ha enviado un correo de recuperación' }
}

// Alias para compatibilidad con código existente
export const iniciarSesion = login

// Logout
export const logout = () => {
  localStorage.removeItem('user')
}

// Alias para compatibilidad
export const cerrarSesion = logout

// Obtener usuario actual
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// Alias para compatibilidad
export const obtenerUsuarioActual = () => {
  return { user: getCurrentUser(), error: null }
}

// Obtener sesión (para compatibilidad)
export const obtenerSesion = () => {
  const user = getCurrentUser()
  return { session: user ? { user } : null, error: null }
}

// Verificar si está autenticado
export const isAuthenticated = () => {
  return getCurrentUser() !== null
}

// Verificar rol específico
export const hasRole = (role) => {
  const user = getCurrentUser()
  return user && user.type === role
}

// Verificar si es cliente
export const isCliente = () => hasRole('cliente')

// Verificar si es admin de empresa
export const isAdminEmpresa = () => hasRole('admin_empresa')

// Verificar si es empleado
export const isEmpleado = () => hasRole('empleado')