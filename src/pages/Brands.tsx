import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import MediaPicker from '@/components/MediaPicker'
import type { MultimediaResponse } from '@/actions/multimedia'
import { useTranslation } from 'react-i18next'
import { useBrands } from '@/queries/brands'
import { useLanguages } from '@/queries/languages'
import { useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/mutations/brands'
import type { BrandResponse, BrandLanguageRequest } from '@/actions/brands'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<BrandResponse>()

interface BrandFormData {
  name: string
  slug: string
  logoUrl: string
  background: string
  brandLanguages: BrandLanguageRequest[]
}

const initialFormData: BrandFormData = {
  name: '',
  slug: '',
  logoUrl: '',
  background: '',
  brandLanguages: [],
}

export default function Brands() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchName, setSearchName] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<BrandResponse | null>(null)
  const [formData, setFormData] = useState<BrandFormData>(initialFormData)

  // Media picker states
  const [isBrandLogoPickerOpen, setIsBrandLogoPickerOpen] = useState(false)
  const [brandLanguageLogoIndex, setBrandLanguageLogoIndex] = useState<number | null>(null)

  const { data, isLoading, error } = useBrands({ page, pageSize, name: searchName || undefined })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const createMutation = useCreateBrand()
  const updateMutation = useUpdateBrand()
  const deleteMutation = useDeleteBrand()

  const openEditModal = (brand: BrandResponse) => {
    setSelectedBrand(brand)
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl || '',
      background: brand.background || '',
      brandLanguages: brand.brandLanguages?.map((bl) => ({
        id: bl.id,
        name: bl.name,
        link: bl.link || '',
        logoUrl: bl.logoUrl || '',
        caption: bl.caption || '',
        code: bl.code,
      })) || [],
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (brand: BrandResponse) => {
    setSelectedBrand(brand)
    setIsDeleteModalOpen(true)
  }

  const columns = useMemo<ColumnDef<BrandResponse, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('slug', {
        header: 'Slug',
        cell: (info) => (
          <span className="text-sm text-muted-foreground font-mono">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('logoUrl', {
        header: 'Logo',
        cell: (info) => {
          const url = info.getValue()
          return url ? (
            <img src={url} alt="Logo" className="h-8 w-8 object-contain rounded" />
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )
        },
      }),
      columnHelper.accessor('brandLanguages', {
        header: 'Languages',
        cell: (info) => {
          const languages = info.getValue()
          return (
            <span className="text-sm text-muted-foreground">
              {languages?.length || 0} language(s)
            </span>
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        slug: formData.slug,
        logoUrl: formData.logoUrl || undefined,
        background: formData.background || undefined,
        brandLanguages: formData.brandLanguages.length > 0 ? formData.brandLanguages : undefined,
      })
      setIsCreateModalOpen(false)
      setFormData(initialFormData)
    } catch (err) {
      console.error('Failed to create brand:', err)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBrand) return
    try {
      await updateMutation.mutateAsync({
        id: selectedBrand.id,
        data: {
          name: formData.name,
          slug: formData.slug,
          logoUrl: formData.logoUrl || undefined,
          background: formData.background || undefined,
          brandLanguages: formData.brandLanguages,
        },
      })
      setIsEditModalOpen(false)
      setSelectedBrand(null)
      setFormData(initialFormData)
    } catch (err) {
      console.error('Failed to update brand:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedBrand) return
    try {
      await deleteMutation.mutateAsync(selectedBrand.id)
      setIsDeleteModalOpen(false)
      setSelectedBrand(null)
    } catch (err) {
      console.error('Failed to delete brand:', err)
    }
  }

  const addBrandLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      brandLanguages: [
        ...prev.brandLanguages,
        { name: '', link: '', logoUrl: '', caption: '', code: '' },
      ],
    }))
  }

  const removeBrandLanguage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      brandLanguages: prev.brandLanguages.filter((_, i) => i !== index),
    }))
  }

  const updateBrandLanguage = (index: number, field: keyof BrandLanguageRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      brandLanguages: prev.brandLanguages.map((bl, i) =>
        i === index ? { ...bl, [field]: value } : bl
      ),
    }))
  }

  const getAvailableLanguages = (currentCode?: string) => {
    if (!languagesData?.data) return []
    const usedCodes = formData.brandLanguages
      .map((bl) => bl.code)
      .filter((code) => code && code !== currentCode)
    return languagesData.data.filter((lang) => !usedCodes.includes(lang.code))
  }

  // Handle brand logo selection from media picker
  const handleBrandLogoSelect = (media: MultimediaResponse) => {
    setFormData((prev) => ({ ...prev, logoUrl: media.originalUrl }))
    setIsBrandLogoPickerOpen(false)
  }

  // Handle brand language logo selection from media picker
  const handleBrandLanguageLogoSelect = (media: MultimediaResponse) => {
    if (brandLanguageLogoIndex !== null) {
      updateBrandLanguage(brandLanguageLogoIndex, 'logoUrl', media.originalUrl)
      setBrandLanguageLogoIndex(null)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">
                {t('nav.brands')}
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage your brands and their translations
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Brand
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search brands..."
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value)
                setPage(1)
              }}
              className="w-full md:w-96 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading brands...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load brands</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No brands found</p>
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
        <Modal
          title="Create Brand"
          onClose={() => {
            setIsCreateModalOpen(false)
            setFormData(initialFormData)
          }}
          size="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={100}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter brand name"
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
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="brand-slug"
                />
              </div>
            </div>

            {/* Brand Logo - Media Picker */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Logo
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsBrandLogoPickerOpen(true)}
                  className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                >
                  <PhotoIcon className="w-5 h-5" />
                  Select from Media
                </button>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoUrl: '' })}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                    title="Clear logo"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              {formData.logoUrl && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border">
                  <img
                    src={formData.logoUrl}
                    alt="Brand logo preview"
                    className="w-16 h-16 object-contain rounded border border-border bg-background"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      {formData.logoUrl}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Brand Background Color */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.background || '#ffffff'}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  className="w-12 h-10 p-1 bg-background border border-border rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  placeholder="#ffffff"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  maxLength={7}
                  className="w-32 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
                {formData.background && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, background: '' })}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                    title="Clear background color"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Brand Languages Section */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-card-foreground">
                  Brand Languages
                </label>
                <button
                  type="button"
                  onClick={addBrandLanguage}
                  className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Language
                </button>
              </div>

              {formData.brandLanguages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No languages added. Click "Add Language" to add translations.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.brandLanguages.map((bl, index) => (
                    <BrandLanguageForm
                      key={index}
                      brandLanguage={bl}
                      index={index}
                      availableLanguages={getAvailableLanguages(bl.code)}
                      allLanguages={languagesData?.data || []}
                      onUpdate={updateBrandLanguage}
                      onRemove={removeBrandLanguage}
                      onOpenMediaPicker={() => setBrandLanguageLogoIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setFormData(initialFormData)
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedBrand && (
        <Modal
          title="Edit Brand"
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedBrand(null)
            setFormData(initialFormData)
          }}
          size="lg"
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={100}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter brand name"
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
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="brand-slug"
                />
              </div>
            </div>

            {/* Brand Logo - Media Picker */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Logo
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsBrandLogoPickerOpen(true)}
                  className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                >
                  <PhotoIcon className="w-5 h-5" />
                  Select from Media
                </button>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoUrl: '' })}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                    title="Clear logo"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              {formData.logoUrl && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border">
                  <img
                    src={formData.logoUrl}
                    alt="Brand logo preview"
                    className="w-16 h-16 object-contain rounded border border-border bg-background"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      {formData.logoUrl}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Brand Background Color */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.background || '#ffffff'}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  className="w-12 h-10 p-1 bg-background border border-border rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  placeholder="#ffffff"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  maxLength={7}
                  className="w-32 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
                {formData.background && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, background: '' })}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                    title="Clear background color"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Brand Languages Section */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-card-foreground">
                  Brand Languages
                </label>
                <button
                  type="button"
                  onClick={addBrandLanguage}
                  className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Language
                </button>
              </div>

              {formData.brandLanguages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No languages added. Click "Add Language" to add translations.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.brandLanguages.map((bl, index) => (
                    <BrandLanguageForm
                      key={bl.id || index}
                      brandLanguage={bl}
                      index={index}
                      availableLanguages={getAvailableLanguages(bl.code)}
                      allLanguages={languagesData?.data || []}
                      onUpdate={updateBrandLanguage}
                      onRemove={removeBrandLanguage}
                      onOpenMediaPicker={() => setBrandLanguageLogoIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedBrand(null)
                  setFormData(initialFormData)
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedBrand && (
        <Modal
          title="Delete Brand"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedBrand(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete the brand "<strong>{selectedBrand.name}</strong>"?
              This will also delete all associated brand languages. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedBrand(null)
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

      {/* Media Picker for Brand Logo */}
      <MediaPicker
        isOpen={isBrandLogoPickerOpen}
        onClose={() => setIsBrandLogoPickerOpen(false)}
        onSelect={handleBrandLogoSelect}
        currentUrl={formData.logoUrl}
        title="Select Brand Logo"
      />

      {/* Media Picker for Brand Language Logo */}
      <MediaPicker
        isOpen={brandLanguageLogoIndex !== null}
        onClose={() => setBrandLanguageLogoIndex(null)}
        onSelect={handleBrandLanguageLogoSelect}
        currentUrl={brandLanguageLogoIndex !== null ? formData.brandLanguages[brandLanguageLogoIndex]?.logoUrl : undefined}
        title="Select Language Logo"
      />
    </Layout>
  )
}

// Brand Language Form Component
interface BrandLanguageFormProps {
  brandLanguage: BrandLanguageRequest
  index: number
  availableLanguages: { code: string; name: string; nativeName: string }[]
  allLanguages: { code: string; name: string; nativeName: string }[]
  onUpdate: (index: number, field: keyof BrandLanguageRequest, value: string) => void
  onRemove: (index: number) => void
  onOpenMediaPicker: () => void
}

function BrandLanguageForm({
  brandLanguage,
  index,
  availableLanguages,
  allLanguages,
  onUpdate,
  onRemove,
  onOpenMediaPicker,
}: BrandLanguageFormProps) {
  const currentLanguage = allLanguages.find((l) => l.code === brandLanguage.code)
  const selectableLanguages = brandLanguage.code
    ? [currentLanguage, ...availableLanguages].filter(Boolean)
    : availableLanguages

  return (
    <div className="p-4 bg-secondary/30 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-card-foreground">
          Language #{index + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-800"
          title="Remove language"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Language *
          </label>
          <select
            value={brandLanguage.code}
            onChange={(e) => onUpdate(index, 'code', e.target.value)}
            required
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">Select language</option>
            {selectableLanguages.map((lang) => (
              <option key={lang!.code} value={lang!.code}>
                {lang!.name} ({lang!.nativeName})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Name *
          </label>
          <input
            type="text"
            value={brandLanguage.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            required
            maxLength={100}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="Localized brand name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Link
          </label>
          <input
            type="url"
            value={brandLanguage.link || ''}
            onChange={(e) => onUpdate(index, 'link', e.target.value)}
            maxLength={255}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Logo
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenMediaPicker}
              className="px-3 py-2 bg-background border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-1 text-sm"
            >
              <PhotoIcon className="w-4 h-4" />
              Select
            </button>
            {brandLanguage.logoUrl && (
              <>
                <img
                  src={brandLanguage.logoUrl}
                  alt="Logo preview"
                  className="w-8 h-8 object-contain rounded border border-border bg-background"
                />
                <button
                  type="button"
                  onClick={() => onUpdate(index, 'logoUrl', '')}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Clear logo"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Caption
          </label>
          <input
            type="text"
            value={brandLanguage.caption || ''}
            onChange={(e) => onUpdate(index, 'caption', e.target.value)}
            maxLength={255}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="Brand caption or tagline"
          />
        </div>
      </div>
    </div>
  )
}

// Modal Component
function Modal({
  title,
  children,
  onClose,
  size = 'md',
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  size?: 'md' | 'lg'
}) {
  const maxWidthClass = size === 'lg' ? 'max-w-2xl' : 'max-w-md'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-card rounded-lg shadow-xl ${maxWidthClass} w-full border border-border max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
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

function TrashIcon({ className }: { className?: string }) {
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
