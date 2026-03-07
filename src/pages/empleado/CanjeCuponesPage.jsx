import { useState } from 'react'
import { canjearCupon } from '../../services/empleadoService'
import { useAuth } from '../../context/AuthContext'

const ESTADO = {
  IDLE:    'idle',
  LOADING: 'loading',
  EXITO:   'exito',
  ERROR:   'error',
}

export default function CanjeCuponesPage() {
  const { perfil } = useAuth()

  const [codigo, setCodigo]   = useState('')
  const [dui, setDui]         = useState('')
  const [estado, setEstado]   = useState(ESTADO.IDLE)
  const [errorMsg, setErrorMsg] = useState('')
  const [cuponCanjeado, setCuponCanjeado] = useState(null)

  const handleCanjear = async () => {
    if (!codigo.trim() || !dui.trim()) {
      setErrorMsg('Debes ingresar el código del cupón y el DUI del cliente.')
      setEstado(ESTADO.ERROR)
      return
    }

    setEstado(ESTADO.LOADING)
    setErrorMsg('')
    setCuponCanjeado(null)

    const { data, error } = await canjearCupon(codigo, dui)

    if (error) {
      setErrorMsg(typeof error === 'string' ? error : 'Error al procesar el canje.')
      setEstado(ESTADO.ERROR)
    } else {
      setCuponCanjeado(data)
      setEstado(ESTADO.EXITO)
    }
  }

  const handleReset = () => {
    setCodigo('')
    setDui('')
    setEstado(ESTADO.IDLE)
    setErrorMsg('')
    setCuponCanjeado(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div
        className="text-white py-7 px-6 shadow"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-black">Canje de cupones</h1>
          <p className="text-orange-100 text-sm mt-0.5">
            Bienvenido, {perfil?.nombre}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Título interior */}
          <div
            className="px-6 py-4 border-b border-gray-100"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
          >
            <h2 className="text-white font-black text-lg text-center">
              Modificacion de empresa
            </h2>
          </div>

          <div className="p-6">

            {/* Campo código del cupón */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                Código del cupón
              </label>
              <input
                type="text"
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleCanjear()}
                placeholder="Ej: ELB-0012345"
                disabled={estado === ESTADO.LOADING || estado === ESTADO.EXITO}
                className="w-full sm:w-64 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 disabled:opacity-50 transition"
              />
            </div>

            {/* Dos áreas de información */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Información del cupón
                </label>
                <textarea
                  readOnly
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 resize-none text-gray-600"
                  value={
                    cuponCanjeado
                      ? `Oferta: ${cuponCanjeado.oferta?.titulo}\nPrecio pagado: $${cuponCanjeado.precio_pagado}\nVencimiento: ${cuponCanjeado.fecha_vencimiento}`
                      : ''
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Información de la persona que compró el cupón
                </label>
                <textarea
                  readOnly
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 resize-none text-gray-600"
                  value={
                    cuponCanjeado
                      ? `DUI: ${cuponCanjeado.dui_canje}\nFecha canje: ${new Date(cuponCanjeado.fecha_canje).toLocaleDateString()}`
                      : dui ? `DUI: ${dui}` : ''
                  }
                />
              </div>
            </div>

            {/* Campo DUI */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                DUI del cliente
              </label>
              <input
                type="text"
                value={dui}
                onChange={e => setDui(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCanjear()}
                placeholder="00000000-0"
                disabled={estado === ESTADO.LOADING || estado === ESTADO.EXITO}
                className="w-full sm:w-64 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 disabled:opacity-50 transition"
              />
            </div>

            {/* Resultado: éxito */}
            {estado === ESTADO.EXITO && (
              <div
                className="rounded-xl px-6 py-5 mb-6 text-center"
                style={{ background: 'linear-gradient(135deg, #b91c1c, #991b1b)' }}
              >
                <p className="text-white font-black text-lg">Cupón canjeado con éxito</p>
                <p className="text-red-200 text-sm mt-1">{cuponCanjeado?.oferta?.titulo}</p>
              </div>
            )}

            {/* Resultado: error */}
            {estado === ESTADO.ERROR && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
                <p className="text-red-700 font-semibold text-sm">{errorMsg}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3">
              {estado === ESTADO.EXITO ? (
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 text-sm text-white font-bold rounded-full hover:opacity-90 transition"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  Canjear otro cupón
                </button>
              ) : (
                <button
                  onClick={handleCanjear}
                  disabled={estado === ESTADO.LOADING}
                  className="px-6 py-2.5 text-sm text-white font-bold rounded-full hover:opacity-90 transition disabled:opacity-60 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  {estado === ESTADO.LOADING ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Validando...
                    </>
                  ) : 'Canjear cupón'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}