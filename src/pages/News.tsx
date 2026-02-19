import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import MediaPicker from '@/components/MediaPicker'
import RichTextEditor from '@/components/RichTextEditor'
import SafeHtml from '@/components/SafeHtml'
import type { MultimediaResponse } from '@/actions/multimedia'
import { useTranslation } from 'react-i18next'
import { useNews } from '@/queries/news'
import { useLanguages } from '@/queries/languages'
import { useBrands } from '@/queries/brands'
import { useCreateNews, useUpdateNews, useDeleteNews } from '@/mutations/news'
import type { NewsResponse } from '@/actions/news'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<NewsResponse>()

interface NewsFormData {
  title: string
  slug: string
  subtitle: string
  image: string
  imageMobile: string
  gallery: string[]
  content: string
  excerpt: string
  category: string
  tags: string[]
  author: string
  publishedAt: string
  isPublished: boolean
  isFeatured: boolean
  languageCode: string
  brandIds: string[]
}

const initialFormData: NewsFormData = {
  title: '',
  slug: '',
  subtitle: '',
  image: '',
  imageMobile: '',
  gallery: [],
  content: '',
  excerpt: '',
  category: '',
  tags: [],
  author: '',
  publishedAt: '',
  isPublished: false,
  isFeatured: false,
  languageCode: '',
  brandIds: [],
}

type MediaPickerTarget =
  | { type: 'image' }
  | { type: 'imageMobile' }
  | { type: 'gallery'; index?: number }

