import fs from 'fs/promises';
import path from 'path';
import { Component } from '../models/Component';
import { StorageRepository } from '../repositories/StorageRepository';
import { AssetsUtils } from './AssetsUtils';

const storageRepository = new StorageRepository();

export class ComponentsUtils {
  /**
   * Add components to the project directory.
   */
  async addComponents(
    projectPath: string,
    uiLibrary: string,
    components: Component[],
    authProvider?: 'supabase' | 'pocketbase'
  ): Promise<void> {
    if (!components || components.length === 0) return;

    for (const component of components) {
      try {
        const storagePath = `${uiLibrary}/components/${
          authProvider ? authProvider : 'base'
        }${component.bucketPath}`;

        const componentPath = component.componentPath.join('/');
        const componentContent = await storageRepository.getFromStorage(
          storagePath,
          `${component.name}.svelte`
        );

        if (!componentContent) {
          throw new Error(
            `Component not found: ${component.bucketPath}/${component.name}`
          );
        }

        const componentDir = path.join(
          projectPath,
          'src',
          'lib',
          'components',
          componentPath
        );

        await fs.mkdir(componentDir, { recursive: true });
        await fs.writeFile(
          path.join(componentDir, `${component.name}.svelte`),
          await componentContent.text(),
          'utf-8'
        );

        // If the component has assets, add them too
        if (component.assets && component.assets.length > 0) {
          const assetsUtils = new AssetsUtils();
          await assetsUtils.addAssets(projectPath, component.assets);
        }
      } catch (error) {
        console.error(`Error adding component ${component.name}:`, error);
        // Continue with other components even if one fails
      }
    }
  }
}
