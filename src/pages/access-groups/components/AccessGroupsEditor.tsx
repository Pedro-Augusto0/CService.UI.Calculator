import type { Dispatch, SetStateAction } from 'react'
import { ArrowLeft, Check, ChevronRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { AccessGroup } from '@/features/access-groups/types'
import type { StoredUser } from '@/features/auth/types'
import { PERMISSION_MODULES } from '@/features/access-groups/permissions'
import { AccessGroupUsersPanel } from '@/pages/access-groups/components/AccessGroupUsersPanel'
import { GroupIconBox } from '@/pages/access-groups/components/GroupIconBox'
import {
  CARD_ICON_MAP,
  COLOR_STYLES,
  DESCRIPTION_MAX,
  GROUP_COLORS_ORDER,
} from '@/pages/access-groups/lib/accessGroupsLib'
import type {
  EditorMode,
  EditorTabName,
  NewCreationStep,
} from '@/pages/access-groups/hooks/useAccessGroupsPage'

export function AccessGroupsEditor({
  mode,
  draft,
  setDraft,
  backToList,
  handleSave,
  editorTab,
  setEditorTab,
  assignedCount,
  assignedUsers,
  allUsersSnapshot,
  sortedGroups,
  assignUsersToDraftGroup,
  removeUsersFromDraftGroup,
  removeAllUsersFromDraftGroup,
  allSelected,
  someSelected,
  selectAllPermissions,
  togglePermission,
  newCreationStep,
  advanceNewGroupToPermissions,
  advanceNewGroupToUsers,
}: {
  mode: Exclude<EditorMode, 'list'>
  draft: AccessGroup
  setDraft: Dispatch<SetStateAction<AccessGroup | null>>
  backToList: () => void
  handleSave: () => void
  editorTab: EditorTabName
  setEditorTab: (t: EditorTabName) => void
  assignedCount: number
  assignedUsers: StoredUser[]
  allUsersSnapshot: StoredUser[]
  sortedGroups: AccessGroup[]
  assignUsersToDraftGroup: (userIds: string[]) => void
  removeUsersFromDraftGroup: (userIds: string[]) => void
  removeAllUsersFromDraftGroup: () => void
  allSelected: boolean
  someSelected: boolean
  selectAllPermissions: (checked: boolean) => void
  togglePermission: (id: string) => void
  newCreationStep: NewCreationStep
  advanceNewGroupToPermissions: () => void
  advanceNewGroupToUsers: () => void
}) {
  const isActive = draft.active !== false
  const isNewWizard = mode === 'new'
  const permissionsTabLocked = isNewWizard && newCreationStep < 1
  const usersTabLocked = isNewWizard && newCreationStep < 2

  const wizardSubtitle =
    editorTab === 'info'
      ? 'Etapa 1 de 3 — Informações obrigatórias: nome do grupo.'
      : editorTab === 'permissions'
        ? 'Etapa 2 de 3 — Permissões (opcional: pode criar um grupo sem marcar itens).'
        : 'Etapa 3 de 3 — Usuários (opcional); conclua com Criar grupo.'

  return (
    <div className="access-groups access-groups--editor">
      <header className="access-groups__page-head access-groups__page-head--split">
        <div className="access-groups__page-head-main">
          <button
            type="button"
            className="access-groups__back"
            onClick={backToList}
            aria-label="Voltar"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <div>
            <h1 className="access-groups__title">
              {mode === 'new' ? 'Novo grupo' : 'Editar grupo'}
            </h1>
            <p className="access-groups__subtitle access-groups__subtitle--editor">
              {isNewWizard
                ? wizardSubtitle
                : 'Defina as informações e permissões deste grupo.'}
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          className={`access-groups__save-btn${isNewWizard ? ' access-groups__wizard-primary-btn' : ''}`}
          onClick={
            mode === 'edit'
              ? handleSave
              : editorTab === 'info'
                ? advanceNewGroupToPermissions
                : editorTab === 'permissions'
                  ? advanceNewGroupToUsers
                  : handleSave
          }
        >
          {mode === 'edit' ? (
            'Salvar alterações'
          ) : editorTab === 'info' ? (
            <>
              Ir para permissões
              <ChevronRight size={18} strokeWidth={2} aria-hidden />
            </>
          ) : editorTab === 'permissions' ? (
            <>
              Ir para usuários
              <ChevronRight size={18} strokeWidth={2} aria-hidden />
            </>
          ) : (
            'Criar grupo'
          )}
        </Button>
      </header>

      <div className="access-groups__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={editorTab === 'info'}
          className={`access-groups__tab${editorTab === 'info' ? ' access-groups__tab--active' : ''}`}
          onClick={() => setEditorTab('info')}
        >
          Informações
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={editorTab === 'permissions'}
          disabled={permissionsTabLocked}
          title={
            permissionsTabLocked
              ? 'Preencha o nome do grupo e clique em «Ir para permissões».'
              : undefined
          }
          className={`access-groups__tab${editorTab === 'permissions' ? ' access-groups__tab--active' : ''}`}
          onClick={() => {
            if (permissionsTabLocked) return
            setEditorTab('permissions')
          }}
        >
          Permissões
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={editorTab === 'users'}
          disabled={usersTabLocked}
          title={
            usersTabLocked
              ? 'Avance com «Ir para usuários» na etapa de permissões.'
              : undefined
          }
          className={`access-groups__tab${editorTab === 'users' ? ' access-groups__tab--active' : ''}`}
          onClick={() => {
            if (usersTabLocked) return
            setEditorTab('users')
          }}
        >
          Usuários ({assignedCount})
        </button>
      </div>

      {editorTab === 'info' ? (
        <section className="access-groups__panel access-groups__panel--info">
          <div className="access-groups__info-layout">
            <div className="access-groups__info-icon-col">
              <span className="access-groups__info-col-title">
                Ícone do grupo
              </span>
              <GroupIconBox
                color={draft.color}
                iconKey={draft.iconKey}
                size="lg"
                variant="editor"
              />
            </div>

            <div className="access-groups__info-middle-col">
              <label className="access-groups__field">
                <span className="access-groups__field-label">
                  Nome do grupo{' '}
                  <abbr
                    title="obrigatório"
                    className="access-groups__required"
                  >
                    *
                  </abbr>
                </span>
                <input
                  className="access-groups__input"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, name: e.target.value } : d))
                  }
                  placeholder="Ex.: Comercial"
                  autoComplete="off"
                />
              </label>
              <label className="access-groups__field">
                <span className="access-groups__field-label">Descrição</span>
                <div className="access-groups__textarea-wrap">
                  <textarea
                    className="access-groups__textarea"
                    value={draft.description}
                    maxLength={DESCRIPTION_MAX}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, description: e.target.value } : d,
                      )
                    }
                    rows={5}
                    placeholder="Descreva o papel deste grupo na plataforma."
                  />
                  <span className="access-groups__char-count">
                    {draft.description.length}/{DESCRIPTION_MAX}
                  </span>
                </div>
              </label>
            </div>

            <div className="access-groups__info-side-col">
              <div className="access-groups__field">
                <span className="access-groups__field-label">Cor do grupo</span>
                <div className="access-groups__swatches">
                  {GROUP_COLORS_ORDER.map((c) => {
                    const sel = draft.color === c
                    const hex = COLOR_STYLES[c].bg
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`access-groups__swatch${sel ? ' access-groups__swatch--selected' : ''}`}
                        style={{ background: hex }}
                        onClick={() =>
                          setDraft((d) => (d ? { ...d, color: c } : d))
                        }
                        aria-label={`Cor ${c}`}
                        aria-pressed={sel}
                      >
                        {sel ? (
                          <Check
                            size={14}
                            strokeWidth={3}
                            className="access-groups__swatch-check"
                          />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="access-groups__field access-groups__field--status">
                <span className="access-groups__field-label">
                  Status do grupo
                </span>
                <div
                  className={`access-groups__group-status-badge${isActive ? ' access-groups__group-status-badge--on' : ' access-groups__group-status-badge--off'}`}
                >
                  <span className="access-groups__group-status-dot" />
                  {isActive ? 'Ativo' : 'Inativo'}
                </div>
                <button
                  type="button"
                  className="access-groups__status-toggle-btn"
                  onClick={() =>
                    setDraft((d) =>
                      d ? { ...d, active: !(d.active !== false) } : d,
                    )
                  }
                >
                  {isActive ? 'Desativar grupo' : 'Ativar grupo'}
                </button>
                <p className="access-groups__status-hint">
                  Grupos inativos não podem ser atribuídos a novos usuários.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {editorTab === 'permissions' ? (
        <>
          <section className="access-groups__perm-section">
            <div className="access-groups__perm-head">
              <div>
                <h2 className="access-groups__perm-title">Permissões</h2>
                <p className="access-groups__perm-sub">
                  Selecione as funcionalidades que os usuários deste grupo poderão
                  acessar.
                </p>
              </div>
              <div className="access-groups__perm-actions">
                <label className="access-groups__select-all">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={(e) => selectAllPermissions(e.target.checked)}
                  />
                  <span>Selecionar tudo</span>
                </label>
              </div>
            </div>

            <div className="access-groups__perm-grid access-groups__perm-grid--3">
              {PERMISSION_MODULES.map((mod) => {
                const CardIcon = CARD_ICON_MAP[mod.icon]
                return (
                  <article
                    key={mod.title}
                    className="access-groups__perm-card"
                  >
                    <div className="access-groups__perm-card-head">
                      <span
                        className={`access-groups__perm-card-icon access-groups__perm-card-icon--${mod.accent}`}
                      >
                        <CardIcon size={20} strokeWidth={2} />
                      </span>
                      <span className="access-groups__perm-card-head-text">
                        <span className="access-groups__perm-card-title">
                          {mod.title}
                        </span>
                        <span className="access-groups__perm-card-desc">
                          {mod.description}
                        </span>
                      </span>
                    </div>
                    <ul className="access-groups__perm-list">
                      {mod.items.map((item) => (
                        <li key={item.id}>
                          <label className="access-groups__perm-row">
                            <input
                              type="checkbox"
                              checked={draft.permissionIds.includes(item.id)}
                              onChange={() => togglePermission(item.id)}
                            />
                            <span>{item.label}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
            </div>
          </section>

          <div className="access-groups__info-banner" role="note">
            <Info
              size={20}
              strokeWidth={2}
              className="access-groups__info-banner-icon"
              aria-hidden
            />
            <p>
              As permissões definidas neste grupo serão aplicadas a todos os
              usuários que pertencem a ele. Alterações são aplicadas
              automaticamente.
            </p>
          </div>
        </>
      ) : null}

      {editorTab === 'users' ? (
        <AccessGroupUsersPanel
          mode={mode}
          draftName={draft.name}
          draftDescription={draft.description}
          draftColor={draft.color}
          draftIconKey={draft.iconKey}
          draftActive={isActive}
          permissionGrantedCount={draft.permissionIds.length}
          accessGroupsSorted={sortedGroups}
          assignedUsers={assignedUsers}
          allUsersSnapshot={allUsersSnapshot}
          onAssignUsers={assignUsersToDraftGroup}
          onRemoveUsers={removeUsersFromDraftGroup}
          onRemoveAllFromGroup={removeAllUsersFromDraftGroup}
          onNavigateToPermissions={() => setEditorTab('permissions')}
        />
      ) : null}
    </div>
  )
}