export default function News() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTitle, setSearchTitle] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPublished, setFilterPublished] = useState<string>('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState<NewsResponse | null>(null)
  const [formData, setFormData] = useState<NewsFormData>(initialFormData)

  // Media picker state
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget | null>(null)

  const { data, isLoading, error } = useNews({
    page,
    pageSize,
    title: searchTitle || undefined,
    category: filterCategory || undefined,
    isPublished: filterPublished === '' ? undefined : filterPublished === 'true',
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: brandsData } = useBrands({ page: 1, pageSize: 100 })
  const createMutation = useCreateNews()
  const updateMutation = useUpdateNews()
  const deleteMutation = useDeleteNews()

  const openEditModal = (news: NewsResponse) => {
    setSelectedNews(news)
    setFormData({
      title: news.title,
      slug: news.slug,
      subtitle: news.subtitle || '',
      image: news.image || '',
      imageMobile: news.imageMobile || '',
      gallery: news.gallery || [],
      content: news.content || '',
      excerpt: news.excerpt || '',
      category: news.category || '',
      tags: news.tags || [],
      author: news.author || '',
      publishedAt: news.publishedAt ? news.publishedAt.slice(0, 16) : '',
      isPublished: news.isPublished,
      isFeatured: news.isFeatured,
      languageCode: news.languageCode,
      brandIds: news.brands?.map((b) => b.id) || [],
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (news: NewsResponse) => {
    setSelectedNews(news)
    setIsDeleteModalOpen(true)
  }

  const columns = useMemo<ColumnDef<NewsResponse, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('image', {
        header: 'Image',
        cell: (info) => {
          const url = info.getValue()
          return url ? (
            <img src={url} alt="News" className="h-10 w-10 object-cover rounded" />
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )
        },
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('author', {
        header: 'Author',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('isPublished', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              info.getValue()
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {info.getValue() ? 'Published' : 'Draft'}
          </span>
        ),
      }),
      columnHelper.accessor('isFeatured', {
        header: 'Featured',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() ? <StarIcon className="w-5 h-5 text-yellow-500" /> : '-'}
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync({
        title: formData.title,
        slug: formData.slug,
        subtitle: formData.subtitle || undefined,
        image: formData.image || undefined,
        imageMobile: formData.imageMobile || undefined,
        gallery: formData.gallery.length > 0 ? formData.gallery : undefined,
        content: formData.content || undefined,
        excerpt: formData.excerpt || undefined,
        category: formData.category || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        author: formData.author || undefined,
        publishedAt: formData.publishedAt || undefined,
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        languageCode: formData.languageCode,
        brandIds: formData.brandIds.length > 0 ? formData.brandIds : undefined,
      })
      setIsCreateModalOpen(false)
      setFormData(initialFormData)
    } catch (err) {
      console.error('Failed to create news:', err)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNews) return
    try {
      await updateMutation.mutateAsync({
        id: selectedNews.id,
        data: {
          title: formData.title,
          slug: formData.slug,
          subtitle: formData.subtitle || undefined,
          image: formData.image || undefined,
          imageMobile: formData.imageMobile || undefined,
          gallery: formData.gallery,
          content: formData.content || undefined,
          excerpt: formData.excerpt || undefined,
          category: formData.category || undefined,
          tags: formData.tags,
          author: formData.author || undefined,
          publishedAt: formData.publishedAt || undefined,
          isPublished: formData.isPublished,
          isFeatured: formData.isFeatured,
          languageCode: formData.languageCode,
          brandIds: formData.brandIds,
        },
      })
      setIsEditModalOpen(false)
      setSelectedNews(null)
      setFormData(initialFormData)
    } catch (err) {
      console.error('Failed to update news:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedNews) return
    try {
      await deleteMutation.mutateAsync(selectedNews.id)
      setIsDeleteModalOpen(false)
      setSelectedNews(null)
    } catch (err) {
      console.error('Failed to delete news:', err)
    }
  }

  // Media picker handlers
  const handleMediaSelect = (media: MultimediaResponse) => {
    if (!mediaPickerTarget) return

    if (mediaPickerTarget.type === 'image') {
      setFormData((prev) => ({ ...prev, image: media.originalUrl }))
    } else if (mediaPickerTarget.type === 'imageMobile') {
      setFormData((prev) => ({ ...prev, imageMobile: media.originalUrl }))
    } else if (mediaPickerTarget.type === 'gallery') {
      if (mediaPickerTarget.index !== undefined) {
        setFormData((prev) => ({
          ...prev,
          gallery: prev.gallery.map((g, i) =>
            i === mediaPickerTarget.index ? media.originalUrl : g
          ),
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          gallery: [...prev.gallery, media.originalUrl],
        }))
      }
    }
    setMediaPickerTarget(null)
  }

  // Gallery handlers
  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }))
  }

  // Tags handlers
  const addTag = () => {
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, ''],
    }))
  }

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  const updateTag = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.map((tag, i) => (i === index ? value : tag)),
    }))
  }

  // Brand toggle handler
  const toggleBrand = (brandId: string) => {
    setFormData((prev) => ({
      ...prev,
      brandIds: prev.brandIds.includes(brandId)
        ? prev.brandIds.filter((id) => id !== brandId)
        : [...prev.brandIds, brandId],
    }))
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">
                {t('nav.news')}
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage your news articles
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create News
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search news..."
              value={searchTitle}
              onChange={(e) => {
                setSearchTitle(e.target.value)
                setPage(1)
              }}
              className="flex-1 min-w-48 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Filter by category..."
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value)
                setPage(1)
              }}
              className="w-48 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterPublished}
              onChange={(e) => {
                setFilterPublished(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading news...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load news</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No news found</p>
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
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <NewsFormModal
          title="Create News"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          onClose={() => {
            setIsCreateModalOpen(false)
            setFormData(initialFormData)
          }}
          isSubmitting={createMutation.isPending}
          submitLabel="Create"
          languages={languagesData?.data || []}
          brands={brandsData?.data || []}
          onOpenMediaPicker={setMediaPickerTarget}
          onRemoveGalleryImage={removeGalleryImage}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          onUpdateTag={updateTag}
          onToggleBrand={toggleBrand}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedNews && (
        <NewsFormModal
          title="Edit News"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedNews(null)
            setFormData(initialFormData)
          }}
          isSubmitting={updateMutation.isPending}
          submitLabel="Update"
          languages={languagesData?.data || []}
          brands={brandsData?.data || []}
          onOpenMediaPicker={setMediaPickerTarget}
          onRemoveGalleryImage={removeGalleryImage}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          onUpdateTag={updateTag}
          onToggleBrand={toggleBrand}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedNews && (
        <Modal
          title="Delete News"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedNews(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete the news article "<strong>{selectedNews.title}</strong>"?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedNews(null)
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

      {/* Media Picker */}
      <MediaPicker
        isOpen={mediaPickerTarget !== null}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={handleMediaSelect}
        title="Select Image"
      />
    </Layout>
  )
}

// News Form Modal Component
interface NewsFormModalProps {
  title: string
  formData: NewsFormData
  setFormData: React.Dispatch<React.SetStateAction<NewsFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  submitLabel: string
  languages: { code: string; name: string; nativeName: string }[]
  brands: { id: string; name: string }[]
  onOpenMediaPicker: (target: MediaPickerTarget) => void
  onRemoveGalleryImage: (index: number) => void
  onAddTag: () => void
  onRemoveTag: (index: number) => void
  onUpdateTag: (index: number, value: string) => void
  onToggleBrand: (brandId: string) => void
}

function NewsFormModal({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  isSubmitting,
  submitLabel,
  languages,
  brands,
  onOpenMediaPicker,
  onRemoveGalleryImage,
  onAddTag,
  onRemoveTag,
  onUpdateTag,
  onToggleBrand,
}: NewsFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  maxLength={255}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="News title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  maxLength={255}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="news-slug"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Language *
                </label>
                <select
                  value={formData.languageCode}
                  onChange={(e) => setFormData({ ...formData, languageCode: e.target.value })}
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
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  maxLength={255}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optional subtitle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  maxLength={100}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Announcements"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  maxLength={100}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Published At
                </label>
                <input
                  type="datetime-local"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded border-border focus:ring-primary"
                  />
                  <span className="text-sm text-card-foreground">Published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-border focus:ring-primary"
                  />
                  <span className="text-sm text-card-foreground">Featured</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Short summary of the news article"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Content
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
                placeholder="Full content of the news article"
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Images
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Main Image
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenMediaPicker({ type: 'image' })}
                    className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                  >
                    <PhotoIcon className="w-5 h-5" />
                    Select
                  </button>
                  {formData.image && (
                    <>
                      <img
                        src={formData.image}
                        alt="News"
                        className="w-12 h-12 object-cover rounded border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
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
                  Mobile Image
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenMediaPicker({ type: 'imageMobile' })}
                    className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                  >
                    <PhotoIcon className="w-5 h-5" />
                    Select
                  </button>
                  {formData.imageMobile && (
                    <>
                      <img
                        src={formData.imageMobile}
                        alt="News Mobile"
                        className="w-12 h-12 object-cover rounded border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageMobile: '' })}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-card-foreground">Gallery</label>
                <button
                  type="button"
                  onClick={() => onOpenMediaPicker({ type: 'gallery' })}
                  className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Image
                </button>
              </div>
              {formData.gallery.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                  No gallery images added
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {formData.gallery.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        className="w-20 h-20 object-cover rounded border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveGalleryImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="text-sm font-semibold text-card-foreground">Tags</h4>
              <button
                type="button"
                onClick={onAddTag}
                className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Tag
              </button>
            </div>
            {formData.tags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No tags added</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-lg border border-border"
                  >
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => onUpdateTag(index, e.target.value)}
                      placeholder="Tag"
                      className="w-24 px-2 py-0.5 bg-background border border-border rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveTag(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brands Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Related Brands
            </h4>
            {brands.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No brands available</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => onToggleBrand(brand.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      formData.brandIds.includes(brand.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal Component
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

// Icons
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

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  )
}
