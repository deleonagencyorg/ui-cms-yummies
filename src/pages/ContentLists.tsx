import { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import Modal from '@/components/Modal'
import TextField from '@/components/TextField'
import RepeaterField from '@/components/RepeaterField'
import MediaPicker from '@/components/MediaPicker'
import { useSite } from '@/contexts/SiteContext'
import type { MultimediaResponse } from '@/actions/multimedia'
import type {
  ContentList,
  CreateContentListRequest,
  UpdateContentListRequest,
} from '@/actions/content-lists'
import { useContentListList } from '@/queries/content-lists'
import { useLanguages } from '@/queries/languages'
import { useSites } from '@/queries/sites'
import {
  useCreateContentList,
  useUpdateContentList,
  useDeleteContentList,
} from '@/mutations/content-lists'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<ContentList>()

interface ContentListItemFormItem {
  key: string
  badge: string
  title: string
  titleHighlight: string
  description: string
  description2: string
  imageId: string | null
  imagePreviewUrl: string
  videoId: string | null
  videoPreviewUrl: string
  buttonText: string
  buttonUrl: string
  backgroundColor: string
}

interface ContentListFormData {
  siteId: string
  languageCode: string
  key: string
  title: string
  description: string
  items: ContentListItemFormItem[]
}

function emptyItem(index: number): ContentListItemFormItem {
  return {
    key: `new-${Date.now()}-${index}`,
    badge: '',
    title: '',
    titleHighlight: '',
    description: '',
    description2: '',
    imageId: null,
    imagePreviewUrl: '',
    videoId: null,
    videoPreviewUrl: '',
    buttonText: '',
    buttonUrl: '',
    backgroundColor: '',
  }
}

const createInitialFormData = (siteId = ''): ContentListFormData => ({
  siteId,
  languageCode: '',
  key: '',
  title: '',
  description: '',
  items: [],
})

function itemToFormData(item: ContentList): ContentListFormData {
  const items = (item.items ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((it, index) => ({
      key: it.id || `${Date.now()}-${index}`,
      badge: it.badge ?? '',
      title: it.title ?? '',
      titleHighlight: it.titleHighlight ?? '',
      description: it.description ?? '',
      description2: it.description2 ?? '',
      imageId: it.imageId ?? null,
      imagePreviewUrl: '',
      videoId: it.videoId ?? null,
      videoPreviewUrl: '',
      buttonText: it.buttonText ?? '',
      buttonUrl: it.buttonUrl ?? '',
      backgroundColor: it.backgroundColor ?? '',
    }))

  return {
    siteId: item.siteId ?? '',
    languageCode: item.languageCode ?? '',
    key: item.key ?? '',
    title: item.title ?? '',
    description: item.description ?? '',
    items,
  }
}

function formDataToPayload(
  formData: ContentListFormData
): CreateContentListRequest & UpdateContentListRequest {
  return {
    siteId: formData.siteId,
    languageCode: formData.languageCode,
    key: formData.key,
    title: formData.title,
    description: formData.description,
    items: formData.items.map((item, index) => ({
      badge: item.badge,
      title: item.title,
      titleHighlight: item.titleHighlight,
      description: item.description,
      description2: item.description2,
      imageId: item.imageId,
      videoId: item.videoId,
      buttonText: item.buttonText,
      buttonUrl: item.buttonUrl,
      backgroundColor: item.backgroundColor,
      order: index,
    })),
  }
}

type MediaPickerTarget = { field: 'imageId' | 'videoId'; index: number }

export default function ContentLists() {
  const { selectedSiteId } = useSite()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKey, setSearchKey] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContentList | null>(null)
  const [formData, setFormData] = useState<ContentListFormData>(createInitialFormData())
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget | null>(null)

  useEffect(() => {
    if (selectedSiteId && !formData.siteId) {
      setFormData((prev) => ({ ...prev, siteId: selectedSiteId }))
    }
  }, [selectedSiteId, formData.siteId])

  const { data, isLoading, error } = useContentListList({
    page,
    pageSize,
    key: searchKey || undefined,
    languageCode: filterLanguage || undefined,
    siteId: selectedSiteId || undefined,
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: sitesData } = useSites({ page: 1, pageSize: 100 })
  const createMutation = useCreateContentList()
  const updateMutation = useUpdateContentList()
  const deleteMutation = useDeleteContentList()

  const openEditModal = (item: ContentList) => {
    setSelectedItem(item)
    setFormData(itemToFormData(item))
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (item: ContentList) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleMediaSelect = (media: MultimediaResponse) => {
    if (!mediaPickerTarget) return
    const { field, index } = mediaPickerTarget
    const previewField = field === 'imageId' ? 'imagePreviewUrl' : 'videoPreviewUrl'
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: media.id, [previewField]: media.originalUrl } : item
      ),
    }))
    setMediaPickerTarget(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.siteId) return
    try {
      await createMutation.mutateAsync(formDataToPayload(formData))
      setIsCreateModalOpen(false)
      setFormData(createInitialFormData(selectedSiteId || ''))
    } catch (err) {
      console.error('Failed to create content list:', err)
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
      console.error('Failed to update content list:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await deleteMutation.mutateAsync(selectedItem.id)
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
    } catch (err) {
      console.error('Failed to delete content list:', err)
    }
  }

  const addItem = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, emptyItem(prev.items.length)] }))
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

  const updateItemField = <K extends keyof ContentListItemFormItem>(
    index: number,
    field: K,
    value: ContentListItemFormItem[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const columns = useMemo<ColumnDef<ContentList, any>[]>(
    () => [
      columnHelper.accessor('key', {
        header: 'Key',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground font-mono">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <span className="text-sm text-muted-foreground line-clamp-1">
            {info.getValue() || '-'}
          </span>
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
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Content Blocks</h2>
              <p className="text-muted-foreground mt-1">
                Manage generic reusable content lists (games, promo cards, video grids...)
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
              Create Content Block
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search by key..."
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
              <p className="mt-4 text-muted-foreground">Loading content blocks...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load content blocks</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No content blocks found</p>
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
        <ContentListFormModal
          title="Create Content Block"
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
          onOpenMediaPicker={setMediaPickerTarget}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onMoveItem={moveItem}
          onUpdateItemField={updateItemField}
        />
      )}

      {isEditModalOpen && selectedItem && (
        <ContentListFormModal
          title="Edit Content Block"
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
          onOpenMediaPicker={setMediaPickerTarget}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onMoveItem={moveItem}
          onUpdateItemField={updateItemField}
        />
      )}

      {isDeleteModalOpen && selectedItem && (
        <Modal
          title="Delete Content Block"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedItem(null)
          }}
        >
          <div className="p-6 space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete "<strong>{selectedItem.key}</strong>"? This action
              cannot be undone.
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
        isOpen={mediaPickerTarget !== null}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={handleMediaSelect}
        title={mediaPickerTarget?.field === 'videoId' ? 'Select Video' : 'Select Image'}
      />
    </Layout>
  )
}

function ContentListFormModal({
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
  onAddItem,
  onRemoveItem,
  onMoveItem,
  onUpdateItemField,
}: {
  title: string
  formData: ContentListFormData
  setFormData: React.Dispatch<React.SetStateAction<ContentListFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  submitLabel: string
  languages: { code: string; name: string; nativeName: string }[]
  sites: { id: string; name: string }[]
  onOpenMediaPicker: (target: MediaPickerTarget) => void
  onAddItem: () => void
  onRemoveItem: (index: number) => void
  onMoveItem: (index: number, direction: -1 | 1) => void
  onUpdateItemField: <K extends keyof ContentListItemFormItem>(
    index: number,
    field: K,
    value: ContentListItemFormItem[K]
  ) => void
}) {
  const set = <K extends keyof ContentListFormData>(key: K, value: ContentListFormData[K]) =>
    setFormData({ ...formData, [key]: value })

  return (
    <Modal title={title} onClose={onClose} maxWidth="max-w-5xl" scrollBody>
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
          <TextField
            label="Key"
            value={formData.key}
            onChange={(v) => set('key', v)}
            required
            placeholder="e.g. games, card_video, card_quiz, home_videos"
          />
          <TextField label="Title" value={formData.title} onChange={(v) => set('title', v)} />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(v) => set('description', v)}
            textarea
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
            Items
          </h4>
          <RepeaterField
            items={formData.items}
            getKey={(item) => item.key}
            onAdd={onAddItem}
            onRemove={onRemoveItem}
            onMove={onMoveItem}
            itemLabel={(item, index) => item.title || `Item ${index + 1}`}
            emptyMessage="No items yet. Add one to get started."
            renderItem={(item, index) => (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <TextField label="Badge" value={item.badge} onChange={(v) => onUpdateItemField(index, 'badge', v)} />
                  <TextField label="Title" value={item.title} onChange={(v) => onUpdateItemField(index, 'title', v)} />
                  <TextField
                    label="Title Highlight"
                    value={item.titleHighlight}
                    onChange={(v) => onUpdateItemField(index, 'titleHighlight', v)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField
                    label="Description"
                    value={item.description}
                    onChange={(v) => onUpdateItemField(index, 'description', v)}
                    textarea
                    rows={2}
                  />
                  <TextField
                    label="Description 2"
                    value={item.description2}
                    onChange={(v) => onUpdateItemField(index, 'description2', v)}
                    textarea
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField
                    label="Button Text"
                    value={item.buttonText}
                    onChange={(v) => onUpdateItemField(index, 'buttonText', v)}
                  />
                  <TextField
                    label="Button URL"
                    value={item.buttonUrl}
                    onChange={(v) => onUpdateItemField(index, 'buttonUrl', v)}
                  />
                </div>
                <TextField
                  label="Background Color"
                  value={item.backgroundColor}
                  onChange={(v) => onUpdateItemField(index, 'backgroundColor', v)}
                  placeholder="#ffffff or a tailwind class"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Image</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onOpenMediaPicker({ field: 'imageId', index })}
                        className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                      >
                        <PhotoIcon className="w-5 h-5" />
                        Select Image
                      </button>
                      {(item.imagePreviewUrl || item.imageId) && (
                        <>
                          {item.imagePreviewUrl && (
                            <img
                              src={item.imagePreviewUrl}
                              alt={item.title || 'Item'}
                              className="w-12 h-12 object-cover rounded border border-border"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => onUpdateItemField(index, 'imageId', null)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Video</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onOpenMediaPicker({ field: 'videoId', index })}
                        className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                      >
                        <PhotoIcon className="w-5 h-5" />
                        Select Video
                      </button>
                      {(item.videoPreviewUrl || item.videoId) && (
                        <button
                          type="button"
                          onClick={() => onUpdateItemField(index, 'videoId', null)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
