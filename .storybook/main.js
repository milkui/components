module.exports = {
  framework: '@storybook/html',
  stories: ['../packages/core/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
};
