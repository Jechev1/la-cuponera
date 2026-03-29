import { supabase } from '../config/supabaseClient'

// ═══════════════════════════════════════════════════════════════
//  RUBROS
// ═══════════════════════════════════════════════════════════════

export const getRubros = async () => {
  try {
    const { data, error } = await supabase
      .from('rubros')
      .select('*')
      .order('nombre')
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener rubros:', error)
    return { data: null, error }
  }
}

export const crearRubro = async ({ nombre }) => {
  try {
    const { data, error } = await supabase
      .from('rubros')
      .insert([{ nombre, activo: true }])
      .select()
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al crear rubro:', error)
    return { data: null, error }
  }
}

export const actualizarRubro = async (id, { nombre, activo }) => {
  try {
    const payload = {}
    if (nombre !== undefined) payload.nombre = nombre
    if (activo !== undefined) payload.activo = activo

    const { data, error } = await supabase
      .from('rubros')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al actualizar rubro:', error)
    return { data: null, error }
  }
}

export const eliminarRubro = async (id) => {
  try {
    const { error } = await supabase
      .from('rubros')
      .update({ activo: false })
      .eq('id', id)
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error al eliminar rubro:', error)
    return { error }
  }
}

// ═══════════════════════════════════════════════════════════════
//  EMPRESAS
// ═══════════════════════════════════════════════════════════════

export const getEmpresas = async () => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*, rubros(nombre)')
      .eq('activo', true)
      .order('nombre')
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener empresas:', error)
    return { data: null, error }
  }
}

export const getEmpresaById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*, rubros(id, nombre)')
      .eq('id', id)
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener empresa:', error)
    return { data: null, error }
  }
}

export const crearEmpresa = async (empresaData) => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .insert([{
        nombre:               empresaData.nombre,
        codigo:               empresaData.codigo.toUpperCase(),
        direccion:            empresaData.direccion,
        nombre_contacto:      empresaData.nombre_contacto,
        telefono:             empresaData.telefono,
        email:                empresaData.email,
        rubro_id:             empresaData.rubro_id,
        porcentaje_comision:  parseFloat(empresaData.porcentaje_comision),
        activo:               true,
      }])
      .select()
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al crear empresa:', error)
    return { data: null, error }
  }
}

export const actualizarEmpresa = async (id, empresaData) => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .update({
        nombre:               empresaData.nombre,
        codigo:               empresaData.codigo.toUpperCase(),
        direccion:            empresaData.direccion,
        nombre_contacto:      empresaData.nombre_contacto,
        telefono:             empresaData.telefono,
        email:                empresaData.email,
        rubro_id:             empresaData.rubro_id,
        porcentaje_comision:  parseFloat(empresaData.porcentaje_comision),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al actualizar empresa:', error)
    return { data: null, error }
  }
}

export const eliminarEmpresa = async (id) => {
  try {
    const { error } = await supabase
      .from('empresas')
      .update({ activo: false })
      .eq('id', id)
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error al eliminar empresa:', error)
    return { error }
  }
}

// ═══════════════════════════════════════════════════════════════
//  OFERTAS ADMIN (todas las empresas)
// ═══════════════════════════════════════════════════════════════

export const getOfertasDeEmpresa = async (empresaId) => {
  try {
    const { data, error } = await supabase
      .from('ofertas')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener ofertas de empresa:', error)
    return { data: null, error }
  }
}

export const getOfertasPendientes = async () => {
  try {
    const { data, error } = await supabase
      .from('ofertas')
      .select('*, empresas(nombre, codigo)')
      .eq('estado', 'en_espera')
      .order('created_at', { ascending: true })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener ofertas pendientes:', error)
    return { data: null, error }
  }
}

export const aprobarOferta = async (ofertaId) => {
  try {
    const { data, error } = await supabase
      .from('ofertas')
      .update({ estado: 'aprobada', motivo_rechazo: null })
      .eq('id', ofertaId)
      .select()
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al aprobar oferta:', error)
    return { data: null, error }
  }
}

export const rechazarOferta = async (ofertaId, motivoRechazo) => {
  try {
    const { data, error } = await supabase
      .from('ofertas')
      .update({ estado: 'rechazada', motivo_rechazo: motivoRechazo })
      .eq('id', ofertaId)
      .select()
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al rechazar oferta:', error)
    return { data: null, error }
  }
}

// ═══════════════════════════════════════════════════════════════
//  CLIENTES
// ═══════════════════════════════════════════════════════════════

export const getClientes = async () => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombres')
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    return { data: null, error }
  }
}

export const getCuponesDeCliente = async (clienteId) => {
  try {
    const { data, error } = await supabase
      .from('cupones')
      .select('*, ofertas(titulo, precio_oferta, fecha_limite_uso, empresas(nombre))')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener cupones del cliente:', error)
    return { data: null, error }
  }
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS — clasificar oferta
// ═══════════════════════════════════════════════════════════════

export const clasificarOferta = (oferta) => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const inicio = new Date(oferta.fecha_inicio)
  const fin    = new Date(oferta.fecha_fin)

  if (oferta.estado === 'rechazada')  return 'rechazada'
  if (oferta.estado === 'descartada') return 'descartada'
  if (oferta.estado === 'en_espera')  return 'en_espera'
  if (oferta.estado === 'aprobada') {
    if (inicio > hoy) return 'aprobada'
    if (fin < hoy)    return 'pasada'
    return 'activa'
  }
  return 'en_espera'
}

export const clasificarCupon = (cupon) => {
  if (cupon.estado === 'canjeado') return 'canjeado'
  const limite = new Date(cupon.ofertas?.fecha_limite_uso)
  if (limite < new Date()) return 'vencido'
  return 'disponible'
}
