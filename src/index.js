import WebpackModules from './util/webpack/webpackModules';
import { patch } from './util/patcher/base.js';

import * as notificationPlugin from './notifications.js';

import { listen } from '@tauri-apps/api/event'

const importsToAssign = {
  webpackModules: WebpackModules,
  patch: patch
};

const init = async function () {
  Object.assign(this, importsToAssign);

  // Request notification permission at the start
  window.__TAURI__.notification.requestPermission();
  notificationPlugin.init();
  
  await listen('DT-Exit', event => {
    window.dtapi.patches.unPatchNotifications();
  })
}

window.dtapi = {};
window.dtapi.patches = {};
init.bind(window.dtapi)();