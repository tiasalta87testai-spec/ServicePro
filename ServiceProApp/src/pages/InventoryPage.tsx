import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

type Equipment = {
  id: string
  name: string
  category: string
  total_quantity: number
  current_available: number
  brand_model: string | null
  condition: string
}

const categories = ['tutti', 'audio', 'luci', 'video', 'strutture', 'servizio']

const catColors: Record<string, string> = {
  audio: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  luci: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  video: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  strutture: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  servizio: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

const conditionEmoji: Record<string, string> = {
  ottimo: '✅',
  buono: '🟡',
  da_revisionare: '🔴',
}

export default function InventoryPage() {
  const { tenantId } = useAuth()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('tutti')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    fetchEquipment()

    const channel = supabase
      .channel('equipment-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, () => fetchEquipment())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tenantId])

  async function fetchEquipment() {
    const { data } = await supabase
      .from('equipment')
      .select('id, name, category, total_quantity, current_available, brand_model, condition')
      .order('name', { ascending: true })
    setEquipment(data ?? [])
    setLoading(false)
  }

  const filtered = equipment.filter(e => {
    const matchCat = activeCategory === 'tutti' || e.category === activeCategory
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="h-full flex flex-col safe-top pb-20">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">Magazzino</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{equipment.length} articoli totali</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca attrezzatura..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all text-sm"
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-4 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'glass-light text-[var(--color-text-secondary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment List */}
      <div className="flex-1 px-4 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-[var(--color-text-muted)] text-sm">Nessun articolo trovato</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => {
              const pct = (item.current_available / item.total_quantity) * 100
              const stockColor = item.current_available === 0
                ? 'var(--color-danger)'
                : pct <= 30 ? 'var(--color-warning)' : 'var(--color-success)'

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      {item.brand_model && (
                        <p className="text-xs text-[var(--color-text-muted)] truncate">{item.brand_model}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <span className={`badge text-[10px] ${catColors[item.category] ?? ''}`}>
                        {item.category}
                      </span>
                      <span className="text-sm">{conditionEmoji[item.condition] ?? ''}</span>
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="stock-bar">
                        <div
                          className="stock-bar-fill"
                          style={{ width: `${pct}%`, background: stockColor }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: stockColor }}>
                      {item.current_available}/{item.total_quantity}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
