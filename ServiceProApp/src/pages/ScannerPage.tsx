import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

type EquipmentResult = {
  id: string
  name: string
  category: string
  total_quantity: number
  current_available: number
  brand_model: string | null
}

const categoryColors: Record<string, string> = {
  audio: 'bg-blue-500/20 text-blue-400',
  luci: 'bg-amber-500/20 text-amber-400',
  video: 'bg-cyan-500/20 text-cyan-400',
  strutture: 'bg-slate-500/20 text-slate-300',
  servizio: 'bg-emerald-500/20 text-emerald-400',
}

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<EquipmentResult | null>(null)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => { stopScanner() }
  }, [])

  async function startScanner() {
    setError('')
    setResult(null)
    setActionMsg('')

    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner
      setScanning(true)

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
        onScanSuccess,
        () => {}
      )
    } catch (err: any) {
      setError('Impossibile accedere alla fotocamera')
      setScanning(false)
    }
  }

  async function stopScanner() {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
    }
    scannerRef.current = null
    setScanning(false)
  }

  async function onScanSuccess(decoded: string) {
    await stopScanner()

    // Try matching by id, serial_number, or barcode
    const { data } = await supabase
      .from('equipment')
      .select('id, name, category, total_quantity, current_available, brand_model')
      .or(`id.eq.${decoded},serial_number.eq.${decoded},barcode.eq.${decoded}`)
      .limit(1)
      .single()

    if (data) {
      setResult(data)
    } else {
      setError(`Nessun articolo trovato per: ${decoded}`)
    }
  }

  async function handleAction(action: 'carica' | 'scarica') {
    if (!result) return
    const delta = action === 'scarica' ? -1 : 1
    const newQty = result.current_available + delta

    if (newQty < 0) { setActionMsg('Stock insufficiente!'); return }
    if (newQty > result.total_quantity) { setActionMsg('Già tutto in magazzino!'); return }

    await supabase
      .from('equipment')
      .update({ current_available: newQty })
      .eq('id', result.id)

    setResult({ ...result, current_available: newQty })
    setActionMsg(action === 'carica' ? '✅ Caricato in magazzino' : '📦 Scaricato dal magazzino')
    setTimeout(() => setActionMsg(''), 2000)
  }

  return (
    <div className="h-full flex flex-col safe-top pb-20 relative">
      {/* Header */}
      <div className="px-5 pt-4 pb-4 relative z-10">
        <h1 className="text-2xl font-bold tracking-tight">QR Scanner</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Inquadra il codice QR dell'attrezzatura</p>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative" ref={containerRef}>
        {!scanning && !result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-40 h-40 mx-auto mb-6 rounded-3xl glass flex items-center justify-center">
              <svg className="w-16 h-16 text-[var(--color-primary-light)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75H16.5v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75H16.5v-.75z" />
              </svg>
            </div>
            <button onClick={startScanner} className="btn-primary px-10">
              Avvia Scansione
            </button>
          </motion.div>
        ) : null}

        {/* QR Reader Container */}
        <div
          id="qr-reader"
          className={`w-full max-w-sm rounded-2xl overflow-hidden ${scanning ? 'block' : 'hidden'}`}
          style={{ minHeight: scanning ? 300 : 0 }}
        />

        {scanning && (
          <button
            onClick={stopScanner}
            className="mt-4 flex items-center gap-2 px-6 py-3 glass text-sm font-medium"
          >
            <XMarkIcon className="w-5 h-5" /> Annulla
          </button>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 glass p-4 text-center"
          >
            <p className="text-[var(--color-danger)] text-sm">{error}</p>
            <button onClick={startScanner} className="mt-3 btn-primary text-sm px-6 py-2">
              Riprova
            </button>
          </motion.div>
        )}
      </div>

      {/* Result Slide-up Panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-40 glass rounded-t-3xl p-6 pb-24 border-t border-[var(--color-border)]"
          >
            <div className="w-10 h-1 rounded-full bg-[var(--color-text-muted)] mx-auto mb-5 opacity-40" />

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{result.name}</h3>
                {result.brand_model && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{result.brand_model}</p>
                )}
              </div>
              <span className={`badge ${categoryColors[result.category] ?? 'bg-slate-500/20 text-slate-300'}`}>
                {result.category}
              </span>
            </div>

            {/* Stock */}
            <div className="glass-light p-4 rounded-xl mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--color-text-secondary)]">Disponibilità</span>
                <span className="font-bold">
                  {result.current_available} / {result.total_quantity}
                </span>
              </div>
              <div className="stock-bar">
                <div
                  className="stock-bar-fill"
                  style={{
                    width: `${(result.current_available / result.total_quantity) * 100}%`,
                    background: result.current_available > 0 ? 'var(--color-success)' : 'var(--color-danger)'
                  }}
                />
              </div>
            </div>

            {actionMsg && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm font-medium text-teal-400 mb-3"
              >
                {actionMsg}
              </motion.p>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAction('carica')}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500/15 text-emerald-400 font-semibold text-sm active:scale-[0.97] transition-transform"
              >
                <ArrowDownTrayIcon className="w-5 h-5" /> Carica
              </button>
              <button
                onClick={() => handleAction('scarica')}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500/15 text-amber-400 font-semibold text-sm active:scale-[0.97] transition-transform"
              >
                <ArrowUpTrayIcon className="w-5 h-5" /> Scarica
              </button>
            </div>

            <button
              onClick={() => { setResult(null); startScanner() }}
              className="w-full mt-3 py-3 text-center text-sm text-[var(--color-text-muted)] font-medium"
            >
              Scansiona un altro
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
