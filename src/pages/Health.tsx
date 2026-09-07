import { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import MediaPicker from '@/components/MediaPicker'
import { useSite } from '@/contexts/SiteContext'
import type { MultimediaResponse } from '@/actions/multimedia'
import type {
  HealthConfig,
  CreateHealthConfigRequest,
  UpdateHealthConfigRequest,
} from '@/actions/health'
import { useHealthList } from '@/queries/health'
import { useLanguages } from '@/queries/languages'
import { useSites } from '@/queries/sites'
import {
  useCreateHealth,
  useUpdateHealth,
  useDeleteHealth,
} from '@/mutations/health'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'
import 'lite-youtube-embed'
import 'lite-youtube-embed/src/lite-yt-embed.css'

const columnHelper = createColumnHelper<HealthConfig>()

interface HealthVideoFormItem {
  key: string
  title: string
  order: number
  video: MultimediaResponse | null
  thumbnail: MultimediaResponse | null
}

interface HealthFormData {
  siteId: string
  languageCode: string
  title: string
  description: string
  image: MultimediaResponse | null
  videosSectionTitle: string
  videosSectionDescription: string
  videos: HealthVideoFormItem[]
}

const createInitialFormData = (siteId = ''): HealthFormData => ({
  siteId,
  languageCode: '',
  title: '',
  description: '',
  image: null,
  videosSectionTitle: '',
  videosSectionDescription: '',
  videos: [],
})

type MediaPickerTarget =
  | { type: 'image' }
  | { type: 'video'; index: number }
  | { type: 'thumbnail'; index: number }

function configToFormData(config: HealthConfig): HealthFormData {
  return {
    siteId: config.siteId ?? '',
    languageCode: config.languageCode ?? '',
    title: config.title ?? '',
    description: config.description ?? '',
    image: config.image ?? null,
    videosSectionTitle: config.videosSectionTitle ?? '',
    videosSectionDescription: config.videosSectionDescription ?? '',
    videos: (config.videos ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((video, index) => ({
        key: video.id || `${Date.now()}-${index}`,
        title: video.title ?? '',
        order: video.order ?? index,
        video: video.video ?? null,
        thumbnail: video.thumbnail ?? null,
      })),
  }
}

function formDataToPayload(
  formData: HealthFormData
): CreateHealthConfigRequest & UpdateHealthConfigRequest {
  return {
    siteId: formData.siteId,
    languageCode: formData.languageCode,
    title: formData.title,
    description: formData.description,
    imageId: formData.image?.id ?? null,
    slider: [],
    videosSectionTitle: formData.videosSectionTitle,
    videosSectionDescription: formData.videosSectionDescription,
    videos: formData.videos.map((video, index) => ({
      title: video.title,
      videoId: video.video?.id ?? null,
      thumbnailId: video.thumbnail?.id ?? null,
      order: index,
    })),
  }
}

function mediaPreviewUrl(media: MultimediaResponse | null | undefined): string | null {
  if (!media) return null
  return media.optimizedUrl || media.originalUrl || media.thumbnailUrl || null
}

function isYouTubeMedia(media: MultimediaResponse | null | undefined): boolean {
  return Boolean(media?.provider === 'youtube' && media.videoId)
}

export default function Health() {
  const { selectedSiteId } = useSite()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTitle, setSearchTitle] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedHealth, setSelectedHealth] = useState<HealthConfig | null>(null)
  const [formData, setFormData] = useState<HealthFormData>(createInitialFormData())
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget | null>(null)

  useEffect(() => {
    if (selectedSiteId && !formData.siteId) {
      setFormData((prev) => ({ ...prev, siteId: selectedSiteId }))
    }
  }, [selectedSiteId, formData.siteId])

  const { data, isLoading, error } = useHealthList({
    page,
    pageSize,
    title: searchTitle || undefined,
    languageCode: filterLanguage || undefined,
    siteId: selectedSiteId || undefined,
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: sitesData } = useSites({ page: 1, pageSize: 100 })
  const createMutation = useCreateHealth()
  const updateMutation = useUpdateHealth()
  const deleteMutation = useDeleteHealth()

  const openEditModal = (item: HealthConfig) => {
    setSelectedHealth(item)
    setFormData(configToFormData(item))
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (item: HealthConfig) => {
    setSelectedHealth(item)
    setIsDeleteModalOpen(true)
  }

  const handleMediaSelect = (media: MultimediaResponse) => {
    if (!mediaPickerTarget) return

    if (mediaPickerTarget.type === 'image') {
      setFormData((prev) => ({ ...prev, image: media }))
    } else if (mediaPickerTarget.type === 'video') {
      const index = mediaPickerTarget.index
      setFormData((prev) => ({
        ...prev,
        videos: prev.videos.map((item, i) =>
          i === index ? { ...item, video: media } : item
        ),
      }))
    } else if (mediaPickerTarget.type === 'thumbnail') {
      const index = mediaPickerTarget.index
      setFormData((prev) => ({
        ...prev,
        videos: prev.videos.map((item, i) =>
          i === index ? { ...item, thumbnail: media } : item
        ),
      }))
    }

    setMediaPickerTarget(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(formDataToPayload(formData))
      setIsCreateModalOpen(false)
      setFormData(createInitialFormData(selectedSiteId || ''))
    } catch (err) {
      console.error('Failed to create health content:', err)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHealth) return
    try {
      await updateMutation.mutateAsync({
        id: selectedHealth.id,
        data: formDataToPayload(formData),
      })
      setIsEditModalOpen(false)
      setSelectedHealth(null)
      setFormData(createInitialFormData(selectedSiteId || ''))
    } catch (err) {
      console.error('Failed to update health content:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedHealth) return
    try {
      await deleteMutation.mutateAsync(selectedHealth.id)
      setIsDeleteModalOpen(false)
      setSelectedHealth(null)
    } catch (err) {
      console.error('Failed to delete health content:', err)
    }
  }

  const addVideo = () => {
    setFormData((prev) => ({
      ...prev,
      videos: [
        ...prev.videos,
        {
          key: `new-${Date.now()}`,
          title: '',
          order: prev.videos.length,
          video: null,
          thumbnail: null,
        },
      ],
    }))
  }

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }))
  }

  const moveVideo = (index: number, direction: -1 | 1) => {
    setFormData((prev) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.videos.length) return prev
      const videos = [...prev.videos]
      const [item] = videos.splice(index, 1)
      videos.splice(nextIndex, 0, item)
      return { ...prev, videos }
    })
  }

  const updateVideoField = (index: number, field: 'title', value: string) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const columns = useMemo<ColumnDef<HealthConfig, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'image',
        header: 'Image',
        cell: ({ row }) => {
          const url = mediaPreviewUrl(row.original.image)
          return url ? (
            <img src={url} alt="Health" className="h-10 w-16 object-cover rounded" />
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
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
      columnHelper.display({
        id: 'videosCount',
        header: 'Videos',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.videos?.length ?? 0}
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

  const mediaPickerTitle =
    mediaPickerTarget?.type === 'video'
      ? 'Select Video'
      : mediaPickerTarget?.type === 'thumbnail'
        ? 'Select Thumbnail'
        : 'Select Image'

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Health</h2>
              <p className="text-muted-foreground mt-1">
                Manage health content and videos
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
              Create Health Content
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search health..."
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
              <p className="mt-4 text-muted-foreground">Loading health...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load health</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No health content found</p>
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
        <HealthFormModal
          title="Create Health Content"
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
          onAddVideo={addVideo}
          onRemoveVideo={removeVideo}
          onMoveVideo={moveVideo}
          onUpdateVideoField={updateVideoField}
        />
      )}

      {isEditModalOpen && selectedHealth && (
        <HealthFormModal
          title="Edit Health Content"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedHealth(null)
            setFormData(createInitialFormData(selectedSiteId || ''))
          }}
          isSubmitting={updateMutation.isPending}
          submitLabel="Update"
          languages={languagesData?.data || []}
          sites={sitesData?.data || []}
          onOpenMediaPicker={setMediaPickerTarget}
          onAddVideo={addVideo}
          onRemoveVideo={removeVideo}
          onMoveVideo={moveVideo}
          onUpdateVideoField={updateVideoField}
        />
      )}

      {isDeleteModalOpen && selectedHealth && (
        <Modal
          title="Delete Health Content"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedHealth(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete the health content "
              <strong>{selectedHealth.title || 'Untitled'}</strong>"?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedHealth(null)
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

interface HealthFormModalProps {
  title: string
  formData: HealthFormData
  setFormData: React.Dispatch<React.SetStateAction<HealthFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  submitLabel: string
  languages: { code: string; name: string; nativeName: string }[]
  sites: { id: string; name: string }[]
  onOpenMediaPicker: (target: MediaPickerTarget) => void
  onAddVideo: () => void
  onRemoveVideo: (index: number) => void
  onMoveVideo: (index: number, direction: -1 | 1) => void
  onUpdateVideoField: (index: number, field: 'title', value: string) => void
}

function HealthFormModal({
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
  onAddVideo,
  onRemoveVideo,
  onMoveVideo,
  onUpdateVideoField,
}: HealthFormModalProps) {
  const imageUrl = mediaPreviewUrl(formData.image)

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
          </div>

          {/* Main Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Main Section
            </h4>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                maxLength={255}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Section title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Section description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Image
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
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Health"
                        className="w-12 h-12 object-cover rounded border border-border"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image: null }))
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

          <div className="rounded-lg border border-dashed border-border bg-secondary/20 p-4">
            <p className="text-sm text-card-foreground font-medium">Page banner</p>
            <p className="text-xs text-muted-foreground mt-1">
              The hero banner for Salud / Health is managed in Pages. Open the page with slug
              <span className="font-mono"> salud</span> or <span className="font-mono">health</span> and add the banner there.
            </p>
          </div>

          {/* Videos Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Videos Section
            </h4>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={formData.videosSectionTitle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    videosSectionTitle: e.target.value,
                  })
                }
                maxLength={255}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Videos section title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Section Description
              </label>
              <textarea
                value={formData.videosSectionDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    videosSectionDescription: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Videos section description"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-card-foreground">
                Videos
              </label>
              <button
                type="button"
                onClick={onAddVideo}
                className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Video
              </button>
            </div>

            {formData.videos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                No videos added
              </p>
            ) : (
              <div className="space-y-4">
                {formData.videos.map((item, index) => {
                  const thumbnailUrl = mediaPreviewUrl(item.thumbnail)
                  return (
                    <div
                      key={item.key}
                      className="border border-border rounded-lg p-4 bg-secondary/30 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-card-foreground">
                          Video {index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onMoveVideo(index, -1)}
                            disabled={index === 0}
                            className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                            title="Move up"
                          >
                            <ChevronUpIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveVideo(index, 1)}
                            disabled={index === formData.videos.length - 1}
                            className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                            title="Move down"
                          >
                            <ChevronDownIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveVideo(index)}
                            className="p-1.5 text-red-600 hover:text-red-800"
                            title="Remove"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            onUpdateVideoField(index, 'title', e.target.value)
                          }
                          required
                          maxLength={255}
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Video title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                          Video
                        </label>
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenMediaPicker({ type: 'video', index })
                            }
                            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                          >
                            <VideoIcon className="w-5 h-5" />
                            Select Video
                          </button>
                          {item.video && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  videos: prev.videos.map((v, i) =>
                                    i === index ? { ...v, video: null } : v
                                  ),
                                }))
                              }
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {item.video && (
                        <div>
                          <label className="block text-sm font-medium text-card-foreground mb-2">
                            Preview
                          </label>
                          {isYouTubeMedia(item.video) ? (
                            <div className="max-w-md overflow-hidden rounded-lg border border-border">
                              <lite-youtube
                                videoid={item.video.videoId!}
                                playlabel={item.title || item.video.fileName}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg border border-border w-fit max-w-full">
                              <VideoIcon className="w-4 h-4 shrink-0" />
                              <span className="text-sm text-foreground truncate">
                                {item.video.fileName}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                          Thumbnail
                        </label>
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenMediaPicker({ type: 'thumbnail', index })
                            }
                            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                          >
                            <PhotoIcon className="w-5 h-5" />
                            Select Thumbnail
                          </button>
                          {item.thumbnail && (
                            <>
                              {thumbnailUrl && (
                                <img
                                  src={thumbnailUrl}
                                  alt="Thumbnail"
                                  className="w-12 h-12 object-cover rounded border border-border"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    videos: prev.videos.map((v, i) =>
                                      i === index ? { ...v, thumbnail: null } : v
                                    ),
                                  }))
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
                  )
                })}
              </div>
            )}
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

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
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
