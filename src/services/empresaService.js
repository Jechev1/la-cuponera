import { supabase } from '../config/supabaseClient'
import { getCurrentUser } from './authService'

// HELPER: obtener empresa_id del usuario logueado 
const getEmpresaId = () => {
  const user = getCurrentUser()
  return user?.empresaId ?? null
}


//  OFERTAS
/**
 * Obtener todas las ofertas de la empresa logueada
 */
export const getOfertasEmpresa = async () => {
  try {
    const empresaId = getEmpresaId()
    if (!empresaId) throw new Error('No se encontró empresa asociada')

    const { data, error } = await supabase
      .from('ofertas')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener ofertas:', error)
    return { data: null, error }
  }
}

/**
 * Obtener ofertas de la empresa filtradas por estado
 * @param {string} estado - "en_espera" | "aprobada" | "rechazada" | "descartada"
 */
export const getOfertasPorEstado = async (estado) => {
  try {
    const empresaId = getEmpresaId()
    if (!empresaId) throw new Error('No se encontró empresa asociada')

    const { data, error } = await supabase
      .from('ofertas')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('estado', estado)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al filtrar ofertas:', error)
    return { data: null, error }
  }
}

/**
 * Registrar una nueva oferta
 * @param {object} ofertaData - datos del formulario
 */
