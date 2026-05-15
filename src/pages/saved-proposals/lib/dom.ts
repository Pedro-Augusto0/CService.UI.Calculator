export function closeParentDetails(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return

  const details = target.closest('details')
  if (details instanceof HTMLDetailsElement) {
    details.open = false
  }
}

export function closeOpenMenus(except?: HTMLDetailsElement | null) {
  document
    .querySelectorAll<HTMLDetailsElement>(
      '.saved-page__status-menu[open], .saved-page__actions-menu[open]',
    )
    .forEach((details) => {
      if (details !== except) {
        details.open = false
      }
    })
}
