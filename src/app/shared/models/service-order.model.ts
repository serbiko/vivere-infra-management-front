export interface ServiceOrder {
  id: string;
  number: string;
  eventId: string;
  status: ServiceOrderStatus;
  materials: SelectedMaterial[];
  totalValue: number;
  createdAt: Date;
}

export enum ServiceOrderStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface SelectedMaterial {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}