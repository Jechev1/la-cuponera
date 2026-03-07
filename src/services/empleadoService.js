import { supabase } from '../config/supabaseClient'
import { getCurrentUser } from './authService'

// HELPER: obtener datos del empleado logueado 
const getEmpleadoActual = () => {
  const user = getCurrentUser()
  return {
    id:        user?.id ?? null,
    empresaId: user?.empresaId ?? null,
  }
}

//  CANJE DE CUPONES
/**
 * Buscar un cupón por su código
 * Retorna la info del cupón + la oferta asociada + el cliente
 * @param {string} codigo - código del cupón ingresado
 */
export const getCuponPorCodigo = async (codigo) => {
  try {
    const { data, error } = await supabase
      .from('cupones')
      .select(`
        id,
        codigo,
        estado,
        fecha_vencimiento,
        fecha_canje,
        dui_canje,
        precio_pagado,
        cliente_id,
        oferta_id,
        oferta:oferta_id (
          id,
          titulo,
          empresa_id,
          precio_oferta,
          fecha_limite_uso
        )
      `)
      .eq('codigo', codigo.trim().toUpperCase())
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al buscar cupón:', error)
    return { data: null, error }
  }
}

/**
 * Validar y canjear un cupón
 * Verifica:
 *  1. Que el cupón exista
 *  2. Que no haya sido canjeado
 *  3. Que el DUI coincida con el comprador
 *  4. Que no esté vencido
 *  5. Que la oferta pertenezca a la empresa del empleado
 *
 * @param {string} codigo  - código del cupón
 * @param {string} dui     - DUI ingresado por el empleado
 */
export const canjearCupon = async (codigo, dui) => {
  try {
    const { empresaId, id: empleadoId } = getEmpleadoActual()
    if (!empresaId) throw new Error('No se encontró empresa asociada')

    // 1. Buscar el cupón
    const { data: cupon, error: errorBusqueda } = await getCuponPorCodigo(codigo)

    if (errorBusqueda || !cupon) {
      return { data: null, error: 'El código de cupón no existe o es inválido.' }
    }

    // 2. Verificar que no esté ya canjeado
    if (cupon.estado === 'canjeado') {
      return { data: null, error: 'Este cupón ya fue canjeado anteriormente.' }
    }

    // 3. Verificar que no esté vencido
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const vencimiento = new Date(cupon.fecha_vencimiento)
    vencimiento.setHours(23, 59, 59, 999)

    if (vencimiento < hoy) {
      return { data: null, error: `Este cupón venció el ${cupon.fecha_vencimiento}.` }
    }

    // 4. Verificar que la oferta pertenezca a esta empresa
    if (cupon.oferta?.empresa_id !== empresaId) {
      return { data: null, error: 'Este cupón no corresponde a tu empresa.' }
    }

    // 5. Verificar DUI contra el cliente comprador
    const { data: cliente, error: errorCliente } = await supabase
      .from('clientes')
      .select('dui')
      .eq('id', cupon.cliente_id)
      .single()

    if (errorCliente || !cliente) {
      return { data: null, error: 'No se pudo verificar el comprador del cupón.' }
    }

    if (cliente.dui !== dui.trim()) {
      return { data: null, error: 'El DUI no coincide con el comprador del cupón.' }
    }

    // 6. Si todo es válido, marcar como canjeado
    const { data: cuponCanjeado, error: errorCanje } = await supabase
      .from('cupones')
      .update({
        estado:      'canjeado',
        fecha_canje: new Date().toISOString(),
        dui_canje:   dui.trim(),
      })
      .eq('id', cupon.id)
      .select()
      .single()

    if (errorCanje) throw errorCanje

    return {
      data: {
        ...cuponCanjeado,
        oferta: cupon.oferta,
      },
      error: null
    }
  } catch (error) {
    console.error('Error al canjear cupón:', error)
    return { data: null, error: 'Ocurrió un error al procesar el canje.' }
  }
}