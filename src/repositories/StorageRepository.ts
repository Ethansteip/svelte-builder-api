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
  private readonly SHAD_TEMPLATE_REPO =
    'git@github.com:Ethansteip/shad-base.git';
  private readonly DAISY_TEMPLATE_REPO =
    'git@github.com:Ethansteip/daisy-base.git';

  async createNewProjectFromTemplate(projectSettings: ProjectSettings) {
    const projectId = uuidv4();
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'svelte-builder-'));
    const projectPath = path.join(tempDir, projectId);
    const { uiLibrary, theme, font, selectedPages } = projectSettings;
    const shad = uiLibrary === 'shad';

    try {
      // Clone the template repository based on the ui library chosen
      if (shad) {
        await this.git.clone(this.SHAD_TEMPLATE_REPO, projectPath);
      } else if (uiLibrary === 'daisy') {
        await this.git.clone(this.DAISY_TEMPLATE_REPO, projectPath);
      }

      // Remove existing .git directory
      await fs.rm(path.join(projectPath, '.git'), { recursive: true });

      // If Shad, Setup Theme
      if (shad) {
        const themesPath = path.join(projectPath, 'src', 'lib', 'themes');
        const selectedThemePath = path.join(themesPath, `${theme}.css`);
        const appCssPath = path.join(projectPath, 'src', 'app.css');

        // Read the selected theme file
        const themeContent = await fs.readFile(selectedThemePath, 'utf-8');

        // Write theme content to app.css
        await fs.writeFile(appCssPath, themeContent);

        // Remove the themes directory
        await fs.rm(themesPath, { recursive: true });
      } else if (uiLibrary === 'daisy') {
        // Setup DaisyUI theme
        const appCssPath = path.join(projectPath, 'src', 'app.css');
        const existingCss = await fs.readFile(appCssPath, 'utf-8');
        const daisyThemeContent = `${existingCss}\n\n@plugin "daisyui" {\n\tthemes: ${theme} --default;\n}\n`;
        await fs.writeFile(appCssPath, daisyThemeContent);
      }

      // Add font
      if (font) {
        // Update package.json to add the font dependency
        const packageJsonPath = path.join(projectPath, 'package.json');
        const packageJson = JSON.parse(
          await fs.readFile(packageJsonPath, 'utf-8')
        );

        if (!font.variable) {
          packageJson.dependencies[`@fontsource/${font.name}`] = '^5.1.0';
        } else {
          packageJson.dependencies[`@fontsource-variable/${font.name}`] =
            '^5.1.0';
        }

        if (shad) {
          delete packageJson.dependencies['_comment'];
        }

        // Add project name to package.json
        packageJson.name = projectSettings.projectName
          .toLowerCase()
          .split(' ')
          .join('-');

        await fs.writeFile(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2)
        );

        // Add font import to app.css
        const appCssPath = path.join(projectPath, 'src', 'app.css');
        const fontImport = `@import '@fontsource${
          font.variable ? '-variable' : ''
        }/${font.name}';\n`;
        const existingCss = await fs.readFile(appCssPath, 'utf-8');
        await fs.writeFile(appCssPath, fontImport + existingCss);

        // Add font-family to the :root or body in app.css
        const fontFamilyRule = `\n\n:root {\n  ${font.fontFamily}\n}\n`;
        await fs.appendFile(appCssPath, fontFamilyRule);
      }

      // Trim pages
      const routesPath = path.join(projectPath, 'src', 'routes');

      // Handle landing pages
      const landingPath = path.join(routesPath, 'landing');
      if (
        await fs
          .access(landingPath)
          .then(() => true)
          .catch(() => false)
      ) {
        const landingEntries = await fs.readdir(landingPath, {
          withFileTypes: true
        });

        // If a landing page is selected, move it to root route
        if (projectSettings.selectedPages.landing) {
          const selectedVariant = projectSettings.selectedPages.landing.href;
          const selectedLandingPath = path.join(landingPath, selectedVariant);

          // Move the +page.svelte from selected landing variant to root route
          await fs.copyFile(
            path.join(selectedLandingPath, '+page.svelte'),
            path.join(routesPath, '+page.svelte')
          );

          // Remove the other components folder if not using mobile-app landing
          if (selectedVariant !== 'mobile-app' && shad) {
            const otherComponentsPath = path.join(
              projectPath,
              'src',
              'lib',
              'components',
              'other'
            );
            if (
              await fs
                .access(otherComponentsPath)
                .then(() => true)
                .catch(() => false)
            ) {
              await fs.rm(otherComponentsPath, { recursive: true });
            }
          }
        }

        for (const entry of landingEntries) {
          if (
            entry.isDirectory() &&
            entry.name !== projectSettings.selectedPages.landing?.href
          ) {
            await fs.rm(path.join(landingPath, entry.name), {
              recursive: true
            });
          }
        }
        // Remove the entire landing directory after moving the selected page to root
        await fs.rm(landingPath, { recursive: true });
      }

      // Handle auth pages
      const authPath = path.join(routesPath, 'auth');
      if (
        await fs
          .access(authPath)
          .then(() => true)
          .catch(() => false)
      ) {
        const authEntries = await fs.readdir(authPath, { withFileTypes: true });

        // If an auth page is selected, move it to root of auth directory
        if (projectSettings.selectedPages.auth) {
          const selectedVariant = projectSettings.selectedPages.auth.href;
          const selectedAuthPath = path.join(authPath, selectedVariant);

          try {
            // First verify the source file exists and has content
            const sourcePath = path.join(selectedAuthPath, '+page.svelte');
            const sourceContent = await fs.readFile(sourcePath, 'utf-8');

            // Write the content to the destination
            const destPath = path.join(authPath, '+page.svelte');
            await fs.writeFile(destPath, sourceContent);

            // Verify the write was successful
            const destContent = await fs.readFile(destPath, 'utf-8');
            console.log('Auth dest content:', destContent.substring(0, 100)); // Log first 100 chars
          } catch (err) {
            console.error('Error copying auth page:', err);
          }
        }

        // Clean up variant directories
        for (const entry of authEntries) {
          if (entry.isDirectory()) {
            await fs.rm(path.join(authPath, entry.name), { recursive: true });
          }
        }

        if (!projectSettings.selectedPages.auth) {
          await fs.rm(authPath, { recursive: true });
        }
      }

      // Handle account pages
      const accountPath = path.join(routesPath, 'account');
      if (
        await fs
          .access(accountPath)
          .then(() => true)
          .catch(() => false)
      ) {
        const accountEntries = await fs.readdir(accountPath, {
          withFileTypes: true
        });

        // If an account page is selected, move it to root of account directory
        if (projectSettings.selectedPages.account) {
          const selectedVariant = projectSettings.selectedPages.account.href;
          const selectedAccountPath = path.join(accountPath, selectedVariant);

          try {
            // First verify the source file exists and has content
            const sourcePath = path.join(selectedAccountPath, '+page.svelte');
            const sourceContent = await fs.readFile(sourcePath, 'utf-8');

            // Write the content to the destination
            const destPath = path.join(accountPath, '+page.svelte');
            await fs.writeFile(destPath, sourceContent);

            // Verify the write was successful
            const destContent = await fs.readFile(destPath, 'utf-8');
          } catch (err) {
            console.error('Error copying account page:', err);
          }
        }

        // Clean up variant directories
        for (const entry of accountEntries) {
          if (entry.isDirectory()) {
            await fs.rm(path.join(accountPath, entry.name), {
              recursive: true
            });
          }
        }

        if (!projectSettings.selectedPages.account) {
          await fs.rm(accountPath, { recursive: true });
        }
      }

      // Add .env file
      const envContent = `PUBLIC_APP_NAME=${projectSettings.projectName}\n`;
      await fs.writeFile(path.join(projectPath, '.env'), envContent);

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
