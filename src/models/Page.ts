export interface Page {
  id?: number;
  categoryId: number;
  categoryName: 'landing' | 'auth' | 'account';
  name: string;
}
