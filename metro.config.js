const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const topicStub = path.resolve(
  __dirname,
  'node_modules/expo-notifications/build/TopicSubscriptionModule.js'
);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'android' &&
    moduleName === './TopicSubscriptionModule' &&
    context.originModulePath.includes('expo-notifications')
  ) {
    return { type: 'sourceFile', filePath: topicStub };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;