import { useState } from 'react'
import type { Option } from '../../scope/ScopeContext'
import { Chevron } from '../../lib/icons'

export function ScopeDropdown({ value, options, onChange, icon }: {
  value: string
  options: Option[]
  onChange: (v: string) => void
  icon?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)

  return (
    <div className="seld-wrap">
      <button className="seld" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}>
        {icon}{current?.label ?? value} <Chevron />
      </button>
      {open && (
        <>
          <div className="seld-backdrop" onClick={() => setOpen(false)} />
          <div className="seld-menu" role="listbox">
            {options.map((o) => (
              <button
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                className={`seld-opt${o.value === value ? ' on' : ''}`}
                onClick={() => { onChange(o.value); setOpen(false) }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