export const crearOferta = async (ofertaData) => {
  try {
    const empresaId = getEmpresaId()
    if (!empresaId) throw new Error('No se encontró empresa asociada')

    const { data, error } = await supabase
      .from('ofertas')
      .insert([{
        empresa_id:       empresaId,
        titulo:           ofertaData.titulo,
        descripcion:      ofertaData.descripcion,
        otros_detalles:   ofertaData.otros_detalles ?? null,
        precio_regular:   ofertaData.precio_regular,
        precio_oferta:    ofertaData.precio_oferta,
        fecha_inicio:     ofertaData.fecha_inicio,
        fecha_fin:        ofertaData.fecha_fin,
        fecha_limite_uso: ofertaData.fecha_limite_uso ?? ofertaData.fecha_fin,
        cantidad_limite:  ofertaData.cantidad_limite,
        imagen_url:       ofertaData.imagen_url ?? null,
        estado:           'en_espera', // siempre inicia en espera de aprobación
        cantidad_vendida: 0,
      }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al crear oferta:', error)
    return { data: null, error }
  }
}

/**
 * Descartar una oferta (solo si está en_espera o rechazada)
 * @param {number} ofertaId
 */
export const descartarOferta = async (ofertaId) => {
  try {
    const empresaId = getEmpresaId()
    if (!empresaId) throw new Error('No se encontró empresa asociada')

    const { data, error } = await supabase
      .from('ofertas')
      .update({ estado: 'descartada' })
      .eq('id', ofertaId)
      .eq('empresa_id', empresaId) // seguridad: solo puede tocar sus propias ofertas
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al descartar oferta:', error)
    return { data: null, error }
  }
}


//  EMPLEADOS
/**
 * Obtener todos los empleados de la empresa logueada
 */
export const getEmpleadosEmpresa = async () => {
  try {
    const empresaId = getEmpresaId()
    if (!empresaId) throw new Error('No se encontró empresa asociada')

    const { data, error } = await supabase
      .from('empleados_empresa')
      .select('id, nombres, apellidos, email, activo, created_at')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .order('nombres', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener empleados:', error)
    return { data: null, error }
  }
}

/**
 * Registrar un nuevo empleado
 * @param {object} empleadoData - { nombres, apellidos, email, password }
 */
export const crearEmpleado = async (empleadoData) => {
  try {
    const empresaId = getEmpresaId()
    if (!empresaId) throw new Error('No se encontró empresa asociada')

    console.log('Llamando a registrar_empleado con:', {
      p_empresa_id: empresaId,
      p_nombres: empleadoData.nombres,
      p_apellidos: empleadoData.apellidos,
      p_email: empleadoData.email,
      p_password: empleadoData.password ? '***' : 'NO PROPORCIONADO'
    })

    const { data, error } = await supabase
      .rpc('registrar_empleado', {
        p_empresa_id: empresaId,
        p_nombres:    empleadoData.nombres,
        p_apellidos:  empleadoData.apellidos,
        p_email:      empleadoData.email,
        p_password:   empleadoData.password,
      })

    console.log('Respuesta de Supabase:', { data, error })

    if (error) {
      console.error('Error de Supabase:', error)
      throw error
    }

    if (!data || data.length === 0) {
      throw new Error('No se recibió respuesta de la función')
    }

    const result = data[0]
    console.log('Resultado parseado:', result)

    if (result.success) {
      return { data: result, error: null }
    } else {
      return { data: null, error: result.mensaje }
    }
  } catch (error) {
    console.error('Error al crear empleado:', error)
    return { data: null, error: error.message || String(error) }
  }
}

/**
 * Actualizar datos de un empleado
 * @param {number} empleadoId
 * @param {object} empleadoData - { nombres, apellidos, email }
 */
export const actualizarEmpleado = async (empleadoId, empleadoData) => {
  try {
    const empresaId = getEmpresaId()
    if (!empresaId) throw new Error('No se encontró empresa asociada')

    const { data, error } = await supabase
      .from('empleados_empresa')
      .update({
        nombres:   empleadoData.nombres,
        apellidos: empleadoData.apellidos,
        email:     empleadoData.email,
      })
      .eq('id', empleadoId)
      .eq('empresa_id', empresaId) // seguridad: solo puede tocar sus propios empleados
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al actualizar empleado:', error)
    return { data: null, error }
  }
}

/**
 * Eliminar (desactivar) un empleado
 * @param {number} empleadoId
 */
export const eliminarEmpleado = async (empleadoId) => {
  try {
    const empresaId = getEmpresaId()
    if (!empresaId) throw new Error('No se encontró empresa asociada')

    const { data, error } = await supabase
      .from('empleados_empresa')
      .update({ activo: false })
      .eq('id', empleadoId)
      .eq('empresa_id', empresaId) // seguridad
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al eliminar empleado:', error)
    return { data: null, error }
  }
}


//  EMPRESA
/**
 * Obtener datos de la empresa logueada
 */
export const getEmpresa = async () => {
  try {
    const empresaId = getEmpresaId()
    if (!empresaId) throw new Error('No se encontró empresa asociada')

    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', empresaId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener empresa:', error)
    return { data: null, error }
  }
}


//  MÉTRICAS
/**
 * Obtener métricas básicas de la empresa:
 * cupones vendidos, ingresos totales, comisión
 */
export const getMetricasEmpresa = async () => {
  try {
    const empresaId = getEmpresaId()
    if (!empresaId) throw new Error('No se encontró empresa asociada')

    // Traer todas las ofertas con sus cupones vendidos e ingresos
    const { data: ofertas, error } = await supabase
      .from('ofertas')
      .select('id, titulo, cantidad_vendida, precio_oferta, estado')
      .eq('empresa_id', empresaId)

    if (error) throw error

    const totalCupones  = ofertas.reduce((a, o) => a + (o.cantidad_vendida ?? 0), 0)
    const totalIngresos = ofertas.reduce((a, o) => a + ((o.cantidad_vendida ?? 0) * (o.precio_oferta ?? 0)), 0)

    // Obtener comisión de la empresa
    const { data: empresa } = await supabase
      .from('empresas')
      .select('porcentaje_comision')
      .eq('id', empresaId)
      .single()

    const comision = totalIngresos * ((empresa?.porcentaje_comision ?? 10) / 100)

    return {
      data: {
        totalCupones,
        totalIngresos,
        comision,
        porcentajeComision: empresa?.porcentaje_comision ?? 10,
        ofertasActivas: ofertas.filter(o => o.estado === 'aprobada').length,
      },
      error: null
    }
  } catch (error) {
    console.error('Error al obtener métricas:', error)
    return { data: null, error }
  }
}