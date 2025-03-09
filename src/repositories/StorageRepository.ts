import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supabase';
import { IStorageRepository } from '../interfaces/IStorageRepository';
import AdmZip from 'adm-zip';
import { ProjectSettings } from '../models/ProjectSettings';

export class StorageRepository implements IStorageRepository {
  private readonly git = simpleGit();
  private readonly SHAD_TEMPLATE_REPO = 'git@github.com:Ethansteip/base.git';
  private readonly DAISY_TEMPLATE_REPO =
    'git@github.com:Ethansteip/daisyui-base.git';

  async createNewProjectFromTemplate(projectSettings: ProjectSettings) {
    const projectId = uuidv4();
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'svelte-builder-'));
    const projectPath = path.join(tempDir, projectId);
    const { uiLibrary, theme, font, selectedPages } = projectSettings;
    const shad = uiLibrary === 'shad';

    try {
      // Clone the template repository based on the ui library chosen
      if (shad) {
        console.log('Cloning Shad template repository');
        await this.git.clone(this.SHAD_TEMPLATE_REPO, projectPath);
      } else if (uiLibrary === 'daisy') {
        console.log('Cloning Daisy template repository');
        await this.git.clone(this.DAISY_TEMPLATE_REPO, projectPath);
      }

      // Remove existing .git directory
      await fs.rm(path.join(projectPath, '.git'), { recursive: true });

      // If Shad, Setup Theme
      if (shad) {
        // find file under /lib/themes that matches project settings theme
        // copy contents
        // and overwrite app.css file in project root with contents
      }

      // Add font

      // Trim pages

      // Create zip file
      const zip = new AdmZip();
      zip.addLocalFolder(projectPath);
      const zipBuffer = zip.toBuffer();

      // Upload zip to Supabase
      const { error } = await supabase.storage
        .from('svelte-5')
        .upload(`projects/${projectId}.zip`, zipBuffer);

      if (error) throw error;

      // Get download URL for zip
      const { data } = await supabase.storage
        .from('svelte-5')
        .createSignedUrl(`projects/${projectId}.zip`, 60);

      // Cleanup
      await fs.rm(tempDir, { recursive: true });

      return { projectId, downloadUrl: data?.signedUrl || '' };
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

  private async getDownloadUrl(projectId: string) {
    const { data } = await supabase.storage
      .from('svelte-5')
      .createSignedUrl(`projects/${projectId}/README.md`, 60, {
        download: true
      });
    return data;
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
