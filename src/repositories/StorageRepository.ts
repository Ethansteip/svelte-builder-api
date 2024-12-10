import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supabase';
import { IStorageRepository } from '../interfaces/IStorageRepository';

export class StorageRepository implements IStorageRepository {
  private readonly git = simpleGit();
  private readonly TEMPLATE_REPO = 'git@github.com:Ethansteip/base.git';

  async createNewProjectFromTemplate(): Promise<{ projectId: string }> {
    const projectId = uuidv4();
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'svelte-builder-'));
    const projectPath = path.join(tempDir, projectId);

    try {
      console.log(`Creating new project ${projectId} in ${projectPath}`);

      // Clone the template repository
      await this.git.clone(this.TEMPLATE_REPO, projectPath);
      console.log('Template repository cloned successfully');

      // Remove .git directory
      await fs.rm(path.join(projectPath, '.git'), { recursive: true });
      console.log('Removed .git directory');

      // Upload each file to Supabase
      await this.uploadDirectoryToSupabase(projectPath, projectId);
      console.log('Files uploaded to Supabase successfully');

      // Cleanup
      await fs.rm(tempDir, { recursive: true });
      console.log('Temporary directory cleaned up');

      return { projectId };
    } catch (error) {
      console.error('Project creation error:', error);
      // Cleanup on error
      try {
        await fs.rm(tempDir, { recursive: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      throw error;
    }
  }

  private async uploadDirectoryToSupabase(
    localPath: string,
    projectId: string,
    basePath?: string
  ) {
    // On first call, set basePath to localPath
    basePath = basePath || localPath;

    const files = await fs.readdir(localPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(localPath, file.name);
      // Calculate relative path from the base project directory
      const relativePath = path.relative(basePath, fullPath);

      if (file.isDirectory()) {
        // Pass along the original basePath for consistent relative path calculation
        await this.uploadDirectoryToSupabase(fullPath, projectId, basePath);
      } else {
        const fileContent = await fs.readFile(fullPath);
        const supabasePath = `projects/${projectId}/${relativePath}`;

        console.log(`Uploading: ${supabasePath}`);
        const { error } = await supabase.storage
          .from('svelte-5')
          .upload(supabasePath, fileContent);

        if (error) {
          throw new Error(`Failed to upload ${supabasePath}: ${error.message}`);
        }
      }
    }
  }
}
