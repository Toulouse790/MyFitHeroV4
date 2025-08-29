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

// TransformStream polyfill pour MSW - NÉCESSAIRE
if (typeof globalThis.TransformStream === 'undefined') {
  globalThis.TransformStream = class TransformStream {
    constructor(transformer = {}) {
      this.readable = new ReadableStream();
      this.writable = new WritableStream(); 
    }
  };
}

// ReadableStream polyfill basique si manquant
if (typeof globalThis.ReadableStream === 'undefined') {
  globalThis.ReadableStream = class ReadableStream {
    constructor() {}
    getReader() { return { read: () => Promise.resolve({ done: true }) }; }
  };
}

// WritableStream polyfill basique si manquant  
if (typeof globalThis.WritableStream === 'undefined') {
  globalThis.WritableStream = class WritableStream {
    constructor() {}
    getWriter() { return { write: () => Promise.resolve() }; }
  };
}

// Fetch polyfill
require('whatwg-fetch');
