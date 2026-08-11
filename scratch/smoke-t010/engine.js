import {
  Awareness,
  Doc,
  Observable,
  ObservableV2,
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet,
  __publicField,
  applyAwarenessUpdate,
  applyUpdate,
  create,
  create2,
  createDecoder,
  createEncoder,
  encodeAwarenessUpdate,
  encodeStateAsUpdate,
  getUnixTime,
  isNode,
  length,
  map,
  messageYjsSyncStep2,
  min,
  pow,
  publish,
  readSyncMessage,
  readVarString,
  readVarUint,
  readVarUint8Array,
  removeAwarenessStates,
  subscribe,
  toUint8Array,
  transact,
  unsubscribe,
  writeSyncStep1,
  writeSyncStep2,
  writeUpdate,
  writeVarUint,
  writeVarUint8Array
} from "./chunk-44WNAXV3.js";

// ../../node_modules/.pnpm/y-protocols@1.0.7_yjs@13.6.32/node_modules/y-protocols/auth.js
var messagePermissionDenied = 0;
var readAuthMessage = (decoder, y, permissionDeniedHandler2) => {
  switch (readVarUint(decoder)) {
    case messagePermissionDenied:
      permissionDeniedHandler2(y, readVarString(decoder));
  }
};

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/url.js
var encodeQueryParams = (params) => map(params, (val, key) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join("&");

// ../../node_modules/.pnpm/y-websocket@3.1.0_yjs@13.6.32/node_modules/y-websocket/src/y-websocket.js
var messageSync = 0;
var messageQueryAwareness = 3;
var messageAwareness = 1;
var messageAuth = 2;
var messageHandlers = [];
messageHandlers[messageSync] = (encoder, decoder, provider, emitSynced, _messageType) => {
  writeVarUint(encoder, messageSync);
  const syncMessageType = readSyncMessage(
    decoder,
    encoder,
    provider.doc,
    provider
  );
  if (emitSynced && syncMessageType === messageYjsSyncStep2 && !provider.synced) {
    provider.synced = true;
  }
};
messageHandlers[messageQueryAwareness] = (encoder, _decoder, provider, _emitSynced, _messageType) => {
  writeVarUint(encoder, messageAwareness);
  writeVarUint8Array(
    encoder,
    encodeAwarenessUpdate(
      provider.awareness,
      Array.from(provider.awareness.getStates().keys())
    )
  );
};
messageHandlers[messageAwareness] = (_encoder, decoder, provider, _emitSynced, _messageType) => {
  applyAwarenessUpdate(
    provider.awareness,
    readVarUint8Array(decoder),
    provider
  );
};
messageHandlers[messageAuth] = (_encoder, decoder, provider, _emitSynced, _messageType) => {
  readAuthMessage(
    decoder,
    provider.doc,
    (_ydoc, reason) => permissionDeniedHandler(provider, reason)
  );
};
var messageReconnectTimeout = 3e4;
var permissionDeniedHandler = (provider, reason) => console.warn(`Permission denied to access ${provider.url}.
${reason}`);
var readMessage = (provider, buf, emitSynced) => {
  const decoder = createDecoder(buf);
  const encoder = createEncoder();
  const messageType = readVarUint(decoder);
  const messageHandler = provider.messageHandlers[messageType];
  if (
    /** @type {any} */
    messageHandler
  ) {
    messageHandler(encoder, decoder, provider, emitSynced, messageType);
  } else {
    console.error("Unable to compute message");
  }
  return encoder;
};
var defaultShouldReconnect = (event) => !(event.code >= 4400 && event.code < 4500);
var closeWebsocketConnection = (provider, ws, event) => {
  if (ws !== null && ws === provider.ws) {
    provider.emit("connection-close", [event, provider]);
    provider.ws = null;
    ws.onmessage = null;
    ws.onopen = null;
    ws.onclose = null;
    ws.onerror = () => {
    };
    ws.close();
    provider.wsconnecting = false;
    if (provider.wsconnected) {
      provider.wsconnected = false;
      provider.synced = false;
      removeAwarenessStates(
        provider.awareness,
        Array.from(provider.awareness.getStates().keys()).filter(
          (client) => client !== provider.doc.clientID
        ),
        provider
      );
      provider.emit("status", [{
        status: "disconnected"
      }]);
    }
    provider.wsUnsuccessfulReconnects++;
    let terminalClose = null;
    if (event != null && !provider.shouldReconnect(event, provider)) {
      provider.shouldConnect = false;
      terminalClose = { code: event.code, reason: event.reason };
    }
    setTimeout(
      setupWS,
      min(
        pow(2, provider.wsUnsuccessfulReconnects) * 100,
        provider.maxBackoffTime
      ),
      provider
    );
    if (terminalClose !== null) {
      provider.emit("closed", [terminalClose, provider]);
    }
  }
};
var setupWS = (provider) => {
  if (provider.shouldConnect && provider.ws === null) {
    const websocket = new provider._WS(provider.url, provider.protocols);
    websocket.binaryType = "arraybuffer";
    provider.ws = websocket;
    provider.wsconnecting = true;
    provider.wsconnected = false;
    provider.synced = false;
    websocket.onmessage = (event) => {
      if (provider.ws !== websocket) return;
      provider.wsLastMessageReceived = getUnixTime();
      const encoder = readMessage(provider, new Uint8Array(event.data), true);
      if (length(encoder) > 1) {
        websocket.send(toUint8Array(encoder));
      }
    };
    websocket.onerror = (event) => {
      if (provider.ws !== websocket) return;
      provider.emit("connection-error", [event, provider]);
    };
    websocket.onclose = (event) => {
      closeWebsocketConnection(provider, websocket, event);
    };
    websocket.onopen = () => {
      if (provider.ws !== websocket) return;
      provider.wsLastMessageReceived = getUnixTime();
      provider.wsconnecting = false;
      provider.wsconnected = true;
      provider.emit("status", [{
        status: "connected"
      }]);
      const encoder = createEncoder();
      writeVarUint(encoder, messageSync);
      writeSyncStep1(encoder, provider.doc);
      websocket.send(toUint8Array(encoder));
      if (provider.awareness.getLocalState() !== null) {
        const encoderAwarenessState = createEncoder();
        writeVarUint(encoderAwarenessState, messageAwareness);
        writeVarUint8Array(
          encoderAwarenessState,
          encodeAwarenessUpdate(provider.awareness, [
            provider.doc.clientID
          ])
        );
        websocket.send(toUint8Array(encoderAwarenessState));
      }
    };
    provider.emit("status", [{
      status: "connecting"
    }]);
  }
};
var broadcastMessage = (provider, buf) => {
  const ws = provider.ws;
  if (provider.wsconnected && ws && ws.readyState === ws.OPEN) {
    ws.send(buf);
  }
  if (provider.bcconnected) {
    publish(provider.bcChannel, buf, provider);
  }
};
var WebsocketProvider = class extends ObservableV2 {
  /**
   * @param {string} serverUrl
   * @param {string} roomname
   * @param {Y.Doc} doc
   * @param {object} opts
   * @param {boolean} [opts.connect]
   * @param {awarenessProtocol.Awareness} [opts.awareness]
   * @param {Object<string,string>} [opts.params] specify url parameters
   * @param {Array<string>} [opts.protocols] specify websocket protocols
   * @param {typeof WebSocket} [opts.WebSocketPolyfill] Optionall provide a WebSocket polyfill
   * @param {number} [opts.resyncInterval] Request server state every `resyncInterval` milliseconds
   * @param {number} [opts.maxBackoffTime] Maximum amount of time to wait before trying to reconnect (we try to reconnect using exponential backoff)
   * @param {boolean} [opts.disableBc] Disable cross-tab BroadcastChannel communication
   * @param {(event: CloseEvent, provider: WebsocketProvider) => boolean} [opts.shouldReconnect] Decide whether to reconnect after the server closed the connection. By default, close codes in the 4400-4499 range are permanent - we stop reconnecting and emit a `closed` event. This is never called for connections that were closed locally (e.g. via `provider.disconnect()`).
   */
  constructor(serverUrl, roomname, doc, {
    connect = true,
    awareness = new Awareness(doc),
    params = {},
    protocols = [],
    WebSocketPolyfill = WebSocket,
    resyncInterval = -1,
    maxBackoffTime = 2500,
    disableBc = false,
    shouldReconnect = defaultShouldReconnect
  } = {}) {
    super();
    while (serverUrl[serverUrl.length - 1] === "/") {
      serverUrl = serverUrl.slice(0, serverUrl.length - 1);
    }
    this.serverUrl = serverUrl;
    this.bcChannel = serverUrl + "/" + roomname;
    this.maxBackoffTime = maxBackoffTime;
    this.shouldReconnect = shouldReconnect;
    this.params = params;
    this.protocols = protocols;
    this.roomname = roomname;
    this.doc = doc;
    this._WS = WebSocketPolyfill;
    this.awareness = awareness;
    this.wsconnected = false;
    this.wsconnecting = false;
    this.bcconnected = false;
    this.disableBc = disableBc;
    this.wsUnsuccessfulReconnects = 0;
    this.messageHandlers = messageHandlers.slice();
    this._synced = false;
    this.ws = null;
    this.wsLastMessageReceived = 0;
    this.shouldConnect = connect;
    this._resyncInterval = 0;
    if (resyncInterval > 0) {
      this._resyncInterval = /** @type {any} */
      setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const encoder = createEncoder();
          writeVarUint(encoder, messageSync);
          writeSyncStep1(encoder, doc);
          this.ws.send(toUint8Array(encoder));
        }
      }, resyncInterval);
    }
    this._bcSubscriber = (data, origin) => {
      if (origin !== this) {
        const encoder = readMessage(this, new Uint8Array(data), false);
        if (length(encoder) > 1) {
          publish(this.bcChannel, toUint8Array(encoder), this);
        }
      }
    };
    this._updateHandler = (update, origin) => {
      if (origin !== this) {
        const encoder = createEncoder();
        writeVarUint(encoder, messageSync);
        writeUpdate(encoder, update);
        broadcastMessage(this, toUint8Array(encoder));
      }
    };
    this.doc.on("update", this._updateHandler);
    this._awarenessUpdateHandler = ({ added, updated, removed }, _origin) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = createEncoder();
      writeVarUint(encoder, messageAwareness);
      writeVarUint8Array(
        encoder,
        encodeAwarenessUpdate(awareness, changedClients)
      );
      broadcastMessage(this, toUint8Array(encoder));
    };
    this._exitHandler = () => {
      removeAwarenessStates(
        this.awareness,
        [doc.clientID],
        "app closed"
      );
    };
    if (isNode && typeof process !== "undefined") {
      process.on("exit", this._exitHandler);
    }
    awareness.on("update", this._awarenessUpdateHandler);
    this._checkInterval = /** @type {any} */
    setInterval(() => {
      if (this.wsconnected && messageReconnectTimeout < getUnixTime() - this.wsLastMessageReceived) {
        closeWebsocketConnection(
          this,
          /** @type {WebSocket} */
          this.ws,
          null
        );
      }
    }, messageReconnectTimeout / 10);
    if (connect) {
      this.connect();
    }
  }
  get url() {
    const encodedParams = encodeQueryParams(this.params);
    return this.serverUrl + "/" + this.roomname + (encodedParams.length === 0 ? "" : "?" + encodedParams);
  }
  /**
   * @type {boolean}
   */
  get synced() {
    return this._synced;
  }
  set synced(state) {
    if (this._synced !== state) {
      this._synced = state;
      if (state) {
        this.wsUnsuccessfulReconnects = 0;
      }
      this.emit("synced", [state]);
      this.emit("sync", [state]);
    }
  }
  destroy() {
    if (this._resyncInterval !== 0) {
      clearInterval(this._resyncInterval);
    }
    clearInterval(this._checkInterval);
    this.disconnect();
    if (isNode && typeof process !== "undefined") {
      process.off("exit", this._exitHandler);
    }
    this.awareness.off("update", this._awarenessUpdateHandler);
    this.doc.off("update", this._updateHandler);
    super.destroy();
  }
  connectBc() {
    if (this.disableBc) {
      return;
    }
    if (!this.bcconnected) {
      subscribe(this.bcChannel, this._bcSubscriber);
      this.bcconnected = true;
    }
    const encoderSync = createEncoder();
    writeVarUint(encoderSync, messageSync);
    writeSyncStep1(encoderSync, this.doc);
    publish(this.bcChannel, toUint8Array(encoderSync), this);
    const encoderState = createEncoder();
    writeVarUint(encoderState, messageSync);
    writeSyncStep2(encoderState, this.doc);
    publish(this.bcChannel, toUint8Array(encoderState), this);
    const encoderAwarenessQuery = createEncoder();
    writeVarUint(encoderAwarenessQuery, messageQueryAwareness);
    publish(
      this.bcChannel,
      toUint8Array(encoderAwarenessQuery),
      this
    );
    const encoderAwarenessState = createEncoder();
    writeVarUint(encoderAwarenessState, messageAwareness);
    writeVarUint8Array(
      encoderAwarenessState,
      encodeAwarenessUpdate(this.awareness, [
        this.doc.clientID
      ])
    );
    publish(
      this.bcChannel,
      toUint8Array(encoderAwarenessState),
      this
    );
  }
  disconnectBc() {
    const encoder = createEncoder();
    writeVarUint(encoder, messageAwareness);
    writeVarUint8Array(
      encoder,
      encodeAwarenessUpdate(this.awareness, [
        this.doc.clientID
      ], /* @__PURE__ */ new Map())
    );
    broadcastMessage(this, toUint8Array(encoder));
    if (this.bcconnected) {
      unsubscribe(this.bcChannel, this._bcSubscriber);
      this.bcconnected = false;
    }
  }
  disconnect() {
    this.shouldConnect = false;
    this.disconnectBc();
    if (this.ws !== null) {
      closeWebsocketConnection(this, this.ws, null);
    }
  }
  connect() {
    this.shouldConnect = true;
    if (!this.wsconnected && this.ws === null) {
      setupWS(this);
      this.connectBc();
    }
  }
};

// ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/indexeddb.js
var rtop = (request) => create2((resolve, reject) => {
  request.onerror = (event) => reject(new Error(event.target.error));
  request.onsuccess = (event) => resolve(event.target.result);
});
var openDB = (name, initDB) => create2((resolve, reject) => {
  const request = indexedDB.open(name);
  request.onupgradeneeded = (event) => initDB(event.target.result);
  request.onerror = (event) => reject(create(event.target.error));
  request.onsuccess = (event) => {
    const db = event.target.result;
    db.onversionchange = () => {
      db.close();
    };
    resolve(db);
  };
});
var deleteDB = (name) => rtop(indexedDB.deleteDatabase(name));
var createStores = (db, definitions) => definitions.forEach(
  (d) => (
    // @ts-ignore
    db.createObjectStore.apply(db, d)
  )
);
var transact2 = (db, stores, access = "readwrite") => {
  const transaction = db.transaction(stores, access);
  return stores.map((store) => getStore(transaction, store));
};
var count = (store, range) => rtop(store.count(range));
var get = (store, key) => rtop(store.get(key));
var del = (store, key) => rtop(store.delete(key));
var put = (store, item, key) => rtop(store.put(item, key));
var addAutoKey = (store, item) => rtop(store.add(item));
var getAll = (store, range, limit) => rtop(store.getAll(range, limit));
var queryFirst = (store, query, direction) => {
  let first = null;
  return iterateKeys(store, query, (key) => {
    first = key;
    return false;
  }, direction).then(() => first);
};
var getLastKey = (store, range = null) => queryFirst(store, range, "prev");
var iterateOnRequest = (request, f) => create2((resolve, reject) => {
  request.onerror = reject;
  request.onsuccess = async (event) => {
    const cursor = event.target.result;
    if (cursor === null || await f(cursor) === false) {
      return resolve();
    }
    cursor.continue();
  };
});
var iterateKeys = (store, keyrange, f, direction = "next") => iterateOnRequest(store.openKeyCursor(keyrange, direction), (cursor) => f(cursor.key));
var getStore = (t, store) => t.objectStore(store);
var createIDBKeyRangeUpperBound = (upper, upperOpen) => IDBKeyRange.upperBound(upper, upperOpen);
var createIDBKeyRangeLowerBound = (lower, lowerOpen) => IDBKeyRange.lowerBound(lower, lowerOpen);

