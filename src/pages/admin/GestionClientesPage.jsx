import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClientes, getCuponesDeCliente, clasificarCupon } from '../../services/adminService'
import { FiUsers, FiChevronDown, FiTag, FiCheckCircle, FiClock, FiSearch } from 'react-icons/fi'

const TABS = [
  { key: 'disponible', label: 'Disponibles', color: 'bg-green-100 text-green-700',  icono: <FiTag /> },
  { key: 'canjeado',   label: 'Canjeados',   color: 'bg-gray-100 text-gray-600',   icono: <FiCheckCircle /> },
  { key: 'vencido',    label: 'Vencidos',    color: 'bg-red-100 text-red-600',     icono: <FiClock /> },
]

export default function GestionClientesPage() {
  const navigate = useNavigate()
  const [clientes, setClientes]     = useState([])
  const [cargando, setCargando]     = useState(true)
  const [busqueda, setBusqueda]     = useState('')

  // Detalle cliente
  const [detalleId, setDetalleId]   = useState(null)
  const [cupones, setCupones]       = useState([])
  const [tabCupon, setTabCupon]     = useState('disponible')
  const [cargandoCupones, setCargandoCupones] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      const { data } = await getClientes()
      setClientes(data ?? [])
      setCargando(false)
    }
    cargar()
  }, [])

  const abrirDetalle = async (cliente) => {
    if (detalleId === cliente.id) { setDetalleId(null); return }
    setDetalleId(cliente.id)
    setCargandoCupones(true)
    const { data } = await getCuponesDeCliente(cliente.id)
    setCupones(data ?? [])
    setCargandoCupones(false)
    setTabCupon('disponible')
  }

  const filtrados = clientes.filter(c =>
    `${c.nombres} ${c.apellidos} ${c.email} ${c.dui}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const cuponesCategorizados = cupones.reduce((acc, c) => {
    const cat = clasificarCupon(c)
    acc[cat] = [...(acc[cat] ?? []), c]
    return acc
  }, { disponible: [], canjeado: [], vencido: [] })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="text-white py-7 px-6 shadow" style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm transition">
            ← Volver
          </button>
          <div className="flex items-center gap-2">
            <FiUsers className="text-2xl" />
            <div>
              <h1 className="text-2xl font-black">Gestión de Clientes</h1>
              <p className="text-emerald-100 text-sm">{clientes.length} clientes registrados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Buscador */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 bg-gray-50 flex-1 max-w-sm">
              <FiSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o DUI..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="bg-transparent text-sm focus:outline-none w-full"
              />
            </div>
            <span className="text-sm text-gray-400">{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
          </div>

          {cargando ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FiUsers className="text-5xl mx-auto mb-3 opacity-30" />
              <p>No se encontraron clientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">DUI</th>
                    <th className="px-6 py-3">Teléfono</th>
                    <th className="px-6 py-3">Dirección</th>
                    <th className="px-6 py-3 text-center">Ver cupones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtrados.map(cliente => (
                    <>
                      <tr key={cliente.id} className={`hover:bg-gray-50 transition ${detalleId === cliente.id ? 'bg-emerald-50' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                              {cliente.nombres?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{cliente.nombres} {cliente.apellidos}</p>
                              <p className="text-xs text-gray-400">{cliente.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-700">{cliente.dui}</td>
                        <td className="px-6 py-4 text-gray-600">{cliente.telefono}</td>
                        <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{cliente.direccion}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => abrirDetalle(cliente)}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                              detalleId === cliente.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            <FiTag /> {detalleId === cliente.id ? 'Ocultar' : 'Ver cupones'}
                          </button>
                        </td>
                      </tr>

                      {/* DETALLE INLINE */}
                      {detalleId === cliente.id && (
                        <tr key={`det-${cliente.id}`}>
                          <td colSpan={5} className="bg-emerald-50 px-6 py-5 border-t border-emerald-100">
                            <h3 className="font-black text-emerald-800 mb-3 text-sm">
                              Cupones de {cliente.nombres} {cliente.apellidos}
                            </h3>

                            {/* Sub-tabs */}
                            <div className="flex gap-2 mb-4">
                              {TABS.map(t => (
                                <button key={t.key}
                                  onClick={() => setTabCupon(t.key)}
                                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                                    tabCupon === t.key ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                  }`}>
                                  {t.icono} {t.label}
                                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tabCupon === t.key ? 'bg-white/30 text-white' : t.color}`}>
                                    {cuponesCategorizados[t.key]?.length ?? 0}
                                  </span>
                                </button>
                              ))}
                            </div>

                            {cargandoCupones ? (
                              <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                              </div>
                            ) : cuponesCategorizados[tabCupon]?.length === 0 ? (
                              <p className="text-gray-400 text-sm text-center py-6">No hay cupones en esta categoría</p>
                            ) : (
                              <div className="space-y-2">
                                {cuponesCategorizados[tabCupon].map(cupon => (
                                  <div key={cupon.id} className="bg-white rounded-xl p-4 border border-emerald-100 text-sm flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                      <p className="font-semibold text-gray-800">{cupon.ofertas?.titulo}</p>
                                      <p className="text-xs text-gray-400 font-mono mt-0.5">{cupon.codigo}</p>
                                      <p className="text-xs text-gray-400 mt-0.5">Empresa: {cupon.ofertas?.empresas?.nombre}</p>
                                    </div>
                                    <div className="flex gap-4 text-right">
                                      <div>
                                        <p className="text-xs text-gray-400">Precio</p>
                                        <p className="font-black text-green-700">${cupon.ofertas?.precio_oferta}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-400">Límite uso</p>
                                        <p className="font-semibold text-gray-700">
                                          {cupon.ofertas?.fecha_limite_uso
                                            ? new Date(cupon.ofertas.fecha_limite_uso).toLocaleDateString()
                                            : '—'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-400">Comprado</p>
                                        <p className="font-semibold text-gray-700">{new Date(cupon.created_at).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
