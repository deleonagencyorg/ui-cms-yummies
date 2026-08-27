import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination'
import { useTranslation } from 'react-i18next'
import { useApiTokens } from '@/queries/apiTokens'
import { useCreateApiToken, useRevokeApiToken, useDeleteApiToken } from '@/mutations/apiTokens'
import type { ApiTokenResponse, ApiTokenScopes } from '@/actions/apiTokens'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'

const AVAILABLE_SCOPES = ['brands', 'products', 'recipes', 'news', 'sites', 'pages', 'top_messages'] as const

const columnHelper = createColumnHelper<ApiTokenResponse>()

export default function ApiTokens() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isTokenDisplayModalOpen, setIsTokenDisplayModalOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<ApiTokenResponse | null>(null)
  const [createdTokenValue, setCreatedTokenValue] = useState('')
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    scopes: ApiTokenScopes
    expiresAt: string
  }>({
    name: '',
    scopes: {},
    expiresAt: '',
  })

  const { data, isLoading, error } = useApiTokens({ page, pageSize })
  const createMutation = useCreateApiToken()
  const revokeMutation = useRevokeApiToken()
  const deleteMutation = useDeleteApiToken()

  const openRevokeModal = (token: ApiTokenResponse) => {
    setSelectedToken(token)
    setIsRevokeModalOpen(true)
  }

  const openDeleteModal = (token: ApiTokenResponse) => {
    setSelectedToken(token)
    setIsDeleteModalOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: '', scopes: {}, expiresAt: '' })
  }

  const columns = useMemo<ColumnDef<ApiTokenResponse, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: t('apiTokens.table.name'),
        cell: (info) => (
          <span className="text-sm font-medium text-card-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('scopes', {
        header: t('apiTokens.table.scopes'),
        cell: (info) => {
          const scopes = info.getValue() as ApiTokenScopes
          return (
            <div className="flex flex-wrap gap-1">
              {Object.entries(scopes).map(([key, value]) => (
                <span
                  key={key}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    value === 'rw'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}
                >
                  {key.replace('_', ' ')}: {value}
                </span>
              ))}
            </div>
          )
        },
      }),
      columnHelper.accessor('expiresAt', {
        header: t('apiTokens.table.expiresAt'),
        cell: (info) => {
          const date = new Date(info.getValue())
          const isExpired = date < new Date()
          return (
            <span className={`text-sm ${isExpired ? 'text-red-500' : 'text-muted-foreground'}`}>
              {date.toLocaleDateString()}
            </span>
          )
        },
      }),
      columnHelper.accessor('revokedAt', {
        header: t('apiTokens.table.status'),
        cell: (info) => {
          const revokedAt = info.getValue()
          const row = info.row.original
          const isExpired = new Date(row.expiresAt) < new Date()

          if (revokedAt) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {t('apiTokens.status.revoked')}
              </span>
            )
          }
          if (isExpired) {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                {t('apiTokens.status.expired')}
              </span>
            )
          }
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {t('apiTokens.status.active')}
            </span>
          )
        },
      }),
      columnHelper.accessor('createdAt', {
        header: t('apiTokens.table.createdAt'),
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="text-right block">{t('apiTokens.table.actions')}</span>,
        cell: ({ row }) => {
          const token = row.original
          const isRevoked = !!token.revokedAt
          return (
            <div className="flex gap-2 justify-end">
              {!isRevoked && (
                <button
                  onClick={() => openRevokeModal(token)}
                  className="text-amber-600 hover:text-amber-800"
                  title={t('apiTokens.actions.revoke')}
                >
                  <RevokeIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => openDeleteModal(token)}
                className="text-red-600 hover:text-red-800"
                title={t('apiTokens.actions.delete')}
              >
                <DeleteIcon className="w-5 h-5" />
              </button>
            </div>
          )
        },
      }),
    ],
    [t]
  )

  const table = useReactTable({
    data: data?.tokens ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.pagination.pageCount ?? 0,
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await createMutation.mutateAsync({
        name: formData.name,
        scopes: formData.scopes,
        expiresAt: new Date(formData.expiresAt).toISOString(),
      })
      setIsCreateModalOpen(false)
      resetForm()
      setCreatedTokenValue(result.token)
      setIsTokenDisplayModalOpen(true)
    } catch (err) {
      console.error('Failed to create API token:', err)
    }
  }

  const handleRevoke = async () => {
    if (!selectedToken) return
    try {
      await revokeMutation.mutateAsync(selectedToken.id)
      setIsRevokeModalOpen(false)
      setSelectedToken(null)
    } catch (err) {
      console.error('Failed to revoke API token:', err)
    }
  }

  const handleDelete = async () => {
    if (!selectedToken) return
    try {
      await deleteMutation.mutateAsync(selectedToken.id)
      setIsDeleteModalOpen(false)
      setSelectedToken(null)
    } catch (err) {
      console.error('Failed to delete API token:', err)
    }
  }

  const handleScopeChange = (scope: string, value: 'r' | 'rw' | null) => {
    setFormData((prev) => {
      const newScopes = { ...prev.scopes }
      if (value === null) {
        delete newScopes[scope as keyof ApiTokenScopes]
      } else {
        newScopes[scope as keyof ApiTokenScopes] = value
      }
      return { ...prev, scopes: newScopes }
    })
  }

  const handleCopyToken = async () => {
    await navigator.clipboard.writeText(createdTokenValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">
                {t('nav.apiTokens')}
              </h2>
              <p className="text-muted-foreground mt-1">
                {t('apiTokens.description')}
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              {t('apiTokens.createButton')}
            </button>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">{t('apiTokens.loading')}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{t('apiTokens.error')}</p>
            </div>
          ) : !data?.tokens.length ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('apiTokens.empty')}</p>
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
                    setPage(1)
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
          title={t('apiTokens.createTitle')}
          onClose={() => {
            setIsCreateModalOpen(false)
            resetForm()
          }}
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {t('apiTokens.form.name')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={100}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('apiTokens.form.namePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {t('apiTokens.form.expiresAt')}
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {t('apiTokens.form.scopes')}
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                {t('apiTokens.form.scopesHint')}
              </p>
              <div className="space-y-2">
                {AVAILABLE_SCOPES.map((scope) => {
                  const currentValue = formData.scopes[scope as keyof ApiTokenScopes]
                  return (
                    <div key={scope} className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-lg">
                      <span className="text-sm font-medium text-card-foreground capitalize">
                        {scope.replace('_', ' ')}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleScopeChange(scope, currentValue === 'r' ? null : 'r')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            currentValue === 'r'
                              ? 'bg-blue-600 text-white'
                              : 'bg-background border border-border text-muted-foreground hover:border-blue-400'
                          }`}
                        >
                          {t('apiTokens.form.read')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleScopeChange(scope, currentValue === 'rw' ? null : 'rw')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            currentValue === 'rw'
                              ? 'bg-amber-600 text-white'
                              : 'bg-background border border-border text-muted-foreground hover:border-amber-400'
                          }`}
                        >
                          {t('apiTokens.form.readWrite')}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  resetForm()
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                {t('apiTokens.form.cancel')}
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || Object.keys(formData.scopes).length === 0}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? t('apiTokens.form.creating') : t('apiTokens.form.create')}
              </button>
            </div>
          </form>
        </LargeModal>
      )}

      {/* Token Display Modal */}
      {isTokenDisplayModalOpen && (
        <Modal
          title={t('apiTokens.tokenCreated.title')}
          onClose={() => {
            setIsTokenDisplayModalOpen(false)
            setCreatedTokenValue('')
            setCopied(false)
          }}
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-400">
                {t('apiTokens.tokenCreated.warning')}
              </p>
            </div>
            <div className="relative">
              <pre className="p-3 bg-secondary rounded-lg text-xs break-all whitespace-pre-wrap text-card-foreground font-mono">
                {createdTokenValue}
              </pre>
              <button
                onClick={handleCopyToken}
                className="absolute top-2 right-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                {copied ? t('apiTokens.tokenCreated.copied') : t('apiTokens.tokenCreated.copy')}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsTokenDisplayModalOpen(false)
                  setCreatedTokenValue('')
                  setCopied(false)
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                {t('apiTokens.tokenCreated.done')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Revoke Modal */}
      {isRevokeModalOpen && selectedToken && (
        <Modal
          title={t('apiTokens.revokeTitle')}
          onClose={() => {
            setIsRevokeModalOpen(false)
            setSelectedToken(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              {t('apiTokens.revokeConfirm', { name: selectedToken.name })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('apiTokens.revokeHint')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsRevokeModalOpen(false)
                  setSelectedToken(null)
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                {t('apiTokens.form.cancel')}
              </button>
              <button
                onClick={handleRevoke}
                disabled={revokeMutation.isPending}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {revokeMutation.isPending ? t('apiTokens.actions.revoking') : t('apiTokens.actions.revoke')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedToken && (
        <Modal
          title={t('apiTokens.deleteTitle')}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedToken(null)
          }}
        >
          <div className="space-y-4">
            <p className="text-card-foreground">
              {t('apiTokens.deleteConfirm', { name: selectedToken.name })}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedToken(null)
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                {t('apiTokens.form.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? t('apiTokens.actions.deleting') : t('apiTokens.actions.delete')}
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

// Large Modal for create form
function LargeModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-lg w-full border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
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

function DeleteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function RevokeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
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
