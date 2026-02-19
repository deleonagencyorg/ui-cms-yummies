import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import MediaPicker from '@/components/MediaPicker'
import type { MultimediaResponse } from '@/actions/multimedia'
import { useTranslation } from 'react-i18next'
import { useProducts } from '@/queries/products'
import { useLanguages } from '@/queries/languages'
import { useBrands } from '@/queries/brands'
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/mutations/products'
import type {
  ProductResponse,
  ProductSizeRequest,
  NutritionRowRequest,
  ProductNutritionRequest,
} from '@/actions/products'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<ProductResponse>()

interface ProductFormData {
  name: string
  slug: string
  image: string
  imageMobile: string
  backgroundColor: string
  category: string
  headerTextColor: string
  colorButton: string
  textColor: string
  description: string
  available: string
  backgroundImage: string
  languageCode: string
  sizes: ProductSizeRequest[]
  weight: string[]
  nutrition: ProductNutritionRequest
  brandId: string
}

const initialFormData: ProductFormData = {
  name: '',
  slug: '',
  image: '',
  imageMobile: '',
  backgroundColor: '',
  category: '',
  headerTextColor: '',
  colorButton: '',
  textColor: '',
  description: '',
  available: '',
  backgroundImage: '',
  languageCode: '',
  sizes: [],
  weight: [],
  nutrition: {
    title: '',
    serving: '',
    rows: [],
    disclaimer: '',
  },
  brandId: '',
}

type MediaPickerTarget =
  | { type: 'image' }
  | { type: 'imageMobile' }
  | { type: 'backgroundImage' }
  | { type: 'available' }
  | { type: 'sizeImage'; index: number }

