/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Lista separada por vírgulas de e-mails que recebem isAdmin ao cadastrar. */
  readonly VITE_AUTH_ADMIN_EMAILS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
