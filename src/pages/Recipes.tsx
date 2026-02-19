import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import MediaPicker from '@/components/MediaPicker'
import type { MultimediaResponse } from '@/actions/multimedia'
import { useTranslation } from 'react-i18next'
import { useRecipes } from '@/queries/recipes'
import { useLanguages } from '@/queries/languages'
import { useBrands } from '@/queries/brands'
import { useProducts } from '@/queries/products'
import { useCreateRecipe, useUpdateRecipe, useDeleteRecipe } from '@/mutations/recipes'
import type { RecipeResponse } from '@/actions/recipes'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<RecipeResponse>()

interface RecipeFormData {
  title: string
  slug: string
  date: string
  people: string
  difficulty: string
  image: string
  gallery: string[]
  type: string
  preparationTime: number
  ingredients: string[]
  category: string
  instructions: string[]
  languageCode: string
  brandIds: string[]
  productIds: string[]
}

const initialFormData: RecipeFormData = {
  title: '',
  slug: '',
  date: '',
  people: '',
  difficulty: '',
  image: '',
  gallery: [],
  type: '',
  preparationTime: 0,
  ingredients: [],
  category: '',
  instructions: [],
  languageCode: '',
  brandIds: [],
  productIds: [],
}

type MediaPickerTarget =
  | { type: 'image' }
  | { type: 'gallery'; index?: number }

export default function Recipes() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTitle, setSearchTitle] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeResponse | null>(null)
  const [formData, setFormData] = useState<RecipeFormData>(initialFormData)

  // Media picker state
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget | null>(null)

  const { data, isLoading, error } = useRecipes({
    page,
    pageSize,
    title: searchTitle || undefined,
    category: filterCategory || undefined,
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: brandsData } = useBrands({ page: 1, pageSize: 100 })
  const { data: productsData } = useProducts({ page: 1, pageSize: 100 })
  const createMutation = useCreateRecipe()
  const updateMutation = useUpdateRecipe()
  const deleteMutation = useDeleteRecipe()

  const openEditModal = (recipe: RecipeResponse) => {
    setSelectedRecipe(recipe)
    setFormData({
      title: recipe.title,
      slug: recipe.slug,
      date: recipe.date || '',
      people: recipe.people || '',
      difficulty: recipe.difficulty || '',
      image: recipe.image || '',
      gallery: recipe.gallery || [],
      type: recipe.type || '',
      preparationTime: recipe.preparationTime || 0,
      ingredients: recipe.ingredients || [],
      category: recipe.category || '',
      instructions: recipe.instructions || [],
      languageCode: recipe.languageCode,
      brandIds: recipe.brands?.map((b) => b.id) || [],
      productIds: recipe.products?.map((p) => p.id) || [],
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (recipe: RecipeResponse) => {
    setSelectedRecipe(recipe)
    setIsDeleteModalOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo<ColumnDef<RecipeResponse, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
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
            <img src={url} alt="Recipe" className="h-10 w-10 object-cover rounded" />
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
      columnHelper.accessor('difficulty', {
        header: 'Difficulty',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('preparationTime', {
        header: 'Prep Time',
        cell: (info) => {
          const time = info.getValue()
          return (
            <span className="text-sm text-muted-foreground">
              {time ? `${time} min` : '-'}
            </span>
          )
        },
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
        date: formData.date || undefined,
        people: formData.people || undefined,
        difficulty: formData.difficulty || undefined,
        image: formData.image || undefined,
        gallery: formData.gallery.length > 0 ? formData.gallery : undefined,
        type: formData.type || undefined,
        preparationTime: formData.preparationTime || undefined,
        ingredients: formData.ingredients.length > 0 ? formData.ingredients : undefined,
        category: formData.category || undefined,
        instructions: formData.instructions.length > 0 ? formData.instructions : undefined,
        languageCode: formData.languageCode,
        brandIds: formData.brandIds.length > 0 ? formData.brandIds : undefined,
        productIds: formData.productIds.length > 0 ? formData.productIds : undefined,
      })
      setIsCreateModalOpen(false)
      setFormData(initialFormData)
    } catch (err) {
      console.error('Failed to create recipe:', err)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecipe) return
    try {
      await updateMutation.mutateAsync({
        id: selectedRecipe.id,
        data: {
          title: formData.title,
          slug: formData.slug,
          date: formData.date || undefined,
          people: formData.people || undefined,
          difficulty: formData.difficulty || undefined,
          image: formData.image || undefined,
          gallery: formData.gallery,
          type: formData.type || undefined,
          preparationTime: formData.preparationTime || undefined,
          ingredients: formData.ingredients,
          category: formData.category || undefined,
          instructions: formData.instructions,
          languageCode: formData.languageCode,
          brandIds: formData.brandIds,
          productIds: formData.productIds,
        },
      })
      setIsEditModalOpen(false)
      setSelectedRecipe(null)
      setFormData(initialFormData)
    } catch (err) {
      console.error('Failed to update recipe:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedRecipe) return
    try {
      await deleteMutation.mutateAsync(selectedRecipe.id)
      setIsDeleteModalOpen(false)
      setSelectedRecipe(null)
    } catch (err) {
      console.error('Failed to delete recipe:', err)
    }
  }

  // Media picker handlers
  const handleMediaSelect = (media: MultimediaResponse) => {
    if (!mediaPickerTarget) return

    if (mediaPickerTarget.type === 'image') {
      setFormData((prev) => ({ ...prev, image: media.originalUrl }))
    } else if (mediaPickerTarget.type === 'gallery') {
      if (mediaPickerTarget.index !== undefined) {
        // Update existing gallery image
        setFormData((prev) => ({
          ...prev,
          gallery: prev.gallery.map((g, i) =>
            i === mediaPickerTarget.index ? media.originalUrl : g
          ),
        }))
      } else {
        // Add new gallery image
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

  // Ingredients handlers
  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ''],
    }))
  }

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  const updateIngredient = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => (i === index ? value : ing)),
    }))
  }

  // Instructions handlers
  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ''],
    }))
  }

  const removeInstruction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }))
  }

  const updateInstruction = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.map((ins, i) => (i === index ? value : ins)),
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

  // Product toggle handler
  const toggleProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
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
                {t('nav.recipes')}
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage your recipes
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Recipe
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search recipes..."
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
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading recipes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load recipes</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recipes found</p>
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
        <RecipeFormModal
          title="Create Recipe"
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
          products={productsData?.data || []}
          onOpenMediaPicker={setMediaPickerTarget}
          onRemoveGalleryImage={removeGalleryImage}
          onAddIngredient={addIngredient}
          onRemoveIngredient={removeIngredient}
          onUpdateIngredient={updateIngredient}
          onAddInstruction={addInstruction}
          onRemoveInstruction={removeInstruction}
          onUpdateInstruction={updateInstruction}
          onToggleBrand={toggleBrand}
          onToggleProduct={toggleProduct}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedRecipe && (
        <RecipeFormModal
          title="Edit Recipe"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedRecipe(null)
            setFormData(initialFormData)
          }}
          isSubmitting={updateMutation.isPending}
          submitLabel="Update"
          languages={languagesData?.data || []}
          brands={brandsData?.data || []}
          products={productsData?.data || []}
          onOpenMediaPicker={setMediaPickerTarget}
          onRemoveGalleryImage={removeGalleryImage}
          onAddIngredient={addIngredient}
          onRemoveIngredient={removeIngredient}
          onUpdateIngredient={updateIngredient}
          onAddInstruction={addInstruction}
          onRemoveInstruction={removeInstruction}
          onUpdateInstruction={updateInstruction}
          onToggleBrand={toggleBrand}
          onToggleProduct={toggleProduct}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedRecipe && (
        <Modal
          title="Delete Recipe"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedRecipe(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete the recipe "<strong>{selectedRecipe.title}</strong>"?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedRecipe(null)
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

// Recipe Form Modal Component
interface RecipeFormModalProps {
  title: string
  formData: RecipeFormData
  setFormData: React.Dispatch<React.SetStateAction<RecipeFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  submitLabel: string
  languages: { code: string; name: string; nativeName: string }[]
  brands: { id: string; name: string }[]
  products: { id: string; name: string }[]
  onOpenMediaPicker: (target: MediaPickerTarget) => void
  onRemoveGalleryImage: (index: number) => void
  onAddIngredient: () => void
  onRemoveIngredient: (index: number) => void
  onUpdateIngredient: (index: number, value: string) => void
  onAddInstruction: () => void
  onRemoveInstruction: (index: number) => void
  onUpdateInstruction: (index: number, value: string) => void
  onToggleBrand: (brandId: string) => void
  onToggleProduct: (productId: string) => void
}

function RecipeFormModal({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  isSubmitting,
  submitLabel,
  languages,
  brands,
  products,
  onOpenMediaPicker,
  onRemoveGalleryImage,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredient,
  onAddInstruction,
  onRemoveInstruction,
  onUpdateInstruction,
  onToggleBrand,
  onToggleProduct,
}: RecipeFormModalProps) {
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
                  placeholder="Recipe title"
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
                  placeholder="recipe-slug"
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
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                  maxLength={50}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Desserts"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Type
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  maxLength={50}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Main Course"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  People/Servings
                </label>
                <input
                  type="text"
                  value={formData.people}
                  onChange={(e) => setFormData({ ...formData, people: e.target.value })}
                  maxLength={50}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 4 servings"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.preparationTime || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 0 })
                  }
                  min={0}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Images
            </h4>
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
                  Select Image
                </button>
                {formData.image && (
                  <>
                    <img
                      src={formData.image}
                      alt="Recipe"
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

          {/* Ingredients Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="text-sm font-semibold text-card-foreground">Ingredients</h4>
              <button
                type="button"
                onClick={onAddIngredient}
                className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Ingredient
              </button>
            </div>
            {formData.ingredients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No ingredients added
              </p>
            ) : (
              <div className="space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => onUpdateIngredient(index, e.target.value)}
                      placeholder="e.g., 2 cups flour"
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveIngredient(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="text-sm font-semibold text-card-foreground">Instructions</h4>
              <button
                type="button"
                onClick={onAddInstruction}
                className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Step
              </button>
            </div>
            {formData.instructions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No instructions added
              </p>
            ) : (
              <div className="space-y-2">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground w-6 pt-2">{index + 1}.</span>
                    <textarea
                      value={instruction}
                      onChange={(e) => onUpdateInstruction(index, e.target.value)}
                      placeholder="Describe this step..."
                      rows={2}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveInstruction(index)}
                      className="text-red-600 hover:text-red-800 pt-2"
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

          {/* Products Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Related Products
            </h4>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No products available</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => onToggleProduct(product.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      formData.productIds.includes(product.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {product.name}
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
