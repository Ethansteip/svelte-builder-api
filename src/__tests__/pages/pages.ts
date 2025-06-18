import { Page } from '../../models/Page';

export const pages: Page[] = [
  /*
   * Landing Pages
   */
  {
    id: 1,
    categoryId: 1,
    categoryName: 'landing',
    bucketPath: '/landing/mobile-app',
    name: 'mobile-app',
    components: [
      {
        id: 1,
        categoryId: 1,
        categoryName: 'other',
        bucketPath: '/other/iPhoneMockup',
        name: 'iPhoneMockup'
      }
    ]
  },
  {
    id: 2,
    categoryId: 1,
    categoryName: 'landing',
    bucketPath: '/landing/saas',
    name: 'saas',
    components: []
  },
  {
    id: 3,
    categoryId: 1,
    categoryName: 'landing',
    bucketPath: '/landing/service',
    name: 'service',
    components: []
  },
  {
    id: 4,
    categoryId: 1,
    categoryName: 'landing',
    bucketPath: '/landing/standard-1',
    name: 'standard-1',
    components: []
  },
  /*
   * Account Pages
   */
  {
    id: 6,
    categoryId: 2,
    categoryName: 'account',
    bucketPath: '/account/standard-1',
    name: 'standard-1',
    components: []
  },
  {
    id: 7,
    categoryId: 2,
    categoryName: 'account',
    bucketPath: '/account/standard-2',
    name: 'standard-2',
    components: []
  },
  /*
   * Auth Pages
   */
  {
    id: 8,
    categoryId: 3,
    categoryName: 'signin',
    bucketPath: '/auth/signin/signin-1',
    name: 'sigin-1',
    components: []
  },
  {
    id: 9,
    categoryId: 3,
    categoryName: 'signin',
    bucketPath: '/auth/signin/signin-2',
    name: 'sigin-2',
    components: []
  },
  {
    id: 10,
    categoryId: 3,
    categoryName: 'signin',
    bucketPath: '/auth/signin/signin-3',
    name: 'sigin-3',
    components: []
  },
  {
    id: 11,
    categoryId: 3,
    categoryName: 'signup',
    bucketPath: '/auth/signup/signup-1',
    name: 'signup-3',
    components: []
  },
  {
    id: 12,
    categoryId: 3,
    categoryName: 'signup',
    bucketPath: '/auth/signup/signup-2',
    name: 'signup-2',
    components: []
  },
  {
    id: 13,
    categoryId: 3,
    categoryName: 'signup',
    bucketPath: '/auth/signup/signup-3',
    name: 'signup-3',
    components: []
  },
  {
    id: 14,
    categoryId: 3,
    categoryName: 'reset-password',
    bucketPath: '/auth/reset-password/reset-password-1',
    name: 'reset-password-1',
    components: []
  },
  {
    id: 15,
    categoryId: 3,
    categoryName: 'forgot-password',
    bucketPath: '/auth/forgot-password/forgot-password-1',
    name: 'forgot-password-1',
    components: []
  }
];
