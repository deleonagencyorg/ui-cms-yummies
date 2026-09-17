import { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import Modal from '@/components/Modal'
import TextField from '@/components/TextField'
import { useSite } from '@/contexts/SiteContext'
import type { SiteText, CreateSiteTextRequest, UpdateSiteTextRequest } from '@/actions/site-texts'
import { useSiteTextList } from '@/queries/site-texts'
import { useLanguages } from '@/queries/languages'
import { useSites } from '@/queries/sites'
import {
  useCreateSiteText,
  useUpdateSiteText,
  useDeleteSiteText,
} from '@/mutations/site-texts'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<SiteText>()

interface SiteTextFormData {
  siteId: string
  languageCode: string
  key: string
  section: string
  page: string
  field: string
  value: string
}

const createInitialFormData = (siteId = ''): SiteTextFormData => ({
  siteId,
  languageCode: '',
  key: '',
  section: 'Identidad del sitio',
  page: 'inicio',
  field: 'title',
  value: '',
})

function itemToFormData(item: SiteText): SiteTextFormData {
  return {
    siteId: item.siteId ?? '',
    languageCode: item.languageCode ?? '',
    key: item.key ?? '',
    section: item.section ?? 'Contenido del sitio',
    page: item.page ?? '',
    field: item.field ?? 'content',
    value: item.value ?? '',
  }
}

function formDataToPayload(
  formData: SiteTextFormData
): CreateSiteTextRequest & UpdateSiteTextRequest {
  const key = formData.key || (
    formData.section === 'SEO y meta'
      ? `meta.${formData.page || 'home'}.${formData.field}`
      : formData.section === 'Página no encontrada'
        ? `not_found.${formData.field}`
        : `site.${formData.field}`
  )
  return { ...formData, key }
}

export function SiteTextsContent() {
  const { selectedSiteId } = useSite()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKey, setSearchKey] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SiteText | null>(null)
  const [formData, setFormData] = useState<SiteTextFormData>(createInitialFormData())

  useEffect(() => {
    if (selectedSiteId && !formData.siteId) {
      setFormData((prev) => ({ ...prev, siteId: selectedSiteId }))
    }
  }, [selectedSiteId, formData.siteId])

  const { data, isLoading, error } = useSiteTextList({
    page,
    pageSize,
    key: searchKey || undefined,
    languageCode: filterLanguage || undefined,
    siteId: selectedSiteId || undefined,
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: sitesData } = useSites({ page: 1, pageSize: 100 })
  const createMutation = useCreateSiteText()
  const updateMutation = useUpdateSiteText()
  const deleteMutation = useDeleteSiteText()

  const openEditModal = (item: SiteText) => {
    setSelectedItem(item)
    setFormData(itemToFormData(item))
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (item: SiteText) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.siteId) return
    try {
      await createMutation.mutateAsync(formDataToPayload(formData))
      setIsCreateModalOpen(false)
      setFormData(createInitialFormData(selectedSiteId || ''))
    } catch (err) {
      console.error('Failed to create site text:', err)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !formData.siteId) return
    try {
      await updateMutation.mutateAsync({
        id: selectedItem.id,
        data: formDataToPayload(formData),
      })
      setIsEditModalOpen(false)
      setSelectedItem(null)
      setFormData(createInitialFormData(selectedSiteId || ''))
    } catch (err) {
      console.error('Failed to update site text:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await deleteMutation.mutateAsync(selectedItem.id)
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
    } catch (err) {
      console.error('Failed to delete site text:', err)
    }
  }

  const columns = useMemo<ColumnDef<SiteText, any>[]>(
    () => [
      columnHelper.accessor('key', {
        header: 'Contenido',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.row.original.label || 'Contenido administrable'}
            <small className="block text-muted-foreground font-normal">
              {info.row.original.section}{info.row.original.page ? ` · ${info.row.original.page}` : ''}
            </small>
          </span>
        ),
      }),
      columnHelper.accessor('value', {
        header: 'Value',
        cell: (info) => (
          <span className="text-sm text-muted-foreground line-clamp-1 max-w-md block">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('languageCode', {
        header: 'Language',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="text-right block">Actions</span>,
        cell: ({ row }) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => openEditModal(row.original)} className="text-primary hover:text-primary/80" title="Edit">
              <EditIcon className="w-5 h-5" />
            </button>
            <button onClick={() => openDeleteModal(row.original)} className="text-red-600 hover:text-red-800" title="Delete">
              <DeleteIcon className="w-5 h-5" />
            </button>
          </div>
        ),
      }),
    ],
    []
  )

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.pagination.pageCount ?? 0,
  })

  return (
    <>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Contenido del sitio</h2>
              <p className="text-muted-foreground mt-1">
                Administra mensajes, SEO y la página “No encontramos esa página” por marca e idioma.
              </p>
            </div>
            <button
              onClick={() => {
                if (!selectedSiteId) return
                setFormData(createInitialFormData(selectedSiteId))
                setIsCreateModalOpen(true)
              }}
              disabled={!selectedSiteId}
              title={!selectedSiteId ? 'Select a site in the sidebar first' : undefined}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-5 h-5" />
              Agregar contenido
            </button>
          </div>
          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Buscar contenido..."
              value={searchKey}
              onChange={(e) => {
                setSearchKey(e.target.value)
                setPage(1)
              }}
              className="flex-1 min-w-48 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterLanguage}
              onChange={(e) => {
                setFilterLanguage(e.target.value)
                setPage(1)
              }}
              className="w-48 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All languages</option>
              {(languagesData?.data || []).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando contenido...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">No se pudo cargar el contenido</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay contenido configurado</p>
            </div>
          ) : (
            <>
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
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
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

              {data.pagination && data.pagination.pageCount > 1 && (
                <Pagination
                  currentPage={data.pagination.page}
                  pageCount={data.pagination.pageCount}
                  pageSize={pageSize}
                  totalItems={data.pagination.total}
                  onPageChange={(newPage) => setPage(newPage)}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize)
                    setPage(1)
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <SiteTextFormModal
          title="Agregar contenido"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          onClose={() => {
            setIsCreateModalOpen(false)
            setFormData(createInitialFormData(selectedSiteId || ''))
          }}
          isSubmitting={createMutation.isPending}
          submitLabel="Guardar"
          languages={languagesData?.data || []}
          sites={sitesData?.data || []}
        />
      )}

      {isEditModalOpen && selectedItem && (
        <SiteTextFormModal
          title="Editar contenido"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedItem(null)
            setFormData(createInitialFormData(selectedSiteId || ''))
          }}
          isSubmitting={updateMutation.isPending}
          submitLabel="Guardar cambios"
          languages={languagesData?.data || []}
          sites={sitesData?.data || []}
        />
      )}

      {isDeleteModalOpen && selectedItem && (
        <Modal
          title="Eliminar contenido"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedItem(null)
          }}
        >
          <div className="p-6 space-y-4">
            <p className="text-card-foreground">
            ¿Quieres eliminar "<strong>{selectedItem.label || 'este contenido'}</strong>"? Esta acción
            no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedItem(null)
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default function SiteTextsPage() {
  return (
    <Layout>
      <SiteTextsContent />
    </Layout>
  )
}

