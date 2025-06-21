import { Asset } from './Asset';

export interface Component {
  categoryName: 'other';
  bucketPath: string;
  componentPath: string[];
  name: string;
  assets?: Asset[];
}
