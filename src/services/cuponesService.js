import { supabase } from '../config/supabaseClient'
import { getCurrentUser } from './authService'

export const getMisCupones = async () => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('cupones')
      .select(`
        id,
        codigo,
        estado,
        precio_pagado,
        fecha_vencimiento,
        fecha_canje,
        oferta_id,
        ofertas (
          titulo,
          precio_regular,
          precio_oferta,
          porcentaje_descuento,
          imagen_url,
          fecha_limite_uso,
          empresas ( nombre )
        )
      `)
      .eq('cliente_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data ?? [], error: null }
  } catch (error) {
    console.error('Error al obtener cupones:', error)
    return { data: null, error }
  }
}

export const comprarCuponDirecto = async ({ ofertaId, precioOferta, empresaNombre, fechaLimiteUso, ofertaData }) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('Debes iniciar sesión para comprar un cupón')

    const codigo = generarCodigo(empresaNombre)

    const { data, error } = await supabase
      .from('cupones')
      .insert([{
        codigo,
        oferta_id:         ofertaId,
        cliente_id:        user.id,
        precio_pagado:     precioOferta,
        estado:            'disponible',
        fecha_vencimiento: fechaLimiteUso,
      }])
      .select(`
        id,
        codigo,
        estado,
        precio_pagado,
        fecha_vencimiento,
        oferta_id,
        ofertas (
          titulo,
          precio_regular,
          precio_oferta,
          porcentaje_descuento,
          imagen_url,
          fecha_limite_uso,
          empresas ( nombre )
        )
      `)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al comprar cupón:', error)
    return { data: null, error }
  }
}

export const getCuponPorId = async (cuponId) => {
  try {
    const { data, error } = await supabase
      .from('cupones')
      .select(`
        id,
        codigo,
        estado,
        precio_pagado,
        fecha_vencimiento,
        fecha_canje,
        oferta_id,
        ofertas (
          titulo,
          precio_regular,
          precio_oferta,
          imagen_url,
          fecha_limite_uso,
          empresas ( nombre )
        )
      `)
      .eq('id', cuponId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

const generarCodigo = (empresaNombre = 'CUP') => {
  const prefijo = empresaNombre
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, 'X')
    .padEnd(3, 'X')
  const numeros = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  return `${prefijo}-${numeros}`
}

export const categorizarCupones = (cupones = []) => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  return cupones.reduce(
    (acc, cupon) => {
      const vencimiento = new Date(cupon.fecha_vencimiento)
      vencimiento.setHours(23, 59, 59, 999)

      if (cupon.estado === 'canjeado') {
        acc.canjeados.push(cupon)
      } else if (vencimiento < hoy || cupon.estado === 'vencido') {
        acc.vencidos.push({ ...cupon, estado: 'vencido' })
      } else {
        acc.disponibles.push(cupon)
      }
      return acc
    },
    { disponibles: [], canjeados: [], vencidos: [] }
  )
}