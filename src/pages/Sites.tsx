import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import MediaPicker from '@/components/MediaPicker'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useSites } from '@/queries/sites'
import { useCreateSite, useUpdateSite, useDeleteSite } from '@/mutations/sites'
import type { SiteResponse, CreateSiteRequest } from '@/actions/sites'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<SiteResponse>()

const SITE_STATUSES = ['active', 'inactive', 'maintenance'] as const

export default function Sites() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchName, setSearchName] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<SiteResponse | null>(null)
  const [isFaviconPickerOpen, setIsFaviconPickerOpen] = useState(false)
  const [isLogoPickerOpen, setIsLogoPickerOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateSiteRequest>>({
    name: '',
    domain: '',
    slug: '',
    defaultLanguageCode: 'en',
    status: 'active',
    sitemapEnabled: true,
  })

  const { data, isLoading, error } = useSites({
    page,
    pageSize,
    name: searchName || undefined,
    status: filterStatus || undefined,
  })

  const createMutation = useCreateSite({
    onSuccess: () => {
      toast.success('Site created successfully!')
      setIsCreateModalOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create site')
    },
  })

  const updateMutation = useUpdateSite({
    onSuccess: () => {
      toast.success('Site updated successfully!')
      setIsEditModalOpen(false)
      setSelectedSite(null)
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update site')
    },
  })

  const deleteMutation = useDeleteSite({
    onSuccess: () => {
      toast.success('Site deleted successfully!')
      setIsDeleteModalOpen(false)
      setSelectedSite(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete site')
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      slug: '',
      defaultLanguageCode: 'en',
      status: 'active',
      sitemapEnabled: true,
    })
  }

  const openEditModal = (site: SiteResponse) => {
    setSelectedSite(site)
    setFormData({
      name: site.name,
      domain: site.domain,
      slug: site.slug,
      defaultLanguageCode: site.defaultLanguageCode,
      status: site.status,
      defaultMetaTitle: site.defaultMetaTitle || '',
      defaultMetaDescription: site.defaultMetaDescription || '',
      faviconUrl: site.faviconUrl || '',
      logoUrl: site.logoUrl || '',
      googleAnalyticsId: site.googleAnalyticsId || '',
      googleTagManagerId: site.googleTagManagerId || '',
      facebookPixelId: site.facebookPixelId || '',
      robotsTxt: site.robotsTxt || '',
      sitemapEnabled: site.sitemapEnabled,
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (site: SiteResponse) => {
    setSelectedSite(site)
    setIsDeleteModalOpen(true)
  }

  const columns = useMemo<ColumnDef<SiteResponse, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('domain', {
        header: 'Domain',
        cell: (info) => (
          <a
            href={`https://${info.getValue()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {info.getValue()}
          </a>
        ),
      }),
      columnHelper.accessor('slug', {
        header: 'Slug',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue()
          const statusColors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            maintenance: 'bg-yellow-100 text-yellow-800',
          }
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
              {status}
            </span>
          )
        },
      }),
      columnHelper.accessor('sitemapEnabled', {
        header: 'Sitemap',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() ? 'Enabled' : 'Disabled'}
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
      name: formData.name!,
      domain: formData.domain!,
      slug: formData.slug!,
      defaultLanguageCode: formData.defaultLanguageCode,
      status: formData.status,
      defaultMetaTitle: formData.defaultMetaTitle || undefined,
      defaultMetaDescription: formData.defaultMetaDescription || undefined,
      faviconUrl: formData.faviconUrl || undefined,
      logoUrl: formData.logoUrl || undefined,
      googleAnalyticsId: formData.googleAnalyticsId || undefined,
      googleTagManagerId: formData.googleTagManagerId || undefined,
      facebookPixelId: formData.facebookPixelId || undefined,
      robotsTxt: formData.robotsTxt || undefined,
      sitemapEnabled: formData.sitemapEnabled,
    })
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSite) return

    await updateMutation.mutateAsync({
      id: selectedSite.id,
      data: {
        name: formData.name,
        domain: formData.domain,
        slug: formData.slug,
        defaultLanguageCode: formData.defaultLanguageCode,
        status: formData.status,
        defaultMetaTitle: formData.defaultMetaTitle || undefined,
        defaultMetaDescription: formData.defaultMetaDescription || undefined,
        faviconUrl: formData.faviconUrl || undefined,
        logoUrl: formData.logoUrl || undefined,
        googleAnalyticsId: formData.googleAnalyticsId || undefined,
        googleTagManagerId: formData.googleTagManagerId || undefined,
        facebookPixelId: formData.facebookPixelId || undefined,
        robotsTxt: formData.robotsTxt || undefined,
        sitemapEnabled: formData.sitemapEnabled,
      }
    })
  }

  const handleDelete = async () => {
    if (!selectedSite) return
    await deleteMutation.mutateAsync(selectedSite.id)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Sites</h2>
              <p className="text-muted-foreground mt-1">Manage your websites</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Site
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value)
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
              {SITE_STATUSES.map((status) => (
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
              <p className="mt-4 text-muted-foreground">Loading sites...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load sites</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sites found</p>
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
          title={isCreateModalOpen ? 'Create Site' : 'Edit Site'}
          onClose={() => {
            isCreateModalOpen ? setIsCreateModalOpen(false) : setIsEditModalOpen(false)
            setSelectedSite(null)
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
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={255}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Domain *
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    required
                    maxLength={255}
                    placeholder="example.com"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                    maxLength={100}
                    placeholder="example-site"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Default Language Code
                  </label>
                  <select
                    value={formData.defaultLanguageCode}
                    onChange={(e) => setFormData({ ...formData, defaultLanguageCode: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="en">English (en)</option>
                    <option value="es">Spanish (es)</option>
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
                    {SITE_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sitemapEnabled}
                      onChange={(e) => setFormData({ ...formData, sitemapEnabled: e.target.checked })}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-card-foreground">Enable Sitemap</span>
                  </label>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">SEO Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Default Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.defaultMetaTitle}
                    onChange={(e) => setFormData({ ...formData, defaultMetaTitle: e.target.value })}
                    maxLength={255}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Default Meta Description
                  </label>
                  <textarea
                    value={formData.defaultMetaDescription}
                    onChange={(e) => setFormData({ ...formData, defaultMetaDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Robots.txt
                  </label>
                  <textarea
                    value={formData.robotsTxt}
                    onChange={(e) => setFormData({ ...formData, robotsTxt: e.target.value })}
                    rows={4}
                    placeholder="User-agent: *&#10;Disallow:"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Assets */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">Assets</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Favicon
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFaviconPickerOpen(true)}
                      className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <PhotoIcon className="w-5 h-5 inline mr-2" />
                      Select from Media
                    </button>
                    {formData.faviconUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, faviconUrl: '' })}
                        className="px-3 py-2 text-red-600 border border-border rounded-lg hover:bg-red-50"
                        title="Clear"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {formData.faviconUrl && (
                    <div className="mt-2 p-2 bg-secondary rounded border border-border">
                      <div className="flex items-center gap-2">
                        <img
                          src={formData.faviconUrl}
                          alt="Favicon preview"
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <p className="text-xs text-muted-foreground break-all">{formData.faviconUrl}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Logo
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLogoPickerOpen(true)}
                      className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <PhotoIcon className="w-5 h-5 inline mr-2" />
                      Select from Media
                    </button>
                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: '' })}
                        className="px-3 py-2 text-red-600 border border-border rounded-lg hover:bg-red-50"
                        title="Clear"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {formData.logoUrl && (
                    <div className="mt-2 p-2 bg-secondary rounded border border-border">
                      <div className="flex items-center gap-2">
                        <img
                          src={formData.logoUrl}
                          alt="Logo preview"
                          className="w-16 h-16 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <p className="text-xs text-muted-foreground break-all">{formData.logoUrl}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics & Tracking */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">Analytics & Tracking</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={formData.googleAnalyticsId}
                    onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                    maxLength={50}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Google Tag Manager ID
                  </label>
                  <input
                    type="text"
                    value={formData.googleTagManagerId}
                    onChange={(e) => setFormData({ ...formData, googleTagManagerId: e.target.value })}
                    maxLength={50}
                    placeholder="GTM-XXXXXXX"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={formData.facebookPixelId}
                    onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
                    maxLength={50}
                    placeholder="123456789012345"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  isCreateModalOpen ? setIsCreateModalOpen(false) : setIsEditModalOpen(false)
                  setSelectedSite(null)
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
      {isDeleteModalOpen && selectedSite && (
        <Modal
          title="Delete Site"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedSite(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete "<strong>{selectedSite.name}</strong>"?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedSite(null)
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
        isOpen={isFaviconPickerOpen}
        onClose={() => setIsFaviconPickerOpen(false)}
        onSelect={(url) => setFormData({ ...formData, faviconUrl: url })}
        currentUrl={formData.faviconUrl}
        title="Select Favicon"
      />

      <MediaPicker
        isOpen={isLogoPickerOpen}
        onClose={() => setIsLogoPickerOpen(false)}
        onSelect={(url) => setFormData({ ...formData, logoUrl: url })}
        currentUrl={formData.logoUrl}
        title="Select Logo"
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
