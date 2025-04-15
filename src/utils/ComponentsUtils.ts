import fs from 'fs/promises';
import path from 'path';
import { Component } from '../models/Component';
import { StorageRepository } from '../repositories/StorageRepository';
import { AssetsUtils } from './AssetsUtils';

export class ComponentsUtils {
  private storageRepository: StorageRepository;

  constructor() {
    this.storageRepository = new StorageRepository();
  }

  public async addComponents(
    projectPath: string,
    uiLibrary: string,
    components: Component[]
  ): Promise<void> {
    if (!components || components.length === 0) return;

    for (const component of components) {
      try {
        const componentContent = await this.storageRepository.getFromStorage(
          `${uiLibrary}/${component.filePath}`,
          component.fileName
        );

        if (!componentContent) {
          console.warn(
            `Component not found: ${component.filePath}/${component.fileName}`
          );
          continue;
        }

        const componentDir = path.join(
          projectPath,
          'src',
          'lib',
          'components',
          component.componentDirectory
        );
        await fs.mkdir(componentDir, { recursive: true });

        await fs.writeFile(
          path.join(componentDir, component.fileName),
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