function SiteTextFormModal({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  isSubmitting,
  submitLabel,
  languages,
  sites,
}: {
  title: string
  formData: SiteTextFormData
  setFormData: React.Dispatch<React.SetStateAction<SiteTextFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  submitLabel: string
  languages: { code: string; name: string; nativeName: string }[]
  sites: { id: string; name: string }[]
}) {
  const set = (key: keyof SiteTextFormData, value: string) =>
    setFormData({ ...formData, [key]: value })

  return (
    <Modal title={title} onClose={onClose} maxWidth="max-w-lg" scrollBody>
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Site *</label>
            <select
              value={formData.siteId}
              required
              disabled
              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg cursor-not-allowed opacity-75"
            >
              <option value="">Select a site</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Language *</label>
            <select
              value={formData.languageCode}
              onChange={(e) => set('languageCode', e.target.value)}
              required
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select language</option>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-card-foreground">Contenido administrable</h3>
            <p className="text-xs text-muted-foreground mt-1">
              El sistema identifica el contenido automáticamente. No necesitas escribir claves técnicas.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Área</label>
            <select
              value={formData.section}
              onChange={(e) => set('section', e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg"
            >
              <option>Identidad del sitio</option>
              <option>SEO y meta</option>
              <option>Página no encontrada</option>
              <option>Contenido del sitio</option>
            </select>
          </div>
          {formData.section === 'SEO y meta' && (
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Página</label>
              <select
                value={formData.page}
                onChange={(e) => set('page', e.target.value)}
                required
                className="w-full px-4 py-2 bg-background border border-border rounded-lg"
              >
                <option value="home">Inicio</option>
                <option value="products">Productos</option>
                <option value="recipes">Recetas</option>
                <option value="news">Noticias</option>
                <option value="health">Salud</option>
                <option value="contact">Contacto</option>
                <option value="about_us">Nosotros</option>
                <option value="not_found">Página no encontrada</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Campo</label>
            <select
              value={formData.field}
              onChange={(e) => set('field', e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg"
            >
              <option value="title">Título</option>
              <option value="description">Descripción</option>
              <option value="keywords">Palabras clave</option>
              <option value="image">Imagen social</option>
              <option value="heading">Encabezado</option>
              <option value="message">Mensaje</option>
              <option value="button">Texto del botón</option>
            </select>
          </div>
        </div>
        <TextField
          label="Texto o contenido"
          value={formData.value}
          onChange={(v) => set('value', v)}
          textarea
          rows={5}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.siteId}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
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
