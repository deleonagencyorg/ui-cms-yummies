import { useState, useEffect } from 'react'
import { useFolderContents, useFolderById } from '@/queries/folders'
import type { MultimediaResponse } from '@/actions/multimedia'
import type { FolderResponse } from '@/actions/folders'

interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MultimediaResponse) => void
  currentUrl?: string
  title?: string
}

interface BreadcrumbItem {
  id: string | null
  name: string
}

export default function MediaPicker({ isOpen, onClose, onSelect, title = 'Select Media' }: MediaPickerProps) {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(24)
  const [searchFileName, setSearchFileName] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<MultimediaResponse | null>(null)

  // Folder navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: 'Root' }])

  const { data: currentFolderData } = useFolderById(currentFolderId || '', {
    enabled: !!currentFolderId,
  })

  const { data, isLoading } = useFolderContents(currentFolderId, {
    page,
    pageSize,
    fileName: searchFileName || undefined,
  })

  // Update breadcrumbs when folder changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!currentFolderId) {
      setBreadcrumbs([{ id: null, name: 'Root' }])
    } else if (currentFolderData) {
      setBreadcrumbs([
        { id: null, name: 'Root' },
        { id: currentFolderData.id, name: currentFolderData.name },
      ])
    }
  }, [currentFolderId, currentFolderData])

  // Reset page when folder changes
  useEffect(() => {
    setPage(1)
  }, [currentFolderId])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null

  const navigateToFolder = (folder: FolderResponse) => {
    setCurrentFolderId(folder.id)
    setSelectedMedia(null)
  }

  const navigateToBreadcrumb = (index: number) => {
    const item = breadcrumbs[index]
    setCurrentFolderId(item.id)
    setBreadcrumbs(breadcrumbs.slice(0, index + 1))
    setSelectedMedia(null)
  }

  const resetAndClose = () => {
    setSelectedMedia(null)
    setCurrentFolderId(null)
    setSearchFileName('')
    setPage(1)
    setBreadcrumbs([{ id: null, name: 'Root' }])
    onClose()
  }

  const handleSelect = () => {
    if (!selectedMedia) return
    onSelect(selectedMedia)
    resetAndClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-5xl w-full border border-border max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <button
            onClick={resetAndClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Breadcrumbs + Search */}
        <div className="p-4 border-b border-border space-y-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.id ?? 'root'} className="flex items-center gap-2">
                {index > 0 && <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />}
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className={`hover:text-primary transition-colors ${
                    index === breadcrumbs.length - 1
                      ? 'text-card-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchFileName}
            onChange={(e) => {
              setSearchFileName(e.target.value)
              setPage(1)
            }}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading media...</p>
            </div>
          ) : !data?.folders?.length && !data?.multimedia?.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">This folder is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Folders */}
              {data?.folders?.map((folder) => (
                <div
                  key={folder.id}
                  onDoubleClick={() => navigateToFolder(folder)}
                  onClick={() => navigateToFolder(folder)}
                  className="cursor-pointer bg-background border-2 border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all"
                >
                  <div className="aspect-square bg-secondary flex items-center justify-center">
                    <FolderIcon className="w-16 h-16 text-yellow-500" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-card-foreground truncate" title={folder.name}>
                      {folder.name}
                    </p>
                    <p className="text-xs text-muted-foreground">Folder</p>
                  </div>
                </div>
              ))}

              {/* Media files */}
              {data?.multimedia?.map((media) => (
                <div
                  key={media.id}
                  onClick={() => setSelectedMedia(media)}
                  className={`cursor-pointer bg-background border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all ${
                    selectedMedia?.id === media.id
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-border'
                  }`}
                >
                  <div className="aspect-square bg-secondary flex items-center justify-center">
                    {media.fileType.startsWith('image') ? (
                      <img
                        src={media.thumbnailUrl || media.originalUrl}
                        alt={media.altText || media.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground">
                        <FileIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-card-foreground truncate" title={media.fileName}>
                      {media.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(media.fileSize)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.pageCount > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-border rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-1 text-sm text-muted-foreground">
                Page {page} of {data.pagination.pageCount}
              </span>
              <button
                onClick={() => setPage(Math.min(data.pagination.pageCount, page + 1))}
                disabled={page === data.pagination.pageCount}
                className="px-3 py-1 border border-border rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Selected Media Preview */}
        {selectedMedia && (
          <div className="p-6 border-t border-border bg-secondary/30">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                  {selectedMedia.fileType.startsWith('image') ? (
                    <img
                      src={selectedMedia.thumbnailUrl || selectedMedia.originalUrl}
                      alt={selectedMedia.altText || selectedMedia.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-card-foreground mb-1">Selected Media</h4>
                <p className="text-sm text-muted-foreground truncate">{selectedMedia.fileName}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {formatFileSize(selectedMedia.fileSize)}
                  {selectedMedia.width && selectedMedia.height &&
                    ` • ${selectedMedia.width}x${selectedMedia.height}`
                  }
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {selectedMedia.originalUrl && (
                    <span className="px-2 py-0.5 bg-background border border-border rounded">Original</span>
                  )}
                  {selectedMedia.optimizedUrl && (
                    <span className="px-2 py-0.5 bg-background border border-border rounded">Optimized</span>
                  )}
                  {selectedMedia.thumbnailUrl && (
                    <span className="px-2 py-0.5 bg-background border border-border rounded">Thumbnail</span>
                  )}
                  {selectedMedia.seoUrl && (
                    <span className="px-2 py-0.5 bg-background border border-border rounded">SEO</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t border-border">
          <button
            onClick={resetAndClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedMedia}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M19.5 21a3 3 0 003-3v-9a3 3 0 00-3-3h-5.379a.75.75 0 01-.53-.22L11.47 3.66A2.25 2.25 0 009.879 3H4.5a3 3 0 00-3 3v12a3 3 0 003 3h15z" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}
