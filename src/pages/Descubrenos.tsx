import { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import MediaPicker from '@/components/MediaPicker'
import { useSite } from '@/contexts/SiteContext'
import type { MultimediaResponse } from '@/actions/multimedia'
import type {
  Descubrenos,
  CreateDescubrenosRequest,
  UpdateDescubrenosRequest,
} from '@/actions/descubrenos'
import { useDescubrenosList } from '@/queries/descubrenos'
import { useLanguages } from '@/queries/languages'
import { useSites } from '@/queries/sites'
import {
  useCreateDescubrenos,
  useUpdateDescubrenos,
  useDeleteDescubrenos,
} from '@/mutations/descubrenos'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const MIN_POSTS = 4
const columnHelper = createColumnHelper<Descubrenos>()

interface PostFormItem {
  key: string
  postUrl: string
  embedUrl: string
  imageUrl: string
  fallbackImage: string
  alt: string
  position: number
}

interface DescubrenosFormData {
  siteId: string
  title: string
  languageCode: string
  showOnHome: boolean
  showOnProducts: boolean
  showOnHealth: boolean
  posts: PostFormItem[]
}

function emptyPost(index: number): PostFormItem {
  return {
    key: `new-${Date.now()}-${index}`,
    postUrl: '',
    embedUrl: '',
    imageUrl: '',
    fallbackImage: '',
    alt: '',
    position: index,
  }
}

function createInitialPosts(): PostFormItem[] {
  return Array.from({ length: MIN_POSTS }, (_, i) => emptyPost(i))
}

const createInitialFormData = (siteId = ''): DescubrenosFormData => ({
  siteId,
  title: '',
  languageCode: '',
  showOnHome: true,
  showOnProducts: false,
  showOnHealth: false,
  posts: createInitialPosts(),
})

type MediaPickerTarget =
  | { type: 'imageUrl'; index: number }
  | { type: 'fallbackImage'; index: number }

function itemToFormData(item: Descubrenos): DescubrenosFormData {
  const posts = (item.posts ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((post, index) => ({
      key: post.id || `${Date.now()}-${index}`,
      postUrl: post.postUrl ?? '',
      embedUrl: post.embedUrl ?? '',
      imageUrl: post.imageUrl ?? '',
      fallbackImage: post.fallbackImage ?? '',
      alt: post.alt ?? '',
      position: post.position ?? index,
    }))

  while (posts.length < MIN_POSTS) {
    posts.push(emptyPost(posts.length))
  }

  return {
    siteId: item.siteId ?? '',
    title: item.title ?? '',
    languageCode: item.languageCode ?? '',
    showOnHome: item.showOnHome ?? true,
    showOnProducts: item.showOnProducts ?? false,
    showOnHealth: item.showOnHealth ?? false,
    posts,
  }
}

function formDataToPayload(
  formData: DescubrenosFormData
): CreateDescubrenosRequest & UpdateDescubrenosRequest {
  return {
    siteId: formData.siteId,
    title: formData.title,
    languageCode: formData.languageCode,
    showOnHome: formData.showOnHome,
    showOnProducts: formData.showOnProducts,
    showOnHealth: formData.showOnHealth,
    posts: formData.posts.map((post, index) => ({
      postUrl: post.postUrl || undefined,
      embedUrl: post.embedUrl || undefined,
      imageUrl: post.imageUrl || undefined,
      fallbackImage: post.fallbackImage || undefined,
      alt: post.alt || undefined,
      position: index,
    })),
  }
}

function toInstagramEmbedUrl(url: string): string {
  if (!url) return ''

  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes('instagram.com')) return url

    parsed.search = ''
    parsed.hash = ''
    const path = parsed.pathname.replace(/\/+$/, '')
    if (path.endsWith('/embed')) {
      return `${parsed.origin}${path}/`
    }

    return `${parsed.origin}${path}/embed/`
  } catch {
    return url
  }
}

function visibilityLabel(item: Descubrenos): string {
  const pages: string[] = []
  if (item.showOnHome) pages.push('Home')
  if (item.showOnProducts) pages.push('Products')
  if (item.showOnHealth) pages.push('Health')
  return pages.length > 0 ? pages.join(', ') : 'None'
}

