export enum UserRole { 
  PRODUCAO = 'PRODUCAO', 
  GALPAO = 'GALPAO', 
  ADMIN = 'ADMIN' 
}

// Devolvendo o Permission para o Angular parar de dar erro de importação
export enum Permission {
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_INVENTORY = 'MANAGE_INVENTORY',
  MANAGE_OS = 'MANAGE_OS'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  isVerified: boolean;
  permissions?: Permission[]; // Opcional, mantido para compatibilidade
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}