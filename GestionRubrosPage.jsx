import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getRubros, crearRubro, actualizarRubro, eliminarRubro } from '../../services/adminService'
import { FiTag, FiEdit2, FiTrash2, FiPlus, FiX, FiSave, FiToggleLeft, FiToggleRight } from 'react-icons/fi'

export default function GestionRubrosPage() {
  const navigate = useNavigate()
  const [rubros, setRubros]         = useState([])
  const [cargando, setCargando]     = useState(true)
  const [busqueda, setBusqueda]     = useState('')
  const [modal, setModal]           = useState(false)
  const [editando, setEditando]     = useState(null)  // null = nuevo
  const [form, setForm]             = useState({ nombre: '' })
  const [guardando, setGuardando]   = useState(false)

  const cargar = async () => {
    setCargando(true)
    const { data } = await getRubros()
    setRubros(data ?? [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ nombre: '' })
    setModal(true)
  }

  const abrirEditar = (rubro) => {
    setEditando(rubro)
    setForm({ nombre: rubro.nombre })
    setModal(true)
  }

  const handleGuardar = async () => {
    if (!form.nombre.trim()) return toast.error('El nombre es requerido')
    setGuardando(true)
    if (editando) {
      const { error } = await actualizarRubro(editando.id, { nombre: form.nombre.trim() })
      if (error) toast.error('Error al actualizar rubro')
      else { toast.success('Rubro actualizado'); setModal(false); cargar() }
    } else {
      const { error } = await crearRubro({ nombre: form.nombre.trim() })
      if (error) toast.error('Error al crear rubro')
      else { toast.success('Rubro creado'); setModal(false); cargar() }
    }
    setGuardando(false)
  }

  const handleToggle = async (rubro) => {
    const { error } = await actualizarRubro(rubro.id, { activo: !rubro.activo })
    if (error) toast.error('Error al cambiar estado')
    else { toast.success(rubro.activo ? 'Rubro desactivado' : 'Rubro activado'); cargar() }
  }

  const handleEliminar = async (rubro) => {
    if (!confirm(`¿Eliminar el rubro "${rubro.nombre}"?`)) return
    const { error } = await eliminarRubro(rubro.id)
    if (error) toast.error('Error al eliminar')
    else { toast.success('Rubro eliminado'); cargar() }
  }

  const filtrados = rubros.filter(r =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="text-white py-7 px-6 shadow" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm transition">
            ← Volver
          </button>
          <div className="flex items-center gap-2">
            <FiTag className="text-2xl" />
            <h1 className="text-2xl font-black">Gestión de Rubros</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Barra */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <input
              type="text"
              placeholder="Buscar rubro..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 w-full sm:w-64"
            />
            <button
              onClick={abrirNuevo}
              className="flex items-center gap-2 text-white text-sm font-bold px-5 py-2 rounded-full shadow hover:opacity-90 transition shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              <FiPlus /> Nuevo rubro
            </button>
          </div>

          {/* Lista */}
          {cargando ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FiTag className="text-5xl mx-auto mb-3 opacity-30" />
              <p>No hay rubros registrados</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map((rubro, i) => (
                  <tr key={rubro.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{rubro.nombre}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleToggle(rubro)} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition"
                        style={{ background: rubro.activo ? '#dcfce7' : '#fee2e2', color: rubro.activo ? '#16a34a' : '#dc2626' }}>
                        {rubro.activo ? <FiToggleRight /> : <FiToggleLeft />}
                        {rubro.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => abrirEditar(rubro)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleEliminar(rubro)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">{editando ? 'Editar rubro' : 'Nuevo rubro'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><FiX /></button>
            </div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ nombre: e.target.value })}
              placeholder="Ej: Restaurantes"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 mb-5"
            />
            <div className="flex gap-3">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={guardando}
                className="flex-1 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                <FiSave /> {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
