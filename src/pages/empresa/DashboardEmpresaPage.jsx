import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { getOfertasEmpresa, getMetricasEmpresa } from '../../services/empresaService'
import { ESTADOS_OFERTA } from '../../config/constants'

// Configuración visual de cada estado
const TABS = [
  { key: 'en_espera',   label: 'En espera de aprobación', color: 'text-yellow-600', dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  { key: 'aprobada',    label: 'Aprobadas futuras',        color: 'text-blue-600',   dot: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-700'     },
  { key: 'activa',      label: 'Ofertas activas',          color: 'text-green-600',  dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700'   },
  { key: 'pasada',      label: 'Ofertas pasadas',          color: 'text-gray-500',   dot: 'bg-gray-400',   badge: 'bg-gray-100 text-gray-600'     },
  { key: 'rechazada',   label: 'Ofertas rechazadas',       color: 'text-red-600',    dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700'       },
  { key: 'descartada',  label: 'Ofertas descartadas',      color: 'text-orange-600', dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700' },
]

// Helper: clasificar oferta según fechas y estado BD 
const clasificarOferta = (oferta) => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const inicio = new Date(oferta.fecha_inicio)
  const fin    = new Date(oferta.fecha_fin)

  if (oferta.estado === ESTADOS_OFERTA.RECHAZADA)  return 'rechazada'
  if (oferta.estado === ESTADOS_OFERTA.DESCARTADA) return 'descartada'
  if (oferta.estado === ESTADOS_OFERTA.EN_ESPERA)  return 'en_espera'

  // Si está aprobada, ver si es futura, activa o pasada según fechas
  if (oferta.estado === ESTADOS_OFERTA.APROBADA) {
    if (inicio > hoy)  return 'aprobada' // futura
    if (fin   < hoy)   return 'pasada'
    return 'activa'
  }

  return 'en_espera'
}

export default function DashboardEmpresaPage() {
  const navigate = useNavigate()
  const { perfil } = useAuth()

  const [tabActiva, setTabActiva]     = useState('activa')
  const [ofertas, setOfertas]         = useState([])
  const [metricas, setMetricas]       = useState(null)
  const [cargando, setCargando]       = useState(true)
  const [cargandoMetricas, setCargandoMetricas] = useState(true)

  // Cargar ofertas 
  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      const { data, error } = await getOfertasEmpresa()
      if (error) {
        toast.error('Error al cargar las ofertas')
      } else {
        setOfertas(data ?? [])
      }
      setCargando(false)
    }
    cargar()
  }, [])

  // Cargar métricas
  useEffect(() => {
    const cargar = async () => {
      setCargandoMetricas(true)
      const { data, error } = await getMetricasEmpresa()
      if (!error) setMetricas(data)
      setCargandoMetricas(false)
    }
    cargar()
  }, [])

  // Clasificar ofertas por tab 
  const ofertasPorTab = TABS.reduce((acc, tab) => {
    acc[tab.key] = ofertas.filter(o => clasificarOferta(o) === tab.key)
    return acc
  }, {})

  const ofertasVisibles = ofertasPorTab[tabActiva] ?? []

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HEADER ── */}
      <div
        className="text-white py-8 px-6 shadow"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black tracking-tight">
            ADMINISTRADOR de la empresa
          </h1>
          <p className="text-orange-100 mt-1 text-sm">
            Bienvenido, {perfil?.nombre}
          </p>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => navigate('/dashboard-empresa/nueva-oferta')}
              className="bg-white text-orange-600 font-bold px-5 py-2 rounded-full text-sm shadow hover:bg-orange-50 transition"
            >
              + Registrar nueva oferta
            </button>
            <button
              onClick={() => navigate('/dashboard-empresa/empleados')}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-5 py-2 rounded-full text-sm border border-white/40 transition"
            >
              Gestión de empleados
            </button>
          </div>

          {/* Métricas rápidas */}
          {!cargandoMetricas && metricas && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[
                { label: 'Ofertas activas',  value: metricas.ofertasActivas },
                { label: 'Cupones vendidos', value: metricas.totalCupones },
                { label: 'Ingresos',         value: `$${metricas.totalIngresos.toLocaleString()}` },
                { label: `Comisión (${metricas.porcentajeComision}%)`, value: `$${metricas.comision.toFixed(2)}` },
              ].map(m => (
                <div key={m.label} className="bg-white/15 rounded-xl px-4 py-3">
                  <p className="text-white font-black text-xl">{m.value}</p>
                  <p className="text-orange-100 text-xs mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── TABS ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex overflow-x-auto">
            {TABS.map(tab => {
              const cantidad = ofertasPorTab[tab.key]?.length ?? 0
              const activa   = tabActiva === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setTabActiva(tab.key)}
                  className={`flex-shrink-0 flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                    activa
                      ? `border-orange-500 ${tab.color} bg-orange-50/50`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${tab.dot}`} />
                  {tab.label}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activa ? tab.badge : 'bg-gray-100 text-gray-500'}`}>
                    {cantidad}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── CONTENIDO ── */}
        {cargando ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
          </div>
        ) : ofertasVisibles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-3">📋</p>
            <p className="font-semibold text-lg">No hay ofertas en esta categoría</p>
            {tabActiva === 'en_espera' && (
              <button
                onClick={() => navigate('/dashboard-empresa/nueva-oferta')}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-full text-sm transition"
              >
                Registrar nueva oferta
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ofertasVisibles.map(oferta => (
              <OfertaCard key={oferta.id} oferta={oferta} tabActiva={tabActiva} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tarjeta de oferta ────────────────────────────────────────────────────
function OfertaCard({ oferta, tabActiva }) {
  const tab = TABS.find(t => t.key === tabActiva)
  const descuento = oferta.precio_regular > 0
    ? Math.round(((oferta.precio_regular - oferta.precio_oferta) / oferta.precio_regular) * 100)
    : 0

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100">
      {/* Imagen */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {oferta.imagen_url ? (
          <img
            src={oferta.imagen_url}
            alt={oferta.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50">
            <span className="text-4xl">🏷️</span>
          </div>
        )}

        {/* Badge descuento */}
        {descuento > 0 && (
          <span
            className="absolute top-2 right-2 text-white text-xs font-black px-2 py-1 rounded-full"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            {descuento}% OFF
          </span>
        )}

        {/* Badge estado */}
        <span className={`absolute bottom-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${tab?.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tab?.dot}`} />
          {tab?.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
          {oferta.titulo}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400 line-through text-xs">${oferta.precio_regular}</span>
          <span className="text-orange-500 font-black text-base">${oferta.precio_oferta}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>📅 {oferta.fecha_inicio}</span>
          <span>{oferta.cantidad_vendida ?? 0} vendidos</span>
        </div>
      </div>
    </div>
  )
}