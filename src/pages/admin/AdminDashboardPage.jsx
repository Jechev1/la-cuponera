import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getEmpresas, getClientes, getOfertasPendientes, getRubros } from '../../services/adminService'
import { FiGrid, FiBriefcase, FiUsers, FiTag, FiCheckCircle, FiClock } from 'react-icons/fi'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { perfil } = useAuth()

  const [stats, setStats] = useState({ empresas: 0, clientes: 0, rubros: 0, pendientes: 0 })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      const [resEmp, resCli, resPend, resRub] = await Promise.all([
        getEmpresas(),
        getClientes(),
        getOfertasPendientes(),
        getRubros(),
      ])
      setStats({
        empresas:   resEmp.data?.length  ?? 0,
        clientes:   resCli.data?.length  ?? 0,
        pendientes: resPend.data?.length ?? 0,
        rubros:     resRub.data?.length  ?? 0,
      })
      setCargando(false)
    }
    cargar()
  }, [])

  const cards = [
    {
      titulo:    'Gestión de Empresas',
      desc:      'Registrar, editar y eliminar empresas ofertantes. Ver sus ofertas categorizadas.',
      icono:     <FiBriefcase className="text-3xl" />,
      ruta:      '/admin/empresas',
      color:     'from-blue-500 to-blue-600',
      stat:      stats.empresas,
      statLabel: 'empresas activas',
    },
    {
      titulo:    'Aprobación de Ofertas',
      desc:      'Revisar las promociones enviadas por las empresas y aprobarlas o rechazarlas.',
      icono:     <FiCheckCircle className="text-3xl" />,
      ruta:      '/admin/ofertas',
      color:     'from-yellow-500 to-orange-500',
      stat:      stats.pendientes,
      statLabel: 'pendientes de revisión',
      badge:     stats.pendientes > 0,
    },
    {
      titulo:    'Gestión de Clientes',
      desc:      'Ver todos los clientes registrados y el detalle de sus cupones.',
      icono:     <FiUsers className="text-3xl" />,
      ruta:      '/admin/clientes',
      color:     'from-green-500 to-emerald-600',
      stat:      stats.clientes,
      statLabel: 'clientes registrados',
    },
    {
      titulo:    'Gestión de Rubros',
      desc:      'Administrar las categorías de empresas (restaurantes, talleres, salones, etc.).',
      icono:     <FiTag className="text-3xl" />,
      ruta:      '/admin/rubros',
      color:     'from-purple-500 to-purple-600',
      stat:      stats.rubros,
      statLabel: 'rubros registrados',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="text-white py-8 px-6 shadow" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <FiGrid className="text-3xl" />
            <h1 className="text-3xl font-black tracking-tight">Panel Administrador</h1>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            Bienvenido, <span className="font-semibold">{perfil?.nombre}</span> — La Cuponera
          </p>

          {!cargando && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[
                { label: 'Empresas',  value: stats.empresas   },
                { label: 'Clientes',  value: stats.clientes   },
                { label: 'Rubros',    value: stats.rubros     },
                { label: 'Pendientes', value: stats.pendientes },
              ].map(s => (
                <div key={s.label} className="bg-white/15 rounded-xl px-4 py-3">
                  <p className="text-white font-black text-2xl">{s.value}</p>
                  <p className="text-blue-100 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CARDS */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map(card => (
            <button
              key={card.ruta}
              onClick={() => navigate(card.ruta)}
              className="group text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className={`bg-gradient-to-r ${card.color} p-5 flex items-center justify-between text-white`}>
                <div className="flex items-center gap-3">
                  {card.icono}
                  <h2 className="font-black text-lg">{card.titulo}</h2>
                </div>
                {card.badge && (
                  <span className="bg-white text-orange-600 text-xs font-black px-2.5 py-1 rounded-full animate-pulse">
                    {stats.pendientes} nuevo{stats.pendientes !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="p-5">
                <p className="text-gray-500 text-sm mb-4">{card.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-gray-800">{card.stat}</span>
                  <span className="text-xs text-gray-400">{card.statLabel}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