// ../../node_modules/.pnpm/y-indexeddb@9.0.12_yjs@13.6.32/node_modules/y-indexeddb/src/y-indexeddb.js
var customStoreName = "custom";
var updatesStoreName = "updates";
var PREFERRED_TRIM_SIZE = 500;
var fetchUpdates = (idbPersistence, beforeApplyUpdatesCallback = () => {
}, afterApplyUpdatesCallback = () => {
}) => {
  const [updatesStore] = transact2(
    /** @type {IDBDatabase} */
    idbPersistence.db,
    [updatesStoreName]
  );
  return getAll(updatesStore, createIDBKeyRangeLowerBound(idbPersistence._dbref, false)).then((updates) => {
    if (!idbPersistence._destroyed) {
      beforeApplyUpdatesCallback(updatesStore);
      transact(idbPersistence.doc, () => {
        updates.forEach((val) => applyUpdate(idbPersistence.doc, val));
      }, idbPersistence, false);
      afterApplyUpdatesCallback(updatesStore);
    }
  }).then(() => getLastKey(updatesStore).then((lastKey) => {
    idbPersistence._dbref = lastKey + 1;
  })).then(() => count(updatesStore).then((cnt) => {
    idbPersistence._dbsize = cnt;
  })).then(() => updatesStore);
};
var storeState = (idbPersistence, forceStore = true) => fetchUpdates(idbPersistence).then((updatesStore) => {
  if (forceStore || idbPersistence._dbsize >= PREFERRED_TRIM_SIZE) {
    addAutoKey(updatesStore, encodeStateAsUpdate(idbPersistence.doc)).then(() => del(updatesStore, createIDBKeyRangeUpperBound(idbPersistence._dbref, true))).then(() => count(updatesStore).then((cnt) => {
      idbPersistence._dbsize = cnt;
    }));
  }
});
var IndexeddbPersistence = class extends Observable {
  /**
   * @param {string} name
   * @param {Y.Doc} doc
   */
  constructor(name, doc) {
    super();
    this.doc = doc;
    this.name = name;
    this._dbref = 0;
    this._dbsize = 0;
    this._destroyed = false;
    this.db = null;
    this.synced = false;
    this._db = openDB(
      name,
      (db) => createStores(db, [
        ["updates", { autoIncrement: true }],
        ["custom"]
      ])
    );
    this.whenSynced = create2((resolve) => this.on("synced", () => resolve(this)));
    this._db.then((db) => {
      this.db = db;
      const beforeApplyUpdatesCallback = (updatesStore) => addAutoKey(updatesStore, encodeStateAsUpdate(doc));
      const afterApplyUpdatesCallback = () => {
        if (this._destroyed) return this;
        this.synced = true;
        this.emit("synced", [this]);
      };
      fetchUpdates(this, beforeApplyUpdatesCallback, afterApplyUpdatesCallback);
    });
    this._storeTimeout = 1e3;
    this._storeTimeoutId = null;
    this._storeUpdate = (update, origin) => {
      if (this.db && origin !== this) {
        const [updatesStore] = transact2(
          /** @type {IDBDatabase} */
          this.db,
          [updatesStoreName]
        );
        addAutoKey(updatesStore, update);
        if (++this._dbsize >= PREFERRED_TRIM_SIZE) {
          if (this._storeTimeoutId !== null) {
            clearTimeout(this._storeTimeoutId);
          }
          this._storeTimeoutId = setTimeout(() => {
            storeState(this, false);
            this._storeTimeoutId = null;
          }, this._storeTimeout);
        }
      }
    };
    doc.on("update", this._storeUpdate);
    this.destroy = this.destroy.bind(this);
    doc.on("destroy", this.destroy);
  }
  destroy() {
    if (this._storeTimeoutId) {
      clearTimeout(this._storeTimeoutId);
    }
    this.doc.off("update", this._storeUpdate);
    this.doc.off("destroy", this.destroy);
    this._destroyed = true;
    return this._db.then((db) => {
      db.close();
    });
  }
  /**
   * Destroys this instance and removes all data from indexeddb.
   *
   * @return {Promise<void>}
   */
  clearData() {
    return this.destroy().then(() => {
      deleteDB(this.name);
    });
  }
  /**
   * @param {String | number | ArrayBuffer | Date} key
   * @return {Promise<String | number | ArrayBuffer | Date | any>}
   */
  get(key) {
    return this._db.then((db) => {
      const [custom] = transact2(db, [customStoreName], "readonly");
      return get(custom, key);
    });
  }
  /**
   * @param {String | number | ArrayBuffer | Date} key
   * @param {String | number | ArrayBuffer | Date} value
   * @return {Promise<String | number | ArrayBuffer | Date>}
   */
  set(key, value) {
    return this._db.then((db) => {
      const [custom] = transact2(db, [customStoreName]);
      return put(custom, value, key);
    });
  }
  /**
   * @param {String | number | ArrayBuffer | Date} key
   * @return {Promise<undefined>}
   */
  del(key) {
    return this._db.then((db) => {
      const [custom] = transact2(db, [customStoreName]);
      return del(custom, key);
    });
  }
};

