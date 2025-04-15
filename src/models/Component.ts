import { Asset } from './Asset';

export interface Component {
  id?: number;
  name: string;
  componentDirectory: string; // provide root directory - assume you're alrwady in /lib/components
  filePath: string;
  fileName: string;
  assets?: Asset[];
}
