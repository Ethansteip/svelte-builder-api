import fs from 'fs/promises';
import path from 'path';
import { Asset } from '../models/Asset';
import { StorageRepository } from '../repositories/StorageRepository';

export class AssetsUtils {
  private storageRepository: StorageRepository;

  constructor() {
    this.storageRepository = new StorageRepository();
  }

  public async addAssets(projectPath: string, assets: Asset[]): Promise<void> {
    if (!assets || assets.length === 0) return;

    const assetsPath = path.join(projectPath, 'src', 'lib', 'assets');
    await fs.mkdir(assetsPath, { recursive: true });

    for (const asset of assets) {
      try {
        const assetContent = await this.storageRepository.getFromStorage(
          asset.storagePath,
          asset.fileName
        );

        if (!assetContent) {
          console.warn(
            `Asset not found: ${asset.storagePath}/${asset.fileName}`
          );
          continue;
        }

        const filePath = path.join(assetsPath, asset.fileName);

        // Handle different asset types
        if (asset.type === 'image') {
          // For images, we need to handle binary data
          const buffer = await assetContent.arrayBuffer();
          await fs.writeFile(filePath, Buffer.from(buffer));
        } else {
          // For other types (text-based files), handle as text
          await fs.writeFile(filePath, await assetContent.text(), 'utf-8');
        }
      } catch (error) {
        console.error(`Error adding asset ${asset.name}:`, error);
        // Continue with other assets even if one fails
      }
    }
  }
}
