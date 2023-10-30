import type { StorybookConfig } from '@storybook/html-webpack5';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../packages/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/html-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.resolve(__dirname, '../'),
    };
    return config;
  },
  babel: (config) => ({
    ...config,
    sourceType: 'unambiguous',
    presets: [
      ...(config.presets || []),
      ['@babel/preset-env', { targets: { chrome: 100, safari: 15, firefox: 91 } }],
      '@babel/preset-typescript',
      '@babel/preset-react',
    ],
  }),
};

export default config;
