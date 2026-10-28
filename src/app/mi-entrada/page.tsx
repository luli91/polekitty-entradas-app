"use client"
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from "@/lib/supabase"
import Link from 'next/link'
import { Clock, Printer, ExternalLink, ArrowLeft } from 'lucide-react'

function ContenidoEntrada() {
  const searchParams = useSearchParams()
  const dniParam = searchParams.get('dni') || (typeof window !== 'undefined' ? localStorage.getItem('user_dni') : null)

  const [entrada, setEntrada] = useState<any>(null)
  const [cargando, setCargando] = useState(true)

  const fetchEntrada = async () => {
    if (!dniParam) {
      setCargando(false)
      return
    }

    const { data } = await supabase
      .from('evento_entradas')
      .select('*')
      .eq('dni', dniParam.trim())
      .single()

    if (data) {
      setEntrada(data)
    }
    setCargando(false)
  }

  useEffect(() => {
    fetchEntrada()

    const channel = supabase
      .channel('cambios_entrada')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'evento_entradas' }, () => {
        fetchEntrada()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [dniParam])

  const handleImprimir = () => {
    window.print()
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black uppercase text-sm bg-black text-white">
        Cargando entrada...
      </div>
    )
  }

  if (!entrada) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-black p-8 border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] max-w-md w-full">
          <h2 className="text-xl font-black uppercase mb-4">Entrada no encontrada</h2>
          <p className="text-xs font-bold text-neutral-400 mb-6">
            No se encontró ningún registro para el DNI especificado.
          </p>
          <Link 
            href="/"
            className="inline-block w-full py-3 bg-white text-black font-black text-xs uppercase tracking-widest border-2 border-white"
          >
            Volver al Registro
          </Link>
        </div>
      </div>
    )
  }

  const esValida = entrada.estado === 'aprobada' || entrada.estado === 'ingresado'

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Botón Volver y Guardar PDF (no sale en la impresión) */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6 print:hidden z-10">
        <Link href="/" className="flex items-center gap-1 text-xs font-black uppercase underline text-white">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        {esValida && (
          <button 
            onClick={handleImprimir}
            className="flex items-center gap-2 bg-white text-black text-xs font-black uppercase tracking-wider px-4 py-2 border-2 border-white shadow-[3px_3px_0px_0px_rgba(100,100,100,1)] hover:bg-neutral-200 transition-colors"
          >
            <Printer className="w-4 h-4" /> Imprimir Entrada / PDF
          </button>
        )}
      </div>

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        
        {/* SI EL PAGO ESTÁ PENDIENTE */}
        {!esValida ? (
          <div className="bg-neutral-900 border-4 border-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-center text-white">
            <div className="w-12 h-12 bg-amber-200 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4 text-black">
              <Clock className="w-6 h-6" />
            </div>

            <span className="bg-amber-300 text-black border border-black font-black text-[10px] uppercase px-3 py-1 tracking-widest inline-block mb-4">
              Pago Pendiente de Verificación
            </span>

            <h1 className="text-2xl font-black uppercase tracking-tight mb-2">
              ¡Hola, {entrada.nombre}!
            </h1>
            <p className="text-xs font-bold text-neutral-400 uppercase mb-6">
              Tu reserva ya quedó registrada. Flor está verificando la transferencia para habilitar tu entrada oficial.
            </p>

            {/* DATOS DE PAGO / TRANSFERENCIA */}
            <div className="bg-black border-2 border-white p-4 text-left mb-6 text-xs font-bold space-y-2">
              <p className="font-black uppercase tracking-wider border-b-2 border-white pb-1 mb-2 text-white">
                Datos para la Transferencia:
              </p>
              <p><span className="text-neutral-400">Titular:</span> Florencia (PoleKitty)</p>
              <p><span className="text-neutral-400">Alias:</span> POLEKITTY.MUESTRA</p>
              <p><span className="text-neutral-400">CBU:</span> 0000003100012345678900</p>
            </div>

            <p className="text-[11px] font-bold text-neutral-400">
              Una vez aprobado el pago, ingresá con tu DNI (<strong className="text-white">{entrada.dni}</strong>) para ver tu entrada oficial.
            </p>
          </div>
        ) : (
          /* IMAGEN DEL TICKET DEL PDF + INFO DE ASISTENTE */
          <div className="space-y-4">
            
            {/* Contenedor de la Imagen del Ticket */}
            <div className="bg-white p-2 border-4 border-white shadow-[8px_8px_0px_0px_rgba(100,100,100,1)] overflow-hidden">
              <img 
                src="/entrada-polekitty.jpeg" 
                alt="Entrada Oficial Muestra Anual PoleKitty" 
                className="w-full h-auto object-contain block"
              />
            </div>

            {/* Datos del asistente discretos debajo del ticket */}
            <div className="bg-neutral-900 border-2 border-neutral-700 p-4 text-xs font-bold flex justify-between items-center">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Asistente registrado</span>
                <span className="text-white font-black uppercase text-sm">{entrada.nombre} {entrada.apellido} (DNI: {entrada.dni})</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block text-[10px] uppercase">Estado</span>
                <span className="text-green-400 font-black uppercase">Aprobada ✓</span>
              </div>
            </div>

            {/* AVISO DE PUERTA Y BOTÓN DE VOTACIÓN */}
            <div className="bg-neutral-950 border-4 border-white p-6 text-center space-y-4 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <p className="text-xs font-black text-white uppercase tracking-widest">
                Presentá tu DNI en la puerta del teatro para ingresar
              </p>

              <div className="pt-4 border-t border-neutral-800 print:hidden">
                <p className="text-xs font-black uppercase tracking-wider mb-3 text-white">
                  ¿Querés votar a tus bailarinas favoritas durante la muestra?
                </p>
                <a 
                  href="https://polekitty-voting-app.vercel.app" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest border-2 border-white flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-[4px_4px_0px_0px_rgba(100,100,100,1)]"
                >
                  IR A VOTAR AHORA <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default function MiEntradaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black uppercase text-sm bg-black text-white">Cargando...</div>}>
      <ContenidoEntrada />
    </Suspense>
  )
}