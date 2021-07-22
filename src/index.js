import WebpackModules from './util/webpack/webpackModules';
import { patch } from './util/patcher/base.js';
import { listen } from '@tauri-apps/api/event'

const importsToAssign = {
  webpackModules: WebpackModules,
  patch: patch
};

const init = async function () {
  Object.assign(this, importsToAssign);
  
  await listen('DT-Exit', event => {
    window.dtapi.patches.forEach(unpatch => {
      unpatch();
    });
  })
}

window.dtapi = {};
window.dtapi.patches = [];
init.bind(window.dtapi)();