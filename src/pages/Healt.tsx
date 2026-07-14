import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import MediaPicker from '@/components/MediaPicker'
import type { MultimediaResponse } from '@/actions/multimedia'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { healthActions } from '@/actions/health'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<any>()

interface HealthVideo {
  id: string
  title: string
  description: string
  video: MultimediaResponse
}

export default function Health() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', videos: [] as HealthVideo[] })
  const [mediaPickerTarget, setMediaPickerTarget] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const queryClient = useQueryClient()

  // Load saved configuration
  const { data: configData, isLoading } = useQuery({
    queryKey: ['healthConfig'],
    queryFn: healthActions.getConfig,
  })

  const saveMutation = useMutation({
    mutationFn: healthActions.saveConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthConfig'] })
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      console.error('Save error:', error)
    }
  })

  const addVideo = () => {
    setFormData((prev) => ({
      ...prev,
      videos: [...prev.videos, { 
        id: Date.now().toString(), 
        title: '', 
        description: '', 
        video: null as any 
      }],
    }))
    setMediaPickerTarget(formData.videos.length)
  }

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }))
  }

  const handleMediaSelect = (media: MultimediaResponse) => {
    if (mediaPickerTarget === null) return

    setFormData((prev) => {
      const newVideos = [...prev.videos]
      newVideos[mediaPickerTarget] = {
        ...newVideos[mediaPickerTarget],
        video: media,
      }
      return { ...prev, videos: newVideos }
    })

    setMediaPickerTarget(null)
  }

  const updateVideoTitle = (index: number, title: string) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.map((v, i) => i === index ? { ...v, title } : v),
    }))
  }

  const updateVideoDescription = (index: number, description: string) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.map((v, i) => i === index ? { ...v, description } : v),
    }))
  }

  // Filter videos by search term
  const filteredVideos = useMemo(() => {
    if (!configData?.videos) return []
    return configData.videos.filter((video: any) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [configData, searchTerm])

  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    columnHelper.accessor('title', { header: 'Title' }),
    columnHelper.accessor('description', { header: 'Description' }),
    columnHelper.accessor('video.fileName', { header: 'Video' }),
  ], [])

  const table = useReactTable({
    data: filteredVideos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Health</h2>
              <p className="text-muted-foreground mt-1">Manage health page videos</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Manage Videos
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg mb-6"
          />

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
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
                          {flexRender(header.column.columnDef.header, header.getContext())}
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
          )}
        </div>
      </div>

      {/* Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="text-lg font-semibold text-card-foreground">Manage Health Videos</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="p-6 space-y-6">
              <button
                onClick={addVideo}
                className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add Video
              </button>

              <div className="space-y-4">
                {formData.videos.map((item, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 bg-secondary/30">
                    <button
                      onClick={() => setMediaPickerTarget(index)}
                      className="w-full text-left px-4 py-3 bg-background border border-border rounded-lg mb-3 hover:bg-secondary"
                    >
                      {item.video ? item.video.fileName : "Select Video"}
                    </button>

                    <input
                      type="text"
                      placeholder="Video Title"
                      value={item.title}
                      onChange={(e) => updateVideoTitle(index, e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg mb-2"
                    />

                    <textarea
                      placeholder="Short description"
                      value={item.description}
                      onChange={(e) => updateVideoDescription(index, e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveMutation.mutate({
                    title: formData.title,
                    description: formData.description,
                    videos: formData.videos.map(v => ({
                      title: v.title,
                      description: v.description,
                      videoId: v.video?.id
                    }))
                  })}
                  disabled={saveMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MediaPicker
        isOpen={mediaPickerTarget !== null}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={handleMediaSelect}
        title="Select Video"
      />
    </Layout>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}