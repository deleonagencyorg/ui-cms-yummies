import { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import { useSite } from '@/contexts/SiteContext'
import type {
  ContactConfig,
  CreateContactConfigRequest,
  UpdateContactConfigRequest,
} from '@/actions/contact'
import { useContactList } from '@/queries/contact'
import { useLanguages } from '@/queries/languages'
import { useSites } from '@/queries/sites'
import {
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from '@/mutations/contact'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<ContactConfig>()

interface FormFieldData {
  label: string
  placeholder: string
  required: boolean
}

interface ContactReasonFieldData extends FormFieldData {
  options: string[]
}

interface OfficeFormItem {
  key: string
  countryCode: string
  tab: string
  name: string
  address: string
  phones: string
  fax: string
  email: string
  mapEmbed: string
  order: number
}

interface ContactFormData {
  siteId: string
  languageCode: string
  title: string
  subtitle: string
  description: string
  email: string
  phone: string
  form: {
    title: string
    submit: string
    contactReason: ContactReasonFieldData
    fullName: FormFieldData
    email: FormFieldData
    phone: FormFieldData
    message: FormFieldData
  }
  offices: {
    title: string
    locations: OfficeFormItem[]
  }
  map: {
    title: string
    description: string
  }
}

const emptyFormField = (): FormFieldData => ({
  label: '',
  placeholder: '',
  required: false,
})

const emptyContactReason = (): ContactReasonFieldData => ({
  label: '',
  placeholder: '',
  required: false,
  options: [],
})

function emptyOffice(index: number): OfficeFormItem {
  return {
    key: `new-${Date.now()}-${index}`,
    countryCode: '',
    tab: '',
    name: '',
    address: '',
    phones: '',
    fax: '',
    email: '',
    mapEmbed: '',
    order: index,
  }
}

const createInitialFormData = (siteId = ''): ContactFormData => ({
  siteId,
  languageCode: '',
  title: '',
  subtitle: '',
  description: '',
  email: '',
  phone: '',
  form: {
    title: '',
    submit: '',
    contactReason: emptyContactReason(),
    fullName: emptyFormField(),
    email: emptyFormField(),
    phone: emptyFormField(),
    message: emptyFormField(),
  },
  offices: {
    title: '',
    locations: [],
  },
  map: {
    title: '',
    description: '',
  },
})

function fieldFromApi(
  field?: { label?: string; placeholder?: string; required?: boolean } | null
): FormFieldData {
  return {
    label: field?.label ?? '',
    placeholder: field?.placeholder ?? '',
    required: field?.required ?? false,
  }
}

function configToFormData(config: ContactConfig): ContactFormData {
  const reason = config.form?.contactReason
  return {
    siteId: config.siteId ?? '',
    languageCode: config.languageCode ?? '',
    title: config.title ?? '',
    subtitle: config.subtitle ?? '',
    description: config.description ?? '',
    email: config.email ?? '',
    phone: config.phone ?? '',
    form: {
      title: config.form?.title ?? '',
      submit: config.form?.submit ?? '',
      contactReason: {
        label: reason?.label ?? '',
        placeholder: reason?.placeholder ?? '',
        required: reason?.required ?? false,
        options: reason?.options ?? [],
      },
      fullName: fieldFromApi(config.form?.fullName),
      email: fieldFromApi(config.form?.email),
      phone: fieldFromApi(config.form?.phone),
      message: fieldFromApi(config.form?.message),
    },
    offices: {
      title: config.offices?.title ?? '',
      locations: (config.offices?.locations ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((office, index) => ({
          key: office.id || `${Date.now()}-${index}`,
          countryCode: office.countryCode ?? '',
          tab: office.tab ?? '',
          name: office.name ?? '',
          address: office.address ?? '',
          phones: (office.phones ?? []).join(', '),
          fax: office.fax ?? '',
          email: office.email ?? '',
          mapEmbed: office.mapEmbed ?? '',
          order: office.order ?? index,
        })),
    },
    map: {
      title: config.map?.title ?? '',
      description: config.map?.description ?? '',
    },
  }
}

function parsePhones(value: string): string[] {
  return value
    .split(',')
    .map((phone) => phone.trim())
    .filter(Boolean)
}

function formDataToPayload(
  formData: ContactFormData
): CreateContactConfigRequest & UpdateContactConfigRequest {
  return {
    siteId: formData.siteId,
    languageCode: formData.languageCode,
    title: formData.title,
    subtitle: formData.subtitle,
    description: formData.description,
    email: formData.email,
    phone: formData.phone,
    form: {
      title: formData.form.title,
      submit: formData.form.submit,
      contactReason: {
        label: formData.form.contactReason.label,
        placeholder: formData.form.contactReason.placeholder,
        required: formData.form.contactReason.required,
        options: formData.form.contactReason.options
          .map((option) => option.trim())
          .filter(Boolean),
      },
      fullName: { ...formData.form.fullName },
      email: { ...formData.form.email },
      phone: { ...formData.form.phone },
      message: { ...formData.form.message },
    },
    offices: {
      title: formData.offices.title,
      locations: formData.offices.locations.map((office, index) => ({
        countryCode: office.countryCode,
        tab: office.tab,
        name: office.name,
        address: office.address,
        phones: parsePhones(office.phones),
        fax: office.fax || undefined,
        email: office.email,
        mapEmbed: office.mapEmbed,
        order: index,
      })),
    },
    map: {
      title: formData.map.title,
      description: formData.map.description,
    },
  }
}

export default function ContactPage() {
  const { selectedSiteId } = useSite()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTitle, setSearchTitle] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContactConfig | null>(null)
  const [formData, setFormData] = useState<ContactFormData>(createInitialFormData())

  useEffect(() => {
    if (selectedSiteId && !formData.siteId) {
      setFormData((prev) => ({ ...prev, siteId: selectedSiteId }))
    }
  }, [selectedSiteId, formData.siteId])

  const { data, isLoading, error } = useContactList({
    page,
    pageSize,
    title: searchTitle || undefined,
    languageCode: filterLanguage || undefined,
    siteId: selectedSiteId || undefined,
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: sitesData } = useSites({ page: 1, pageSize: 100 })
  const createMutation = useCreateContact()
  const updateMutation = useUpdateContact()
  const deleteMutation = useDeleteContact()

  const openEditModal = (item: ContactConfig) => {
    setSelectedItem(item)
    setFormData(configToFormData(item))
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (item: ContactConfig) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.siteId) return
    try {
      await createMutation.mutateAsync(formDataToPayload(formData))
      setIsCreateModalOpen(false)
      setFormData(createInitialFormData(selectedSiteId || ''))
    } catch (err) {
      console.error('Failed to create contact:', err)
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
      console.error('Failed to update contact:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await deleteMutation.mutateAsync(selectedItem.id)
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
    } catch (err) {
      console.error('Failed to delete contact:', err)
    }
  }

  const addOffice = () => {
    setFormData((prev) => ({
      ...prev,
      offices: {
        ...prev.offices,
        locations: [...prev.offices.locations, emptyOffice(prev.offices.locations.length)],
      },
    }))
  }

  const removeOffice = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      offices: {
        ...prev.offices,
        locations: prev.offices.locations.filter((_, i) => i !== index),
      },
    }))
  }

  const moveOffice = (index: number, direction: -1 | 1) => {
    setFormData((prev) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.offices.locations.length) return prev
      const locations = [...prev.offices.locations]
      const [item] = locations.splice(index, 1)
      locations.splice(nextIndex, 0, item)
      return {
        ...prev,
        offices: { ...prev.offices, locations },
      }
    })
  }

  const updateOfficeField = (
    index: number,
    field: keyof Omit<OfficeFormItem, 'key' | 'order'>,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      offices: {
        ...prev.offices,
        locations: prev.offices.locations.map((office, i) =>
          i === index ? { ...office, [field]: value } : office
        ),
      },
    }))
  }

  const columns = useMemo<ColumnDef<ContactConfig, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground line-clamp-1">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('languageCode', {
        header: 'Language',
        cell: (info) => (
          <span className="text-sm text-muted-foreground font-mono">{info.getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: 'officesCount',
        header: 'Offices',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.offices?.locations?.length ?? 0}
          </span>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{info.getValue() || '-'}</span>
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Contact</h2>
              <p className="text-muted-foreground mt-1">Manage contact page content</p>
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
              Create Contact
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search contact..."
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
              <p className="mt-4 text-muted-foreground">Loading contact...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load contact</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No contact content found</p>
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
        <ContactFormModal
          title="Create Contact"
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
          onAddOffice={addOffice}
          onRemoveOffice={removeOffice}
          onMoveOffice={moveOffice}
          onUpdateOfficeField={updateOfficeField}
        />
      )}

      {isEditModalOpen && selectedItem && (
        <ContactFormModal
          title="Edit Contact"
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
          onAddOffice={addOffice}
          onRemoveOffice={removeOffice}
          onMoveOffice={moveOffice}
          onUpdateOfficeField={updateOfficeField}
        />
      )}

      {isDeleteModalOpen && selectedItem && (
        <Modal
          title="Delete Contact"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedItem(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete the contact config "
              <strong>{selectedItem.title || 'Untitled'}</strong>"? This action cannot be undone.
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
    </Layout>
  )
}

function TextField({
  label,
  value,
  onChange,
  required,
  textarea,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  textarea?: boolean
  rows?: number
}) {
  const className =
    'w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
  return (
    <div>
      <label className="block text-sm font-medium text-card-foreground mb-2">
        {label}
        {required ? ' *' : ''}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={rows}
          className={className}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={className}
        />
      )}
    </div>
  )
}

function FormFieldEditor({
  title,
  field,
  onChange,
}: {
  title: string
  field: FormFieldData
  onChange: (field: FormFieldData) => void
}) {
  return (
    <div className="border border-border rounded-lg p-4 bg-secondary/30 space-y-3">
      <h5 className="text-sm font-medium text-card-foreground">{title}</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField
          label="Label"
          value={field.label}
          onChange={(value) => onChange({ ...field, label: value })}
        />
        <TextField
          label="Placeholder"
          value={field.placeholder}
          onChange={(value) => onChange({ ...field, placeholder: value })}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={field.required}
          onChange={(e) => onChange({ ...field, required: e.target.checked })}
          className="rounded border-border text-primary focus:ring-primary"
        />
        Required
      </label>
    </div>
  )
}

interface ContactFormModalProps {
  title: string
  formData: ContactFormData
  setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  submitLabel: string
  languages: { code: string; name: string; nativeName: string }[]
  sites: { id: string; name: string }[]
  onAddOffice: () => void
  onRemoveOffice: (index: number) => void
  onMoveOffice: (index: number, direction: -1 | 1) => void
  onUpdateOfficeField: (
    index: number,
    field: keyof Omit<OfficeFormItem, 'key' | 'order'>,
    value: string
  ) => void
}

function ContactFormModal({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  isSubmitting,
  submitLabel,
  languages,
  sites,
  onAddOffice,
  onRemoveOffice,
  onMoveOffice,
  onUpdateOfficeField,
}: ContactFormModalProps) {
  const setTop = (key: 'title' | 'subtitle' | 'description' | 'email' | 'phone' | 'languageCode', value: string) =>
    setFormData({ ...formData, [key]: value })

  const setFormField = <K extends keyof ContactFormData['form']>(
    key: K,
    value: ContactFormData['form'][K]
  ) => {
    setFormData({
      ...formData,
      form: { ...formData.form, [key]: value },
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
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
                  onChange={(e) => setTop('languageCode', e.target.value)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Title" value={formData.title} onChange={(v) => setTop('title', v)} />
              <TextField
                label="Subtitle"
                value={formData.subtitle}
                onChange={(v) => setTop('subtitle', v)}
              />
              <TextField label="Email" value={formData.email} onChange={(v) => setTop('email', v)} />
              <TextField label="Phone" value={formData.phone} onChange={(v) => setTop('phone', v)} />
            </div>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(v) => setTop('description', v)}
              textarea
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Contact Form
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Form Title"
                value={formData.form.title}
                onChange={(v) => setFormField('title', v)}
              />
              <TextField
                label="Submit Button"
                value={formData.form.submit}
                onChange={(v) => setFormField('submit', v)}
              />
            </div>

            <div className="border border-border rounded-lg p-4 bg-secondary/30 space-y-3">
              <h5 className="text-sm font-medium text-card-foreground">Contact Reason</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextField
                  label="Label"
                  value={formData.form.contactReason.label}
                  onChange={(value) =>
                    setFormField('contactReason', {
                      ...formData.form.contactReason,
                      label: value,
                    })
                  }
                />
                <TextField
                  label="Placeholder"
                  value={formData.form.contactReason.placeholder}
                  onChange={(value) =>
                    setFormField('contactReason', {
                      ...formData.form.contactReason,
                      placeholder: value,
                    })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.form.contactReason.required}
                  onChange={(e) =>
                    setFormField('contactReason', {
                      ...formData.form.contactReason,
                      required: e.target.checked,
                    })
                  }
                  className="rounded border-border text-primary focus:ring-primary"
                />
                Required
              </label>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Options (one per line)
                </label>
                <textarea
                  value={formData.form.contactReason.options.join('\n')}
                  onChange={(e) =>
                    setFormField('contactReason', {
                      ...formData.form.contactReason,
                      options: e.target.value.split('\n'),
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={'Option 1\nOption 2\nOption 3'}
                />
              </div>
            </div>

            <FormFieldEditor
              title="Full Name"
              field={formData.form.fullName}
              onChange={(field) => setFormField('fullName', field)}
            />
            <FormFieldEditor
              title="Email Field"
              field={formData.form.email}
              onChange={(field) => setFormField('email', field)}
            />
            <FormFieldEditor
              title="Phone Field"
              field={formData.form.phone}
              onChange={(field) => setFormField('phone', field)}
            />
            <FormFieldEditor
              title="Message"
              field={formData.form.message}
              onChange={(field) => setFormField('message', field)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h4 className="text-sm font-semibold text-card-foreground">Offices</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.offices.locations.length} location
                  {formData.offices.locations.length === 1 ? '' : 's'} added
                </p>
              </div>
              <button
                type="button"
                onClick={onAddOffice}
                className="px-3 py-1 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/80 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Office
              </button>
            </div>

            <TextField
              label="Offices Section Title"
              value={formData.offices.title}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  offices: { ...formData.offices, title: value },
                })
              }
            />

            {formData.offices.locations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                No offices added
              </p>
            ) : (
              <div className="space-y-4">
                {formData.offices.locations.map((office, index) => (
                  <div
                    key={office.key}
                    className="border border-border rounded-lg p-4 bg-secondary/30 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-card-foreground">
                        Office {index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onMoveOffice(index, -1)}
                          disabled={index === 0}
                          className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          title="Move up"
                        >
                          <ChevronUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveOffice(index, 1)}
                          disabled={index === formData.offices.locations.length - 1}
                          className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          title="Move down"
                        >
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveOffice(index)}
                          className="p-1.5 text-red-600 hover:text-red-800"
                          title="Remove"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <TextField
                        label="Country Code"
                        value={office.countryCode}
                        onChange={(value) => onUpdateOfficeField(index, 'countryCode', value)}
                        required
                      />
                      <TextField
                        label="Tab"
                        value={office.tab}
                        onChange={(value) => onUpdateOfficeField(index, 'tab', value)}
                      />
                      <TextField
                        label="Name"
                        value={office.name}
                        onChange={(value) => onUpdateOfficeField(index, 'name', value)}
                      />
                      <TextField
                        label="Email"
                        value={office.email}
                        onChange={(value) => onUpdateOfficeField(index, 'email', value)}
                      />
                      <TextField
                        label="Phones (comma-separated)"
                        value={office.phones}
                        onChange={(value) => onUpdateOfficeField(index, 'phones', value)}
                      />
                      <TextField
                        label="Fax"
                        value={office.fax}
                        onChange={(value) => onUpdateOfficeField(index, 'fax', value)}
                      />
                    </div>
                    <TextField
                      label="Address"
                      value={office.address}
                      onChange={(value) => onUpdateOfficeField(index, 'address', value)}
                      textarea
                      rows={2}
                    />
                    <TextField
                      label="Map Embed"
                      value={office.mapEmbed}
                      onChange={(value) => onUpdateOfficeField(index, 'mapEmbed', value)}
                      textarea
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Map Section
            </h4>
            <TextField
              label="Map Title"
              value={formData.map.title}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  map: { ...formData.map, title: value },
                })
              }
            />
            <TextField
              label="Map Description"
              value={formData.map.description}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  map: { ...formData.map, description: value },
                })
              }
              textarea
            />
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