// src/engine.ts
var inBrowser = typeof indexedDB !== "undefined";
var hasWebRTC = typeof RTCPeerConnection !== "undefined";
var _idb, _websocket, _webrtc, _webrtcPending, _wsStatus, _rtcConnected, _status, _statusListeners, _left, _SpoolEngine_instances, deriveStatus_fn;
var SpoolEngine = class {
  constructor(opts) {
    __privateAdd(this, _SpoolEngine_instances);
    __publicField(this, "code");
    __publicField(this, "doc");
    __publicField(this, "whenReady");
    __privateAdd(this, _idb, null);
    __privateAdd(this, _websocket, null);
    __privateAdd(this, _webrtc, null);
    __privateAdd(this, _webrtcPending, Promise.resolve());
    __privateAdd(this, _wsStatus, "disconnected");
    __privateAdd(this, _rtcConnected, false);
    __privateAdd(this, _status, "offline");
    __privateAdd(this, _statusListeners, /* @__PURE__ */ new Set());
    __privateAdd(this, _left, false);
    this.code = opts.code;
    this.doc = new Doc();
    const persist = opts.persist ?? inBrowser;
    if (persist) {
      if (!inBrowser) throw new Error("persist requires IndexedDB; pass persist: false outside browsers");
      __privateSet(this, _idb, new IndexeddbPersistence(opts.code, this.doc));
      const idb = __privateGet(this, _idb);
      this.whenReady = idb.synced ? Promise.resolve() : new Promise((resolve) => idb.once("synced", () => resolve()));
    } else {
      this.whenReady = Promise.resolve();
    }
    if (opts.relay) {
      __privateSet(this, _websocket, new WebsocketProvider(opts.relay, opts.code, this.doc, {
        resyncInterval: opts.resyncIntervalMs ?? 2e4,
        disableBc: opts.disableBc ?? false,
        ...opts.WebSocketPolyfill ? { WebSocketPolyfill: opts.WebSocketPolyfill } : {}
      }));
      __privateGet(this, _websocket).on("status", ({ status }) => {
        __privateSet(this, _wsStatus, status === "connected" ? "connected" : status === "connecting" ? "connecting" : "disconnected");
        __privateMethod(this, _SpoolEngine_instances, deriveStatus_fn).call(this);
      });
    }
    const webrtc = opts.webrtc ?? hasWebRTC;
    if (webrtc && opts.signaling?.length) {
      __privateSet(this, _webrtcPending, import("./y-webrtc-UVNV6M4L.js").then(({ WebrtcProvider }) => {
        if (__privateGet(this, _left)) return;
        __privateSet(this, _webrtc, new WebrtcProvider(opts.code, this.doc, {
          signaling: opts.signaling,
          // one awareness across both transports (fosho sync.ts:1032)
          ...__privateGet(this, _websocket) ? { awareness: __privateGet(this, _websocket).awareness } : {}
        }));
        __privateGet(this, _webrtc).on("status", ({ connected }) => {
          __privateSet(this, _rtcConnected, connected);
          __privateMethod(this, _SpoolEngine_instances, deriveStatus_fn).call(this);
        });
      }));
    }
  }
  get status() {
    return __privateGet(this, _status);
  }
  get awareness() {
    return __privateGet(this, _websocket)?.awareness ?? __privateGet(this, _webrtc)?.awareness ?? null;
  }
  onStatus(cb) {
    __privateGet(this, _statusListeners).add(cb);
    return () => __privateGet(this, _statusListeners).delete(cb);
  }
  /**
   * Disconnect and release resources. Local IndexedDB data is retained — a
   * spool is a keepsake. Teardown order per fosho disconnectFromNote:
   * webrtc → websocket → idb → doc.
   */
  async leave() {
    if (__privateGet(this, _left)) return;
    __privateSet(this, _left, true);
    await __privateGet(this, _webrtcPending);
    __privateGet(this, _webrtc)?.destroy();
    __privateGet(this, _websocket)?.destroy();
    await __privateGet(this, _idb)?.destroy();
    this.doc.destroy();
    __privateGet(this, _statusListeners).clear();
    if (__privateGet(this, _status) !== "offline") {
      __privateSet(this, _status, "offline");
    }
  }
};
_idb = new WeakMap();
_websocket = new WeakMap();
_webrtc = new WeakMap();
_webrtcPending = new WeakMap();
_wsStatus = new WeakMap();
_rtcConnected = new WeakMap();
_status = new WeakMap();
_statusListeners = new WeakMap();
_left = new WeakMap();
_SpoolEngine_instances = new WeakSet();
deriveStatus_fn = function() {
  const next = __privateGet(this, _wsStatus) === "connected" || __privateGet(this, _rtcConnected) ? "connected" : __privateGet(this, _wsStatus) === "connecting" ? "connecting" : "offline";
  if (next !== __privateGet(this, _status)) {
    __privateSet(this, _status, next);
    for (const cb of __privateGet(this, _statusListeners)) cb(next);
  }
};
export {
  SpoolEngine
};
