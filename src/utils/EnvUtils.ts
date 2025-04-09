import fs from 'fs/promises';
import path from 'path';

export interface EnvVariables {
  [key: string]: string;
}

export class EnvUtils {
  static async createEnvFile(
    projectPath: string,
    variables: EnvVariables
  ): Promise<void> {
    const envPath = path.join(projectPath, '.env');

    // Convert variables object to env file format
    const envContent = Object.entries(variables)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create or overwrite the .env file
    await fs.writeFile(envPath, envContent);
  }

  static async addEnvVariable(
    projectPath: string,
    key: string,
    value: string
  ): Promise<void> {
    const envPath = path.join(projectPath, '.env');

    try {
      // Read existing env file if it exists
      const existingContent = await fs
        .readFile(envPath, 'utf-8')
        .catch(() => '');

      // Check if variable already exists
      const lines = existingContent.split('\n');
      const variableExists = lines.some((line) => line.startsWith(`${key}=`));

      if (variableExists) {
        // Update existing variable
        const updatedLines = lines.map((line) =>
          line.startsWith(`${key}=`) ? `${key}=${value}` : line
        );
        await fs.writeFile(envPath, updatedLines.join('\n'));
      } else {
        // Add new variable
        const newContent = existingContent
          ? `${existingContent}\n${key}=${value}`
          : `${key}=${value}`;
        await fs.writeFile(envPath, newContent);
      }
    } catch (error) {
      console.error('Error updating .env file:', error);
      throw error;
    }
  }

  static async removeEnvVariable(
    projectPath: string,
    key: string
  ): Promise<void> {
    const envPath = path.join(projectPath, '.env');

    try {
      const existingContent = await fs.readFile(envPath, 'utf-8');
      const lines = existingContent.split('\n');
      const updatedLines = lines.filter((line) => !line.startsWith(`${key}=`));

      await fs.writeFile(envPath, updatedLines.join('\n'));
    } catch (error) {
      console.error('Error removing variable from .env file:', error);
      throw error;
    }
  }
}
