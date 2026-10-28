"use client"
import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomeAcceso() {
  const router = useRouter()
  const [modo, setModo] = useState<'registro' | 'consultar'>('registro')
  
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [dni, setDni] = useState('')
  const [bailarinaId, setBailarinaId] = useState('')
  
  const [bailarinas, setBailarinas] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  useEffect(() => {
    const cargarBailarinas = async () => {
      const { data } = await supabase.from('evento_participantes').select('*').order('nombre', { ascending: true })
      if (data) setBailarinas(data)
    }
    cargarBailarinas()
  }, [])

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setMensaje(null)

    const { data, error } = await supabase.from('evento_entradas').insert({
      nombre,
      apellido,
      dni: dni.trim(),
      bailarina_id: bailarinaId || null,
      estado: 'pendiente'
    }).select().single()

    if (error) {
      if (error.code === '23505') {
        setMensaje("Este DNI ya tiene una entrada registrada. Seleccioná 'Ya tengo entrada' para consultar el estado.")
      } else {
        setMensaje("Hubo un error al registrar tus datos. Por favor intentá de nuevo.")
      }
    } else if (data) {
      localStorage.setItem('user_dni', dni.trim())
      router.push(`/mi-entrada?dni=${dni.trim()}`)
    }
    setCargando(false)
  }

  const handleConsulta = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dni.trim()) return
    localStorage.setItem('user_dni', dni.trim())
    router.push(`/mi-entrada?dni=${dni.trim()}`)
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      <img 
        src="/pole_kitty_fondo.jpg" 
        alt="PoleKitty Fondo" 
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[200%] sm:w-[120vw] max-w-[1000px] -z-10 mix-blend-multiply pointer-events-none"
      />

      <div className="absolute top-4 right-4 z-30">
        <Link href="/admin">
          <span className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-3 py-1.5 bg-white hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Acceso Admin
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 py-8">
        <div className="mb-6 flex justify-center">
          <img 
            src="/logo-Polekitty.png" 
            alt="PoleKitty Logo" 
            className="w-34 h-auto mix-blend-multiply" 
          />
        </div>

        <div className="bg-white p-6 sm:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center mb-6">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase border-b-2 border-black inline-block pb-1 mb-2">
              Muestra Anual - 29 Noviembre
            </h2>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Entradas Oficiales
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6 border-2 border-black p-1 bg-neutral-100">
            <button
              onClick={() => { setModo('registro'); setMensaje(null); }}
              className={`py-2 text-xs font-black uppercase tracking-wider transition-all ${
                modo === 'registro' ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-black hover:bg-neutral-200'
              }`}
            >
              Comprar Entrada
            </button>
            <button
              onClick={() => { setModo('consultar'); setMensaje(null); }}
              className={`py-2 text-xs font-black uppercase tracking-wider transition-all ${
                modo === 'consultar' ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-black hover:bg-neutral-200'
              }`}
            >
              Ya tengo entrada
            </button>
          </div>

          {mensaje && (
            <div className="mb-4 p-3 bg-neutral-100 border-2 border-black text-xs font-bold text-black text-center">
              {mensaje}
            </div>
          )}

          {modo === 'registro' ? (
            <form onSubmit={handleRegistro} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">Nombre</label>
                <input 
                  type="text" 
                  required 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full p-3 border-2 border-black font-bold text-sm focus:outline-none focus:bg-neutral-50"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">Apellido</label>
                <input 
                  type="text" 
                  required 
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Tu apellido"
                  className="w-full p-3 border-2 border-black font-bold text-sm focus:outline-none focus:bg-neutral-50"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">DNI (Sin puntos)</label>
                <input 
                  type="text" 
                  required 
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ej: 38123456"
                  className="w-full p-3 border-2 border-black font-bold text-sm focus:outline-none focus:bg-neutral-50"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">¿A qué bailarina venís a ver?</label>
                <select 
                  required
                  value={bailarinaId}
                  onChange={(e) => setBailarinaId(e.target.value)}
                  className="w-full p-3 border-2 border-black font-bold text-sm bg-white focus:outline-none"
                >
                  <option value="">-- Seleccionar Bailarina --</option>
                  {bailarinas.map((b) => (
                    <option key={b.id} value={b.id}>{b.nombre}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                disabled={cargando}
                className="w-full mt-4 py-4 bg-black text-white font-black text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
              >
                {cargando ? 'REGISTRANDO...' : 'RESERVAR Y VER DATOS DE PAGO'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConsulta} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">Ingresá tu DNI registrado</label>
                <input 
                  type="text" 
                  required 
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ej: 38123456"
                  className="w-full p-3 border-2 border-black font-bold text-sm focus:outline-none focus:bg-neutral-50"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-black text-white font-black text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                VER MI ENTRADA / ESTADO
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}