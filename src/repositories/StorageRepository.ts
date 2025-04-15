import { StorageRepositoryInterface } from '../interfaces/StorageRepositoryInterface';
import { supabase } from '../utils/supabase';

export class StorageRepository implements StorageRepositoryInterface {
  public async getFromStorage(path: string, fileName: string) {
    const { data, error } = await supabase.storage
      .from(path)
      .download(fileName);

    if (error) {
      console.error(error);
      throw new Error(error.message);
    }

    return data;
  }
}
