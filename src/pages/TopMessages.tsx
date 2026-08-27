import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import { useTranslation } from 'react-i18next'
import { useLanguages } from '@/queries/languages'
import { useBrands } from '@/queries/brands'
import { useTopMessages } from '@/queries/top-messages'
import { useCreateTopMessage, useUpdateTopMessage, useDeleteTopMessage } from '@/mutations/top-messages'
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
  title: string
  link: string
  order: number
  brandId: string
  languageCode: string
}

const initialFormData: TopMessageFormData = {
  title: '',
  link: '',
  order: 0,
  brandId: '',
  languageCode: '',
}

export default function TopMessages() {
  const { t } = useTranslation()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<TopMessageResponse | null>(null)
  const [formData, setFormData] = useState<TopMessageFormData>(initialFormData)

  // Filtros de búsqueda
  const [filterBrandId, setFilterBrandId] = useState<string>('')
  const [filterLanguageCode, setFilterLanguageCode] = useState<string>('')

  // Consultas de datos
  const { data: messages, isLoading, error } = useTopMessages({
    brandId: filterBrandId || undefined,
    languageCode: filterLanguageCode || undefined,
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: brandsData } = useBrands({ page: 1, pageSize: 100 })

  // Mutaciones
  const createMutation = useCreateTopMessage()
  const updateMutation = useUpdateTopMessage()
  const deleteMutation = useDeleteTopMessage()

  // Mapeos rápidos para mostrar nombres en la tabla
  const languagesMap = useMemo(() => {
    return new Map(languagesData?.data?.map((l) => [l.code, l.name]) || [])
  }, [languagesData])

  const brandsMap = useMemo(() => {
    return new Map(brandsData?.data?.map((b) => [b.id, b.name]) || [])
  }, [brandsData])

  const openCreateModal = () => {
    createMutation.reset()
    setFormData(initialFormData)
    setIsCreateModalOpen(true)
  }

  const openEditModal = (message: TopMessageResponse) => {
    updateMutation.reset()
    setSelectedMessage(message)
    setFormData({
      title: message.title || '',
      link: message.link || '',
      order: message.order ?? 0,
      brandId: message.brandId || '',
      languageCode: message.languageCode || '',
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (message: TopMessageResponse) => {
    deleteMutation.reset()
    setSelectedMessage(message)
    setIsDeleteModalOpen(true)
  }

  const clearFilters = () => {
    setFilterBrandId('')
    setFilterLanguageCode('')
  }

  const columns = useMemo<ColumnDef<TopMessageResponse, any>[]>(
    () => [
      columnHelper.accessor('order', {
        header: 'Orden',
        cell: (info) => (
          <span className="text-xs font-semibold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20 inline-block">
            #{info.getValue() ?? 0}
          </span>
        ),
      }),
      columnHelper.accessor('title', {
        header: 'Título / Mensaje',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('link', {
        header: 'Enlace',
        cell: (info) => {
          const link = info.getValue()
          return link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline truncate max-w-xs block"
              title={link}
            >
              {link}
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )
        },
      }),
      columnHelper.accessor('brandId', {
        header: 'Marca',
        cell: (info) => {
          const brandId = info.getValue()
          return (
            <span className="text-sm text-muted-foreground">
              {brandId ? (brandsMap.get(brandId) || `ID: ${brandId}`) : '-'}
            </span>
          )
        },
      }),
      columnHelper.accessor('languageCode', {
        header: 'Idioma',
        cell: (info) => {
          const code = info.getValue()
          return (
            <span className="text-sm text-muted-foreground">
              {code ? (languagesMap.get(code) || code) : '-'}
            </span>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="text-right block">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => openEditModal(row.original)}
              className="text-cyan-400 hover:text-cyan-300 p-1 rounded hover:bg-secondary transition-colors"
              title="Editar"
            >
              <EditIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-secondary transition-colors"
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
        title: formData.title,
        link: formData.link || undefined,
        order: Number(formData.order) || 0,
        brandId: formData.brandId,
        languageCode: formData.languageCode,
      })
      setIsCreateModalOpen(false)
      setFormData(initialFormData)
    } catch (err) {
      console.error('Failed to create top message:', err)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMessage) return
    try {
      await updateMutation.mutateAsync({
        id: selectedMessage.id,
        data: {
          title: formData.title,
          link: formData.link || undefined,
          order: Number(formData.order) || 0,
          brandId: formData.brandId,
          languageCode: formData.languageCode,
        },
      })
      setIsEditModalOpen(false)
      setSelectedMessage(null)
      setFormData(initialFormData)
    } catch (err) {
      console.error('Failed to update top message:', err)
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

  const hasActiveFilters = Boolean(filterBrandId || filterLanguageCode)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">
                Cintillos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Administra los cintillos promocionales superiores que se muestran en el sitio
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Crear Cintillo
            </button>
          </div>

          {/* Filtros de la tabla */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-border">
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Filtrar por Marca
              </label>
              <select
                value={filterBrandId}
                onChange={(e) => setFilterBrandId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todas las marcas</option>
                {brandsData?.data?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Filtrar por Idioma
              </label>
              <select
                value={filterLanguageCode}
                onChange={(e) => setFilterLanguageCode(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos los idiomas</option>
                {languagesData?.data?.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando cintillos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 font-medium">Error al cargar los cintillos</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(error as Error)?.message || 'Ocurrió un error inesperado al conectar con el servidor.'}
              </p>
            </div>
          ) : !messages?.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? 'No se encontraron cintillos que coincidan con los filtros seleccionados.'
                  : 'No se encontraron cintillos creados'}
              </p>
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
                    <tr key={row.id} className="hover:bg-secondary/50 transition-colors">
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
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Nuevo Cintillo</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {createMutation.isError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-xs">
                  {createMutation.error?.message || 'Error al crear el cintillo'}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Título / Texto *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Ej: ¡20% de descuento en chocolates!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Orden / Posición *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Ej: 1 (Menor número aparece primero)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Enlace (Opcional)</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Ej: https://ejemplo.com/promocion"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Marca *</label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
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
                  value={formData.languageCode}
                  onChange={(e) => setFormData({ ...formData, languageCode: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">Selecciona un idioma</option>
                  {languagesData?.data?.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
                  ))}
                </select>
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
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
                >
                  {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Editar Cintillo</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {updateMutation.isError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-xs">
                  {updateMutation.error?.message || 'Error al actualizar el cintillo'}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Título / Texto *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Ej: ¡20% de descuento en chocolates!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Orden / Posición *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Ej: 1 (Menor número aparece primero)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Enlace (Opcional)</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Ej: https://ejemplo.com/promocion"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Marca *</label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
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
                  value={formData.languageCode}
                  onChange={(e) => setFormData({ ...formData, languageCode: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">Selecciona un idioma</option>
                  {languagesData?.data?.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
                >
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
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
              {deleteMutation.isError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-xs">
                  {deleteMutation.error?.message || 'Error al eliminar el cintillo'}
                </div>
              )}

              <p className="text-sm text-card-foreground">
                ¿Estás seguro de que quieres eliminar el cintillo "<strong>{selectedMessage.title}</strong>"? Esta acción no se puede deshacer.
              </p>

              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
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

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
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