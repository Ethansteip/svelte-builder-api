import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supabase';
import { IStorageRepository } from '../interfaces/IStorageRepository';
import AdmZip from 'adm-zip';
import { ProjectSettings } from '../models/ProjectSettings';
import { config } from 'dotenv';
import { ThemeUtils } from '../utils/ThemeUtils';
import { FontUtils } from '../utils/FontUtils';
import { PackageJsonUtils } from '../utils/PackageJsonUtils';
import { PagesUtils } from '../utils/PagesUtils';
import { EnvUtils } from '../utils/EnvUtils';

config();

export class StorageRepository implements IStorageRepository {
  private readonly git = simpleGit();
  private readonly SUPABASE_STORAGE_PROJECT_BUCKET_PATH =
    process.env.SUPABASE_STORAGE_PROJECT_BUCKET_PATH;
  private readonly environment = process.env.NODE_ENV;
  private readonly SHAD_BASE_TEMPLATE_REPO =
    'git@github.com:Ethansteip/shad-base.git';
  private readonly DAISY_BASE_TEMPLATE_REPO =
    'git@github.com:Ethansteip/daisy-base.git';

  private async getTemplateRepo(
    uiLibrary: string,
    authProvider?: string
  ): Promise<string> {
    const templateMap = {
      shad: {
        default: this.SHAD_BASE_TEMPLATE_REPO,
        supabase: this.SHAD_BASE_TEMPLATE_REPO, // TODO: Add Supabase template
        pocketbase: this.SHAD_BASE_TEMPLATE_REPO // TODO: Add PocketBase template
      },
      daisy: {
        default: this.DAISY_BASE_TEMPLATE_REPO,
        supabase: this.DAISY_BASE_TEMPLATE_REPO, // TODO: Add Supabase template
        pocketbase: this.DAISY_BASE_TEMPLATE_REPO // TODO: Add PocketBase template
      }
    };

    const libraryTemplates = templateMap[uiLibrary as keyof typeof templateMap];
    if (!libraryTemplates) {
      throw new Error(`Unsupported UI library: ${uiLibrary}`);
    }

    return (
      libraryTemplates[authProvider as keyof typeof libraryTemplates] ||
      libraryTemplates.default
    );
  }

  async createNewProjectFromTemplate(projectSettings: ProjectSettings) {
    const projectId = uuidv4();
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'svelte-builder-'));
    const projectPath = path.join(tempDir, projectId);
    const { uiLibrary, theme, font, pages, name } = projectSettings;
    const shad = uiLibrary === 'shad';

    try {
      // Clone the template repository based on the ui library chosen
      const templateRepo = await this.getTemplateRepo(
        uiLibrary,
        projectSettings.authProvider
      );

      await this.git.clone(templateRepo, projectPath);

      // Remove existing .git directory
      await fs.rm(path.join(projectPath, '.git'), { recursive: true });

      // setup theme
      if (shad) {
        await ThemeUtils.setupShadTheme(projectPath, theme);
      } else if (uiLibrary === 'daisy') {
        await ThemeUtils.setupDaisyTheme(projectPath, theme);
      } else {
        throw new Error('Unsupported UI library');
      }

      // Add font
      if (font) {
        await FontUtils.setupFont(projectPath, font, shad);
        await PackageJsonUtils.updateProjectName(
          projectPath,
          projectSettings.name.fileName
        );
      }

      // Setup pages
      await PagesUtils.setupLandingPage(projectPath, pages);
      await PagesUtils.setupAuthPage(projectPath, pages);
      await PagesUtils.setupAccountPage(projectPath, pages);

      // Add .env file
      await EnvUtils.createEnvFile(projectPath, {
        PUBLIC_APP_NAME: projectSettings.name.clientName
      });

      // Create zip file
      const zip = new AdmZip();
      zip.addLocalFolder(projectPath);
      const zipBuffer = zip.toBuffer();

      // Upload zip to Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('projects')
        .upload(
          `${this.SUPABASE_STORAGE_PROJECT_BUCKET_PATH}/${projectId}/${projectSettings.name.fileName}.zip`,
          zipBuffer
        );

      if (uploadError) throw Error;

      const storagePath = uploadData?.path;

      /// upload project details to projects table
      const { data: insertData, error: insertError } = await supabase
        .from('projects')
        .insert({
          project_name: projectSettings.name.clientName,
          ui_library: uiLibrary,
          environment: this.environment,
          project_uuid: projectId,
          project_configuration: projectSettings,
          project_storage_path: storagePath
        });

      if (insertError) throw Error;

      // Get download URL for zip
      const { data } = await supabase.storage
        .from('projects')
        .createSignedUrl(
          `${this.SUPABASE_STORAGE_PROJECT_BUCKET_PATH}/${projectId}/${projectSettings.name.fileName}.zip`,
          3600
        );

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
}
