import { Asset } from './Asset';
import { Component } from './Component';

export interface Page {
  categoryName: string;
  routePath?: string[];
  bucketPath: string;
  includePageServer?: true;
  landingPage?: true;
  webPage?: true;
  authenticatedPage?: true;
  name: string;
  assets?: Asset[];
  components?: Component[];
}