export default function DescubrenosPage() {
  const { selectedSiteId } = useSite()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTitle, setSearchTitle] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Descubrenos | null>(null)
  const [formData, setFormData] = useState<DescubrenosFormData>(createInitialFormData())
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget | null>(null)

  useEffect(() => {
    if (selectedSiteId && !formData.siteId) {
      setFormData((prev) => ({ ...prev, siteId: selectedSiteId }))
    }
  }, [selectedSiteId, formData.siteId])

  const { data, isLoading, error } = useDescubrenosList({
    page,
    pageSize,
    title: searchTitle || undefined,
    languageCode: filterLanguage || undefined,
    siteId: selectedSiteId || undefined,
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: sitesData } = useSites({ page: 1, pageSize: 100 })
  const createMutation = useCreateDescubrenos()
  const updateMutation = useUpdateDescubrenos()
  const deleteMutation = useDeleteDescubrenos()

  const openEditModal = (item: Descubrenos) => {
    setSelectedItem(item)
    setFormData(itemToFormData(item))
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (item: Descubrenos) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleMediaSelect = (media: MultimediaResponse) => {
    if (!mediaPickerTarget) return
    const { type, index } = mediaPickerTarget
    setFormData((prev) => ({
      ...prev,
      posts: prev.posts.map((post, i) =>
        i === index ? { ...post, [type]: media.originalUrl } : post
      ),
    }))
    setMediaPickerTarget(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.siteId || formData.posts.length < MIN_POSTS) return
    try {
      await createMutation.mutateAsync(formDataToPayload(formData))
      setIsCreateModalOpen(false)
      setFormData(createInitialFormData(selectedSiteId || ''))
    } catch (err) {
      console.error('Failed to create descubrenos:', err)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !formData.siteId || formData.posts.length < MIN_POSTS) return
    try {
      await updateMutation.mutateAsync({
        id: selectedItem.id,
        data: formDataToPayload(formData),
      })
      setIsEditModalOpen(false)
      setSelectedItem(null)
      setFormData(createInitialFormData(selectedSiteId || ''))
    } catch (err) {
      console.error('Failed to update descubrenos:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await deleteMutation.mutateAsync(selectedItem.id)
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
    } catch (err) {
      console.error('Failed to delete descubrenos:', err)
    }
  }

  const addPost = () => {
    setFormData((prev) => ({
      ...prev,
      posts: [...prev.posts, emptyPost(prev.posts.length)],
    }))
  }

  const removePost = (index: number) => {
    setFormData((prev) => {
      if (prev.posts.length <= MIN_POSTS) return prev
      return {
        ...prev,
        posts: prev.posts.filter((_, i) => i !== index),
      }
    })
  }

  const movePost = (index: number, direction: -1 | 1) => {
    setFormData((prev) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.posts.length) return prev
      const posts = [...prev.posts]
      const [item] = posts.splice(index, 1)
      posts.splice(nextIndex, 0, item)
      return { ...prev, posts }
    })
  }

  const updatePostField = (
    index: number,
    field: 'postUrl' | 'embedUrl' | 'imageUrl' | 'fallbackImage' | 'alt',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      posts: prev.posts.map((post, i) => {
        if (i !== index) return post
        if (field !== 'postUrl') return { ...post, [field]: value }

        const nextEmbed = toInstagramEmbedUrl(value)
        const previousAutoEmbed = toInstagramEmbedUrl(post.postUrl)
        const shouldSyncEmbed =
          !post.embedUrl || post.embedUrl === previousAutoEmbed

        return {
          ...post,
          postUrl: value,
          embedUrl: shouldSyncEmbed ? nextEmbed : post.embedUrl,
        }
      }),
    }))
  }

  const columns = useMemo<ColumnDef<Descubrenos, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('languageCode', {
        header: 'Language',
        cell: (info) => (
          <span className="text-sm text-muted-foreground font-mono">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'visibility',
        header: 'Visible On',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {visibilityLabel(row.original)}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'postsCount',
        header: 'Posts',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.posts?.length ?? 0}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'preview',
        header: 'Preview',
        cell: ({ row }) => {
          const first = row.original.posts?.[0]
          const url = first?.imageUrl || first?.fallbackImage
          return url ? (
            <img src={url} alt={first?.alt || 'Post'} className="h-10 w-10 object-cover rounded" />
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )
        },
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
            <button
              onClick={() => openEditModal(row.original)}
              className="text-primary hover:text-primary/80"
              title="Edit"
            >
              <EditIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
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
              <h2 className="text-2xl font-bold text-card-foreground">Descúbrenos</h2>
              <p className="text-muted-foreground mt-1">
                Manage Instagram gallery content
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
              Create Descúbrenos
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search descubrenos..."
              value={searchTitle}
              onChange={(e) => {
                setSearchTitle(e.target.value)
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
              <p className="mt-4 text-muted-foreground">Loading descubrenos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load descubrenos</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No descubrenos content found</p>
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
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
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
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
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
        <DescubrenosFormModal
          title="Create Descúbrenos"
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
          onAddPost={addPost}
          onRemovePost={removePost}
          onMovePost={movePost}
          onUpdatePostField={updatePostField}
        />
      )}

      {isEditModalOpen && selectedItem && (
        <DescubrenosFormModal
          title="Edit Descúbrenos"
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
          onAddPost={addPost}
          onRemovePost={removePost}
          onMovePost={movePost}
          onUpdatePostField={updatePostField}
        />
      )}

      {isDeleteModalOpen && selectedItem && (
        <Modal
          title="Delete Descúbrenos"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedItem(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete "
              <strong>{selectedItem.title || 'Untitled'}</strong>"?
              This action cannot be undone.
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
        title="Select Image"
      />
    </Layout>
  )
}

interface DescubrenosFormModalProps {
  title: string
  formData: DescubrenosFormData
  setFormData: React.Dispatch<React.SetStateAction<DescubrenosFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  submitLabel: string
  languages: { code: string; name: string; nativeName: string }[]
  sites: { id: string; name: string }[]
  onOpenMediaPicker: (target: MediaPickerTarget) => void
  onAddPost: () => void
  onRemovePost: (index: number) => void
  onMovePost: (index: number, direction: -1 | 1) => void
  onUpdatePostField: (
    index: number,
    field: 'postUrl' | 'embedUrl' | 'imageUrl' | 'fallbackImage' | 'alt',
    value: string
  ) => void
}

function DescubrenosFormModal({
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
  onAddPost,
  onRemovePost,
  onMovePost,
  onUpdatePostField,
}: DescubrenosFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Site *
                </label>
                <select
                  value={formData.siteId}
                  onChange={(e) =>
                    setFormData({ ...formData, siteId: e.target.value })
                  }
                  required
                  disabled
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-not-allowed opacity-75"
                >
                  <option value="">Select a site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Site is automatically set from the sidebar selector
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Language *
                </label>
                <select
                  value={formData.languageCode}
                  onChange={(e) =>
                    setFormData({ ...formData, languageCode: e.target.value })
                  }
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
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                maxLength={255}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Section title"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Visibility
            </h4>
            <p className="text-xs text-muted-foreground">
              Choose where this Descúbrenos section should appear for this site.
            </p>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showOnHome}
                  onChange={(e) =>
                    setFormData({ ...formData, showOnHome: e.target.checked })
                  }
                  className="rounded border-border text-primary focus:ring-primary"
                />
                Show on Home
              </label>
              <label className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showOnProducts}
                  onChange={(e) =>
                    setFormData({ ...formData, showOnProducts: e.target.checked })
                  }
                  className="rounded border-border text-primary focus:ring-primary"
                />
                Show on Products
              </label>
              <label className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showOnHealth}
                  onChange={(e) =>
                    setFormData({ ...formData, showOnHealth: e.target.checked })
                  }
                  className="rounded border-border text-primary focus:ring-primary"
                />
                Show on Health
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h4 className="text-sm font-semibold text-card-foreground">
                  Instagram Posts
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum {MIN_POSTS} posts required ({formData.posts.length} added)
                </p>
              </div>
              <button
                type="button"
                onClick={onAddPost}
                className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Post
              </button>
            </div>

            <div className="space-y-4">
              {formData.posts.map((post, index) => (
                <div
                  key={post.key}
                  className="border border-border rounded-lg p-4 bg-secondary/30 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-card-foreground">
                      Post {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onMovePost(index, -1)}
                        disabled={index === 0}
                        className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title="Move up"
                      >
                        <ChevronUpIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMovePost(index, 1)}
                        disabled={index === formData.posts.length - 1}
                        className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title="Move down"
                      >
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemovePost(index)}
                        disabled={formData.posts.length <= MIN_POSTS}
                        className="p-1.5 text-red-600 hover:text-red-800 disabled:opacity-30"
                        title="Remove"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Post URL
                      </label>
                      <input
                        type="url"
                        value={post.postUrl}
                        onChange={(e) =>
                          onUpdatePostField(index, 'postUrl', e.target.value)
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://www.instagram.com/reel/..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Paste the Instagram reel or post link. The embed URL is generated automatically.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Embed URL
                      </label>
                      <input
                        type="url"
                        value={post.embedUrl}
                        onChange={(e) =>
                          onUpdatePostField(index, 'embedUrl', e.target.value)
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://www.instagram.com/p/.../embed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={post.alt}
                      onChange={(e) =>
                        onUpdatePostField(index, 'alt', e.target.value)
                      }
                      maxLength={255}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Image description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Image
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenMediaPicker({ type: 'imageUrl', index })
                          }
                          className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                        >
                          <PhotoIcon className="w-5 h-5" />
                          Select Image
                        </button>
                        {post.imageUrl && (
                          <>
                            <img
                              src={post.imageUrl}
                              alt={post.alt || 'Post'}
                              className="w-12 h-12 object-cover rounded border border-border"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                onUpdatePostField(index, 'imageUrl', '')
                              }
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Fallback Image
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenMediaPicker({ type: 'fallbackImage', index })
                          }
                          className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                        >
                          <PhotoIcon className="w-5 h-5" />
                          Select Image
                        </button>
                        {post.fallbackImage && (
                          <>
                            <img
                              src={post.fallbackImage}
                              alt={post.alt || 'Fallback'}
                              className="w-12 h-12 object-cover rounded border border-border"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                onUpdatePostField(index, 'fallbackImage', '')
                              }
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              disabled={isSubmitting || !formData.siteId || formData.posts.length < MIN_POSTS}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
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
