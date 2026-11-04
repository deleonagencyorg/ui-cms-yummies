import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  maxWidth?: string
  scrollBody?: boolean
}

export default function Modal({
  title,
  onClose,
  children,
  maxWidth = 'max-w-md',
  scrollBody = false,
}: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-card rounded-lg shadow-xl ${maxWidth} w-full border border-border ${
          scrollBody ? 'max-h-[90vh] overflow-y-auto' : ''
        }`}
      >
        <div
          className={`flex items-center justify-between p-6 border-b border-border ${
            scrollBody ? 'sticky top-0 bg-card z-10' : ''
          }`}
        >
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
