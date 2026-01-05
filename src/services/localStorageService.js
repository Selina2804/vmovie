// src/services/localStorageService.js
// 🗄️ Core localStorage helper với error handling

/**
 * Lấy dữ liệu từ localStorage
 * @param {string} key - localStorage key
 * @param {*} defaultValue - giá trị mặc định nếu không tìm thấy
 * @returns {*} parsed data hoặc defaultValue
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    
    if (item === null) {
      return defaultValue;
    }
    
    // Try parse JSON
    try {
      return JSON.parse(item);
    } catch {
      // Nếu không phải JSON thì return string
      return item;
    }
  } catch (error) {
    console.error(`❌ Error getting item "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Lưu dữ liệu vào localStorage
 * @param {string} key - localStorage key
 * @param {*} value - data cần lưu (sẽ tự động stringify)
 * @returns {boolean} success status
 */
export const setItem = (key, value) => {
  try {
    const serialized = typeof value === 'string' 
      ? value 
      : JSON.stringify(value);
    
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`❌ Error setting item "${key}":`, error);
    
    // Check nếu lỗi do quota exceeded
    if (error.name === 'QuotaExceededError') {
      console.warn('⚠️ localStorage quota exceeded! Consider clearing old data.');
    }
    
    return false;
  }
};

/**
 * Xóa item khỏi localStorage
 * @param {string} key - localStorage key
 * @returns {boolean} success status
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`❌ Error removing item "${key}":`, error);
    return false;
  }
};

/**
 * Xóa tất cả items trong localStorage
 * @returns {boolean} success status
 */
export const clear = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('❌ Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Kiểm tra key có tồn tại không
 * @param {string} key - localStorage key
 * @returns {boolean}
 */
export const hasItem = (key) => {
  return localStorage.getItem(key) !== null;
};

/**
 * Lấy tất cả keys matching với prefix
 * @param {string} prefix - prefix để filter keys
 * @returns {string[]} array of matching keys
 */
export const getKeysByPrefix = (prefix) => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.error('❌ Error getting keys by prefix:', error);
    return [];
  }
};

/**
 * Lấy size của localStorage (KB)
 * @returns {number} size in KB
 */
export const getStorageSize = () => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2); // KB
  } catch (error) {
    console.error('❌ Error getting storage size:', error);
    return 0;
  }
};

/**
 * Update một phần của object trong localStorage
 * @param {string} key - localStorage key
 * @param {object} updates - object chứa các field cần update
 * @returns {boolean} success status
 */
export const updateItem = (key, updates) => {
  try {
    const current = getItem(key, {});
    
    if (typeof current !== 'object' || Array.isArray(current)) {
      console.error('❌ Cannot update non-object item');
      return false;
    }
    
    const updated = { ...current, ...updates };
    return setItem(key, updated);
  } catch (error) {
    console.error(`❌ Error updating item "${key}":`, error);
    return false;
  }
};

/**
 * Xóa nhiều items cùng lúc
 * @param {string[]} keys - array of keys to remove
 * @returns {number} số lượng items đã xóa thành công
 */
export const removeItems = (keys) => {
  let count = 0;
  keys.forEach(key => {
    if (removeItem(key)) count++;
  });
  return count;
};

/**
 * Kiểm tra localStorage có available không
 * @returns {boolean}
 */
export const isLocalStorageAvailable = () => {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

// Export default object
export default {
  get: getItem,
  set: setItem,
  remove: removeItem,
  clear,
  has: hasItem,
  update: updateItem,
  getKeysByPrefix,
  getStorageSize,
  removeItems,
  isAvailable: isLocalStorageAvailable,
};