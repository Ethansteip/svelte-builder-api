import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supabase';
import { ProjectRepositoryInterface } from '../interfaces/ProjectRepositoryInterface';
import AdmZip from 'adm-zip';
import { ProjectSettings } from '../models/ProjectSettings';
import { config } from 'dotenv';
import { ThemeUtils } from '../utils/ThemeUtils';
import { FontUtils } from '../utils/FontUtils';
import { PackageJsonUtils } from '../utils/PackageJsonUtils';
import { PagesUtils } from '../utils/PagesUtils';
import { EnvUtils } from '../utils/EnvUtils';
import { AuthenticationProvider } from './AuthenticationProvider';
config();

export class ProjectRepository implements ProjectRepositoryInterface {
  private readonly git = simpleGit();
  private readonly SUPABASE_STORAGE_PROJECT_BUCKET_PATH =
    process.env.SUPABASE_STORAGE_PROJECT_BUCKET_PATH;
  private readonly environment = process.env.NODE_ENV;
  private readonly SHAD_BASE_V2_TEMPLATE_REPO =
    'git@github.com:Ethansteip/shad-base-v2.git';
  private readonly DAISY_BASE_V2_TEMPLATE_REPO =
    'git@github.com:Ethansteip/daisy-base-v2.git';
  private readonly SHAD_SUPABASE_TEMPLATE_REPO =
    'git@github.com:Ethansteip/shad-supabase.git';
  private readonly SHAD_POCKETBASE_TEMPLATE_REPO =
    'git@github.com:Ethansteip/shad-pocketbase.git';
  private readonly DAISY_SUPABASE_TEMPLATE_REPO =
    'git@github.com:Ethansteip/daisy-supabase.git';
  private readonly DAISY_POCKETBASE_TEMPLATE_REPO =
    'git@github.com:Ethansteip/daisy-pocketbase.git';
  private ThemeUtils: ThemeUtils;
  private PagesUtils: PagesUtils;
  private EnvUtils: EnvUtils;
  private FontUtils: FontUtils;
  private PackageJsonUtils: PackageJsonUtils;

  constructor() {
    this.ThemeUtils = new ThemeUtils();
    this.PagesUtils = new PagesUtils();
    this.EnvUtils = new EnvUtils();
    this.FontUtils = new FontUtils();
    this.PackageJsonUtils = new PackageJsonUtils();
  }

  async createProject(projectSettings: ProjectSettings) {
    const projectId = uuidv4();
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'svelte-builder-'));
    const projectPath = path.join(tempDir, projectId);
    const { uiLibrary, theme, font, pages, name, authProvider } =
      projectSettings;
    const shad = uiLibrary === 'shad';

    try {
      // Clone the template repository based on the ui library chosen
      const templateRepo = await this.getTemplateRepo(uiLibrary, authProvider);

      if (!templateRepo) {
        throw new Error(
          'No template repository found for the given configuration'
        );
      }

      await this.git.clone(templateRepo, projectPath);
      // Remove existing .git directory
      await fs.rm(path.join(projectPath, '.git'), { recursive: true });

      // setup theme
      await this.ThemeUtils.setupBaseTheme(projectPath, uiLibrary, theme);

      // Add font
      await this.FontUtils.setupFont(projectPath, font);

      // Update the project name in package.json
      await this.PackageJsonUtils.updateProjectName(
        projectPath,
        projectSettings.name.fileName
      );

      // Setup pages - landing, auth, account, etc.
      // TODO: create new BaseProvider class to deal with these repos.
      if (!authProvider) {
        await this.PagesUtils.addPages(projectPath, uiLibrary, pages);
      }

      // Add .env file
      await EnvUtils.createEnvFile(projectPath, [
        {
          key: 'PUBLIC_APP_NAME',
          value: projectSettings.name.clientName,
          type: 'string'
        }
      ]);

      // Add auth provider
      if (authProvider === 'supabase') {
        await new AuthenticationProvider(projectPath).addSupabase(uiLibrary);
      } else if (authProvider === 'pocketbase') {
        console.log('Pocketbase not implemented yet');
      }

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

  private async getTemplateRepo(
    uiLibrary: string,
    authProvider: string | undefined
  ) {
    // if no auth provider specificed, select base repo.
    if (!authProvider) {
      if (uiLibrary === 'shad') {
        return this.SHAD_BASE_V2_TEMPLATE_REPO;
      } else if (uiLibrary === 'daisy') {
        return this.DAISY_BASE_V2_TEMPLATE_REPO;
      } else {
        throw new Error('Unsupported UI library');
      }
    }

    // if auth provider is supabase, select supabase repo.
    if (authProvider === 'supabase') {
      if (uiLibrary === 'shad') {
        return this.SHAD_SUPABASE_TEMPLATE_REPO;
      } else if (uiLibrary === 'daisy') {
        return this.DAISY_SUPABASE_TEMPLATE_REPO;
      }
    }

    // if auth provider is pocketbase, select pocketbase repo.
    if (authProvider === 'pocketbase') {
      if (uiLibrary === 'shad') {
        return this.SHAD_POCKETBASE_TEMPLATE_REPO;
      } else if (uiLibrary === 'daisy') {
        return this.DAISY_POCKETBASE_TEMPLATE_REPO;
      }
    }
  }
}
