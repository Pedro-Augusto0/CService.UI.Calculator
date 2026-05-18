import type { PermissionModule } from './types'

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    title: 'Propostas',
    description:
      'Criação, edição e envio de propostas comerciais para clientes.',
    icon: 'file-text',
    accent: 'blue',
    items: [
      { id: 'proposals.view', label: 'Visualizar' },
      { id: 'proposals.create', label: 'Criar' },
      { id: 'proposals.edit', label: 'Editar' },
      { id: 'proposals.delete', label: 'Excluir' },
    ],
  },
  {
    title: 'Clientes',
    description:
      'Cadastro e gestão da base de clientes vinculados às propostas.',
    icon: 'users',
    accent: 'green',
    items: [
      { id: 'clients.view', label: 'Visualizar' },
      { id: 'clients.create', label: 'Criar' },
      { id: 'clients.edit', label: 'Editar' },
      { id: 'clients.delete', label: 'Excluir' },
    ],
  },
  {
    title: 'Modelos',
    description:
      'Templates reutilizáveis para agilizar a montagem de propostas.',
    icon: 'layout-grid',
    accent: 'orange',
    items: [
      { id: 'templates.view', label: 'Visualizar' },
      { id: 'templates.create', label: 'Criar' },
      { id: 'templates.edit', label: 'Editar' },
      { id: 'templates.delete', label: 'Excluir' },
    ],
  },
  {
    title: 'Configurações',
    description:
      'Parâmetros da calculadora, integrações e políticas da conta.',
    icon: 'circle-dollar-sign',
    accent: 'purple',
    items: [
      { id: 'settings.pricing', label: 'Configurar preços' },
      { id: 'settings.general', label: 'Configurações gerais' },
      { id: 'settings.integrations', label: 'Gerenciar integrações' },
      { id: 'settings.users', label: 'Gerenciar usuários' },
    ],
  },
  {
    title: 'Relatórios',
    description:
      'Indicadores operacionais e exportação de dados consolidados.',
    icon: 'bar-chart-3',
    accent: 'teal',
    items: [
      { id: 'reports.view', label: 'Visualizar' },
      { id: 'reports.delete', label: 'Excluir' },
      { id: 'reports.export', label: 'Exportar' },
    ],
  },
  {
    title: 'Administração',
    description:
      'Governança da plataforma, grupos de acesso e trilhas de auditoria.',
    icon: 'shield',
    accent: 'red',
    items: [
      { id: 'admin.groups', label: 'Gerenciar grupos' },
      { id: 'admin.logs', label: 'Ver logs do sistema' },
      { id: 'admin.audit', label: 'Acessar auditoria' },
    ],
  },
]

export function getAllPermissionIds(): string[] {
  return PERMISSION_MODULES.flatMap((m) => m.items.map((i) => i.id))
}
