const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

const appNodeModules = path.join(projectRoot, 'node_modules');
const workspaceNodeModules = path.join(workspaceRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

// Prefer the app's node_modules for core platform packages (react, react-native, etc.)
// and fallback to workspace node_modules for shared packages.
config.resolver.extraNodeModules = new Proxy({}, {
  get: (_, name) => {
    const appPath = path.join(appNodeModules, name);
    const wsPath = path.join(workspaceNodeModules, name);
    if (fs.existsSync(appPath)) return appPath;
    return wsPath;
  }
});

// Watch the workspace so changes in packages are picked up
config.watchFolders = [workspaceRoot];

module.exports = config;