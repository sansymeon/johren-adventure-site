/* Local scenes and test photographs. IndexedDB only. Nothing is uploaded. */
(function () {
  const DB_NAME = "turbo-adventures-studio";
  const DB_VERSION = 1;

  let dbPromise = null;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains("scenes")) {
          db.createObjectStore("scenes", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("uploads")) {
          db.createObjectStore("uploads", { keyPath: "id" });
        }
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () {
        dbPromise = null;
        reject(request.error);
      };
    });
    return dbPromise;
  }

  function withStore(name, mode, fn) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        const tx = db.transaction(name, mode);
        const store = tx.objectStore(name);
        let result;
        let pending = null;
        try {
          pending = fn(store);
        } catch (error) {
          reject(error);
          return;
        }
        if (pending && typeof pending.onsuccess === "object" || (pending && "result" in pending && typeof pending.addEventListener === "function")) {
          pending.onsuccess = function () { result = pending.result; };
          pending.onerror = function () { reject(pending.error); };
        }
        tx.oncomplete = function () { resolve(result); };
        tx.onerror = function () { reject(tx.error); };
        tx.onabort = function () { reject(tx.error || new Error("Storage transaction aborted")); };
      });
    });
  }

  const TASStore = {
    listScenes: function () {
      return withStore("scenes", "readonly", function (store) {
        return store.getAll();
      }).then(function (rows) {
        return (rows || []).sort(function (a, b) { return b.updated - a.updated; });
      });
    },
    saveScene: function (scene) {
      return withStore("scenes", "readwrite", function (store) {
        store.put(scene);
      });
    },
    deleteScene: function (id) {
      return withStore("scenes", "readwrite", function (store) {
        store.delete(id);
      });
    },
    listUploads: function () {
      return withStore("uploads", "readonly", function (store) {
        return store.getAll();
      }).then(function (rows) {
        return (rows || []).sort(function (a, b) { return b.created - a.created; });
      });
    },
    saveUpload: function (upload) {
      return withStore("uploads", "readwrite", function (store) {
        store.put(upload);
      });
    },
    deleteUpload: function (id) {
      return withStore("uploads", "readwrite", function (store) {
        store.delete(id);
      });
    }
  };

  window.TASStore = TASStore;
})();
