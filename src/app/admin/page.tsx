"use client"
import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import Link from 'next/link'
import { ArrowLeft, Users, ShieldCheck, Printer, Share2 } from 'lucide-react'

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [password, setPassword] = useState('')
  const [entradas, setEntradas] = useState<any[]>([])
  const [bailarinas, setBailarinas] = useState<any>({})
  const [filtro, setFiltro] = useState<'todos' | 'pendiente' | 'aprobada'>('todos')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'flor123' || password === 'admin') {
      setAutenticado(true)
      localStorage.setItem('admin_auth', 'true')
    } else {
      alert('Contraseña incorrecta')
    }
  }

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      setAutenticado(true)
    }
  }, [])

  const cargarDatos = async () => {
    const { data: partData } = await supabase.from('evento_participantes').select('*')
    if (partData) {
      const map: Record<string, string> = {}
      partData.forEach((p: any) => { map[p.id] = p.nombre })
      setBailarinas(map)
    }

    const { data: entData } = await supabase.from('evento_entradas').select('*').order('created_at', { ascending: false })
    if (entData) setEntradas(entData)
  }

  useEffect(() => {
    if (autenticado) {
      cargarDatos()

      const channel = supabase
        .channel('admin_entradas_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'evento_entradas' }, () => {
          cargarDatos()
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [autenticado])

  const togglePago = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'pendiente' ? 'aprobada' : 'pendiente'
    const { error } = await supabase
      .from('evento_entradas')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (error) alert('Error al actualizar pago')
    else cargarDatos()
  }

  const toggleIngreso = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'ingresado' ? 'aprobada' : 'ingresado'
    const { error } = await supabase
      .from('evento_entradas')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (error) alert('Error al actualizar ingreso')
    else cargarDatos()
  }

  const handleCompartirQR = async () => {
    const urlQR = "https://polekitty-voting-app.vercel.app"
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Votación - Muestra PoleKitty',
          text: 'Escaneá este código QR para votar a las bailarinas en vivo:',
          url: urlQR,
        })
      } catch (err) {
        console.log('Compartir cancelado o no soportado', err)
      }
    } else {
      navigator.clipboard.writeText(urlQR)
      alert("¡Link de votación copiado al portapapeles!")
    }
  }

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4 font-sans relative">
        <div className="w-full max-w-sm bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center mb-6">
            <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-black" />
            <h1 className="text-xl font-black uppercase tracking-tight">Panel de Administradora</h1>
            <p className="text-xs font-bold text-neutral-500 uppercase mt-1">Exclusivo para Flor</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">Contraseña Admin</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 border-2 border-black font-bold text-sm focus:outline-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-black text-white font-black text-xs uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800"
            >
              INGRESAR AL PANEL
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs font-black uppercase underline">← Volver al inicio</Link>
          </div>
        </div>
      </div>
    )
  }

  const entradasFiltradas = entradas.filter(e => {
    if (filtro === 'todos') return true;
    return e.estado === filtro;
  });

  return (
    <div className="min-h-screen bg-white text-black p-4 sm:p-8 font-sans">
      
      {/* HEADER (Se oculta al imprimir) */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b-4 border-black gap-4 print:hidden">
        <div>
          <Link href="/" className="text-xs font-black uppercase underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Volver al sitio público
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Panel de Control - Entradas Flor</h1>
          <p className="text-xs font-bold text-neutral-600 uppercase mt-1">Gestión de pagos y control de acceso en puerta</p>
        </div>
        
        <button 
          onClick={() => { localStorage.removeItem('admin_auth'); setAutenticado(false); }}
          className="text-xs font-black uppercase bg-neutral-200 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TÍTULO EXCLUSIVO PARA IMPRESIÓN DE LA LISTA */}
        <div className="hidden print:block mb-4 text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight">Listado Oficial de Asistentes (Pagos Aprobados)</h1>
          <p className="text-xs font-bold uppercase text-neutral-600">Teatro Asociación de Música San Martín - 29 de Noviembre</p>
        </div>

        {/* SECCIÓN QR OFICIAL DE VOTACIÓN (Oculta al imprimir la lista con print:hidden) */}
        <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
          <div>
            <span className="bg-black text-white text-[10px] font-black uppercase px-2 py-1 tracking-widest inline-block mb-2">
              Materiales para el Teatro
            </span>
            <h2 className="text-xl font-black uppercase tracking-tight mb-2">QR Oficial de Votación para las Mesas</h2>
            <p className="text-xs font-bold text-neutral-600 uppercase max-w-lg">
              Imprimí este código QR y colócalo en las mesas del Teatro Asociación de Música San Martín (Tucumán 2157) para que los espectadores voten en vivo.
            </p>
            <p className="text-xs font-mono font-bold mt-2 text-neutral-800">https://polekitty-voting-app.vercel.app</p>
            
            {/* Botones de acción del QR */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => {
                  const printContents = document.getElementById('seccion-qr-imprimir')?.innerHTML;
                  if (printContents) {
                    const originalContents = document.body.innerHTML;
                    document.body.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; text-align: center;">${printContents}</div>`;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-2 bg-black text-white text-xs font-black uppercase tracking-wider px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(150,150,150,1)] hover:bg-neutral-800 transition-colors"
              >
                <Printer className="w-4 h-4" /> Imprimir solo este QR
              </button>

              <button
                onClick={handleCompartirQR}
                className="flex items-center gap-2 bg-neutral-200 text-black text-xs font-black uppercase tracking-wider px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(150,150,150,1)] hover:bg-neutral-300 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Compartir Link QR
              </button>
            </div>
          </div>

          <div id="seccion-qr-imprimir" className="p-3 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center shrink-0">
            <h3 className="hidden print:block font-black uppercase text-xl mb-4">Votá a tu bailarina favorita</h3>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://polekitty-voting-app.vercel.app" 
              alt="QR Votación Mesa" 
              className="w-32 h-32 mx-auto"
            />
            <p className="hidden print:block font-bold uppercase text-sm mt-4">Escaneá con tu celular</p>
          </div>
        </div>

        {/* LISTADO Y GESTIÓN DE ENTRADAS */}
        <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] print:shadow-none print:border-2">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 pb-4 border-b-2 border-black print:hidden">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5" /> Listado de Espectadores ({entradas.length})
            </h2>

            <div className="flex items-center gap-3">
              {/* Botón Imprimir Lista */}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-black text-white text-xs font-black uppercase tracking-wider px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(150,150,150,1)] hover:bg-neutral-800 transition-colors"
              >
                <Printer className="w-4 h-4" /> Imprimir Lista
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 text-xs font-black uppercase mb-6 print:hidden">
            {(['todos', 'pendiente', 'aprobada'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 border-2 border-black transition-all ${
                  filtro === f ? 'bg-black text-white' : 'bg-neutral-100 text-black hover:bg-neutral-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* TABLA */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b-4 border-black text-xs font-black uppercase bg-neutral-100 print:bg-neutral-200">
                  <th className="px-4 py-3 border-r-2 border-black">Asistente</th>
                  <th className="px-4 py-3 border-r-2 border-black">DNI</th>
                  <th className="px-4 py-3 border-r-2 border-black">Viene a ver a</th>
                  <th className="px-4 py-3 text-center border-r-2 border-black">Estado Pago</th>
                  <th className="px-4 py-3 text-center print:border-r-0">Control Puerta (Ingreso)</th>
                </tr>
              </thead>
              <tbody>
                {entradasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-xs font-bold text-neutral-500 uppercase">
                      No hay entradas con este filtro.
                    </td>
                  </tr>
                ) : (
                  entradasFiltradas.map((e) => {
                    const pagoAprobado = e.estado === 'aprobada' || e.estado === 'ingresado'
                    const estaIngresado = e.estado === 'ingresado'

                    return (
                      <tr 
                        key={e.id} 
                        className={`border-b-2 border-black hover:bg-neutral-50 ${!pagoAprobado ? 'print:hidden' : ''}`}
                      >
                        <td className="px-4 py-3 border-r-2 border-black font-black uppercase">
                          {e.nombre} {e.apellido}
                        </td>
                        <td className="px-4 py-3 border-r-2 border-black font-mono font-bold">
                          {e.dni}
                        </td>
                        <td className="px-4 py-3 border-r-2 border-black font-bold text-xs uppercase">
                          {bailarinas[e.bailarina_id] || 'General'}
                        </td>

                        {/* COLUMNA 1: ESTADO DE PAGO */}
                        <td className="px-4 py-3 text-center border-r-2 border-black">
                          <div className="print:block hidden font-black text-xs uppercase">
                            APROBADO ✓
                          </div>
                          <div className="print:hidden">
                            <button
                              onClick={() => togglePago(e.id, e.estado)}
                              className={`w-full py-2 px-3 text-[11px] font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                                pagoAprobado 
                                  ? 'bg-green-300 text-black hover:bg-green-400' 
                                  : 'bg-amber-200 text-black hover:bg-amber-300'
                              }`}
                            >
                              {pagoAprobado ? 'Aprobado ✓' : 'Pendiente'}
                            </button>
                          </div>
                        </td>

                        {/* COLUMNA 2: CONTROL DE PUERTA */}
                        <td className="px-4 py-3 text-center print:border-r-0">
                          <div className="print:block hidden font-black text-xs uppercase leading-tight">
                            {estaIngresado ? (
                              'INGRESADO ✓'
                            ) : (
                              <>
                                [ &nbsp; ] Presente <br />
                                [ &nbsp; ] Ausente
                              </>
                            )}
                          </div>
                          <div className="print:hidden">
                            {!pagoAprobado ? (
                              <span className="block py-2 px-3 text-[10px] font-black uppercase tracking-wider bg-neutral-100 border-2 border-dashed border-neutral-400 text-neutral-400 cursor-not-allowed">
                                Pago Pendiente (Bloqueado)
                              </span>
                            ) : (
                              <button
                                onClick={() => toggleIngreso(e.id, e.estado)}
                                className={`w-full py-2 px-3 text-[11px] font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                                  estaIngresado 
                                    ? 'bg-black text-white hover:bg-neutral-800' 
                                    : 'bg-white text-black hover:bg-neutral-100'
                                }`}
                              >
                                {estaIngresado ? 'Ingresado ✓' : 'Dar Presente'}
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  )
}