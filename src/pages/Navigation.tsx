import { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import Modal from '@/components/Modal'
import TextField from '@/components/TextField'
import RepeaterField from '@/components/RepeaterField'
import { useSite } from '@/contexts/SiteContext'
import type {
  NavigationConfig,
  CreateNavigationConfigRequest,
  UpdateNavigationConfigRequest,
} from '@/actions/navigation'
import { useNavigationList } from '@/queries/navigation'
import { useLanguages } from '@/queries/languages'
import { useSites } from '@/queries/sites'
import {
  useCreateNavigation,
  useUpdateNavigation,
  useDeleteNavigation,
} from '@/mutations/navigation'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<NavigationConfig>()

interface MenuItemFormItem {
  key: string
  id?: string
  label: string
  href: string
  parentId: string | null
  isExternal: boolean
}

interface NavigationFormData {
  siteId: string
  languageCode: string
  openMenuLabel: string
  closeMenuLabel: string
  items: MenuItemFormItem[]
}

function emptyMenuItem(index: number): MenuItemFormItem {
  return {
    key: `new-${Date.now()}-${index}`,
    label: '',
    href: '',
    parentId: null,
    isExternal: false,
  }
}

const createInitialFormData = (siteId = ''): NavigationFormData => ({
  siteId,
  languageCode: '',
  openMenuLabel: '',
  closeMenuLabel: '',
  items: [],
})

function itemToFormData(item: NavigationConfig): NavigationFormData {
  const items = (item.items ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((menuItem, index) => ({
      key: menuItem.id || `${Date.now()}-${index}`,
      id: menuItem.id,
      label: menuItem.label ?? '',
      href: menuItem.href ?? '',
      parentId: menuItem.parentId ?? null,
      isExternal: menuItem.isExternal ?? false,
    }))

  return {
    siteId: item.siteId ?? '',
    languageCode: item.languageCode ?? '',
    openMenuLabel: item.openMenuLabel ?? '',
    closeMenuLabel: item.closeMenuLabel ?? '',
    items,
  }
}

function formDataToPayload(
  formData: NavigationFormData
): CreateNavigationConfigRequest & UpdateNavigationConfigRequest {
  return {
    siteId: formData.siteId,
    languageCode: formData.languageCode,
    openMenuLabel: formData.openMenuLabel,
    closeMenuLabel: formData.closeMenuLabel,
    items: formData.items.map((item, index) => ({
      label: item.label,
      href: item.href,
      order: index,
      parentId: item.parentId || null,
      isExternal: item.isExternal,
    })),
  }
}

export function NavigationPageContent() {
  const { selectedSiteId } = useSite()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filterLanguage, setFilterLanguage] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<NavigationConfig | null>(null)
  const [formData, setFormData] = useState<NavigationFormData>(createInitialFormData())

  useEffect(() => {
    if (selectedSiteId && !formData.siteId) {
      setFormData((prev) => ({ ...prev, siteId: selectedSiteId }))
    }
  }, [selectedSiteId, formData.siteId])

  const { data, isLoading, error } = useNavigationList({
    page,
    pageSize,
    languageCode: filterLanguage || undefined,
    siteId: selectedSiteId || undefined,
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: sitesData } = useSites({ page: 1, pageSize: 100 })
  const createMutation = useCreateNavigation()
  const updateMutation = useUpdateNavigation()
  const deleteMutation = useDeleteNavigation()

  const openEditModal = (item: NavigationConfig) => {
    setSelectedItem(item)
    setFormData(itemToFormData(item))
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (item: NavigationConfig) => {
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
      console.error('Failed to create navigation config:', err)
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
      console.error('Failed to update navigation config:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await deleteMutation.mutateAsync(selectedItem.id)
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
    } catch (err) {
      console.error('Failed to delete navigation config:', err)
    }
  }

  const addItem = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, emptyMenuItem(prev.items.length)] }))
  }

  const removeItem = (index: number) => {
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    setFormData((prev) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.items.length) return prev
      const items = [...prev.items]
      const [moved] = items.splice(index, 1)
      items.splice(nextIndex, 0, moved)
      return { ...prev, items }
    })
  }

  const updateItemField = <K extends keyof MenuItemFormItem>(
    index: number,
    field: K,
    value: MenuItemFormItem[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const columns = useMemo<ColumnDef<NavigationConfig, any>[]>(
    () => [
      columnHelper.accessor('openMenuLabel', {
        header: 'Open Label',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('closeMenuLabel', {
        header: 'Close Label',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{info.getValue() || '-'}</span>
        ),
      }),
      columnHelper.accessor('languageCode', {
        header: 'Language',
        cell: (info) => (
          <span className="text-sm text-muted-foreground font-mono">{info.getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: 'itemsCount',
        header: 'Items',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.items?.length ?? 0}
          </span>
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
              <h2 className="text-2xl font-bold text-card-foreground">Navigation</h2>
              <p className="text-muted-foreground mt-1">Manage site menu labels and links</p>
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
              Create Navigation
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
              <p className="mt-4 text-muted-foreground">Loading navigation...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load navigation</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No navigation configs found</p>
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
        <NavigationFormModal
          title="Create Navigation"
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
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onMoveItem={moveItem}
          onUpdateItemField={updateItemField}
        />
      )}

      {isEditModalOpen && selectedItem && (
        <NavigationFormModal
          title="Edit Navigation"
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
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onMoveItem={moveItem}
          onUpdateItemField={updateItemField}
        />
      )}

      {isDeleteModalOpen && selectedItem && (
        <Modal
          title="Delete Navigation"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedItem(null)
          }}
        >
          <div className="p-6 space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete this navigation config? This action cannot be undone.
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
    </>
  )
}

export default function NavigationPage() {
  return (
    <Layout>
      <NavigationPageContent />
    </Layout>
  )
}

function NavigationFormModal({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  isSubmitting,
  submitLabel,
  languages,
  sites,
  onAddItem,
  onRemoveItem,
  onMoveItem,
  onUpdateItemField,
}: {
  title: string
  formData: NavigationFormData
  setFormData: React.Dispatch<React.SetStateAction<NavigationFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  submitLabel: string
  languages: { code: string; name: string; nativeName: string }[]
  sites: { id: string; name: string }[]
  onAddItem: () => void
  onRemoveItem: (index: number) => void
  onMoveItem: (index: number, direction: -1 | 1) => void
  onUpdateItemField: <K extends keyof MenuItemFormItem>(
    index: number,
    field: K,
    value: MenuItemFormItem[K]
  ) => void
}) {
  const set = <K extends keyof NavigationFormData>(key: K, value: NavigationFormData[K]) =>
    setFormData({ ...formData, [key]: value })

  return (
    <Modal title={title} onClose={onClose} maxWidth="max-w-4xl" scrollBody>
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
            Basic Information
          </h4>
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
              label="Open Menu Label"
              value={formData.openMenuLabel}
              onChange={(v) => set('openMenuLabel', v)}
            />
            <TextField
              label="Close Menu Label"
              value={formData.closeMenuLabel}
              onChange={(v) => set('closeMenuLabel', v)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
            Menu Items
          </h4>
          <RepeaterField
            items={formData.items}
            getKey={(item) => item.key}
            onAdd={onAddItem}
            onRemove={onRemoveItem}
            onMove={onMoveItem}
            itemLabel={(item, index) => item.label || `Item ${index + 1}`}
            emptyMessage="No menu items yet. Add one to get started."
            renderItem={(item, index) => {
              const parentOptions = formData.items.filter(
                (candidate) => candidate.id && candidate.key !== item.key
              )
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextField
                      label="Label"
                      value={item.label}
                      onChange={(v) => onUpdateItemField(index, 'label', v)}
                      required
                    />
                    <TextField
                      label="Href"
                      value={item.href}
                      onChange={(v) => onUpdateItemField(index, 'href', v)}
                      placeholder="/products"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Parent (submenu of)
                      </label>
                      <select
                        value={item.parentId ?? ''}
                        onChange={(e) => onUpdateItemField(index, 'parentId', e.target.value || null)}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Top level</option>
                        {parentOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label || opt.id}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Only saved items can be selected as a parent. Save first, then edit to
                        build submenus.
                      </p>
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isExternal}
                          onChange={(e) => onUpdateItemField(index, 'isExternal', e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        External link
                      </label>
                    </div>
                  </div>
                </div>
              )
            }}
          />
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
