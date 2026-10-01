import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface ContactFormField {
  label: string
  placeholder: string
  required: boolean
}

export interface ContactReasonField extends ContactFormField {
  options: string[]
}

export interface ContactForm {
  title: string
  contactReason: ContactReasonField
  fullName: ContactFormField
  email: ContactFormField
  phone: ContactFormField
  message: ContactFormField
  submit: string
}

export interface ContactOffice {
  id: string
  countryCode: string
  tab: string
  name: string
  address: string
  phones: string[]
  fax?: string
  email: string
  mapEmbed: string
  order: number
}

export interface ContactOffices {
  title: string
  locations: ContactOffice[]
}

export interface ContactMap {
  title: string
  description: string
}

export interface ContactConfig {
  id: string
  siteId: string
  languageCode: string
  title: string
  subtitle: string
  description: string
  email: string
  phone: string
  form: ContactForm
  offices: ContactOffices
  map: ContactMap
  createdAt: string
  updatedAt: string
}

export interface ContactListResponse {
  data: ContactConfig[]
  pagination: Pagination
}

export interface CreateContactFormFieldRequest {
  label?: string
  placeholder?: string
  required?: boolean
}

export interface CreateContactReasonFieldRequest extends CreateContactFormFieldRequest {
  options?: string[]
}

export interface CreateContactFormRequest {
  title?: string
  contactReason?: CreateContactReasonFieldRequest
  fullName?: CreateContactFormFieldRequest
  email?: CreateContactFormFieldRequest
  phone?: CreateContactFormFieldRequest
  message?: CreateContactFormFieldRequest
  submit?: string
}

export interface CreateContactOfficeRequest {
  countryCode: string
  tab?: string
  name?: string
  address?: string
  phones?: string[]
  fax?: string
  email?: string
  mapEmbed?: string
  order?: number
}

export interface CreateContactConfigRequest {
  siteId: string
  languageCode: string
  title?: string
  subtitle?: string
  description?: string
  email?: string
  phone?: string
  form?: CreateContactFormRequest
  offices?: {
    title?: string
    locations?: CreateContactOfficeRequest[]
  }
  map?: {
    title?: string
    description?: string
  }
}

export interface UpdateContactConfigRequest {
  siteId?: string
  languageCode?: string
  title?: string
  subtitle?: string
  description?: string
  email?: string
  phone?: string
  form?: CreateContactFormRequest
  offices?: {
    title?: string
    locations?: CreateContactOfficeRequest[]
  }
  map?: {
    title?: string
    description?: string
  }
}

export interface ContactFiltersRequest {
  title?: string
  languageCode?: string
  siteId?: string
  page?: number
  pageSize?: number
}

export const contactActions = {
  getAll: async (filters?: ContactFiltersRequest) => {
    const response = await axiosInstance.get<ContactListResponse>(
      API_ENDPOINTS.CONTACT.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ContactConfig>(
      API_ENDPOINTS.CONTACT.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateContactConfigRequest) => {
    const response = await axiosInstance.post<ContactConfig>(
      API_ENDPOINTS.CONTACT.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateContactConfigRequest) => {
    const response = await axiosInstance.put<ContactConfig>(
      API_ENDPOINTS.CONTACT.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.CONTACT.BY_ID(id))
  },
}
