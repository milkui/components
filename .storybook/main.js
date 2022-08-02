const path = require('path');

module.exports = {
  stories: ['../packages/**/*.stories.tsx'],
  addons: ['@storybook/addon-essentials'],
  framework: '@storybook/html',
  core: { builder: 'webpack5' },
  webpackFinal(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      '~': path.resolve(__dirname, '../'),
    };

    return config;
  },
  babel: (options) => ({
    ...options,
    plugins: [
      ...options.plugins,
      '@babel/plugin-transform-react-jsx',
      ['auto-import', { declarations: [{ default: 'React', path: 'react' }] }],
    ],
  }),
};
