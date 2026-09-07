import { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import { useSite } from '@/contexts/SiteContext'
import type {
  FooterConfig,
  CreateFooterConfigRequest,
  UpdateFooterConfigRequest,
} from '@/actions/footer'
import { useFooterList } from '@/queries/footer'
import { useLanguages } from '@/queries/languages'
import { useSites } from '@/queries/sites'
import {
  useCreateFooter,
  useUpdateFooter,
  useDeleteFooter,
} from '@/mutations/footer'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<FooterConfig>()

interface FooterFormData {
  siteId: string
  languageCode: string
  mainText: string
  description: string
  choose: string
  followUs: string
  contactUs: string
  instagramText: string
  facebookText: string
  email: string
  copyright: string
  privacyPolicyText: string
  privacyPolicyUrl: string
  newsletter: string
  newsletterDescription: string
  emailPlaceholder: string
  home: string
  products: string
  health: string
  latestNews: string
  contact: string
  support: string
  privacyPolicy: string
  cookiePolicy: string
  termsConditions: string
  complaintsBook: string
  help: string
}

const createInitialFormData = (siteId = ''): FooterFormData => ({
  siteId,
  languageCode: '',
  mainText: '',
  description: '',
  choose: '',
  followUs: '',
  contactUs: '',
  instagramText: '',
  facebookText: '',
  email: '',
  copyright: '',
  privacyPolicyText: '',
  privacyPolicyUrl: '',
  newsletter: '',
  newsletterDescription: '',
  emailPlaceholder: '',
  home: '',
  products: '',
  health: '',
  latestNews: '',
  contact: '',
  support: '',
  privacyPolicy: '',
  cookiePolicy: '',
  termsConditions: '',
  complaintsBook: '',
  help: '',
})

function configToFormData(config: FooterConfig): FooterFormData {
  return {
    siteId: config.siteId ?? '',
    languageCode: config.languageCode ?? '',
    mainText: config.mainText ?? '',
    description: config.description ?? '',
    choose: config.choose ?? '',
    followUs: config.followUs ?? '',
    contactUs: config.contactUs ?? '',
    instagramText: config.instagramText ?? '',
    facebookText: config.facebookText ?? '',
    email: config.email ?? '',
    copyright: config.copyright ?? '',
    privacyPolicyText: config.privacyPolicyText ?? '',
    privacyPolicyUrl: config.privacyPolicyUrl ?? '',
    newsletter: config.newsletter ?? '',
    newsletterDescription: config.newsletterDescription ?? '',
    emailPlaceholder: config.emailPlaceholder ?? '',
    home: config.home ?? '',
    products: config.products ?? '',
    health: config.health ?? '',
    latestNews: config.latestNews ?? '',
    contact: config.contact ?? '',
    support: config.support ?? '',
    privacyPolicy: config.privacyPolicy ?? '',
    cookiePolicy: config.cookiePolicy ?? '',
    termsConditions: config.termsConditions ?? '',
    complaintsBook: config.complaintsBook ?? '',
    help: config.help ?? '',
  }
}

function formDataToPayload(
  formData: FooterFormData
): CreateFooterConfigRequest & UpdateFooterConfigRequest {
  return { ...formData }
}

export default function FooterPage() {
  const { selectedSiteId } = useSite()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchMainText, setSearchMainText] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FooterConfig | null>(null)
  const [formData, setFormData] = useState<FooterFormData>(createInitialFormData())

  useEffect(() => {
    if (selectedSiteId && !formData.siteId) {
      setFormData((prev) => ({ ...prev, siteId: selectedSiteId }))
    }
  }, [selectedSiteId, formData.siteId])

  const { data, isLoading, error } = useFooterList({
    page,
    pageSize,
    mainText: searchMainText || undefined,
    languageCode: filterLanguage || undefined,
    siteId: selectedSiteId || undefined,
  })
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const { data: sitesData } = useSites({ page: 1, pageSize: 100 })
  const createMutation = useCreateFooter()
  const updateMutation = useUpdateFooter()
  const deleteMutation = useDeleteFooter()

  const openEditModal = (item: FooterConfig) => {
    setSelectedItem(item)
    setFormData(configToFormData(item))
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (item: FooterConfig) => {
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
      console.error('Failed to create footer:', err)
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
      console.error('Failed to update footer:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    try {
      await deleteMutation.mutateAsync(selectedItem.id)
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
    } catch (err) {
      console.error('Failed to delete footer:', err)
    }
  }

  const columns = useMemo<ColumnDef<FooterConfig, any>[]>(
    () => [
      columnHelper.accessor('mainText', {
        header: 'Main Text',
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Footer</h2>
              <p className="text-muted-foreground mt-1">Manage footer content</p>
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
              Create Footer
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search footer..."
              value={searchMainText}
              onChange={(e) => {
                setSearchMainText(e.target.value)
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
              <p className="mt-4 text-muted-foreground">Loading footer...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load footer</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No footer content found</p>
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
        <FooterFormModal
          title="Create Footer"
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
        />
      )}

      {isEditModalOpen && selectedItem && (
        <FooterFormModal
          title="Edit Footer"
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
        />
      )}

      {isDeleteModalOpen && selectedItem && (
        <Modal
          title="Delete Footer"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedItem(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete this footer config? This action cannot be undone.
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
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  textarea?: boolean
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
          rows={3}
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

function FooterFormModal({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  isSubmitting,
  submitLabel,
  languages,
  sites,
}: {
  title: string
  formData: FooterFormData
  setFormData: React.Dispatch<React.SetStateAction<FooterFormData>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  submitLabel: string
  languages: { code: string; name: string; nativeName: string }[]
  sites: { id: string; name: string }[]
}) {
  const set = (key: keyof FooterFormData, value: string) =>
    setFormData({ ...formData, [key]: value })

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
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Branding
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Main Text" value={formData.mainText} onChange={(v) => set('mainText', v)} />
              <TextField label="Choose" value={formData.choose} onChange={(v) => set('choose', v)} />
            </div>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(v) => set('description', v)}
              textarea
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Social & Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Follow Us" value={formData.followUs} onChange={(v) => set('followUs', v)} />
              <TextField label="Contact Us" value={formData.contactUs} onChange={(v) => set('contactUs', v)} />
              <TextField label="Instagram Text" value={formData.instagramText} onChange={(v) => set('instagramText', v)} />
              <TextField label="Facebook Text" value={formData.facebookText} onChange={(v) => set('facebookText', v)} />
              <TextField label="Email" value={formData.email} onChange={(v) => set('email', v)} />
              <TextField label="Copyright" value={formData.copyright} onChange={(v) => set('copyright', v)} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Newsletter
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Newsletter" value={formData.newsletter} onChange={(v) => set('newsletter', v)} />
              <TextField
                label="Email Placeholder"
                value={formData.emailPlaceholder}
                onChange={(v) => set('emailPlaceholder', v)}
              />
            </div>
            <TextField
              label="Newsletter Description"
              value={formData.newsletterDescription}
              onChange={(v) => set('newsletterDescription', v)}
              textarea
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Navigation Labels
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Home" value={formData.home} onChange={(v) => set('home', v)} />
              <TextField label="Products" value={formData.products} onChange={(v) => set('products', v)} />
              <TextField label="Health" value={formData.health} onChange={(v) => set('health', v)} />
              <TextField label="Latest News" value={formData.latestNews} onChange={(v) => set('latestNews', v)} />
              <TextField label="Contact" value={formData.contact} onChange={(v) => set('contact', v)} />
              <TextField label="Support" value={formData.support} onChange={(v) => set('support', v)} />
              <TextField label="Help" value={formData.help} onChange={(v) => set('help', v)} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-card-foreground border-b border-border pb-2">
              Legal Links
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Privacy Policy Text"
                value={formData.privacyPolicyText}
                onChange={(v) => set('privacyPolicyText', v)}
              />
              <TextField
                label="Privacy Policy URL"
                value={formData.privacyPolicyUrl}
                onChange={(v) => set('privacyPolicyUrl', v)}
              />
              <TextField
                label="Privacy Policy"
                value={formData.privacyPolicy}
                onChange={(v) => set('privacyPolicy', v)}
              />
              <TextField
                label="Cookie Policy"
                value={formData.cookiePolicy}
                onChange={(v) => set('cookiePolicy', v)}
              />
              <TextField
                label="Terms & Conditions"
                value={formData.termsConditions}
                onChange={(v) => set('termsConditions', v)}
              />
              <TextField
                label="Complaints Book"
                value={formData.complaintsBook}
                onChange={(v) => set('complaintsBook', v)}
              />
            </div>
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
