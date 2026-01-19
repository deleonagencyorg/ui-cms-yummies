import { useState } from 'react'
import { useMultimedia } from '@/queries/multimedia'
import type { MultimediaResponse } from '@/actions/multimedia'

interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string, media: MultimediaResponse) => void
  currentUrl?: string
  title?: string
}

type UrlType = 'original' | 'optimized' | 'thumbnail' | 'seo'

export default function MediaPicker({ isOpen, onClose, onSelect, currentUrl, title = 'Select Media' }: MediaPickerProps) {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(24)
  const [searchFileName, setSearchFileName] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<MultimediaResponse | null>(null)
  const [selectedUrlType, setSelectedUrlType] = useState<UrlType>('original')

  const { data, isLoading } = useMultimedia({
    page,
    pageSize,
    fileName: searchFileName || undefined,
  })

  if (!isOpen) return null

  const handleSelect = () => {
    if (!selectedMedia) return

    let url = selectedMedia.originalUrl
    if (selectedUrlType === 'optimized' && selectedMedia.optimizedUrl) {
      url = selectedMedia.optimizedUrl
    } else if (selectedUrlType === 'thumbnail' && selectedMedia.thumbnailUrl) {
      url = selectedMedia.thumbnailUrl
    } else if (selectedUrlType === 'seo' && selectedMedia.seoUrl) {
      url = selectedMedia.seoUrl
    }

    onSelect(url, selectedMedia)
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getAvailableUrlTypes = (media: MultimediaResponse): UrlType[] => {
    const types: UrlType[] = ['original']
    if (media.optimizedUrl) types.push('optimized')
    if (media.thumbnailUrl) types.push('thumbnail')
    if (media.seoUrl) types.push('seo')
    return types
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-5xl w-full border border-border max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-border">
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
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No media files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data.data.map((media) => (
                <div
                  key={media.id}
                  onClick={() => {
                    setSelectedMedia(media)
                    // Reset to original if the previously selected type isn't available
                    const availableTypes = getAvailableUrlTypes(media)
                    if (!availableTypes.includes(selectedUrlType)) {
                      setSelectedUrlType('original')
                    }
                  }}
                  className={`cursor-pointer bg-background border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all ${
                    selectedMedia?.id === media.id
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-border'
                  }`}
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
                        <FileIcon className="w-8 h-8" />
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

        {/* Selected Media Preview & URL Type Selection */}
        {selectedMedia && (
          <div className="p-6 border-t border-border bg-secondary/30">
            <div className="flex gap-6">
              {/* Preview */}
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

              {/* Details & URL Type Selection */}
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-card-foreground mb-2">Selected Media</h4>
                <p className="text-sm text-muted-foreground mb-1">{selectedMedia.fileName}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  {formatFileSize(selectedMedia.fileSize)}
                  {selectedMedia.width && selectedMedia.height &&
                    ` • ${selectedMedia.width}x${selectedMedia.height}`
                  }
                </p>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-card-foreground">
                    Select URL Type
                  </label>
                  <div className="flex gap-2">
                    {getAvailableUrlTypes(selectedMedia).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedUrlType(type)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          selectedUrlType === type
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:bg-secondary'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedUrlType === 'original' && 'Full resolution original file'}
                    {selectedUrlType === 'optimized' && 'Compressed and optimized version'}
                    {selectedUrlType === 'thumbnail' && 'Small thumbnail version'}
                    {selectedUrlType === 'seo' && 'SEO-optimized version (max width 300px)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t border-border">
          <button
            onClick={onClose}
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
