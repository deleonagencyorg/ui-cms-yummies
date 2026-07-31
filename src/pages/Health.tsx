import { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import MediaPicker from '@/components/MediaPicker'
import type { MultimediaResponse } from '@/actions/multimedia'
import type { HealthConfig, UpdateHealthConfigRequest } from '@/actions/health'
import { useHealthConfig } from '@/queries/health'
import { useUpdateHealthConfig } from '@/mutations/health'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'
import 'lite-youtube-embed'
import 'lite-youtube-embed/src/lite-yt-embed.css'

const columnHelper = createColumnHelper<HealthConfig['videos'][number]>()

interface HealthVideoFormItem {
  key: string
  title: string
  description: string
  order: number
  video: MultimediaResponse | null
}

interface HealthFormData {
  heroImage: MultimediaResponse | null
  mainTitle: string
  mainDescription: string
  mainImage: MultimediaResponse | null
  videosSectionTitle: string
  videosSectionDescription: string
  videos: HealthVideoFormItem[]
}

const emptyFormData: HealthFormData = {
  heroImage: null,
  mainTitle: '',
  mainDescription: '',
  mainImage: null,
  videosSectionTitle: '',
  videosSectionDescription: '',
  videos: [],
}

type MediaPickerTarget =
  | { type: 'heroImage' }
  | { type: 'mainImage' }
  | { type: 'video'; index: number }

function configToFormData(config: HealthConfig): HealthFormData {
  return {
    heroImage: config.heroImage ?? null,
    mainTitle: config.mainTitle ?? '',
    mainDescription: config.mainDescription ?? '',
    mainImage: config.mainImage ?? null,
    videosSectionTitle: config.videosSectionTitle ?? '',
    videosSectionDescription: config.videosSectionDescription ?? '',
    videos: (config.videos ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((video, index) => ({
        key: video.id || `${Date.now()}-${index}`,
        title: video.title ?? '',
        description: video.description ?? '',
        order: video.order ?? index,
        video: video.video ?? null,
      })),
  }
}

function formDataToPayload(formData: HealthFormData): UpdateHealthConfigRequest {
  return {
    heroImageId: formData.heroImage?.id ?? null,
    mainTitle: formData.mainTitle,
    mainDescription: formData.mainDescription,
    mainImageId: formData.mainImage?.id ?? null,
    videosSectionTitle: formData.videosSectionTitle,
    videosSectionDescription: formData.videosSectionDescription,
    videos: formData.videos.map((video, index) => ({
      title: video.title,
      description: video.description,
      videoId: video.video?.id ?? null,
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<HealthFormData>(emptyFormData)
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaPickerTarget | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: configData, isLoading, error } = useHealthConfig()
  const updateMutation = useUpdateHealthConfig()

  useEffect(() => {
    if (configData && !isModalOpen) {
      setFormData(configToFormData(configData))
    }
  }, [configData, isModalOpen])

  const openEditModal = () => {
    if (configData) {
      setFormData(configToFormData(configData))
    }
    setIsModalOpen(true)
  }

  const closeEditModal = () => {
    setIsModalOpen(false)
    setMediaPickerTarget(null)
    if (configData) {
      setFormData(configToFormData(configData))
    }
  }

  const handleMediaSelect = (media: MultimediaResponse) => {
    if (!mediaPickerTarget) return

    if (mediaPickerTarget.type === 'heroImage') {
      setFormData((prev) => ({ ...prev, heroImage: media }))
    } else if (mediaPickerTarget.type === 'mainImage') {
      setFormData((prev) => ({ ...prev, mainImage: media }))
    } else if (mediaPickerTarget.type === 'video') {
      const index = mediaPickerTarget.index
      setFormData((prev) => ({
        ...prev,
        videos: prev.videos.map((item, i) =>
          i === index ? { ...item, video: media } : item
        ),
      }))
    }

    setMediaPickerTarget(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateMutation.mutateAsync(formDataToPayload(formData))
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to update health config:', err)
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
          description: '',
          order: prev.videos.length,
          video: null,
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

  const updateVideoField = (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const filteredVideos = useMemo(() => {
    if (!configData?.videos) return []
    const term = searchTerm.trim().toLowerCase()
    const videos = configData.videos.slice().sort((a, b) => a.order - b.order)
    if (!term) return videos
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(term) ||
        video.description.toLowerCase().includes(term)
    )
  }, [configData, searchTerm])

  const columns = useMemo<ColumnDef<HealthConfig['videos'][number], any>[]>(
    () => [
      columnHelper.accessor('order', {
        header: 'Order',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => (
          <span className="text-sm text-muted-foreground line-clamp-2 max-w-md">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'video',
        header: 'Video',
        cell: ({ row }) => {
          const video = row.original.video
          if (!video) {
            return <span className="text-sm text-muted-foreground">-</span>
          }
          if (isYouTubeMedia(video)) {
            return (
              <span className="text-sm text-muted-foreground">
                YouTube · {video.videoId}
              </span>
            )
          }
          return (
            <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
              {video.fileName}
            </span>
          )
        },
      }),
    ],
    []
  )

  const table = useReactTable({
    data: filteredVideos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const heroUrl = mediaPreviewUrl(configData?.heroImage)
  const mainUrl = mediaPreviewUrl(configData?.mainImage)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Health</h2>
              <p className="text-muted-foreground mt-1">
                Manage health page content
              </p>
            </div>
            <button
              onClick={openEditModal}
              disabled={isLoading || !!error}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Edit Health Page
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              Failed to load health configuration
            </div>
          ) : (
            <div className="space-y-8">
              {/* Hero preview */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
                  Hero / Banner
                </h3>
                {heroUrl ? (
                  <img
                    src={heroUrl}
                    alt="Hero"
                    className="h-32 w-full max-w-xl object-cover rounded-lg border border-border"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">No hero image selected</p>
                )}
              </section>

              {/* Main section preview */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
                  Main Section
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-card-foreground">
                      {configData?.mainTitle || 'Untitled'}
                    </p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {configData?.mainDescription || 'No description'}
                    </p>
                  </div>
                  {mainUrl ? (
                    <img
                      src={mainUrl}
                      alt="Main"
                      className="h-40 w-full object-cover rounded-lg border border-border"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">No side image selected</p>
                  )}
                </div>
              </section>

              {/* Videos section */}
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground border-b border-border pb-2 mb-3">
                    Videos Section
                  </h3>
                  <p className="text-base font-medium text-card-foreground">
                    {configData?.videosSectionTitle || 'Untitled videos section'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {configData?.videosSectionDescription || 'No description'}
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />

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
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-border">
                      {table.getRowModel().rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="px-6 py-8 text-center text-sm text-muted-foreground"
                          >
                            No videos configured
                          </td>
                        </tr>
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <tr key={row.id} className="hover:bg-secondary/50">
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="px-6 py-4">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <HealthFormModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={closeEditModal}
          isSubmitting={updateMutation.isPending}
          onOpenMediaPicker={setMediaPickerTarget}
          onAddVideo={addVideo}
          onRemoveVideo={removeVideo}
          onMoveVideo={moveVideo}
          onUpdateVideoField={updateVideoField}
        />
      )}

      <MediaPicker
        isOpen={mediaPickerTarget !== null}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={handleMediaSelect}
        title={
          mediaPickerTarget?.type === 'video' ? 'Select Video' : 'Select Image'
        }
      />
    </Layout>
  )
}

interface HealthFormModalProps {
  formData: HealthFormData
  setFormData: React.Dispatch<React.SetStateAction<HealthFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  onOpenMediaPicker: (target: MediaPickerTarget) => void
  onAddVideo: () => void
  onRemoveVideo: (index: number) => void
  onMoveVideo: (index: number, direction: -1 | 1) => void
  onUpdateVideoField: (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => void
}

function HealthFormModal({
  formData,
  setFormData,
  onSubmit,
  onClose,
  isSubmitting,
  onOpenMediaPicker,
  onAddVideo,
  onRemoveVideo,
  onMoveVideo,
  onUpdateVideoField,
}: HealthFormModalProps) {
  const heroUrl = mediaPreviewUrl(formData.heroImage)
  const mainUrl = mediaPreviewUrl(formData.mainImage)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="text-lg font-semibold text-card-foreground">
            Edit Health Page
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Hero / Banner */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Hero / Banner
            </h4>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Hero Image
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenMediaPicker({ type: 'heroImage' })}
                  className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                >
                  <PhotoIcon className="w-5 h-5" />
                  Select Image
                </button>
                {formData.heroImage && (
                  <>
                    {heroUrl && (
                      <img
                        src={heroUrl}
                        alt="Hero"
                        className="w-12 h-12 object-cover rounded border border-border"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, heroImage: null }))
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
                value={formData.mainTitle}
                onChange={(e) =>
                  setFormData({ ...formData, mainTitle: e.target.value })
                }
                maxLength={255}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Main section title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.mainDescription}
                onChange={(e) =>
                  setFormData({ ...formData, mainDescription: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Main section description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Side Image
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenMediaPicker({ type: 'mainImage' })}
                  className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                >
                  <PhotoIcon className="w-5 h-5" />
                  Select Image
                </button>
                {formData.mainImage && (
                  <>
                    {mainUrl && (
                      <img
                        src={mainUrl}
                        alt="Main"
                        className="w-12 h-12 object-cover rounded border border-border"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, mainImage: null }))
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
                {formData.videos.map((item, index) => (
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
                        Description
                      </label>
                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          onUpdateVideoField(index, 'description', e.target.value)
                        }
                        rows={2}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Short description"
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
                  </div>
                ))}
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
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
