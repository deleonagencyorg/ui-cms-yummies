import type { ReactNode } from 'react'

interface RepeaterFieldProps<T> {
  items: T[]
  onAdd: () => void
  onRemove: (index: number) => void
  onMove: (index: number, direction: -1 | 1) => void
  renderItem: (item: T, index: number) => ReactNode
  getKey: (item: T, index: number) => string
  minItems?: number
  addLabel?: string
  itemLabel?: (item: T, index: number) => string
  emptyMessage?: string
}

export default function RepeaterField<T>({
  items,
  onAdd,
  onRemove,
  onMove,
  renderItem,
  getKey,
  minItems = 0,
  addLabel = 'Add Item',
  itemLabel,
  emptyMessage,
}: RepeaterFieldProps<T>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
        >
          <PlusIcon className="w-4 h-4" />
          {addLabel}
        </button>
      </div>

      {items.length === 0 && emptyMessage ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={getKey(item, index)}
              className="border border-border rounded-lg p-4 bg-secondary/30 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-card-foreground">
                  {itemLabel ? itemLabel(item, index) : `Item ${index + 1}`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMove(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUpIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, 1)}
                    disabled={index === items.length - 1}
                    className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    disabled={items.length <= minItems}
                    className="p-1.5 text-red-600 hover:text-red-800 disabled:opacity-30"
                    title="Remove"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface StringRepeaterFieldProps {
  items: string[]
  onChange: (items: string[]) => void
  addLabel?: string
  placeholder?: string
  minItems?: number
}

export function StringRepeaterField({
  items,
  onChange,
  addLabel = 'Add Line',
  placeholder,
  minItems = 0,
}: StringRepeaterFieldProps) {
  const add = () => onChange([...items, ''])
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index))
  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(nextIndex, 0, moved)
    onChange(next)
  }
  const update = (index: number, value: string) =>
    onChange(items.map((item, i) => (i === index ? value : item)))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={add}
          className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
        >
          <PlusIcon className="w-4 h-4" />
          {addLabel}
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => update(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="Move up"
            >
              <ChevronUpIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === items.length - 1}
              className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="Move down"
            >
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={items.length <= minItems}
              className="p-1.5 text-red-600 hover:text-red-800 disabled:opacity-30"
              title="Remove"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}
