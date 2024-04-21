import EncryptedStorage from 'react-native-encrypted-storage';

async function setItem(name, params = {}) {
  try {
    await EncryptedStorage.setItem(name, JSON.stringify(params));

    // Congrats! You've just stored your first value!
  } catch (error) {
    // There was an error on the native side
    console.error(error);
  }
}

async function getItem(name) {
  try {
    const session = await EncryptedStorage.getItem(name);

    if (session !== undefined) {
      // Congrats! You've just retrieved your first value!
      return JSON.parse(session);
    }
  } catch (error) {
    // There was an error on the native side
  }
}

async function removeItem(name) {
  try {
    await EncryptedStorage.removeItem(name);
    // Congrats! You've just removed your first value!
  } catch (error) {
    // There was an error on the native side
  }
}

async function clearStorage() {
  try {
    await EncryptedStorage.clear();
    // Congrats! You've just cleared the device storage!
  } catch (error) {
    // There was an error on the native side
  }
}

export default {
  getItem,
  setItem,
  removeItem,
  clearStorage,
};


