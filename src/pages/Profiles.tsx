import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import { useTranslation } from 'react-i18next'
import { useProfiles } from '@/queries/profiles'
import { useCreateProfile, useUpdateProfile, useDeleteProfile } from '@/mutations/profiles'
import { useJobTitles } from '@/queries/job-titles'
import type { ProfileResponse, CreateProfileRequest } from '@/actions/profiles'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<ProfileResponse>()

const EMPLOYMENT_STATUSES = ['active', 'inactive', 'terminated', 'leave'] as const
const GENDERS = ['unspecified', 'male', 'female', 'other'] as const

export default function Profiles() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchFirstName, setSearchFirstName] = useState('')
  const [searchLastName, setSearchLastName] = useState('')
  const [filterEmploymentStatus, setFilterEmploymentStatus] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<ProfileResponse | null>(null)
  const [formData, setFormData] = useState<Partial<CreateProfileRequest>>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    gender: 'unspecified',
    employmentStatus: 'active',
  })

  const { data, isLoading, error } = useProfiles({
    page,
    pageSize,
    firstName: searchFirstName || undefined,
    lastName: searchLastName || undefined,
    employmentStatus: filterEmploymentStatus || undefined,
  })
  const { data: jobTitlesData } = useJobTitles({ page: 1, pageSize: 100 })
  const createMutation = useCreateProfile()
  const updateMutation = useUpdateProfile()
  const deleteMutation = useDeleteProfile()

  const openEditModal = (profile: ProfileResponse) => {
    setSelectedProfile(profile)
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar || undefined,
      birthday: profile.birthday ? new Date(profile.birthday).toISOString().split('T')[0] : undefined,
      gender: profile.gender,
      employeeId: profile.employeeId || undefined,
      workEmail: profile.workEmail || undefined,
      workPhone: profile.workPhone || undefined,
      jobTitleId: profile.jobTitleId || undefined,
      location: profile.location || undefined,
      employmentStatus: profile.employmentStatus,
      hireDate: profile.hireDate ? new Date(profile.hireDate).toISOString().split('T')[0] : undefined,
      terminationDate: profile.terminationDate ? new Date(profile.terminationDate).toISOString().split('T')[0] : undefined,
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (profile: ProfileResponse) => {
    setSelectedProfile(profile)
    setIsDeleteModalOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo<ColumnDef<ProfileResponse, any>[]>(
    () => [
      columnHelper.accessor('firstName', {
        header: 'First Name',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('lastName', {
        header: 'Last Name',
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('user', {
        header: 'Email',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue()?.email || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('jobTitle', {
        header: 'Job Title',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue()?.name || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('employmentStatus', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue()
          const statusColors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            terminated: 'bg-red-100 text-red-800',
            leave: 'bg-yellow-100 text-yellow-800',
          }
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
              {status}
            </span>
          )
        },
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync({
        email: formData.email!,
        password: formData.password || null,
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        avatar: formData.avatar || null,
        birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
        gender: formData.gender as CreateProfileRequest['gender'],
        employeeId: formData.employeeId || null,
        workEmail: formData.workEmail || null,
        workPhone: formData.workPhone || null,
        jobTitleId: formData.jobTitleId || null,
        location: formData.location || null,
        employmentStatus: formData.employmentStatus as CreateProfileRequest['employmentStatus'],
        hireDate: formData.hireDate ? new Date(formData.hireDate).toISOString() : null,
        terminationDate: formData.terminationDate ? new Date(formData.terminationDate).toISOString() : null,
        bossUserId: formData.bossUserId || null,
      })
      setIsCreateModalOpen(false)
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        gender: 'unspecified',
        employmentStatus: 'active',
      })
    } catch (err) {
      console.error('Failed to create profile:', err)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfile) return
    try {
      await updateMutation.mutateAsync({
        id: selectedProfile.id,
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          avatar: formData.avatar || null,
          birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
          gender: formData.gender as CreateProfileRequest['gender'],
          employeeId: formData.employeeId || null,
          workEmail: formData.workEmail || null,
          workPhone: formData.workPhone || null,
          jobTitleId: formData.jobTitleId || null,
          location: formData.location || null,
          employmentStatus: formData.employmentStatus as CreateProfileRequest['employmentStatus'],
          hireDate: formData.hireDate ? new Date(formData.hireDate).toISOString() : null,
          terminationDate: formData.terminationDate ? new Date(formData.terminationDate).toISOString() : null,
          bossUserId: formData.bossUserId || null,
        }
      })
      setIsEditModalOpen(false)
      setSelectedProfile(null)
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        gender: 'unspecified',
        employmentStatus: 'active',
      })
    } catch (err) {
      console.error('Failed to update profile:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedProfile) return
    try {
      await deleteMutation.mutateAsync(selectedProfile.id)
      setIsDeleteModalOpen(false)
      setSelectedProfile(null)
    } catch (err) {
      console.error('Failed to delete profile:', err)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">
                {t('nav.profiles')}
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage employee profiles
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Profile
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search by first name..."
              value={searchFirstName}
              onChange={(e) => {
                setSearchFirstName(e.target.value)
                setPage(1)
              }}
              className="flex-1 min-w-48 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Search by last name..."
              value={searchLastName}
              onChange={(e) => {
                setSearchLastName(e.target.value)
                setPage(1)
              }}
              className="flex-1 min-w-48 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterEmploymentStatus}
              onChange={(e) => {
                setFilterEmploymentStatus(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              {EMPLOYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading profiles...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load profiles</p>
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No profiles found</p>
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
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                    setPage(1) // Reset to first page when changing page size
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <LargeModal
          title="Create Profile"
          onClose={() => {
            setIsCreateModalOpen(false)
            setFormData({
              email: '',
              password: '',
              firstName: '',
              lastName: '',
              gender: 'unspecified',
              employmentStatus: 'active',
            })
          }}
        >
          <form onSubmit={handleCreate} className="space-y-6">
            {/* Account Section */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">Account Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    maxLength={100}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to generate a random password</p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    maxLength={100}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    maxLength={100}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as string })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {GENDERS.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Birthday
                  </label>
                  <input
                    type="date"
                    value={formData.birthday || ''}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Employment Info */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">Employment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId || ''}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    maxLength={50}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={formData.workEmail || ''}
                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                    maxLength={255}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Work Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.workPhone || ''}
                    onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                    maxLength={50}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Job Title
                  </label>
                  <select
                    value={formData.jobTitleId || ''}
                    onChange={(e) => setFormData({ ...formData, jobTitleId: e.target.value || undefined })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">No Job Title</option>
                    {jobTitlesData?.data.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    maxLength={100}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Employment Status
                  </label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as string })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {EMPLOYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={formData.hireDate || ''}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Termination Date
                  </label>
                  <input
                    type="date"
                    value={formData.terminationDate || ''}
                    onChange={(e) => setFormData({ ...formData, terminationDate: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setFormData({
                    email: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    gender: 'unspecified',
                    employmentStatus: 'active',
                  })
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </LargeModal>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedProfile && (
        <LargeModal
          title="Edit Profile"
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedProfile(null)
            setFormData({
              email: '',
              password: '',
              firstName: '',
              lastName: '',
              gender: 'unspecified',
              employmentStatus: 'active',
            })
          }}
        >
          <form onSubmit={handleEdit} className="space-y-6">
            {/* Personal Info */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    maxLength={100}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    maxLength={100}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as string })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {GENDERS.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Birthday
                  </label>
                  <input
                    type="date"
                    value={formData.birthday || ''}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Employment Info */}
            <div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">Employment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId || ''}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    maxLength={50}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={formData.workEmail || ''}
                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                    maxLength={255}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Work Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.workPhone || ''}
                    onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                    maxLength={50}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Job Title
                  </label>
                  <select
                    value={formData.jobTitleId || ''}
                    onChange={(e) => setFormData({ ...formData, jobTitleId: e.target.value || undefined })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">No Job Title</option>
                    {jobTitlesData?.data.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    maxLength={100}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Employment Status
                  </label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as string })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {EMPLOYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={formData.hireDate || ''}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Termination Date
                  </label>
                  <input
                    type="date"
                    value={formData.terminationDate || ''}
                    onChange={(e) => setFormData({ ...formData, terminationDate: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedProfile(null)
                  setFormData({
                    email: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    gender: 'unspecified',
                    employmentStatus: 'active',
                  })
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
        </LargeModal>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedProfile && (
        <Modal
          title="Delete Profile"
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedProfile(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              Are you sure you want to delete the profile for "<strong>{selectedProfile.firstName} {selectedProfile.lastName}</strong>"?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedProfile(null)
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

// Large Modal Component (for forms with lots of fields)
function LargeModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full border border-border my-8">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
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
