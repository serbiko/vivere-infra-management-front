export interface Event {
  id: string;
  name: string;      // No banco está 'name', não 'title'
  latitude: number;
  longitude: number;
  startDate: Date;
  endDate: Date;
  status: 'PENDING' | 'ACTIVE' | 'FINISHED'; // Status exatos do back
  createdAt?: Date;
}