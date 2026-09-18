import type { ReactNode } from 'react'

export interface TabItem {
  key: string
  label: string
  content: ReactNode
}

interface TabsProps {
  tabs: TabItem[]
  activeKey: string
  onChange: (key: string) => void
}

export default function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0]

  return (
    <div>
      <div className="border-b border-border overflow-x-auto">
        <nav className="flex gap-1 min-w-max" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab?.key === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">{activeTab?.content}</div>
    </div>
  )
}
