/**
 * @description
 * This is a plugin for IndexedDB
 * @property {string} dbName - database name
 * @property {number} dbVersion - database version
 * @property {string} storeName - store name
 * @method addLocalData - add local data
 * @method getLocalData - get local data
 * @method updateLocalData - update local data
 * @method deleteLocalData - delete local data
 * @method clearLocalData - clear local data
 * @method getAllLocalData - get all local data
 */

class IndexDataBaseProxy {
  #db;
  #dbOpen;
  #dbData;
  #tx;
  #dbName;
  #dbVersion;
  #storeName;
  #idDB;
  constructor(dbName, dbVersion, storeName) {
    if (!dbName) {
      throw new Error('dbName is required');
    }

    if (!dbVersion) {
      throw new Error('dbVersion is required');
    }

    if (typeof dbVersion !== 'number') {
      throw new Error('dbVersion must be a number');
    }

    if (typeof dbName !== 'string') {
      throw new Error('dbName must be a string');
    }

    if (!storeName) {
      throw new Error('storeName is required');
    }

    if (typeof storeName !== 'string') {
      throw new Error('storeName must be a string');
    }

    this.#dbName = dbName;
    this.#dbVersion = dbVersion;
    this.#storeName = storeName;
    this.#db = indexedDB.open(this.#dbName, this.#dbVersion);
    this.#dbOpen = this.#db;
    this.#dbOpen.onupgradeneeded = this.#onUpgradeNeeded.bind(this);
    this.#dbOpen.onsuccess = this.#onSuccess.bind(this);
    this.#dbOpen.onerror = this.#onError.bind(this);
  }

  #onUpgradeNeeded(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains(this.#storeName)) {
      db.createObjectStore(this.#storeName, { keyPath: 'id' });
    }
  }

  #onError(event) {
    console.error(event);
  }

  #onSuccess(event) {
    this.#dbData = event.target.result;
  }

  #onComplete(event) {
    this.#dbData = event.target.result;
    if (this.#idDB) {
      this.#idDB.close();
    }
  }

  #onAbort(event) {
    this.#dbData = event.target.result;
    if (this.#idDB) {
      this.#idDB.close();
    }
  }

  async #transaction(data, processType) {
    try {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (this.#dbData) {
            clearInterval(interval);
            this.#idDB = this.#dbData;
            this.#tx = this.#idDB.transaction(this.#storeName, 'readwrite');
            const store = this.#tx.objectStore(this.#storeName);
            const request = store[processType](data);
            request.onsuccess = (event) => {
              resolve(event.target.result);
              this.#idDB.close();
            };
            request.onerror = this.#onError.bind(this);
            this.#tx.onerror = this.#onError.bind(this);
            this.#tx.oncomplete = this.#onComplete.bind(this);
            this.#tx.onabort = this.#onAbort.bind(this);
          }
        }, 1000);

        //clear the interval
        setTimeout(() => {
          if (!this.#idDB) {
            clearInterval(interval);
            reject(new Error('Timeout'));
          }
        }, 2000);
      });
    } catch (error) {
      console.log(error);
    }
  }

  //add local data
  async addLocalData(data) {
    if (!data) {
      throw new Error('data is required');
    }

    if (typeof data !== 'object') {
      throw new Error('data must be an object');
    }
    return await this.#transaction(data, 'add');
  }

  //get local data
  async getLocalData(id) {
    return await this.#transaction(id, 'get');
  }
  //update local data
  async updateLocalData(data) {
    if (!data) {
      throw new Error('data is required');
    }

    if (typeof data !== 'object') {
      throw new Error('data must be an object');
    }
    return await this.#transaction(data, 'put');
  }
  //delete local data
  async deleteLocalData(id) {
    return await this.#transaction(id, 'delete');
  }
  //clear local data
  async clearLocalData() {
    return await this.#transaction(null, 'clear');
  }
  //get all local data
  async getAllLocalData() {
    return await this.#transaction(null, 'getAll');
  }
  //create index
  async createIndex(indexName, keyPath, options) {
    if (!indexName) {
      throw new Error('indexName is required');
    }

    if (typeof indexName !== 'string') {
      throw new Error('indexName must be a string');
    }

    if (!keyPath) {
      throw new Error('keyPath is required');
    }

    if (typeof keyPath !== 'string') {
      throw new Error('keyPath must be a string');
    }

    if (options && typeof options !== 'object') {
      throw new Error('options must be an object');
    }

    return await this.#transaction(
      { indexName, keyPath, options },
      'createIndex'
    );
  }
}

const IndexDataBase = new Proxy(IndexDataBaseProxy, {
  construct(target, args) {
    const instance = new target(...args);
    const handler = {
      get(target, property, receiver) {
        const value = Reflect.get(target, property, receiver);
        if (typeof value === 'function') {
          return function (...args) {
            return value.apply(instance, args);
          };
        }
        return value;
      },
      set(target, property, value, receiver) {
        return Reflect.set(target, property, value, receiver);
      },
    };

    return new Proxy(instance, handler);
  },
});

export default IndexDataBase;
