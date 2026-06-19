import { Pencil } from 'lucide-react'
import type { ApiClient } from '@/features/api/types'
import { initialsFromName } from '@/utils/strings'
import {
  formatDatePt,
  formatTimePt,
  paletteForId,
} from '@/pages/users/lib/usersPageLib'

export function ClientsTable({
  filtered,
  canManageClients,
  loading,
  onEdit,
}: {
  filtered: ApiClient[]
  canManageClients: boolean
  loading: boolean
  onEdit: (client: ApiClient) => void
}) {
  return (
    <div className="clients-page__table-shell">
      <table className="clients-page__table">
        <thead>
          <tr>
            <th className="clients-page__th">Cliente</th>
            <th className="clients-page__th clients-page__th--status">Status</th>
            <th className="clients-page__th">Cadastrado em</th>
            <th className="clients-page__th clients-page__th--actions">
              <span className="clients-page__sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((client) => {
            const created = new Date(client.createdAt)
            const pal = paletteForId(String(client.id))

            return (
              <tr key={client.id} className="clients-page__row">
                <td className="clients-page__td clients-page__td--client">
                  <div className="clients-page__client-cell">
                    <div
                      className="clients-page__avatar"
                      style={{
                        background: pal.bg,
                        color: pal.fg,
                      }}
                      aria-hidden
                    >
                      {initialsFromName(client.name)}
                    </div>
                    <div className="clients-page__client-name">{client.name}</div>
                  </div>
                </td>
                <td className="clients-page__td clients-page__td--status">
                  <span
                    className={
                      client.isActive
                        ? 'clients-page__status clients-page__status--on'
                        : 'clients-page__status clients-page__status--off'
                    }
                  >
                    <span className="clients-page__status-dot" aria-hidden />
                    {client.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="clients-page__td clients-page__td--date">
                  <div className="clients-page__date-line">
                    {formatDatePt(created)}
                  </div>
                  <div className="clients-page__time-line">
                    {formatTimePt(created)}
                  </div>
                </td>
                <td className="clients-page__td clients-page__td--actions">
                  {canManageClients ? (
                    <div className="clients-page__actions">
                      <button
                        type="button"
                        className="clients-page__edit"
                        title="Editar cliente"
                        onClick={() => onEdit(client)}
                      >
                        <Pencil size={18} strokeWidth={1.9} />
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {loading ? (
        <p className="clients-page__empty">Carregando clientes…</p>
      ) : filtered.length === 0 ? (
        <p className="clients-page__empty">Nenhum cliente encontrado.</p>
      ) : null}
    </div>
  )
}
