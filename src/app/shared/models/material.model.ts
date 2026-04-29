export interface Material {
  id: string;
  name: string;
  categoryId: string;
  stock: number; // No banco está 'stock', não 'stockQuantity'
}

export interface MaterialCategory {
  id: string;
  name: string;
}

export interface Structure {
  id: string;
  structureTypeId: string;
  name: string;
}