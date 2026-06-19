import { UserPlus } from 'lucide-react'
import { ClientFormModal } from '@/pages/clients/components/ClientFormModal'
import { ClientsSummaryCards } from '@/pages/clients/components/ClientsSummaryCards'
import { ClientsTable } from '@/pages/clients/components/ClientsTable'
import { ClientsToolbar } from '@/pages/clients/components/ClientsToolbar'
import { useClientsPage } from '@/pages/clients/hooks/useClientsPage'
import './Clients.css'

export function Clients() {
  const p = useClientsPage()

  if (!p.apiEnabled) {
    return (
      <div className="clients-page">
        <header className="clients-page__header">
          <div className="clients-page__header-text">
            <h1 className="clients-page__title">Clientes</h1>
            <p className="clients-page__subtitle">
              Cadastro de clientes disponível apenas com a API ativa.
            </p>
          </div>
        </header>
        <p className="clients-page__notice">
          Ative <code>VITE_USE_API=true</code> para gerenciar clientes.
        </p>
      </div>
    )
  }

  return (
    <div className="clients-page">
      <header className="clients-page__header">
        <div className="clients-page__header-text">
          <h1 className="clients-page__title">Clientes</h1>
          <p className="clients-page__subtitle">
            Cadastre clientes e vincule-os às propostas.
          </p>
        </div>
        {p.canManageClients ? (
          <button
            type="button"
            className="clients-page__create-btn"
            onClick={p.openCreateModal}
          >
            <UserPlus size={18} strokeWidth={2} aria-hidden />
            Novo cliente
          </button>
        ) : null}
      </header>

      <ClientsSummaryCards stats={p.stats} />

      <ClientsToolbar
        query={p.query}
        setQuery={p.setQuery}
        statusFilter={p.statusFilter}
        setStatusFilter={p.setStatusFilter}
      />

      <ClientsTable
        filtered={p.filtered}
        canManageClients={p.canManageClients}
        loading={p.loading}
        onEdit={p.openEditModal}
      />

      <ClientFormModal
        open={p.formOpen}
        client={p.editClient}
        busy={p.formBusy}
        error={p.formError}
        onClose={p.closeFormModal}
        onSubmit={p.handleSubmitClient}
      />
    </div>
  )
}
