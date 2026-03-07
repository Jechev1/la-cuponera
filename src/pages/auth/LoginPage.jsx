import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from '../../hooks/useForm'
import { login } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const navigate = useNavigate()
  const { refrescarPerfil } = useAuth()

  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const { valores, errores, handleChange, validar } = useForm(
    { email: '', password: '' },
    {
      email: { requerido: true, email: true },
      password: { requerido: true, minLength: 6 },
    }
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return

    setEnviando(true)
    const { data, error } = await login(valores.email, valores.password)
    setEnviando(false)

    if (error) {
      toast.error(error)
      return
    }

    // Actualizar el contexto antes de navegar
    refrescarPerfil()

    toast.success(`¡Bienvenido ${data.name}!`)

    switch (data.type) {
      case 'cliente':
        navigate('/')
        break
      case 'admin_empresa':
        navigate('/dashboard-empresa')
        break
      case 'empleado':
        navigate('/canje-cupones')
        break
      default:
        navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white text-center relative">
          <Link to="/" className="absolute left-4 top-4 text-white/80 hover:text-white">
            <FiArrowLeft className="text-xl" />
          </Link>
          <img
            src="/Cuponera-sin fondo.png"
            alt="La Cuponera"
            className="h-16 mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold">Bienvenido</h1>
          <p className="text-orange-100 text-sm">Ingresa a tu cuenta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={valores.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                  errores.email ? 'border-red-400' : 'border-gray-300'
                }`}
              />
            </div>
            {errores.email && (
              <p className="text-red-500 text-xs mt-1">{errores.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={mostrarPassword ? 'text' : 'password'}
                name="password"
                value={valores.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                  errores.password ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errores.password && (
              <p className="text-red-500 text-xs mt-1">{errores.password}</p>
            )}
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <Link
              to="/recuperar-contrasena"
              className="text-sm text-orange-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {enviando ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-orange-600 font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginPage