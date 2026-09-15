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
  ZambosTruckConfig,
  CreateZambosTruckConfigRequest,
  UpdateZambosTruckConfigRequest,
} from '@/actions/zambos-truck'
import { useZambosTruckList } from '@/queries/zambos-truck'
import { useLanguages } from '@/queries/languages'
import { useSites } from '@/queries/sites'
import {
  useCreateZambosTruck,
  useUpdateZambosTruck,
  useDeleteZambosTruck,
} from '@/mutations/zambos-truck'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<ZambosTruckConfig>()

const FIELD_TYPES = ['text', 'email', 'tel', 'number', 'date', 'select', 'textarea'] as const

interface PackageImageItem {
  key: string
  imageId: string | null
  imagePreviewUrl: string
}

interface StepItem {
  key: string
  icon: string
  title: string
  description: string
}

interface ModelItem {
  key: string
  name: string
  imageId: string | null
  imagePreviewUrl: string
}

interface RecipeItem {
  key: string
  title: string
  description: string
  imageId: string | null
  imagePreviewUrl: string
  price: string
}

interface GalleryImageItem {
  key: string
  imageId: string | null
  imagePreviewUrl: string
  category: string
}

interface FormFieldItem {
  key: string
  name: string
  label: string
  type: string
  required: boolean
  optionsText: string
}

interface ZambosTruckFormData {
  siteId: string
  languageCode: string

  heroTitle: string
  heroSubtitle: string
  heroCtaLabel: string
  heroCtaUrl: string
  heroVideoId: string | null
  heroVideoPreviewUrl: string
  heroBannerId: string | null
  heroBannerPreviewUrl: string

  packagesTitle: string
  packagesSubtitle: string
  packageImages: PackageImageItem[]

  howToTitle: string
  howToSubtitle: string
  howToSteps: StepItem[]

  modelsTitle: string
  models: ModelItem[]

  recipesTitle: string
  recipesSubtitle: string
  recipes: RecipeItem[]

  galleryTitle: string
  galleryImages: GalleryImageItem[]

  formTitle: string
  formDescription: string
  formSubmitLabel: string
  formFields: FormFieldItem[]

  ctaJoinTitle: string
  ctaJoinButtonLabel: string
  ctaJoinButtonUrl: string

  whatsappPhone: string
  whatsappMessage: string
}

const createInitialFormData = (siteId = ''): ZambosTruckFormData => ({
  siteId,
  languageCode: '',
  heroTitle: '',
  heroSubtitle: '',
  heroCtaLabel: '',
  heroCtaUrl: '',
  heroVideoId: null,
  heroVideoPreviewUrl: '',
  heroBannerId: null,
  heroBannerPreviewUrl: '',
  packagesTitle: '',
  packagesSubtitle: '',
  packageImages: [],
  howToTitle: '',
  howToSubtitle: '',
  howToSteps: [],
  modelsTitle: '',
  models: [],
  recipesTitle: '',
  recipesSubtitle: '',
  recipes: [],
  galleryTitle: '',
  galleryImages: [],
  formTitle: '',
  formDescription: '',
  formSubmitLabel: '',
  formFields: [],
  ctaJoinTitle: '',
  ctaJoinButtonLabel: '',
  ctaJoinButtonUrl: '',
  whatsappPhone: '',
  whatsappMessage: '',
})

function mediaPreviewUrl(media: MultimediaResponse | null | undefined): string {
  if (!media) return ''
  return media.optimizedUrl || media.originalUrl || media.thumbnailUrl || ''
}

function configToFormData(config: ZambosTruckConfig): ZambosTruckFormData {
  return {
    siteId: config.siteId ?? '',
    languageCode: config.languageCode ?? '',
    heroTitle: config.heroTitle ?? '',
    heroSubtitle: config.heroSubtitle ?? '',
    heroCtaLabel: config.heroCtaLabel ?? '',
    heroCtaUrl: config.heroCtaUrl ?? '',
    heroVideoId: config.heroVideo?.id ?? null,
    heroVideoPreviewUrl: mediaPreviewUrl(config.heroVideo),
    heroBannerId: config.heroBanner?.id ?? null,
    heroBannerPreviewUrl: mediaPreviewUrl(config.heroBanner),
    packagesTitle: config.packagesTitle ?? '',
    packagesSubtitle: config.packagesSubtitle ?? '',
    packageImages: (config.packageImages ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        key: item.id || `${Date.now()}-${index}`,
        imageId: item.image?.id ?? null,
        imagePreviewUrl: mediaPreviewUrl(item.image),
      })),
    howToTitle: config.howToTitle ?? '',
    howToSubtitle: config.howToSubtitle ?? '',
    howToSteps: (config.howToSteps ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        key: item.id || `${Date.now()}-${index}`,
        icon: item.icon ?? '',
        title: item.title ?? '',
        description: item.description ?? '',
      })),
    modelsTitle: config.modelsTitle ?? '',
    models: (config.models ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        key: item.id || `${Date.now()}-${index}`,
        name: item.name ?? '',
        imageId: item.image?.id ?? null,
        imagePreviewUrl: mediaPreviewUrl(item.image),
      })),
    recipesTitle: config.recipesTitle ?? '',
    recipesSubtitle: config.recipesSubtitle ?? '',
    recipes: (config.recipes ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        key: item.id || `${Date.now()}-${index}`,
        title: item.title ?? '',
        description: item.description ?? '',
        imageId: item.image?.id ?? null,
        imagePreviewUrl: mediaPreviewUrl(item.image),
        price: item.price ?? '',
      })),
    galleryTitle: config.galleryTitle ?? '',
    galleryImages: (config.galleryImages ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        key: item.id || `${Date.now()}-${index}`,
        imageId: item.image?.id ?? null,
        imagePreviewUrl: mediaPreviewUrl(item.image),
        category: item.category ?? '',
      })),
    formTitle: config.formTitle ?? '',
    formDescription: config.formDescription ?? '',
    formSubmitLabel: config.formSubmitLabel ?? '',
    formFields: (config.formFields ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        key: item.id || `${Date.now()}-${index}`,
        name: item.name ?? '',
        label: item.label ?? '',
        type: item.type ?? 'text',
        required: Boolean(item.required),
        optionsText: (item.options ?? []).join(', '),
      })),
    ctaJoinTitle: config.ctaJoinTitle ?? '',
    ctaJoinButtonLabel: config.ctaJoinButtonLabel ?? '',
    ctaJoinButtonUrl: config.ctaJoinButtonUrl ?? '',
    whatsappPhone: config.whatsappPhone ?? '',
    whatsappMessage: config.whatsappMessage ?? '',
  }
}

function formDataToPayload(
  formData: ZambosTruckFormData
): CreateZambosTruckConfigRequest & UpdateZambosTruckConfigRequest {
  return {
    siteId: formData.siteId,
    languageCode: formData.languageCode,
    heroTitle: formData.heroTitle,
    heroSubtitle: formData.heroSubtitle,
    heroCtaLabel: formData.heroCtaLabel,
    heroCtaUrl: formData.heroCtaUrl,
    heroVideoId: formData.heroVideoId,
    heroBannerId: formData.heroBannerId,
    packagesTitle: formData.packagesTitle,
    packagesSubtitle: formData.packagesSubtitle,
    packageImages: formData.packageImages.map((item, index) => ({
      imageId: item.imageId,
      order: index,
    })),
    howToTitle: formData.howToTitle,
    howToSubtitle: formData.howToSubtitle,
    howToSteps: formData.howToSteps.map((item, index) => ({
      icon: item.icon,
      title: item.title,
      description: item.description,
      order: index,
    })),
    modelsTitle: formData.modelsTitle,
    models: formData.models.map((item, index) => ({
      name: item.name,
      imageId: item.imageId,
      order: index,
    })),
    recipesTitle: formData.recipesTitle,
    recipesSubtitle: formData.recipesSubtitle,
    recipes: formData.recipes.map((item, index) => ({
      title: item.title,
      description: item.description,
      imageId: item.imageId,
      price: item.price,
      order: index,
    })),
    galleryTitle: formData.galleryTitle,
    galleryImages: formData.galleryImages.map((item, index) => ({
      imageId: item.imageId,
      category: item.category,
      order: index,
    })),
    formTitle: formData.formTitle,
    formDescription: formData.formDescription,
    formSubmitLabel: formData.formSubmitLabel,
    formFields: formData.formFields.map((item, index) => ({
      name: item.name,
      label: item.label,
      type: item.type,
      required: item.required,
      options: item.optionsText
        .split(',')
        .map((opt) => opt.trim())
        .filter(Boolean),
      order: index,
    })),
    ctaJoinTitle: formData.ctaJoinTitle,
    ctaJoinButtonLabel: formData.ctaJoinButtonLabel,
    ctaJoinButtonUrl: formData.ctaJoinButtonUrl,
    whatsappPhone: formData.whatsappPhone,
    whatsappMessage: formData.whatsappMessage,
  }
}

type MediaPickerTarget =
  | { kind: 'heroVideo' }
  | { kind: 'heroBanner' }
  | { kind: 'packageImage'; index: number }
  | { kind: 'modelImage'; index: number }
  | { kind: 'recipeImage'; index: number }
  | { kind: 'galleryImage'; index: number }

export default function ZambosTruck() {
  const { selectedSiteId } = useSite()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filterLanguage, setFilterLanguage] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ZambosTruckConfig | null>(null)
  const [formData, setFormData] = useState<ZambosTruckFormData>(createInitialFormData())
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget | null>(null)

  useEffect(() => {
    if (selectedSiteId && !formData.siteId) {
      setFormData((prev) => ({ ...prev, siteId: selectedSiteId }))
    }
  }, [selectedSiteId, formData.siteId])

  const { data, isLoading, error } = useZambosTruckList({
    page,
    pageSize,
    languageCode: filterLanguage || undefined,
    siteId: selectedSiteId || undefined,
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: sitesData } = useSites({ page: 1, pageSize: 100 })
  const createMutation = useCreateZambosTruck()
  const updateMutation = useUpdateZambosTruck()
  const deleteMutation = useDeleteZambosTruck()

  const openEditModal = (item: ZambosTruckConfig) => {
    setSelectedItem(item)
    setFormData(configToFormData(item))
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (item: ZambosTruckConfig) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleMediaSelect = (media: MultimediaResponse) => {
    if (!mediaPickerTarget) return
    const url = mediaPreviewUrl(media)

    setFormData((prev) => {
      switch (mediaPickerTarget.kind) {
        case 'heroVideo':
          return { ...prev, heroVideoId: media.id, heroVideoPreviewUrl: url }
        case 'heroBanner':
          return { ...prev, heroBannerId: media.id, heroBannerPreviewUrl: url }
        case 'packageImage':
          return {
            ...prev,
            packageImages: prev.packageImages.map((item, i) =>
              i === mediaPickerTarget.index ? { ...item, imageId: media.id, imagePreviewUrl: url } : item
            ),
          }
        case 'modelImage':
          return {
            ...prev,
            models: prev.models.map((item, i) =>
              i === mediaPickerTarget.index ? { ...item, imageId: media.id, imagePreviewUrl: url } : item
            ),
          }
        case 'recipeImage':
          return {
            ...prev,
            recipes: prev.recipes.map((item, i) =>
              i === mediaPickerTarget.index ? { ...item, imageId: media.id, imagePreviewUrl: url } : item
            ),
          }
        case 'galleryImage':
          return {
            ...prev,
            galleryImages: prev.galleryImages.map((item, i) =>
              i === mediaPickerTarget.index ? { ...item, imageId: media.id, imagePreviewUrl: url } : item
            ),
          }
        default:
          return prev
      }
    })

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
      console.error('Failed to create zambos truck content:', err)
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
      console.error('Failed to update zambos truck content:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await deleteMutation.mutateAsync(selectedItem.id)
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
    } catch (err) {
      console.error('Failed to delete zambos truck content:', err)
    }
  }

  const columns = useMemo<ColumnDef<ZambosTruckConfig, any>[]>(
    () => [
      columnHelper.accessor('heroTitle', {
        header: 'Hero Title',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">{info.getValue() || '-'}</span>
        ),
      }),
      columnHelper.accessor('languageCode', {
        header: 'Language',
        cell: (info) => (
          <span className="text-sm text-muted-foreground font-mono">{info.getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: 'recipesCount',
        header: 'Recipes',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.recipes?.length ?? 0}</span>
        ),
      }),
      columnHelper.display({
        id: 'galleryCount',
        header: 'Gallery',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.galleryImages?.length ?? 0}
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

  const mediaPickerTitle =
    mediaPickerTarget?.kind === 'heroVideo' ? 'Select Hero Video' : 'Select Image'

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Zambos Truck</h2>
              <p className="text-muted-foreground mt-1">
                Manage the Zambos Truck campaign microsite content (hero, packages, how-to,
                models, recipes, gallery, inquiry form, join CTA and WhatsApp contact)
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
              Create Content
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
              <p className="mt-4 text-muted-foreground">Loading Zambos Truck content...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load Zambos Truck content</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No Zambos Truck content found</p>
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
        <ZambosTruckFormModal
          title="Create Zambos Truck Content"
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
        />
      )}

      {isEditModalOpen && selectedItem && (
        <ZambosTruckFormModal
          title="Edit Zambos Truck Content"
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
        />
      )}

      {isDeleteModalOpen && selectedItem && (
        <Modal
          title="Delete Zambos Truck Content"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedItem(null)
          }}
        >
          <div className="p-6 space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete "<strong>{selectedItem.heroTitle || 'Untitled'}</strong>
              " ({selectedItem.languageCode})? This action cannot be undone.
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
        title={mediaPickerTitle}
      />
    </Layout>
  )
}

function ImagePickerControl({
  label,
  previewUrl,
  onSelect,
  onClear,
}: {
  label: string
  previewUrl: string
  onSelect: () => void
  onClear: () => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-card-foreground mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSelect}
          className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
        >
          <PhotoIcon className="w-5 h-5" />
          Select
        </button>
        {previewUrl && (
          <>
            <img src={previewUrl} alt={label} className="w-12 h-12 object-cover rounded border border-border" />
            <button type="button" onClick={onClear} className="p-2 text-red-600 hover:text-red-800">
              <XIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function ZambosTruckFormModal({
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
  formData: ZambosTruckFormData
  setFormData: React.Dispatch<React.SetStateAction<ZambosTruckFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  submitLabel: string
  languages: { code: string; name: string; nativeName: string }[]
  sites: { id: string; name: string }[]
  onOpenMediaPicker: (target: MediaPickerTarget) => void
}) {
  const set = <K extends keyof ZambosTruckFormData>(key: K, value: ZambosTruckFormData[K]) =>
    setFormData({ ...formData, [key]: value })

  return (
    <Modal title={title} onClose={onClose} maxWidth="max-w-5xl" scrollBody>
      <form onSubmit={onSubmit} className="p-6 space-y-8">
        <Section title="Basic Information">
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
              <p className="text-xs text-muted-foreground mt-1">
                Site is automatically set from the sidebar selector
              </p>
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
        </Section>

        <Section title="Hero">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Title" value={formData.heroTitle} onChange={(v) => set('heroTitle', v)} />
            <TextField label="Subtitle" value={formData.heroSubtitle} onChange={(v) => set('heroSubtitle', v)} />
            <TextField label="CTA Label" value={formData.heroCtaLabel} onChange={(v) => set('heroCtaLabel', v)} />
            <TextField label="CTA URL" value={formData.heroCtaUrl} onChange={(v) => set('heroCtaUrl', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImagePickerControl
              label="Banner Image"
              previewUrl={formData.heroBannerPreviewUrl}
              onSelect={() => onOpenMediaPicker({ kind: 'heroBanner' })}
              onClear={() => setFormData((prev) => ({ ...prev, heroBannerId: null, heroBannerPreviewUrl: '' }))}
            />
            <ImagePickerControl
              label="Video"
              previewUrl={formData.heroVideoPreviewUrl}
              onSelect={() => onOpenMediaPicker({ kind: 'heroVideo' })}
              onClear={() => setFormData((prev) => ({ ...prev, heroVideoId: null, heroVideoPreviewUrl: '' }))}
            />
          </div>
        </Section>

        <Section title="Packages">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Title" value={formData.packagesTitle} onChange={(v) => set('packagesTitle', v)} />
            <TextField label="Subtitle" value={formData.packagesSubtitle} onChange={(v) => set('packagesSubtitle', v)} />
          </div>
          <RepeaterField
            items={formData.packageImages}
            getKey={(item) => item.key}
            addLabel="Add Package Image"
            onAdd={() =>
              setFormData((prev) => ({
                ...prev,
                packageImages: [...prev.packageImages, { key: `new-${Date.now()}`, imageId: null, imagePreviewUrl: '' }],
              }))
            }
            onRemove={(index) =>
              setFormData((prev) => ({ ...prev, packageImages: prev.packageImages.filter((_, i) => i !== index) }))
            }
            onMove={(index, direction) =>
              setFormData((prev) => {
                const next = index + direction
                if (next < 0 || next >= prev.packageImages.length) return prev
                const items = [...prev.packageImages]
                const [moved] = items.splice(index, 1)
                items.splice(next, 0, moved)
                return { ...prev, packageImages: items }
              })
            }
            itemLabel={(_, index) => `Image ${index + 1}`}
            emptyMessage="No package images yet."
            renderItem={(item, index) => (
              <ImagePickerControl
                label="Image"
                previewUrl={item.imagePreviewUrl}
                onSelect={() => onOpenMediaPicker({ kind: 'packageImage', index })}
                onClear={() =>
                  setFormData((prev) => ({
                    ...prev,
                    packageImages: prev.packageImages.map((it, i) =>
                      i === index ? { ...it, imageId: null, imagePreviewUrl: '' } : it
                    ),
                  }))
                }
              />
            )}
          />
        </Section>

        <Section title="How To">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Title" value={formData.howToTitle} onChange={(v) => set('howToTitle', v)} />
            <TextField label="Subtitle" value={formData.howToSubtitle} onChange={(v) => set('howToSubtitle', v)} />
          </div>
          <RepeaterField
            items={formData.howToSteps}
            getKey={(item) => item.key}
            addLabel="Add Step"
            onAdd={() =>
              setFormData((prev) => ({
                ...prev,
                howToSteps: [...prev.howToSteps, { key: `new-${Date.now()}`, icon: '', title: '', description: '' }],
              }))
            }
            onRemove={(index) =>
              setFormData((prev) => ({ ...prev, howToSteps: prev.howToSteps.filter((_, i) => i !== index) }))
            }
            onMove={(index, direction) =>
              setFormData((prev) => {
                const next = index + direction
                if (next < 0 || next >= prev.howToSteps.length) return prev
                const items = [...prev.howToSteps]
                const [moved] = items.splice(index, 1)
                items.splice(next, 0, moved)
                return { ...prev, howToSteps: items }
              })
            }
            itemLabel={(item, index) => item.title || `Step ${index + 1}`}
            emptyMessage="No steps yet."
            renderItem={(item, index) => (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <TextField
                  label="Icon"
                  value={item.icon}
                  placeholder="wand, bag, store..."
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      howToSteps: prev.howToSteps.map((it, i) => (i === index ? { ...it, icon: v } : it)),
                    }))
                  }
                />
                <TextField
                  label="Title"
                  value={item.title}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      howToSteps: prev.howToSteps.map((it, i) => (i === index ? { ...it, title: v } : it)),
                    }))
                  }
                />
                <TextField
                  label="Description"
                  value={item.description}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      howToSteps: prev.howToSteps.map((it, i) => (i === index ? { ...it, description: v } : it)),
                    }))
                  }
                />
              </div>
            )}
          />
        </Section>

        <Section title="Truck Models">
          <TextField label="Title" value={formData.modelsTitle} onChange={(v) => set('modelsTitle', v)} />
          <RepeaterField
            items={formData.models}
            getKey={(item) => item.key}
            addLabel="Add Model"
            onAdd={() =>
              setFormData((prev) => ({
                ...prev,
                models: [...prev.models, { key: `new-${Date.now()}`, name: '', imageId: null, imagePreviewUrl: '' }],
              }))
            }
            onRemove={(index) => setFormData((prev) => ({ ...prev, models: prev.models.filter((_, i) => i !== index) }))}
            onMove={(index, direction) =>
              setFormData((prev) => {
                const next = index + direction
                if (next < 0 || next >= prev.models.length) return prev
                const items = [...prev.models]
                const [moved] = items.splice(index, 1)
                items.splice(next, 0, moved)
                return { ...prev, models: items }
              })
            }
            itemLabel={(item, index) => item.name || `Model ${index + 1}`}
            emptyMessage="No truck models yet."
            renderItem={(item, index) => (
              <div className="space-y-3">
                <TextField
                  label="Name"
                  value={item.name}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      models: prev.models.map((it, i) => (i === index ? { ...it, name: v } : it)),
                    }))
                  }
                />
                <ImagePickerControl
                  label="Image"
                  previewUrl={item.imagePreviewUrl}
                  onSelect={() => onOpenMediaPicker({ kind: 'modelImage', index })}
                  onClear={() =>
                    setFormData((prev) => ({
                      ...prev,
                      models: prev.models.map((it, i) => (i === index ? { ...it, imageId: null, imagePreviewUrl: '' } : it)),
                    }))
                  }
                />
              </div>
            )}
          />
        </Section>

        <Section title="Recipes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Title" value={formData.recipesTitle} onChange={(v) => set('recipesTitle', v)} />
            <TextField label="Subtitle" value={formData.recipesSubtitle} onChange={(v) => set('recipesSubtitle', v)} />
          </div>
          <RepeaterField
            items={formData.recipes}
            getKey={(item) => item.key}
            addLabel="Add Recipe"
            onAdd={() =>
              setFormData((prev) => ({
                ...prev,
                recipes: [
                  ...prev.recipes,
                  { key: `new-${Date.now()}`, title: '', description: '', imageId: null, imagePreviewUrl: '', price: '' },
                ],
              }))
            }
            onRemove={(index) => setFormData((prev) => ({ ...prev, recipes: prev.recipes.filter((_, i) => i !== index) }))}
            onMove={(index, direction) =>
              setFormData((prev) => {
                const next = index + direction
                if (next < 0 || next >= prev.recipes.length) return prev
                const items = [...prev.recipes]
                const [moved] = items.splice(index, 1)
                items.splice(next, 0, moved)
                return { ...prev, recipes: items }
              })
            }
            itemLabel={(item, index) => item.title || `Recipe ${index + 1}`}
            emptyMessage="No recipes yet."
            renderItem={(item, index) => (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField
                    label="Title"
                    value={item.title}
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        recipes: prev.recipes.map((it, i) => (i === index ? { ...it, title: v } : it)),
                      }))
                    }
                  />
                  <TextField
                    label="Price"
                    value={item.price}
                    placeholder="Q12.00"
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        recipes: prev.recipes.map((it, i) => (i === index ? { ...it, price: v } : it)),
                      }))
                    }
                  />
                </div>
                <TextField
                  label="Description"
                  value={item.description}
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      recipes: prev.recipes.map((it, i) => (i === index ? { ...it, description: v } : it)),
                    }))
                  }
                />
                <ImagePickerControl
                  label="Image"
                  previewUrl={item.imagePreviewUrl}
                  onSelect={() => onOpenMediaPicker({ kind: 'recipeImage', index })}
                  onClear={() =>
                    setFormData((prev) => ({
                      ...prev,
                      recipes: prev.recipes.map((it, i) => (i === index ? { ...it, imageId: null, imagePreviewUrl: '' } : it)),
                    }))
                  }
                />
              </div>
            )}
          />
        </Section>

        <Section title="Gallery">
          <TextField label="Title" value={formData.galleryTitle} onChange={(v) => set('galleryTitle', v)} />
          <p className="text-xs text-muted-foreground">
            Filter chips shown on the site are derived automatically from each image's category
            (plus an "All" option), so there is nothing else to configure here.
          </p>
          <RepeaterField
            items={formData.galleryImages}
            getKey={(item) => item.key}
            addLabel="Add Image"
            onAdd={() =>
              setFormData((prev) => ({
                ...prev,
                galleryImages: [
                  ...prev.galleryImages,
                  { key: `new-${Date.now()}`, imageId: null, imagePreviewUrl: '', category: '' },
                ],
              }))
            }
            onRemove={(index) =>
              setFormData((prev) => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }))
            }
            onMove={(index, direction) =>
              setFormData((prev) => {
                const next = index + direction
                if (next < 0 || next >= prev.galleryImages.length) return prev
                const items = [...prev.galleryImages]
                const [moved] = items.splice(index, 1)
                items.splice(next, 0, moved)
                return { ...prev, galleryImages: items }
              })
            }
            itemLabel={(item, index) => item.category || `Image ${index + 1}`}
            emptyMessage="No gallery images yet."
            renderItem={(item, index) => (
              <div className="space-y-3">
                <TextField
                  label="Category"
                  value={item.category}
                  placeholder="Eventos"
                  onChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      galleryImages: prev.galleryImages.map((it, i) => (i === index ? { ...it, category: v } : it)),
                    }))
                  }
                />
                <ImagePickerControl
                  label="Image"
                  previewUrl={item.imagePreviewUrl}
                  onSelect={() => onOpenMediaPicker({ kind: 'galleryImage', index })}
                  onClear={() =>
                    setFormData((prev) => ({
                      ...prev,
                      galleryImages: prev.galleryImages.map((it, i) =>
                        i === index ? { ...it, imageId: null, imagePreviewUrl: '' } : it
                      ),
                    }))
                  }
                />
              </div>
            )}
          />
        </Section>

        <Section title="Inquiry Form">
          <TextField label="Title" value={formData.formTitle} onChange={(v) => set('formTitle', v)} />
          <TextField
            label="Description"
            value={formData.formDescription}
            onChange={(v) => set('formDescription', v)}
            textarea
          />
          <TextField label="Submit Button Label" value={formData.formSubmitLabel} onChange={(v) => set('formSubmitLabel', v)} />
          <RepeaterField
            items={formData.formFields}
            getKey={(item) => item.key}
            addLabel="Add Field"
            onAdd={() =>
              setFormData((prev) => ({
                ...prev,
                formFields: [
                  ...prev.formFields,
                  { key: `new-${Date.now()}`, name: '', label: '', type: 'text', required: false, optionsText: '' },
                ],
              }))
            }
            onRemove={(index) =>
              setFormData((prev) => ({ ...prev, formFields: prev.formFields.filter((_, i) => i !== index) }))
            }
            onMove={(index, direction) =>
              setFormData((prev) => {
                const next = index + direction
                if (next < 0 || next >= prev.formFields.length) return prev
                const items = [...prev.formFields]
                const [moved] = items.splice(index, 1)
                items.splice(next, 0, moved)
                return { ...prev, formFields: items }
              })
            }
            itemLabel={(item, index) => item.label || item.name || `Field ${index + 1}`}
            emptyMessage="No fields yet."
            renderItem={(item, index) => (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField
                    label="Name (form key)"
                    value={item.name}
                    required
                    placeholder="nombre, email, telefono..."
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        formFields: prev.formFields.map((it, i) => (i === index ? { ...it, name: v } : it)),
                      }))
                    }
                  />
                  <TextField
                    label="Label"
                    value={item.label}
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        formFields: prev.formFields.map((it, i) => (i === index ? { ...it, label: v } : it)),
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Type</label>
                    <select
                      value={item.type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          formFields: prev.formFields.map((it, i) => (i === index ? { ...it, type: e.target.value } : it)),
                        }))
                      }
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {FIELD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-card-foreground pb-2">
                    <input
                      type="checkbox"
                      checked={item.required}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          formFields: prev.formFields.map((it, i) =>
                            i === index ? { ...it, required: e.target.checked } : it
                          ),
                        }))
                      }
                    />
                    Required
                  </label>
                </div>
                {item.type === 'select' && (
                  <TextField
                    label="Options (comma-separated)"
                    value={item.optionsText}
                    placeholder="Guatemala, Honduras, El Salvador"
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        formFields: prev.formFields.map((it, i) => (i === index ? { ...it, optionsText: v } : it)),
                      }))
                    }
                  />
                )}
              </div>
            )}
          />
        </Section>

        <Section title="Join Us CTA">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Title" value={formData.ctaJoinTitle} onChange={(v) => set('ctaJoinTitle', v)} />
            <TextField label="Button Label" value={formData.ctaJoinButtonLabel} onChange={(v) => set('ctaJoinButtonLabel', v)} />
          </div>
          <TextField label="Button URL" value={formData.ctaJoinButtonUrl} onChange={(v) => set('ctaJoinButtonUrl', v)} />
        </Section>

        <Section title="WhatsApp Contact">
          <TextField label="Phone (with country code)" value={formData.whatsappPhone} placeholder="50488368730" onChange={(v) => set('whatsappPhone', v)} />
          <TextField label="Prefilled Message" value={formData.whatsappMessage} onChange={(v) => set('whatsappMessage', v)} textarea />
        </Section>

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">{title}</h4>
      {children}
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
