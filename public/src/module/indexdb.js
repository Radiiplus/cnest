let db = null;

async function openDB(dbName, storeName) {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName, 1);
        req.onerror = (event) => reject(event.target.error);
        req.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        req.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
                
            } else {
            }
        };
    });
}

async function ensureConn(dbName, storeName) {
    if (!db) {
        await openDB(dbName, storeName);
    }
}

async function runOp(op) {
    await ensureConn(op.dbName, op.storeName);
    try {
        return await op.fn(db);
    } catch (error) {
        throw error;
    }
}

async function putItem(dbName, storeName, item) {
    return runOp({
        dbName,
        storeName,
        fn: (db) => new Promise((resolve, reject) => {
            const txn = db.transaction([storeName], 'readwrite');
            const store = txn.objectStore(storeName);
            const req = store.put(item);
            req.onerror = (event) => reject(event.target.error);
            req.onsuccess = () => resolve();
        })
    });
}

async function getItem(dbName, storeName, id) {
    return runOp({
        dbName,
        storeName,
        fn: (db) => new Promise((resolve, reject) => {
            const txn = db.transaction([storeName], 'readonly');
            const store = txn.objectStore(storeName);
            const req = store.get(id);
            req.onerror = (event) => reject(event.target.error);
            req.onsuccess = (event) => resolve(event.target.result);
        })
    });
}

async function delItem(dbName, storeName, id) {
    return runOp({
        dbName,
        storeName,
        fn: (db) => new Promise((resolve, reject) => {
            const txn = db.transaction([storeName], 'readwrite');
            const store = txn.objectStore(storeName);
            const req = store.delete(id);
            req.onerror = (event) => reject(event.target.error);
            req.onsuccess = () => resolve();
        })
    });
}

async function listItems(dbName, storeName) {
    return runOp({
        dbName,
        storeName,
        fn: (db) => new Promise((resolve, reject) => {
            const txn = db.transaction([storeName], 'readonly');
            const store = txn.objectStore(storeName);
            const allItems = [];
            
            const req = store.openCursor();
            
            req.onerror = (event) => reject(event.target.error);
            
            req.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    allItems.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(allItems);
                }
            };
        })
    });
}

export { putItem, getItem, delItem, listItems };