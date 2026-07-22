import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import { useTranslation } from 'react-i18next'
import { useLanguages } from '@/queries/languages'
import { useBrands } from '@/queries/brands'
import { useTopMessages } from '@/queries/top-messages'
import { useCreateTopMessage, useDeleteTopMessage } from '@/mutations/top-messages'
import type { TopMessageResponse } from '@/actions/top-messages'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<TopMessageResponse>()

interface TopMessageFormData {
  text: string
  sort_order: number
  brand_id: string
  language_id: string
}

const initialFormData: TopMessageFormData = {
  text: '',
  sort_order: 0,
  brand_id: '',
  language_id: '',
}

export default function TopMessages() {
  const { t } = useTranslation()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<TopMessageResponse | null>(null)
  const [formData, setFormData] = useState<TopMessageFormData>(initialFormData)

  // Consultas de datos
  const { data: messages, isLoading, error } = useTopMessages()
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: brandsData } = useBrands({ page: 1, pageSize: 100 })

  // Mutaciones
  const createMutation = useCreateTopMessage()
  const deleteMutation = useDeleteTopMessage()

  // Mapeos rápidos para mostrar nombres en la tabla
  const languagesMap = useMemo(() => {
    return new Map(languagesData?.data?.map((l) => [l.id.toString(), l.name]) || [])
  }, [languagesData])

  const brandsMap = useMemo(() => {
    return new Map(brandsData?.data?.map((b) => [b.id.toString(), b.name]) || [])
  }, [brandsData])

  const openDeleteModal = (message: TopMessageResponse) => {
    setSelectedMessage(message)
    setIsDeleteModalOpen(true)
  }

  const columns = useMemo<ColumnDef<TopMessageResponse, any>[]>(
    () => [
      columnHelper.accessor('text', {
        header: 'Texto del Cintillo',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('brand_id', {
        header: 'Marca',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {brandsMap.get(info.getValue().toString()) || `ID: ${info.getValue()}`}
          </span>
        ),
      }),
      columnHelper.accessor('language_id', {
        header: 'Idioma',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {languagesMap.get(info.getValue().toString()) || `ID: ${info.getValue()}`}
          </span>
        ),
      }),
      columnHelper.accessor('sort_order', {
        header: 'Posición / Orden',
        cell: (info) => (
          <span className="text-sm font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="text-right block">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => openDeleteModal(row.original)}
              className="text-red-600 hover:text-red-800"
              title="Eliminar"
            >
              <DeleteIcon className="w-5 h-5" />
            </button>
          </div>
        ),
      }),
    ],
    [brandsMap, languagesMap]
  )

  const table = useReactTable({
    data: messages ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync({
        text: formData.text,
        sort_order: Number(formData.sort_order),
        brand_id: Number(formData.brand_id),
        language_id: Number(formData.language_id),
      })
      setIsCreateModalOpen(false)
      setFormData(initialFormData)
    } catch (err) {
      console.error('Failed to create top message:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedMessage) return
    try {
      await deleteMutation.mutateAsync(selectedMessage.id)
      setIsDeleteModalOpen(false)
      setSelectedMessage(null)
    } catch (err) {
      console.error('Failed to delete top message:', err)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">
                Cintillos
              </h2>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Crear Cintillo
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando cintillos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error al cargar los cintillos</p>
            </div>
          ) : !messages?.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron cintillos creados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-border">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-secondary/50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border>">
              <h3 className="text-lg font-semibold text-card-foreground">Nuevo Cintillo</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Texto *</label>
                <input
                  type="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Ej: ¡20% de descuento en chocolates!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Marca *</label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">Selecciona una marca</option>
                  {brandsData?.data?.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Idioma *</label>
                <select
                  value={formData.language_id}
                  onChange={(e) => setFormData({ ...formData, language_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">Selecciona un idioma</option>
                  {languagesData?.data?.map((lang) => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Orden / Posición *</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  required
                  min={0}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm"
                >
                  {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Eliminar Cintillo</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-card-foreground">
                ¿Estás seguro de que quieres eliminar el cintillo "<strong>{selectedMessage.text}</strong>"? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                >
                  {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function DeleteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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