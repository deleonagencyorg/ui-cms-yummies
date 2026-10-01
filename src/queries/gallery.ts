import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  galleryActions,
  type GalleryImage,
  type GalleryImageListResponse,
  type GalleryImageFiltersRequest,
} from '@/actions/gallery'

export const GALLERY_KEYS = {
  all: ['gallery'] as const,
  lists: () => [...GALLERY_KEYS.all, 'list'] as const,
  list: (filters?: GalleryImageFiltersRequest) => [...GALLERY_KEYS.lists(), filters] as const,
  details: () => [...GALLERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...GALLERY_KEYS.details(), id] as const,
}

export const useGalleryList = (
  filters?: GalleryImageFiltersRequest,
  options?: Omit<UseQueryOptions<GalleryImageListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<GalleryImageListResponse, Error>({
    queryKey: GALLERY_KEYS.list(filters),
    queryFn: () => galleryActions.getAll(filters),
    ...options,
  })
}

export const useGalleryImage = (
  id: string,
  options?: Omit<UseQueryOptions<GalleryImage, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<GalleryImage, Error>({
    queryKey: GALLERY_KEYS.detail(id),
    queryFn: () => galleryActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
