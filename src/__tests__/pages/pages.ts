import { Page } from '../../models/Page';

export const pages: Page[] = [
  /*
   * Landing Pages
   */
  {
    categoryName: 'landing',
    bucketPath: '/landing/mobile-app',
    landingPage: true,
    name: 'mobile-app',
    components: [
      {
        categoryName: 'other',
        bucketPath: '/other',
        componentPath: ['other'],
        name: 'IphoneMockup'
      }
    ]
  },
  {
    categoryName: 'landing',
    bucketPath: '/landing/saas',
    landingPage: true,
    name: 'saas',
    components: []
  },
  {
    categoryName: 'landing',
    bucketPath: '/landing/service',
    landingPage: true,
    name: 'service',
    components: []
  },
  {
    categoryName: 'landing',
    bucketPath: '/landing/standard-1',
    landingPage: true,
    name: 'standard-1',
    components: []
  },
  /*
   * Account Pages
   */
  {
    categoryName: 'account',
    bucketPath: '/account/standard-1',
    routePath: ['app', 'account'],
    authenticatedPage: true,
    name: 'standard-1',
    components: []
  },
  {
    categoryName: 'account',
    bucketPath: '/account/standard-2',
    routePath: ['app', 'account'],
    authenticatedPage: true,
    name: 'standard-2',
    components: []
  },
  /*
   * Auth Pages
   */
  {
    categoryName: 'signin',
    bucketPath: '/auth/signin/signin-1',
    routePath: ['auth'],
    webPage: true,
    includePageServer: true,
    name: 'sigin-1',
    components: []
  },
  {
    categoryName: 'signin',
    bucketPath: '/auth/signin/signin-2',
    routePath: ['auth'],
    webPage: true,
    includePageServer: true,
    name: 'sigin-2',
    components: []
  },
  {
    categoryName: 'signin',
    bucketPath: '/auth/signin/signin-3',
    routePath: ['auth'],
    webPage: true,
    includePageServer: true,
    name: 'sigin-3',
    components: []
  },
  {
    categoryName: 'signup',
    bucketPath: '/auth/signup/signup-1',
    routePath: ['auth', 'signup'],
    webPage: true,
    includePageServer: true,
    name: 'signup-3',
    components: []
  },
  {
    categoryName: 'signup',
    bucketPath: '/auth/signup/signup-2',
    routePath: ['auth', 'signup'],
    webPage: true,
    includePageServer: true,
    name: 'signup-2',
    components: []
  },
  {
    categoryName: 'signup',
    bucketPath: '/auth/signup/signup-3',
    routePath: ['auth', 'signup'],
    webPage: true,
    includePageServer: true,
    name: 'signup-3',
    components: []
  },
  {
    categoryName: 'reset-password',
    bucketPath: '/auth/reset-password/reset-password-1',
    routePath: ['auth', 'reset-password'],
    webPage: true,
    includePageServer: true,
    name: 'reset-password-1',
    components: []
  },
  {
    categoryName: 'forgot-password',
    bucketPath: '/auth/forgot-password/forgot-password-1',
    routePath: ['auth', 'forgot-password'],
    webPage: true,
    includePageServer: true,
    name: 'forgot-password-1',
    components: []
  }
];
