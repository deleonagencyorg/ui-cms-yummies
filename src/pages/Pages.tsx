import { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import MediaPicker from '@/components/MediaPicker'
import { useSite } from '@/contexts/SiteContext'
import { toast } from 'sonner'
import { usePages } from '@/queries/pages'
import { useSites } from '@/queries/sites'
import { useLanguages } from '@/queries/languages'
import { useCreatePage, useUpdatePage, useDeletePage } from '@/mutations/pages'
import type { PageResponse, CreatePageRequest } from '@/actions/pages'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<PageResponse>()

const PAGE_STATUSES = ['draft', 'published', 'scheduled', 'trash'] as const

export default function Pages() {
  const { selectedSiteId } = useSite()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTitle, setSearchTitle] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<PageResponse | null>(null)
  const [isFeaturedImagePickerOpen, setIsFeaturedImagePickerOpen] = useState(false)
  const [isOgImagePickerOpen, setIsOgImagePickerOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<CreatePageRequest>>({
    siteId: '',
    languageCode: 'en',
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    featuredImageId: '',
    ogTitle: '',
    ogDescription: '',
    ogImageId: '',
    status: 'draft',
  })

  // Auto-set siteId in form when selectedSiteId changes and form is empty
  useEffect(() => {
    if (selectedSiteId && !formData.siteId) {
      setFormData(prev => ({ ...prev, siteId: selectedSiteId }))
    }
  }, [selectedSiteId])

  const { data, isLoading, error } = usePages({
    page,
    pageSize,
    title: searchTitle || undefined,
    status: filterStatus || undefined,
    siteId: selectedSiteId || undefined,
  })

  const { data: sitesData } = useSites({ page: 1, pageSize: 100 })
  const { data: languagesData } = useLanguages()

  const createMutation = useCreatePage({
    onSuccess: () => {
      toast.success('Page created successfully!')
      setIsCreateModalOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create page')
    },
  })

  const updateMutation = useUpdatePage({
    onSuccess: () => {
      toast.success('Page updated successfully!')
      setIsEditModalOpen(false)
      setSelectedPage(null)
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update page')
    },
  })

  const deleteMutation = useDeletePage({
    onSuccess: () => {
      toast.success('Page deleted successfully!')
      setIsDeleteModalOpen(false)
      setSelectedPage(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete page')
    },
  })

  const resetForm = () => {
    setFormData({
      siteId: selectedSiteId || '',
      languageCode: 'en',
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      featuredImageId: '',
      ogTitle: '',
      ogDescription: '',
      ogImageId: '',
      status: 'draft',
    })
  }

  const openEditModal = (page: PageResponse) => {
    setSelectedPage(page)
    setFormData({
      siteId: page.siteId,
      languageCode: page.languageCode,
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      excerpt: page.excerpt || '',
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      metaKeywords: page.metaKeywords || '',
      featuredImageId: page.featuredImageId || '',
      ogTitle: page.ogTitle || '',
      ogDescription: page.ogDescription || '',
      ogImageId: page.ogImageId || '',
      status: page.status,
      publishedAt: page.publishedAt || '',
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (page: PageResponse) => {
    setSelectedPage(page)
    setIsDeleteModalOpen(true)
  }

  const columns = useMemo<ColumnDef<PageResponse, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <div>
            <span className="text-sm font-medium text-card-foreground">
              {info.getValue()}
            </span>
            {info.row.original.site && (
              <p className="text-xs text-muted-foreground">
                {info.row.original.site.name}
              </p>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('slug', {
        header: 'Slug',
        cell: (info) => (
          <span className="text-sm text-muted-foreground font-mono">
            /{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('languageCode', {
        header: 'Language',
        cell: (info) => {
          const languageCode = info.getValue()
          const language = info.row.original.language
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              <span className="font-mono mr-1">{languageCode.toUpperCase()}</span>
              {language && <span className="text-blue-600">• {language.name}</span>}
            </span>
          )
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue()
          const statusColors = {
            draft: 'bg-gray-100 text-gray-800',
            published: 'bg-green-100 text-green-800',
            scheduled: 'bg-blue-100 text-blue-800',
            trash: 'bg-red-100 text-red-800',
          }
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
              {status}
            </span>
          )
        },
      }),
      columnHelper.accessor('author', {
        header: 'Author',
        cell: (info) => {
          const author = info.getValue()
          return author ? (
            <span className="text-sm text-muted-foreground">
              {author.firstName} {author.lastName}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )
        },
      }),
      columnHelper.accessor('updatedAt', {
        header: 'Last Updated',
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
    await createMutation.mutateAsync({
      siteId: formData.siteId!,
      languageCode: formData.languageCode!,
      title: formData.title!,
      slug: formData.slug!,
      content: formData.content!,
      excerpt: formData.excerpt || undefined,
      metaTitle: formData.metaTitle || undefined,
      metaDescription: formData.metaDescription || undefined,
      metaKeywords: formData.metaKeywords || undefined,
      featuredImageId: formData.featuredImageId || undefined,
      ogTitle: formData.ogTitle || undefined,
      ogDescription: formData.ogDescription || undefined,
      ogImageId: formData.ogImageId || undefined,
      status: formData.status,
      publishedAt: formData.publishedAt || undefined,
    })
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPage) return

    await updateMutation.mutateAsync({
      id: selectedPage.id,
      data: {
        siteId: formData.siteId,
        languageCode: formData.languageCode,
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        metaKeywords: formData.metaKeywords || undefined,
        featuredImageId: formData.featuredImageId || undefined,
        ogTitle: formData.ogTitle || undefined,
        ogDescription: formData.ogDescription || undefined,
        ogImageId: formData.ogImageId || undefined,
        status: formData.status,
        publishedAt: formData.publishedAt || undefined,
      }
    })
  }

  const handleDelete = async () => {
    if (!selectedPage) return
    await deleteMutation.mutateAsync(selectedPage.id)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Pages</h2>
              <p className="text-muted-foreground mt-1">Manage your website pages</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Page
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTitle}
              onChange={(e) => {
                setSearchTitle(e.target.value)
                setPage(1)
              }}
              className="flex-1 min-w-48 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              {PAGE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading pages...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load pages</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pages found</p>
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

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <LargeModal
          title={isCreateModalOpen ? 'Create Page' : 'Edit Page'}
          onClose={() => {
            isCreateModalOpen ? setIsCreateModalOpen(false) : setIsEditModalOpen(false)
            setSelectedPage(null)
            resetForm()
          }}
        >
          <form onSubmit={isCreateModalOpen ? handleCreate : handleEdit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Site *
                  </label>
                  <select
                    value={formData.siteId}
                    onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                    required
                    disabled
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-not-allowed opacity-75"
                  >
                    <option value="">Select a site</option>
                    {sitesData?.data.map((site) => (
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
                    onChange={(e) => setFormData({ ...formData, languageCode: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {languagesData?.data.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.name} ({language.nativeName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {PAGE_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
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
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    maxLength={255}
                    placeholder="page-url-slug"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    maxLength={500}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Brief summary of the page"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={8}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    placeholder="Page content (HTML supported)"
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">Featured Image</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFeaturedImagePickerOpen(true)}
                  className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <PhotoIcon className="w-5 h-5 inline mr-2" />
                  Select from Media
                </button>
                {formData.featuredImageId && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, featuredImageId: '' })}
                    className="px-3 py-2 text-red-600 border border-border rounded-lg hover:bg-red-50"
                    title="Clear"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              {formData.featuredImageId && (
                <div className="mt-2 p-2 bg-secondary rounded border border-border">
                  <p className="text-xs text-muted-foreground">
                    Image ID: {formData.featuredImageId}
                  </p>
                </div>
              )}
            </div>

            {/* SEO */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">SEO Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    maxLength={255}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                    maxLength={255}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Open Graph / Social Media */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">Open Graph / Social Media</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    OG Title
                  </label>
                  <input
                    type="text"
                    value={formData.ogTitle}
                    onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                    maxLength={255}
                    placeholder="How the page title appears when shared on social media"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 60-90 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    OG Description
                  </label>
                  <textarea
                    value={formData.ogDescription}
                    onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                    rows={3}
                    placeholder="Brief description for social media previews"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 150-200 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    OG Image
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOgImagePickerOpen(true)}
                      className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <PhotoIcon className="w-5 h-5 inline mr-2" />
                      Select OG Image
                    </button>
                    {formData.ogImageId && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, ogImageId: '' })}
                        className="px-3 py-2 text-red-600 border border-border rounded-lg hover:bg-red-50"
                        title="Clear"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {formData.ogImageId && (
                    <div className="mt-2 p-2 bg-secondary rounded border border-border">
                      <p className="text-xs text-muted-foreground">
                        Image ID: {formData.ogImageId}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 1200x630 pixels (1.91:1 ratio)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  isCreateModalOpen ? setIsCreateModalOpen(false) : setIsEditModalOpen(false)
                  setSelectedPage(null)
                  resetForm()
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? isCreateModalOpen ? 'Creating...' : 'Updating...'
                  : isCreateModalOpen ? 'Create' : 'Update'}
              </button>
            </div>
          </form>
        </LargeModal>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedPage && (
        <Modal
          title="Delete Page"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedPage(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete "<strong>{selectedPage.title}</strong>"?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedPage(null)
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

      {/* Media Pickers */}
      <MediaPicker
        isOpen={isFeaturedImagePickerOpen}
        onClose={() => setIsFeaturedImagePickerOpen(false)}
        onSelect={(url, media) => setFormData({ ...formData, featuredImageId: media.id })}
        currentUrl={formData.featuredImageId}
        title="Select Featured Image"
      />

      <MediaPicker
        isOpen={isOgImagePickerOpen}
        onClose={() => setIsOgImagePickerOpen(false)}
        onSelect={(url, media) => setFormData({ ...formData, ogImageId: media.id })}
        currentUrl={formData.ogImageId}
        title="Select Open Graph Image"
      />
    </Layout>
  )
}

// Large Modal Component (for complex forms)
function LargeModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full border border-border my-8">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

// Modal Component
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
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
