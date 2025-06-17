import fs from 'fs/promises';
import path from 'path';
import { Page } from '../models/Page';
import { StorageRepository } from '../repositories/StorageRepository';
import { AssetsUtils } from './AssetsUtils';
import { ComponentsUtils } from './ComponentsUtils';

export class PagesUtils {
  private storageRepository: StorageRepository;
  private assetsUtils: AssetsUtils;
  private componentsUtils: ComponentsUtils;

  constructor() {
    this.storageRepository = new StorageRepository();
    this.assetsUtils = new AssetsUtils();
    this.componentsUtils = new ComponentsUtils();
  }

  private async createRoute(
    projectPath: string,
    routeName: string
  ): Promise<string> {
    const routesPath = path.join(projectPath, 'src', 'routes');
    const routePath = path.join(routesPath, routeName);

    // Ensure the route directory exists
    await fs.mkdir(routePath, { recursive: true });

    return routePath;
  }

  private async fetchPageContent(
    uiLibrary: string,
    page: Page,
    authProvider: string | undefined
  ): Promise<string> {
    const storagePath = `${uiLibrary}/pages/${
      authProvider ? authProvider : 'base'
    }/${page.categoryName}/${page.name}`;

    const pageContent = await this.storageRepository.getFromStorage(
      storagePath,
      `+page.svelte`
    );

    if (!pageContent) {
      throw new Error(
        `Page content not found for ${page.categoryName}/${page.name}`
      );
    }

    return pageContent.text();
  }

  public async addPages(
    projectPath: string,
    uiLibrary: string,
    pages: Page[],
    authProvider?: 'supabase' | 'pocketbase' | undefined
  ): Promise<void> {
    try {
      // Handle landing page separately since it goes in the root
      const landingPage = pages.find((page) => page.categoryName === 'landing');

      if (landingPage) {
        const content = await this.fetchPageContent(
          uiLibrary,
          landingPage,
          authProvider
        );

        const routesPath = path.join(projectPath, 'src', 'routes');
        await fs.mkdir(routesPath, { recursive: true });
        await fs.writeFile(
          path.join(routesPath, '+page.svelte'),
          content,
          'utf-8'
        );

        // Add assets and components for landing page
        if (landingPage.assets) {
          await this.assetsUtils.addAssets(projectPath, landingPage.assets);
        }

        if (landingPage.components) {
          await this.componentsUtils.addComponents(
            projectPath,
            uiLibrary,
            landingPage.components
          );
        }
      }

      // Handle all other pages
      for (const page of pages) {
        // Skip landing page as it's handled above
        if (page.categoryName === 'landing') {
          continue;
        }

        try {
          const routePath = await this.createRoute(
            projectPath,
            page.categoryName
          );

          const content = await this.fetchPageContent(
            uiLibrary,
            page,
            authProvider
          );

          // Write the page content
          await fs.writeFile(
            path.join(routePath, '+page.svelte'),
            content,
            'utf-8'
          );

          // Add assets and components for the page
          if (page.assets) {
            await this.assetsUtils.addAssets(projectPath, page.assets);
          }
          if (page.components) {
            await this.componentsUtils.addComponents(
              projectPath,
              uiLibrary,
              page.components
            );
          }

          // Clean up any variant directories
          const routeEntries = await fs.readdir(routePath, {
            withFileTypes: true
          });
          for (const entry of routeEntries) {
            if (entry.isDirectory() && entry.name !== page.name) {
              await fs.rm(path.join(routePath, entry.name), {
                recursive: true
              });
            }
          }
        } catch (error) {
          console.error(`Error setting up ${page.categoryName} page:`, error);
          // Continue with other pages even if one fails
        }
      }
    } catch (error) {
      console.error('Error adding pages:', error);
      throw new Error(
        `Failed to add pages: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
