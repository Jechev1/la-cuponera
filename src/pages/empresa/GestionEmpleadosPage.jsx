import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getEmpleadosEmpresa, crearEmpleado, actualizarEmpleado, eliminarEmpleado } from '../../services/empresaService'

const FORM_VACIO = {
  nombres:   '',
  apellidos: '',
  email:     '',
  password:  '',
}

export default function GestionEmpleadosPage() {
  const navigate = useNavigate()

  const [empleados, setEmpleados]       = useState([])
  const [cargando, setCargando]         = useState(true)
  const [busqueda, setBusqueda]         = useState('')
  const [guardando, setGuardando]       = useState(false)

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [empleadoEdit, setEmpleadoEdit] = useState(null) // null = nuevo, objeto = editar
  const [form, setForm]                 = useState(FORM_VACIO)

  // Cargar empleados
  useEffect(() => {
    cargarEmpleados()
  }, [])

  const cargarEmpleados = async () => {
    setCargando(true)
    const { data, error } = await getEmpleadosEmpresa()
    if (error) {
      toast.error('Error al cargar los empleados')
    } else {
      setEmpleados(data ?? [])
    }
    setCargando(false)
  }

  // Filtrar por búsqueda
  const empleadosFiltrados = empleados.filter(e =>
    `${e.nombres} ${e.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  // Abrir modal para nuevo empleado
  const handleNuevo = () => {
    setEmpleadoEdit(null)
    setForm(FORM_VACIO)
    setModalAbierto(true)
  }

  // Abrir modal para editar empleado
  const handleEditar = (empleado) => {
    setEmpleadoEdit(empleado)
    setForm({
      nombres:   empleado.nombres,
      apellidos: empleado.apellidos,
      email:     empleado.email,
      password:  '',
    })
    setModalAbierto(true)
  }

  // Guardar (crear o actualizar)
  const handleGuardar = async () => {
    if (!form.nombres.trim())   { toast.error('El nombre es obligatorio');    return }
    if (!form.apellidos.trim()) { toast.error('El apellido es obligatorio');  return }
    if (!form.email.trim())     { toast.error('El correo es obligatorio');    return }
    if (!empleadoEdit && !form.password.trim()) {
      toast.error('La contraseña es obligatoria para nuevos empleados')
      return
    }

    setGuardando(true)

    if (empleadoEdit) {
      const { error } = await actualizarEmpleado(empleadoEdit.id, form)
      if (error) {
        toast.error('Error al actualizar el empleado')
      } else {
        toast.success('Empleado actualizado correctamente')
        setModalAbierto(false)
        cargarEmpleados()
      }
    } else {
      const { error } = await crearEmpleado(form)
      if (error) {
        toast.error('Error al registrar el empleado')
      } else {
        toast.success('Empleado registrado correctamente')
        setModalAbierto(false)
        cargarEmpleados()
      }
    }

    setGuardando(false)
  }

  // Eliminar empleado
  const handleEliminar = async (empleado) => {
    if (!confirm(`¿Seguro que deseas eliminar a ${empleado.nombres} ${empleado.apellidos}?`)) return

    const { error } = await eliminarEmpleado(empleado.id)
    if (error) {
      toast.error('Error al eliminar el empleado')
    } else {
      toast.success('Empleado eliminado correctamente')
      cargarEmpleados()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div
        className="text-white py-7 px-6 shadow"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
      >
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard-empresa')}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm transition"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-black">Gestión de empleados</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Barra superior: buscador + botón nuevo */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <input
              type="text"
              placeholder="Buscar empleado..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 w-full sm:w-72"
            />
            <button
              onClick={handleNuevo}
              className="text-white text-sm font-bold px-5 py-2 rounded-full shadow hover:opacity-90 transition shrink-0"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              + Registrar nuevo empleado
            </button>
          </div>

          {/* Lista de empleados */}
          {cargando ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
            </div>
          ) : empleadosFiltrados.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-2">👤</p>
              <p className="font-medium">No se encontraron empleados</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                  {['Empleado', 'Correo', 'Acciones'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {empleadosFiltrados.map(emp => (
                  <tr key={emp.id} className="hover:bg-orange-50/30 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                        >
                          {emp.nombres?.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-800">
                          {emp.nombres} {emp.apellidos}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{emp.email}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditar(emp)}
                          className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-100 transition font-medium"
                        >
                          Modificar empleado
                        </button>
                        <button
                          onClick={() => handleEliminar(emp)}
                          className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full hover:bg-red-100 transition font-medium"
                        >
                          Eliminar empleado
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

      {/* MODAL NUEVO / EDITAR EMPLEADO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

            {/* Header modal */}
            <div
              className="px-6 py-4 rounded-t-2xl flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              <h2 className="text-white font-black text-lg">
                {empleadoEdit ? 'Modificación de empleado' : 'Registrar nuevo empleado'}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-white/80 hover:text-white text-xl font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo modal */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo label="Nombres *">
                  <input
                    className={inputCls}
                    value={form.nombres}
                    onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))}
                    placeholder="Nombres del empleado"
                  />
                </Campo>
                <Campo label="Apellidos *">
                  <input
                    className={inputCls}
                    value={form.apellidos}
                    onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
                    placeholder="Apellidos del empleado"
                  />
                </Campo>
                <div className="sm:col-span-2">
                  <Campo label="Correo *">
                    <input
                      type="email"
                      className={inputCls}
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="correo@ejemplo.com"
                    />
                  </Campo>
                </div>
                {/* Contraseña solo al crear */}
                {!empleadoEdit && (
                  <div className="sm:col-span-2">
                    <Campo label="Contraseña *">
                      <input
                        type="password"
                        className={inputCls}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Contraseña de acceso"
                      />
                    </Campo>
                  </div>
                )}
              </div>

              {/* Botones modal */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setModalAbierto(false)}
                  className="px-5 py-2.5 text-sm border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition font-medium"
                >
                  Cancelar
                </button>
                {empleadoEdit && (
                  <button
                    onClick={() => handleEliminar(empleadoEdit)}
                    className="px-5 py-2.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition font-medium"
                  >
                    Eliminar empleado
                  </button>
                )}
                <button
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="px-6 py-2.5 text-sm text-white font-bold rounded-full hover:opacity-90 transition disabled:opacity-60 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  {guardando ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : empleadoEdit ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helpers UI
function Campo({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 transition'