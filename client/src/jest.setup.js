/**
 * Configuration Jest - Polyfills nécessaires AVANT import des modules
 * Ce fichier s'exécute avant setupTests.ts et avant l'import des modules de test
 */

// Polyfills Node pour JSDOM - NÉCESSAIRE pour MSW
const { TextEncoder, TextDecoder } = require('util');

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder;
}

// BroadcastChannel polyfill pour MSW
if (typeof globalThis.BroadcastChannel === 'undefined') {
  globalThis.BroadcastChannel = class BroadcastChannel {
    constructor(name) {
      this.name = name;
    }
    addEventListener() {}
    removeEventListener() {}
    postMessage() {}
    close() {}
  };
}

// Fetch polyfill
require('whatwg-fetch');
