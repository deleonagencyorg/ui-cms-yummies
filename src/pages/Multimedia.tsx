import { useState, useRef } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import { toast } from 'sonner'
import { useMultimedia } from '@/queries/multimedia'
import { useUploadMultimedia, useDeleteMultimedia, useUpdateMultimedia } from '@/mutations/multimedia'
import type { MultimediaResponse } from '@/actions/multimedia'

type ViewMode = 'grid' | 'list'

export default function Multimedia() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(24)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchFileName, setSearchFileName] = useState('')
  const [filterFileType, setFilterFileType] = useState('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<MultimediaResponse | null>(null)
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    altText: '',
    caption: '',
  })
  const [editData, setEditData] = useState({
    altText: '',
    caption: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, error } = useMultimedia({
    page,
    pageSize,
    fileName: searchFileName || undefined,
    fileType: filterFileType || undefined,
  })

  const uploadMutation = useUploadMultimedia({
    onSuccess: () => {
      toast.success('File uploaded successfully!')
      setIsUploadModalOpen(false)
      setUploadData({ file: null, altText: '', caption: '' })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to upload file')
    },
  })

  const updateMutation = useUpdateMultimedia({
    onSuccess: () => {
      toast.success('Media updated successfully!')
      setIsEditModalOpen(false)
      setSelectedMedia(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update media')
    },
  })

  const deleteMutation = useDeleteMultimedia({
    onSuccess: () => {
      toast.success('Media deleted successfully!')
      setIsDeleteModalOpen(false)
      setSelectedMedia(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete media')
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadData({ ...uploadData, file })
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadData.file) {
      toast.error('Please select a file')
      return
    }

    await uploadMutation.mutateAsync({
      file: uploadData.file,
      altText: uploadData.altText || undefined,
      caption: uploadData.caption || undefined,
    })
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMedia) return

    await updateMutation.mutateAsync({
      id: selectedMedia.id,
      data: editData,
    })
  }

  const handleDelete = async () => {
    if (!selectedMedia) return
    await deleteMutation.mutateAsync(selectedMedia.id)
  }

  const openEditModal = (media: MultimediaResponse) => {
    setSelectedMedia(media)
    setEditData({
      altText: media.altText || '',
      caption: media.caption || '',
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (media: MultimediaResponse) => {
    setSelectedMedia(media)
    setIsDeleteModalOpen(true)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image')) return <ImageIcon className="w-6 h-6" />
    if (fileType.startsWith('video')) return <VideoIcon className="w-6 h-6" />
    if (fileType.startsWith('audio')) return <AudioIcon className="w-6 h-6" />
    if (fileType.includes('pdf')) return <DocumentIcon className="w-6 h-6" />
    return <FileIcon className="w-6 h-6" />
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Media Library</h2>
              <p className="text-muted-foreground mt-1">Manage your files and media</p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <UploadIcon className="w-5 h-5" />
              Upload File
            </button>
          </div>

          {/* Filters and View Toggle */}
          <div className="mb-6 flex gap-4 flex-wrap items-center">
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchFileName}
              onChange={(e) => {
                setSearchFileName(e.target.value)
                setPage(1)
              }}
              className="flex-1 min-w-48 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterFileType}
              onChange={(e) => {
                setFilterFileType(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>

            {/* View Toggle */}
            <div className="flex gap-2 border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary'
                }`}
                title="Grid View"
              >
                <GridIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary'
                }`}
                title="List View"
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading media...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load media</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No media files found</p>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {data.data.map((media) => (
                    <div
                      key={media.id}
                      className="group relative bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-square bg-secondary flex items-center justify-center">
                        {media.fileType.startsWith('image') ? (
                          <img
                            src={media.thumbnailUrl || media.originalUrl}
                            alt={media.altText || media.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-muted-foreground">
                            {getFileIcon(media.fileType)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2">
                        <p className="text-xs font-medium text-card-foreground truncate" title={media.fileName}>
                          {media.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(media.fileSize)}
                        </p>
                      </div>

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(media)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                          title="Edit"
                        >
                          <EditIcon className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(media)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                          title="Delete"
                        >
                          <DeleteIcon className="w-4 h-4 text-red-600" />
                        </button>
                        <a
                          href={media.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                          title="View"
                        >
                          <EyeIcon className="w-4 h-4 text-gray-700" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Preview
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          File Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.data.map((media) => (
                        <tr key={media.id} className="hover:bg-secondary/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center overflow-hidden">
                              {media.fileType.startsWith('image') ? (
                                <img
                                  src={media.thumbnailUrl || media.originalUrl}
                                  alt={media.altText || media.fileName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-muted-foreground">
                                  {getFileIcon(media.fileType)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-card-foreground">{media.fileName}</p>
                            {media.caption && (
                              <p className="text-xs text-muted-foreground">{media.caption}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-muted-foreground">{media.mimeType}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-muted-foreground">
                              {formatFileSize(media.fileSize)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-muted-foreground">
                              {new Date(media.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openEditModal(media)}
                                className="text-primary hover:text-primary/80"
                                title="Edit"
                              >
                                <EditIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(media)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <DeleteIcon className="w-5 h-5" />
                              </button>
                              <a
                                href={media.originalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="View"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

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
                  pageSizeOptions={[12, 24, 48, 96]}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <Modal
          title="Upload File"
          onClose={() => {
            setIsUploadModalOpen(false)
            setUploadData({ file: null, altText: '', caption: '' })
          }}
        >
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                File *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                required
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {uploadData.file && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {uploadData.file.name} ({formatFileSize(uploadData.file.size)})
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={uploadData.altText}
                onChange={(e) => setUploadData({ ...uploadData, altText: e.target.value })}
                maxLength={255}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe this image for accessibility"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Caption
              </label>
              <textarea
                value={uploadData.caption}
                onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
                maxLength={500}
                rows={3}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Optional caption"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false)
                  setUploadData({ file: null, altText: '', caption: '' })
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedMedia && (
        <Modal
          title="Edit Media"
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedMedia(null)
          }}
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                File Name
              </label>
              <input
                type="text"
                value={selectedMedia.fileName}
                disabled
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={editData.altText}
                onChange={(e) => setEditData({ ...editData, altText: e.target.value })}
                maxLength={255}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Caption
              </label>
              <textarea
                value={editData.caption}
                onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                maxLength={500}
                rows={3}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedMedia(null)
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
      {isDeleteModalOpen && selectedMedia && (
        <Modal
          title="Delete Media"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedMedia(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete "<strong>{selectedMedia.fileName}</strong>"?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedMedia(null)
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
    </Layout>
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
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

function AudioIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  )
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}
