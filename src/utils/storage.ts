import { supabase } from './supabase';

export async function testBucketAccess() {
  try {
    const { data, error } = await supabase.storage.from('svelte-5').list();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}
