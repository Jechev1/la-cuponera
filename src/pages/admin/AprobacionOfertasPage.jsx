import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getOfertasPendientes, aprobarOferta, rechazarOferta } from '../../services/adminService'
import { FiCheckCircle, FiXCircle, FiClock, FiAlertTriangle } from 'react-icons/fi'

export default function AprobacionOfertasPage() {
  const navigate = useNavigate()
  const [ofertas, setOfertas]       = useState([])
  const [cargando, setCargando]     = useState(true)
  const [procesando, setProcesando] = useState(null)

  // Modal rechazo
  const [modalRechazo, setModalRechazo]   = useState(false)
  const [ofertaRechazo, setOfertaRechazo] = useState(null)
  const [motivo, setMotivo]               = useState('')
  const [enviando, setEnviando]           = useState(false)

  const cargar = async () => {
    setCargando(true)
    const { data } = await getOfertasPendientes()
    setOfertas(data ?? [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const handleAprobar = async (oferta) => {
    if (!confirm(`¿Aprobar la oferta "${oferta.titulo}"?`)) return
    setProcesando(oferta.id)
    const { error } = await aprobarOferta(oferta.id)
    if (error) toast.error('Error al aprobar la oferta')
    else { toast.success('✅ Oferta aprobada'); cargar() }
    setProcesando(null)
  }

  const abrirRechazo = (oferta) => {
    setOfertaRechazo(oferta)
    setMotivo('')
    setModalRechazo(true)
  }

  const handleRechazar = async () => {
    if (!motivo.trim()) return toast.error('Debes indicar un motivo de rechazo')
    setEnviando(true)
    const { error } = await rechazarOferta(ofertaRechazo.id, motivo.trim())
    if (error) toast.error('Error al rechazar la oferta')
    else { toast.success('❌ Oferta rechazada'); setModalRechazo(false); cargar() }
    setEnviando(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="text-white py-7 px-6 shadow" style={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' }}>
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm transition">
            ← Volver
          </button>
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-2xl" />
            <div>
              <h1 className="text-2xl font-black">Aprobación de Ofertas</h1>
              <p className="text-amber-100 text-sm">
                {ofertas.length} oferta{ofertas.length !== 1 ? 's' : ''} pendiente{ofertas.length !== 1 ? 's' : ''} de revisión
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
          </div>
        ) : ofertas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <FiCheckCircle className="text-6xl mx-auto text-green-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">¡Todo al día!</h2>
            <p className="text-gray-400">No hay ofertas pendientes de revisión.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ofertas.map(oferta => {
              const descuento = oferta.precio_regular && oferta.precio_oferta
                ? Math.round((1 - oferta.precio_oferta / oferta.precio_regular) * 100)
                : 0

              return (
                <div key={oferta.id} className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                  {/* Banner empresa */}
                  <div className="bg-amber-50 border-b border-amber-100 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-black text-sm">
                        {oferta.empresas?.nombre?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-amber-900 text-sm">{oferta.empresas?.nombre}</p>
                        <p className="text-amber-600 text-xs font-mono">{oferta.empresas?.codigo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-700 text-xs">
                      <FiClock />
                      <span>Recibida: {new Date(oferta.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Cuerpo */}
                  <div className="p-5">
                    <div className="flex items-start gap-4 flex-wrap">
                      {/* Info principal */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-gray-800 mb-1">{oferta.titulo}</h3>
                        <p className="text-gray-500 text-sm mb-3">{oferta.descripcion}</p>
                        {oferta.otros_detalles && (
                          <p className="text-gray-400 text-xs mb-3 italic">{oferta.otros_detalles}</p>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-0.5">Precio regular</p>
                            <p className="font-bold text-gray-500 line-through">${oferta.precio_regular}</p>
                          </div>
                          <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-0.5">Precio oferta</p>
                            <p className="font-black text-green-700">${oferta.precio_oferta}</p>
                          </div>
                          <div className="bg-orange-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-0.5">Descuento</p>
                            <p className="font-black text-orange-600">{descuento}% OFF</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-0.5">Inicio</p>
                            <p className="font-semibold text-gray-700">{new Date(oferta.fecha_inicio).toLocaleDateString()}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-0.5">Fin</p>
                            <p className="font-semibold text-gray-700">{new Date(oferta.fecha_fin).toLocaleDateString()}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-0.5">Límite uso</p>
                            <p className="font-semibold text-gray-700">{new Date(oferta.fecha_limite_uso).toLocaleDateString()}</p>
                          </div>
                          {oferta.cantidad_limite && (
                            <div className="bg-blue-50 rounded-xl p-3">
                              <p className="text-xs text-gray-400 mb-0.5">Cupones límite</p>
                              <p className="font-black text-blue-700">{oferta.cantidad_limite}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Imagen */}
                      {oferta.imagen_url && (
                        <img src={oferta.imagen_url} alt={oferta.titulo}
                          className="w-32 h-32 object-cover rounded-xl border border-gray-100 shrink-0" />
                      )}
                    </div>

                    {/* Botones acción */}
                    <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleAprobar(oferta)}
                        disabled={procesando === oferta.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm transition disabled:opacity-50"
                      >
                        <FiCheckCircle />
                        {procesando === oferta.id ? 'Procesando...' : 'Aprobar oferta'}
                      </button>
                      <button
                        onClick={() => abrirRechazo(oferta)}
                        disabled={procesando === oferta.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition disabled:opacity-50"
                      >
                        <FiXCircle />
                        Rechazar oferta
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL RECHAZO */}
      {modalRechazo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-2"><FiAlertTriangle className="text-red-600 text-xl" /></div>
              <h2 className="text-lg font-black text-gray-800">Rechazar oferta</h2>
            </div>
            <p className="text-gray-600 text-sm mb-1">
              Oferta: <span className="font-semibold">{ofertaRechazo?.titulo}</span>
            </p>
            <p className="text-gray-500 text-xs mb-4">
              La empresa será notificada del motivo de rechazo y podrá editar o descartar su oferta.
            </p>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo de rechazo *</label>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              rows={4}
              placeholder="Explica el motivo por el cual se rechaza esta oferta..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-5"
            />
            <div className="flex gap-3">
              <button onClick={() => setModalRechazo(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleRechazar} disabled={enviando}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition">
                <FiXCircle />
                {enviando ? 'Rechazando...' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
