// app/bootstrap/storageAdapter.js
import AsyncStorage from '@react-native-async-storage/async-storage'
import { setStorageAdapter } from '@navrang/core/services/storage'

setStorageAdapter({
  get: (k) => AsyncStorage.getItem(k),
  set: (k, v) => AsyncStorage.setItem(k, v),
  remove: (k) => AsyncStorage.removeItem(k),
})
