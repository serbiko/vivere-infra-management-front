export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

export enum UserRole { 
  ADMIN = 'ADMIN', 
  MANAGER = 'MANAGER', 
  TECHNICIAN = 'TECHNICIAN', 
  OPERATOR = 'OPERATOR' 
}

export type Permission =
  | 'event.create' | 'event.edit' | 'event.delete'
  | 'os.create' | 'os.approve'
  | 'inventory.manage';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}