import { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import Modal from '@/components/Modal'
import TextField from '@/components/TextField'
import MediaPicker from '@/components/MediaPicker'
import { useSite } from '@/contexts/SiteContext'
import type { MultimediaResponse } from '@/actions/multimedia'
import type {
  ProductCategory,
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
} from '@/actions/product-categories'
import { useProductCategoryList } from '@/queries/product-categories'
import { useLanguages } from '@/queries/languages'
import { useSites } from '@/queries/sites'
import {
  useCreateProductCategory,
  useUpdateProductCategory,
  useDeleteProductCategory,
} from '@/mutations/product-categories'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<ProductCategory>()

interface ProductCategoryFormData {
  siteId: string
  languageCode: string
  key: string
  label: string
  slug: string
  iconId: string | null
  iconPreviewUrl: string
  backgroundColor: string
  order: number
}

const createInitialFormData = (siteId = ''): ProductCategoryFormData => ({
  siteId,
  languageCode: '',
  key: '',
  label: '',
  slug: '',
  iconId: null,
  iconPreviewUrl: '',
  backgroundColor: '',
  order: 0,
})

function itemToFormData(item: ProductCategory): ProductCategoryFormData {
  return {
    siteId: item.siteId ?? '',
    languageCode: item.languageCode ?? '',
    key: item.key ?? '',
    label: item.label ?? '',
    slug: item.slug ?? '',
    iconId: item.iconId ?? null,
    iconPreviewUrl: '',
    backgroundColor: item.backgroundColor ?? '',
    order: item.order ?? 0,
  }
}

function formDataToPayload(
  formData: ProductCategoryFormData
): CreateProductCategoryRequest & UpdateProductCategoryRequest {
  return {
    siteId: formData.siteId,
    languageCode: formData.languageCode,
    key: formData.key,
    label: formData.label,
    slug: formData.slug,
    iconId: formData.iconId,
    backgroundColor: formData.backgroundColor,
    order: Number(formData.order) || 0,
  }
}

export default function ProductCategoriesPage() {
  const { selectedSiteId } = useSite()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filterLanguage, setFilterLanguage] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ProductCategory | null>(null)
  const [formData, setFormData] = useState<ProductCategoryFormData>(createInitialFormData())
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

  useEffect(() => {
    if (selectedSiteId && !formData.siteId) {
      setFormData((prev) => ({ ...prev, siteId: selectedSiteId }))
    }
  }, [selectedSiteId, formData.siteId])

  const { data, isLoading, error } = useProductCategoryList({
    page,
    pageSize,
    languageCode: filterLanguage || undefined,
    siteId: selectedSiteId || undefined,
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: sitesData } = useSites({ page: 1, pageSize: 100 })
  const createMutation = useCreateProductCategory()
  const updateMutation = useUpdateProductCategory()
  const deleteMutation = useDeleteProductCategory()

  const openEditModal = (item: ProductCategory) => {
    setSelectedItem(item)
    setFormData(itemToFormData(item))
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (item: ProductCategory) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleMediaSelect = (media: MultimediaResponse) => {
    setFormData((prev) => ({ ...prev, iconId: media.id, iconPreviewUrl: media.originalUrl }))
    setIsMediaPickerOpen(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.siteId) return
    try {
      await createMutation.mutateAsync(formDataToPayload(formData))
      setIsCreateModalOpen(false)
      setFormData(createInitialFormData(selectedSiteId || ''))
    } catch (err) {
      console.error('Failed to create product category:', err)
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
      console.error('Failed to update product category:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await deleteMutation.mutateAsync(selectedItem.id)
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
    } catch (err) {
      console.error('Failed to delete product category:', err)
    }
  }

  const columns = useMemo<ColumnDef<ProductCategory, any>[]>(
    () => [
      columnHelper.accessor('key', {
        header: 'Key',
        cell: (info) => (
          <span className="text-sm font-mono text-card-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('label', {
        header: 'Label',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('slug', {
        header: 'Slug',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{info.getValue() || '-'}</span>
        ),
      }),
      columnHelper.accessor('backgroundColor', {
        header: 'Color',
        cell: (info) => {
          const color = info.getValue()
          return color ? (
            <div className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded border border-border inline-block"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-muted-foreground font-mono">{color}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )
        },
      }),
      columnHelper.accessor('order', {
        header: 'Order',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{info.getValue() ?? 0}</span>
        ),
      }),
      columnHelper.accessor('languageCode', {
        header: 'Language',
        cell: (info) => (
          <span className="text-sm text-muted-foreground font-mono">{info.getValue()}</span>
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
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Product Categories</h2>
              <p className="text-muted-foreground mt-1">
                Manage the product category taxonomy (label, slug, icon and color)
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
              Create Category
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
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
              <p className="mt-4 text-muted-foreground">Loading categories...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load categories</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No product categories found</p>
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
        <ProductCategoryFormModal
          title="Create Product Category"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          onClose={() => {
            setIsCreateModalOpen(false)
            setFormData(createInitialFormData(selectedSiteId || ''))
          }}
          isSubmitting={createMutation.isPending}
          submitLabel="Create"
          languages={languagesData?.data || []}
          sites={sitesData?.data || []}
          onOpenMediaPicker={() => setIsMediaPickerOpen(true)}
        />
      )}

      {isEditModalOpen && selectedItem && (
        <ProductCategoryFormModal
          title="Edit Product Category"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedItem(null)
            setFormData(createInitialFormData(selectedSiteId || ''))
          }}
          isSubmitting={updateMutation.isPending}
          submitLabel="Update"
          languages={languagesData?.data || []}
          sites={sitesData?.data || []}
          onOpenMediaPicker={() => setIsMediaPickerOpen(true)}
        />
      )}

      {isDeleteModalOpen && selectedItem && (
        <Modal
          title="Delete Product Category"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedItem(null)
          }}
        >
          <div className="p-6 space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete "<strong>{selectedItem.label || selectedItem.key}</strong>
              "? This action cannot be undone.
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
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        title="Select Icon"
      />
    </Layout>
  )
}

function ProductCategoryFormModal({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  isSubmitting,
  submitLabel,
  languages,
  sites,
  onOpenMediaPicker,
}: {
  title: string
  formData: ProductCategoryFormData
  setFormData: React.Dispatch<React.SetStateAction<ProductCategoryFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  submitLabel: string
  languages: { code: string; name: string; nativeName: string }[]
  sites: { id: string; name: string }[]
  onOpenMediaPicker: () => void
}) {
  const set = <K extends keyof ProductCategoryFormData>(key: K, value: ProductCategoryFormData[K]) =>
    setFormData({ ...formData, [key]: value })

  return (
    <Modal title={title} onClose={onClose} maxWidth="max-w-2xl" scrollBody>
      <form onSubmit={onSubmit} className="p-6 space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Key"
            value={formData.key}
            onChange={(v) => set('key', v)}
            required
            placeholder="manies"
          />
          <TextField
            label="Order"
            type="number"
            value={String(formData.order)}
            onChange={(v) => set('order', Number(v) || 0)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Label"
            value={formData.label}
            onChange={(v) => set('label', v)}
            required
            placeholder="Maní"
          />
          <TextField
            label="Slug"
            value={formData.slug}
            onChange={(v) => set('slug', v)}
            placeholder="manies"
          />
        </div>

        <TextField
          label="Background Color"
          value={formData.backgroundColor}
          onChange={(v) => set('backgroundColor', v)}
          placeholder="#0073C1"
        />

        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">Icon</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenMediaPicker}
              className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
            >
              <PhotoIcon className="w-5 h-5" />
              Select Icon
            </button>
            {(formData.iconPreviewUrl || formData.iconId) && (
              <>
                {formData.iconPreviewUrl && (
                  <img
                    src={formData.iconPreviewUrl}
                    alt={formData.label || 'Icon'}
                    className="w-10 h-10 object-cover rounded border border-border"
                  />
                )}
                <button
                  type="button"
                  onClick={() => set('iconId', null)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

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

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}
