import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getEmpresas, crearEmpresa, actualizarEmpresa, eliminarEmpresa, getRubros,
  getOfertasDeEmpresa, clasificarOferta
} from '../../services/adminService'
import { FiBriefcase, FiEdit2, FiTrash2, FiPlus, FiX, FiSave, FiEye, FiChevronDown } from 'react-icons/fi'

const TABS_OFERTA = [
  { key: 'en_espera',  label: 'En espera',     badge: 'bg-yellow-100 text-yellow-700' },
  { key: 'aprobada',   label: 'Aprobadas fut.', badge: 'bg-blue-100 text-blue-700'   },
  { key: 'activa',     label: 'Activas',        badge: 'bg-green-100 text-green-700' },
  { key: 'pasada',     label: 'Pasadas',        badge: 'bg-gray-100 text-gray-600'   },
  { key: 'rechazada',  label: 'Rechazadas',     badge: 'bg-red-100 text-red-700'     },
  { key: 'descartada', label: 'Descartadas',    badge: 'bg-orange-100 text-orange-700'},
]

const CAMPO_VACIO = {
  nombre: '', codigo: '', direccion: '', nombre_contacto: '',
  telefono: '', email: '', rubro_id: '', porcentaje_comision: '',
}

export default function GestionEmpresasPage() {
  const navigate = useNavigate()
  const [empresas, setEmpresas]       = useState([])
  const [rubros, setRubros]           = useState([])
  const [cargando, setCargando]       = useState(true)
  const [busqueda, setBusqueda]       = useState('')
  const [modal, setModal]             = useState(false)
  const [editando, setEditando]       = useState(null)
  const [form, setForm]               = useState(CAMPO_VACIO)
  const [guardando, setGuardando]     = useState(false)
  const [errores, setErrores]         = useState({})

  // Panel detalle empresa
  const [detalleId, setDetalleId]     = useState(null)
  const [ofertas, setOfertas]         = useState([])
  const [tabOferta, setTabOferta]     = useState('activa')
  const [cargandoOfertas, setCargandoOfertas] = useState(false)

  const cargar = async () => {
    setCargando(true)
    const [resEmp, resRub] = await Promise.all([getEmpresas(), getRubros()])
    setEmpresas(resEmp.data ?? [])
    setRubros(resRub.data ?? [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const abrirDetalle = async (empresa) => {
    if (detalleId === empresa.id) { setDetalleId(null); return }
    setDetalleId(empresa.id)
    setCargandoOfertas(true)
    const { data } = await getOfertasDeEmpresa(empresa.id)
    setOfertas(data ?? [])
    setCargandoOfertas(false)
    setTabOferta('activa')
  }

  const abrirNuevo = () => {
    setEditando(null); setForm(CAMPO_VACIO); setErrores({}); setModal(true)
  }

  const abrirEditar = (emp) => {
    setEditando(emp)
    setForm({
      nombre: emp.nombre, codigo: emp.codigo, direccion: emp.direccion,
      nombre_contacto: emp.nombre_contacto, telefono: emp.telefono,
      email: emp.email, rubro_id: emp.rubro_id, porcentaje_comision: emp.porcentaje_comision,
    })
    setErrores({})
    setModal(true)
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim())           e.nombre = 'Requerido'
    if (!/^[A-Za-z]{3}\d{3}$/.test(form.codigo)) e.codigo = 'Formato: 3 letras + 3 dígitos (ej: ABC123)'
    if (!form.direccion.trim())        e.direccion = 'Requerido'
    if (!form.nombre_contacto.trim())  e.nombre_contacto = 'Requerido'
    if (!form.telefono.trim())         e.telefono = 'Requerido'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (!form.rubro_id)                e.rubro_id = 'Selecciona un rubro'
    const com = parseFloat(form.porcentaje_comision)
    if (isNaN(com) || com < 0 || com > 100) e.porcentaje_comision = 'Porcentaje entre 0 y 100'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleGuardar = async () => {
    if (!validar()) return
    setGuardando(true)
    const fn = editando ? actualizarEmpresa(editando.id, form) : crearEmpresa(form)
    const { error } = await fn
    if (error) {
      toast.error(error.message?.includes('duplicate') ? 'El código ya existe' : 'Error al guardar')
    } else {
      toast.success(editando ? 'Empresa actualizada' : 'Empresa creada')
      setModal(false)
      cargar()
    }
    setGuardando(false)
  }

  const handleEliminar = async (emp) => {
    if (!confirm(`¿Eliminar la empresa "${emp.nombre}"?`)) return
    const { error } = await eliminarEmpresa(emp.id)
    if (error) toast.error('Error al eliminar')
    else { toast.success('Empresa eliminada'); cargar(); if (detalleId === emp.id) setDetalleId(null) }
  }

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrores(e => ({ ...e, [k]: '' })) }

  const filtradas = empresas.filter(emp =>
    emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.codigo.toLowerCase().includes(busqueda.toLowerCase())
  )

  const ofertasPorTab = TABS_OFERTA.reduce((acc, t) => {
    acc[t.key] = ofertas.filter(o => clasificarOferta(o) === t.key)
    return acc
  }, {})

  const empresaDetalle = empresas.find(e => e.id === detalleId)

  const Campo = ({ label, err, children }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
      {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
    </div>
  )
  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="text-white py-7 px-6 shadow" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm transition">
            ← Volver
          </button>
          <div className="flex items-center gap-2">
            <FiBriefcase className="text-2xl" />
            <h1 className="text-2xl font-black">Gestión de Empresas</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* TABLA EMPRESAS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <input
              type="text"
              placeholder="Buscar empresa..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 w-full sm:w-72"
            />
            <button
              onClick={abrirNuevo}
              className="flex items-center gap-2 text-white text-sm font-bold px-5 py-2 rounded-full shadow hover:opacity-90 transition shrink-0"
              style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}
            >
              <FiPlus /> Nueva empresa
            </button>
          </div>

          {cargando ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FiBriefcase className="text-5xl mx-auto mb-3 opacity-30" />
              <p>No hay empresas registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Empresa</th>
                    <th className="px-6 py-3">Código</th>
                    <th className="px-6 py-3">Rubro</th>
                    <th className="px-6 py-3">Contacto</th>
                    <th className="px-6 py-3">Comisión</th>
                    <th className="px-6 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtradas.map(emp => (
                    <>
                      <tr key={emp.id} className={`hover:bg-gray-50 transition ${detalleId === emp.id ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                              {emp.nombre[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{emp.nombre}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[180px]">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-blue-700">{emp.codigo}</td>
                        <td className="px-6 py-4 text-gray-600">{emp.rubros?.nombre ?? '—'}</td>
                        <td className="px-6 py-4 text-gray-600">{emp.nombre_contacto}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{emp.porcentaje_comision}%</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => abrirDetalle(emp)} title="Ver ofertas"
                              className={`p-2 rounded-lg transition ${detalleId === emp.id ? 'bg-blue-100 text-blue-700' : 'text-blue-600 hover:bg-blue-50'}`}>
                              <FiEye />
                            </button>
                            <button onClick={() => abrirEditar(emp)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                              <FiEdit2 />
                            </button>
                            <button onClick={() => handleEliminar(emp)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* DETALLE INLINE */}
                      {detalleId === emp.id && (
                        <tr key={`det-${emp.id}`}>
                          <td colSpan={6} className="bg-blue-50 px-6 py-5 border-t border-blue-100">
                            <h3 className="font-black text-blue-800 mb-3 text-sm">
                              Ofertas de {empresaDetalle?.nombre}
                            </h3>

                            {/* Sub-tabs */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {TABS_OFERTA.map(t => (
                                <button key={t.key}
                                  onClick={() => setTabOferta(t.key)}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${tabOferta === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                                  {t.label}
                                  {ofertasPorTab[t.key]?.length > 0 && (
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${tabOferta === t.key ? 'bg-white/30 text-white' : t.badge}`}>
                                      {ofertasPorTab[t.key].length}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>

                            {cargandoOfertas ? (
                              <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                              </div>
                            ) : ofertasPorTab[tabOferta]?.length === 0 ? (
                              <p className="text-gray-400 text-sm text-center py-6">No hay ofertas en esta categoría</p>
                            ) : (
                              <div className="space-y-3">
                                {ofertasPorTab[tabOferta].map(oferta => {
                                  const ingresos = (oferta.cantidad_vendida ?? 0) * (oferta.precio_oferta ?? 0)
                                  const comision = ingresos * ((emp.porcentaje_comision ?? 0) / 100)
                                  return (
                                    <div key={oferta.id} className="bg-white rounded-xl p-4 border border-blue-100 text-sm">
                                      <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-800">{oferta.titulo}</p>
                                          <p className="text-gray-500 text-xs mt-0.5">{oferta.descripcion?.slice(0, 80)}{oferta.descripcion?.length > 80 ? '…' : ''}</p>
                                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                                            <span>Inicio: {new Date(oferta.fecha_inicio).toLocaleDateString()}</span>
                                            <span>Fin: {new Date(oferta.fecha_fin).toLocaleDateString()}</span>
                                          </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-right">
                                          <div>
                                            <p className="text-xs text-gray-400">Cupones vendidos</p>
                                            <p className="font-black text-gray-800">{oferta.cantidad_vendida ?? 0}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-400">Disponibles</p>
                                            <p className="font-black text-gray-800">
                                              {oferta.cantidad_limite
                                                ? Math.max(0, oferta.cantidad_limite - (oferta.cantidad_vendida ?? 0))
                                                : '∞'}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-400">Ingresos</p>
                                            <p className="font-black text-green-700">${ingresos.toFixed(2)}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-400">Comisión</p>
                                            <p className="font-black text-orange-600">${comision.toFixed(2)}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-400">Precio oferta</p>
                                            <p className="font-black text-blue-700">${oferta.precio_oferta}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
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

      {/* MODAL FORMULARIO */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-800">
                {editando ? 'Editar empresa' : 'Nueva empresa ofertante'}
              </h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl"><FiX /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo label="Nombre de la empresa *" err={errores.nombre}>
                <input className={inp} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre" />
              </Campo>
              <Campo label="Código (ej: ABC123) *" err={errores.codigo}>
                <input className={inp} value={form.codigo} onChange={e => set('codigo', e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} />
              </Campo>
              <Campo label="Dirección *" err={errores.direccion}>
                <input className={inp} value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Dirección" />
              </Campo>
              <Campo label="Nombre del contacto *" err={errores.nombre_contacto}>
                <input className={inp} value={form.nombre_contacto} onChange={e => set('nombre_contacto', e.target.value)} placeholder="Nombre contacto" />
              </Campo>
              <Campo label="Teléfono *" err={errores.telefono}>
                <input className={inp} value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="2222-0000" />
              </Campo>
              <Campo label="Correo electrónico *" err={errores.email}>
                <input className={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="empresa@mail.com" />
              </Campo>
              <Campo label="Rubro *" err={errores.rubro_id}>
                <select className={inp} value={form.rubro_id} onChange={e => set('rubro_id', e.target.value)}>
                  <option value="">Selecciona un rubro</option>
                  {rubros.filter(r => r.activo).map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="% Comisión *" err={errores.porcentaje_comision}>
                <input className={inp} type="number" min={0} max={100} step={0.1} value={form.porcentaje_comision} onChange={e => set('porcentaje_comision', e.target.value)} placeholder="10" />
              </Campo>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={guardando}
                className="flex-1 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}>
                <FiSave /> {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
