import fs from 'fs/promises';
import path from 'path';

export interface PackageJson {
  name: string;
  dependencies: Record<string, string>;
  [key: string]: any;
}

export class PackageJsonUtils {
  public async readPackageJson(projectPath: string): Promise<PackageJson> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    return JSON.parse(packageJsonContent);
  }

  public async writePackageJson(
    projectPath: string,
    packageJson: PackageJson
  ): Promise<void> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  public async addDependency(
    projectPath: string,
    packageName: string,
    version: string
  ): Promise<void> {
    const packageJson = await this.readPackageJson(projectPath);
    packageJson.dependencies[packageName] = version;
    await this.writePackageJson(projectPath, packageJson);
  }

  public async removeDependency(
    projectPath: string,
    packageName: string
  ): Promise<void> {
    const packageJson = await this.readPackageJson(projectPath);
    delete packageJson.dependencies[packageName];
    await this.writePackageJson(projectPath, packageJson);
  }

  public async updateProjectName(
    projectPath: string,
    name: string
  ): Promise<void> {
    const packageJson = await this.readPackageJson(projectPath);
    packageJson.name = name;
    await this.writePackageJson(projectPath, packageJson);
  }
}
