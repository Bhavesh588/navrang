// packages/core/services/storage.js
let adapter = null

export const setStorageAdapter = (a) => {
  adapter = a
}

const assertAdapter = () => {
  if (!adapter) {
    throw new Error("Storage adapter not initialized")
  }
}

export const storage = {
  get: async (k) => {
    assertAdapter()
    return adapter.get(k)
  },
  set: async (k, v) => {
    assertAdapter()
    return adapter.set(k, v)
  },
  remove: async (k) => {
    assertAdapter()
    return adapter.remove(k)
  },
}