export default function Products() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchName, setSearchName] = useState('')
  const [filterBrandId, setFilterBrandId] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)

  // Media picker state
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget | null>(null)

  const { data, isLoading, error } = useProducts({
    page,
    pageSize,
    name: searchName || undefined,
    brandId: filterBrandId || undefined,
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: brandsData } = useBrands({ page: 1, pageSize: 100 })
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  const openEditModal = (product: ProductResponse) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      image: product.image || '',
      imageMobile: product.imageMobile || '',
      backgroundColor: product.backgroundColor || '',
      category: product.category || '',
      headerTextColor: product.headerTextColor || '',
      colorButton: product.colorButton || '',
      textColor: product.textColor || '',
      description: product.description || '',
      available: product.available || '',
      backgroundImage: product.backgroundImage || '',
      languageCode: product.languageCode,
      sizes: product.sizes?.map((s) => ({ value: s.value, image: s.image })) || [],
      weight: product.weight || [],
      nutrition: {
        title: product.nutrition?.title || '',
        serving: product.nutrition?.serving || '',
        rows: product.nutrition?.rows?.map((r) => ({ label: r.label, value: r.value })) || [],
        disclaimer: product.nutrition?.disclaimer || '',
      },
      brandId: product.brandId,
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (product: ProductResponse) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  const getBrandName = (brandId: string) => {
    return brandsData?.data.find((b) => b.id === brandId)?.name || '-'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo<ColumnDef<ProductResponse, any>[]>(
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
      columnHelper.accessor('image', {
        header: 'Image',
        cell: (info) => {
          const url = info.getValue()
          return url ? (
            <img src={url} alt="Product" className="h-10 w-10 object-cover rounded" />
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
      columnHelper.accessor('brandId', {
        header: 'Brand',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {getBrandName(info.getValue())}
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
    [brandsData]
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
        image: formData.image || undefined,
        imageMobile: formData.imageMobile || undefined,
        backgroundColor: formData.backgroundColor || undefined,
        category: formData.category || undefined,
        headerTextColor: formData.headerTextColor || undefined,
        colorButton: formData.colorButton || undefined,
        textColor: formData.textColor || undefined,
        description: formData.description || undefined,
        available: formData.available || undefined,
        backgroundImage: formData.backgroundImage || undefined,
        languageCode: formData.languageCode,
        sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
        weight: formData.weight.length > 0 ? formData.weight : undefined,
        nutrition: formData.nutrition.title || formData.nutrition.rows?.length
          ? formData.nutrition
          : undefined,
        brandId: formData.brandId,
      })
      setIsCreateModalOpen(false)
      setFormData(initialFormData)
    } catch (err) {
      console.error('Failed to create product:', err)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    try {
      await updateMutation.mutateAsync({
        id: selectedProduct.id,
        data: {
          name: formData.name,
          slug: formData.slug,
          image: formData.image || undefined,
          imageMobile: formData.imageMobile || undefined,
          backgroundColor: formData.backgroundColor || undefined,
          category: formData.category || undefined,
          headerTextColor: formData.headerTextColor || undefined,
          colorButton: formData.colorButton || undefined,
          textColor: formData.textColor || undefined,
          description: formData.description || undefined,
          available: formData.available || undefined,
          backgroundImage: formData.backgroundImage || undefined,
          languageCode: formData.languageCode,
          sizes: formData.sizes,
          weight: formData.weight,
          nutrition: formData.nutrition,
          brandId: formData.brandId,
        },
      })
      setIsEditModalOpen(false)
      setSelectedProduct(null)
      setFormData(initialFormData)
    } catch (err) {
      console.error('Failed to update product:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return
    try {
      await deleteMutation.mutateAsync(selectedProduct.id)
      setIsDeleteModalOpen(false)
      setSelectedProduct(null)
    } catch (err) {
      console.error('Failed to delete product:', err)
    }
  }

  // Media picker handlers
  const handleMediaSelect = (media: MultimediaResponse) => {
    if (!mediaPickerTarget) return

    if (mediaPickerTarget.type === 'image') {
      setFormData((prev) => ({ ...prev, image: media.originalUrl }))
    } else if (mediaPickerTarget.type === 'imageMobile') {
      setFormData((prev) => ({ ...prev, imageMobile: media.originalUrl }))
    } else if (mediaPickerTarget.type === 'backgroundImage') {
      setFormData((prev) => ({ ...prev, backgroundImage: media.originalUrl }))
    } else if (mediaPickerTarget.type === 'available') {
      setFormData((prev) => ({ ...prev, available: media.originalUrl }))
    } else if (mediaPickerTarget.type === 'sizeImage') {
      updateSize(mediaPickerTarget.index, 'image', media.originalUrl)
    }
    setMediaPickerTarget(null)
  }

  // Size handlers
  const addSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { value: '', image: '' }],
    }))
  }

  const removeSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }))
  }

  const updateSize = (index: number, field: keyof ProductSizeRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }))
  }

  // Weight handlers
  const addWeight = () => {
    setFormData((prev) => ({
      ...prev,
      weight: [...prev.weight, ''],
    }))
  }

  const removeWeight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      weight: prev.weight.filter((_, i) => i !== index),
    }))
  }

  const updateWeight = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      weight: prev.weight.map((w, i) => (i === index ? value : w)),
    }))
  }

  // Nutrition handlers
  const addNutritionRow = () => {
    setFormData((prev) => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        rows: [...(prev.nutrition.rows || []), { label: '', value: '' }],
      },
    }))
  }

  const removeNutritionRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        rows: (prev.nutrition.rows || []).filter((_, i) => i !== index),
      },
    }))
  }

  const updateNutritionRow = (index: number, field: keyof NutritionRowRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        rows: (prev.nutrition.rows || []).map((r, i) =>
          i === index ? { ...r, [field]: value } : r
        ),
      },
    }))
  }

  const updateNutrition = (field: keyof ProductNutritionRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      nutrition: { ...prev.nutrition, [field]: value },
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
                {t('nav.products')}
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage your products catalog
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Product
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value)
                setPage(1)
              }}
              className="flex-1 min-w-48 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterBrandId}
              onChange={(e) => {
                setFilterBrandId(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Brands</option>
              {brandsData?.data.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load products</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
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
        <ProductFormModal
          title="Create Product"
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
          onAddSize={addSize}
          onRemoveSize={removeSize}
          onUpdateSize={updateSize}
          onAddWeight={addWeight}
          onRemoveWeight={removeWeight}
          onUpdateWeight={updateWeight}
          onAddNutritionRow={addNutritionRow}
          onRemoveNutritionRow={removeNutritionRow}
          onUpdateNutritionRow={updateNutritionRow}
          onUpdateNutrition={updateNutrition}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedProduct && (
        <ProductFormModal
          title="Edit Product"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedProduct(null)
            setFormData(initialFormData)
          }}
          isSubmitting={updateMutation.isPending}
          submitLabel="Update"
          languages={languagesData?.data || []}
          brands={brandsData?.data || []}
          onOpenMediaPicker={setMediaPickerTarget}
          onAddSize={addSize}
          onRemoveSize={removeSize}
          onUpdateSize={updateSize}
          onAddWeight={addWeight}
          onRemoveWeight={removeWeight}
          onUpdateWeight={updateWeight}
          onAddNutritionRow={addNutritionRow}
          onRemoveNutritionRow={removeNutritionRow}
          onUpdateNutritionRow={updateNutritionRow}
          onUpdateNutrition={updateNutrition}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedProduct && (
        <Modal
          title="Delete Product"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedProduct(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete the product "<strong>{selectedProduct.name}</strong>"?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedProduct(null)
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

// Product Form Modal Component
interface ProductFormModalProps {
  title: string
  formData: ProductFormData
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  submitLabel: string
  languages: { code: string; name: string; nativeName: string }[]
  brands: { id: string; name: string }[]
  onOpenMediaPicker: (target: MediaPickerTarget) => void
  onAddSize: () => void
  onRemoveSize: (index: number) => void
  onUpdateSize: (index: number, field: keyof ProductSizeRequest, value: string) => void
  onAddWeight: () => void
  onRemoveWeight: (index: number) => void
  onUpdateWeight: (index: number, value: string) => void
  onAddNutritionRow: () => void
  onRemoveNutritionRow: (index: number) => void
  onUpdateNutritionRow: (index: number, field: keyof NutritionRowRequest, value: string) => void
  onUpdateNutrition: (field: keyof ProductNutritionRequest, value: string) => void
}

function ProductFormModal({
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
  onAddSize,
  onRemoveSize,
  onUpdateSize,
  onAddWeight,
  onRemoveWeight,
  onUpdateWeight,
  onAddNutritionRow,
  onRemoveNutritionRow,
  onUpdateNutritionRow,
  onUpdateNutrition,
}: ProductFormModalProps) {
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
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={100}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Product name"
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
                  placeholder="product-slug"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Brand *
                </label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
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
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  maxLength={100}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Product category"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Product description"
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Images
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ImageField
                label="Main Image"
                value={formData.image}
                onClear={() => setFormData({ ...formData, image: '' })}
                onSelect={() => onOpenMediaPicker({ type: 'image' })}
              />
              <ImageField
                label="Mobile Image"
                value={formData.imageMobile}
                onClear={() => setFormData({ ...formData, imageMobile: '' })}
                onSelect={() => onOpenMediaPicker({ type: 'imageMobile' })}
              />
              <ImageField
                label="Background Image"
                value={formData.backgroundImage}
                onClear={() => setFormData({ ...formData, backgroundImage: '' })}
                onSelect={() => onOpenMediaPicker({ type: 'backgroundImage' })}
              />
              <ImageField
                label="Available Image"
                value={formData.available}
                onClear={() => setFormData({ ...formData, available: '' })}
                onSelect={() => onOpenMediaPicker({ type: 'available' })}
              />
            </div>
          </div>

          {/* Colors Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Colors
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorField
                label="Background"
                value={formData.backgroundColor}
                onChange={(v) => setFormData({ ...formData, backgroundColor: v })}
              />
              <ColorField
                label="Header Text"
                value={formData.headerTextColor}
                onChange={(v) => setFormData({ ...formData, headerTextColor: v })}
              />
              <ColorField
                label="Button"
                value={formData.colorButton}
                onChange={(v) => setFormData({ ...formData, colorButton: v })}
              />
              <ColorField
                label="Text"
                value={formData.textColor}
                onChange={(v) => setFormData({ ...formData, textColor: v })}
              />
            </div>
          </div>

          {/* Sizes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="text-sm font-semibold text-card-foreground">Sizes</h4>
              <button
                type="button"
                onClick={onAddSize}
                className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Size
              </button>
            </div>
            {formData.sizes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No sizes added
              </p>
            ) : (
              <div className="space-y-3">
                {formData.sizes.map((size, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border"
                  >
                    <input
                      type="text"
                      value={size.value}
                      onChange={(e) => onUpdateSize(index, 'value', e.target.value)}
                      placeholder="Size value"
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => onOpenMediaPicker({ type: 'sizeImage', index })}
                      className="px-3 py-2 bg-background border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-1 text-sm"
                    >
                      <PhotoIcon className="w-4 h-4" />
                      Image
                    </button>
                    {size.image && (
                      <img
                        src={size.image}
                        alt="Size"
                        className="w-8 h-8 object-cover rounded border border-border"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveSize(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weight Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="text-sm font-semibold text-card-foreground">Weight Options</h4>
              <button
                type="button"
                onClick={onAddWeight}
                className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Weight
              </button>
            </div>
            {formData.weight.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No weight options added
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.weight.map((w, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-lg border border-border"
                  >
                    <input
                      type="text"
                      value={w}
                      onChange={(e) => onUpdateWeight(index, e.target.value)}
                      placeholder="Weight"
                      className="w-24 px-2 py-1 bg-background border border-border rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveWeight(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nutrition Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Nutrition Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.nutrition.title || ''}
                  onChange={(e) => onUpdateNutrition('title', e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Nutrition Facts"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Serving Size
                </label>
                <input
                  type="text"
                  value={formData.nutrition.serving || ''}
                  onChange={(e) => onUpdateNutrition('serving', e.target.value)}
                  maxLength={255}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Per serving (100g)"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Disclaimer
              </label>
              <textarea
                value={formData.nutrition.disclaimer || ''}
                onChange={(e) => onUpdateNutrition('disclaimer', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Nutritional disclaimer text"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-muted-foreground">
                  Nutrition Rows
                </label>
                <button
                  type="button"
                  onClick={onAddNutritionRow}
                  className="px-2 py-1 text-xs bg-secondary text-foreground rounded hover:bg-secondary/80 flex items-center gap-1"
                >
                  <PlusIcon className="w-3 h-3" />
                  Add Row
                </button>
              </div>
              {(formData.nutrition.rows || []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No nutrition rows added
                </p>
              ) : (
                <div className="space-y-2">
                  {(formData.nutrition.rows || []).map((row, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => onUpdateNutritionRow(index, 'label', e.target.value)}
                        placeholder="Label (e.g., Calories)"
                        className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => onUpdateNutritionRow(index, 'value', e.target.value)}
                        placeholder="Value (e.g., 250kcal)"
                        className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveNutritionRow(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

// Image Field Component
function ImageField({
  label,
  value,
  onClear,
  onSelect,
}: {
  label: string
  value: string
  onClear: () => void
  onSelect: () => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-card-foreground mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-1 text-sm"
        >
          <PhotoIcon className="w-4 h-4" />
          Select
        </button>
        {value && (
          <>
            <img
              src={value}
              alt={label}
              className="w-10 h-10 object-cover rounded border border-border"
            />
            <button
              type="button"
              onClick={onClear}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Color Field Component
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 p-0.5 bg-background border border-border rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          maxLength={7}
          className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm font-mono"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-red-600 hover:text-red-800"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
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
