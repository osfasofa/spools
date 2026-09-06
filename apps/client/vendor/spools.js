"use strict";
var spools = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all2) => {
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };
  var __copyProps = (to, from2, except, desc) => {
    if (from2 && typeof from2 === "object" || typeof from2 === "function") {
      for (let key of __getOwnPropNames(from2))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet(obj, member, value, setter);
    },
    get _() {
      return __privateGet(obj, member, getter);
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/map.js
  var create, copy, setIfUndefined, map, any;
  var init_map = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/map.js"() {
      "use strict";
      create = () => /* @__PURE__ */ new Map();
      copy = (m) => {
        const r = create();
        m.forEach((v, k) => {
          r.set(k, v);
        });
        return r;
      };
      setIfUndefined = (map3, key, createT) => {
        let set = map3.get(key);
        if (set === void 0) {
          map3.set(key, set = createT());
        }
        return set;
      };
      map = (m, f) => {
        const res = [];
        for (const [key, value] of m) {
          res.push(f(value, key));
        }
        return res;
      };
      any = (m, f) => {
        for (const [key, value] of m) {
          if (f(value, key)) {
            return true;
          }
        }
        return false;
      };
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/set.js
  var create2;
  var init_set = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/set.js"() {
      "use strict";
      create2 = () => /* @__PURE__ */ new Set();
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/array.js
  var last, appendTo, from, every, some, unfold, isArray;
  var init_array = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/array.js"() {
      "use strict";
      last = (arr) => arr[arr.length - 1];
      appendTo = (dest, src) => {
        for (let i = 0; i < src.length; i++) {
          dest.push(src[i]);
        }
      };
      from = Array.from;
      every = (arr, f) => {
        for (let i = 0; i < arr.length; i++) {
          if (!f(arr[i], i, arr)) {
            return false;
          }
        }
        return true;
      };
      some = (arr, f) => {
        for (let i = 0; i < arr.length; i++) {
          if (f(arr[i], i, arr)) {
            return true;
          }
        }
        return false;
      };
      unfold = (len, f) => {
        const array = new Array(len);
        for (let i = 0; i < len; i++) {
          array[i] = f(i, array);
        }
        return array;
      };
      isArray = Array.isArray;
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/observable.js
  var ObservableV2, Observable;
  var init_observable = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/observable.js"() {
      "use strict";
      init_map();
      init_set();
      init_array();
      ObservableV2 = class {
        constructor() {
          this._observers = create();
        }
        /**
         * @template {keyof EVENTS & string} NAME
         * @param {NAME} name
         * @param {EVENTS[NAME]} f
         */
        on(name, f) {
          setIfUndefined(
            this._observers,
            /** @type {string} */
            name,
            create2
          ).add(f);
          return f;
        }
        /**
         * @template {keyof EVENTS & string} NAME
         * @param {NAME} name
         * @param {EVENTS[NAME]} f
         */
        once(name, f) {
          const _f = (...args2) => {
            this.off(
              name,
              /** @type {any} */
              _f
            );
            f(...args2);
          };
          this.on(
            name,
            /** @type {any} */
            _f
          );
        }
        /**
         * @template {keyof EVENTS & string} NAME
         * @param {NAME} name
         * @param {EVENTS[NAME]} f
         */
        off(name, f) {
          const observers = this._observers.get(name);
          if (observers !== void 0) {
            observers.delete(f);
            if (observers.size === 0) {
              this._observers.delete(name);
            }
          }
        }
        /**
         * Emit a named event. All registered event listeners that listen to the
         * specified name will receive the event.
         *
         * @todo This should catch exceptions
         *
         * @template {keyof EVENTS & string} NAME
         * @param {NAME} name The event name.
         * @param {Parameters<EVENTS[NAME]>} args The arguments that are applied to the event listener.
         */
        emit(name, args2) {
          return from((this._observers.get(name) || create()).values()).forEach((f) => f(...args2));
        }
        destroy() {
          this._observers = create();
        }
      };
      Observable = class {
        constructor() {
          this._observers = create();
        }
        /**
         * @param {N} name
         * @param {function} f
         */
        on(name, f) {
          setIfUndefined(this._observers, name, create2).add(f);
        }
        /**
         * @param {N} name
         * @param {function} f
         */
        once(name, f) {
          const _f = (...args2) => {
            this.off(name, _f);
            f(...args2);
          };
          this.on(name, _f);
        }
        /**
         * @param {N} name
         * @param {function} f
         */
        off(name, f) {
          const observers = this._observers.get(name);
          if (observers !== void 0) {
            observers.delete(f);
            if (observers.size === 0) {
              this._observers.delete(name);
            }
          }
        }
        /**
         * Emit a named event. All registered event listeners that listen to the
         * specified name will receive the event.
         *
         * @todo This should catch exceptions
         *
         * @param {N} name The event name.
         * @param {Array<any>} args The arguments that are applied to the event listener.
         */
        emit(name, args2) {
          return from((this._observers.get(name) || create()).values()).forEach((f) => f(...args2));
        }
        destroy() {
          this._observers = create();
        }
      };
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/math.js
  var floor, abs, log10, min, max, isNaN2, pow, isNegativeZero;
  var init_math = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/math.js"() {
      "use strict";
      floor = Math.floor;
      abs = Math.abs;
      log10 = Math.log10;
      min = (a, b) => a < b ? a : b;
      max = (a, b) => a > b ? a : b;
      isNaN2 = Number.isNaN;
      pow = Math.pow;
      isNegativeZero = (n) => n !== 0 ? n < 0 : 1 / n < 0;
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/binary.js
  var BIT1, BIT2, BIT3, BIT4, BIT6, BIT7, BIT8, BIT18, BIT19, BIT20, BIT21, BIT22, BIT23, BIT24, BIT25, BIT26, BIT27, BIT28, BIT29, BIT30, BIT31, BIT32, BITS5, BITS6, BITS7, BITS17, BITS18, BITS19, BITS20, BITS21, BITS22, BITS23, BITS24, BITS25, BITS26, BITS27, BITS28, BITS29, BITS30, BITS31;
  var init_binary = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/binary.js"() {
      "use strict";
      BIT1 = 1;
      BIT2 = 2;
      BIT3 = 4;
      BIT4 = 8;
      BIT6 = 32;
      BIT7 = 64;
      BIT8 = 128;
      BIT18 = 1 << 17;
      BIT19 = 1 << 18;
      BIT20 = 1 << 19;
      BIT21 = 1 << 20;
      BIT22 = 1 << 21;
      BIT23 = 1 << 22;
      BIT24 = 1 << 23;
      BIT25 = 1 << 24;
      BIT26 = 1 << 25;
      BIT27 = 1 << 26;
      BIT28 = 1 << 27;
      BIT29 = 1 << 28;
      BIT30 = 1 << 29;
      BIT31 = 1 << 30;
      BIT32 = 1 << 31;
      BITS5 = 31;
      BITS6 = 63;
      BITS7 = 127;
      BITS17 = BIT18 - 1;
      BITS18 = BIT19 - 1;
      BITS19 = BIT20 - 1;
      BITS20 = BIT21 - 1;
      BITS21 = BIT22 - 1;
      BITS22 = BIT23 - 1;
      BITS23 = BIT24 - 1;
      BITS24 = BIT25 - 1;
      BITS25 = BIT26 - 1;
      BITS26 = BIT27 - 1;
      BITS27 = BIT28 - 1;
      BITS28 = BIT29 - 1;
      BITS29 = BIT30 - 1;
      BITS30 = BIT31 - 1;
      BITS31 = 2147483647;
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/number.js
  var MAX_SAFE_INTEGER, MIN_SAFE_INTEGER, LOWEST_INT32, isInteger, isNaN3, parseInt2;
  var init_number = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/number.js"() {
      "use strict";
      init_math();
      MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
      MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
      LOWEST_INT32 = 1 << 31;
      isInteger = Number.isInteger || ((num) => typeof num === "number" && isFinite(num) && floor(num) === num);
      isNaN3 = Number.isNaN;
      parseInt2 = Number.parseInt;
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/string.js
  var fromCharCode, fromCodePoint, MAX_UTF16_CHARACTER, toLowerCase, trimLeftRegex, trimLeft, fromCamelCaseRegex, fromCamelCase, _encodeUtf8Polyfill, utf8TextEncoder, _encodeUtf8Native, encodeUtf8, utf8TextDecoder, repeat;
  var init_string = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/string.js"() {
      "use strict";
      init_array();
      fromCharCode = String.fromCharCode;
      fromCodePoint = String.fromCodePoint;
      MAX_UTF16_CHARACTER = fromCharCode(65535);
      toLowerCase = (s) => s.toLowerCase();
      trimLeftRegex = /^\s*/g;
      trimLeft = (s) => s.replace(trimLeftRegex, "");
      fromCamelCaseRegex = /([A-Z])/g;
      fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, (match2) => `${separator}${toLowerCase(match2)}`));
      _encodeUtf8Polyfill = (str) => {
        const encodedString = unescape(encodeURIComponent(str));
        const len = encodedString.length;
        const buf = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          buf[i] = /** @type {number} */
          encodedString.codePointAt(i);
        }
        return buf;
      };
      utf8TextEncoder = /** @type {TextEncoder} */
      typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
      _encodeUtf8Native = (str) => utf8TextEncoder.encode(str);
      encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill;
      utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
      if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
        utf8TextDecoder = null;
      }
      repeat = (source, n) => unfold(n, () => source).join("");
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/encoding.js
  var Encoder, createEncoder, length, toUint8Array, verifyLen, write, writeUint8, writeVarUint, writeVarInt, _strBuffer, _maxStrBSize, _writeVarStringNative, _writeVarStringPolyfill, writeVarString, writeUint8Array, writeVarUint8Array, writeOnDataView, writeFloat32, writeFloat64, writeBigInt64, floatTestBed, isFloat32, writeAny, RleEncoder, flushUintOptRleEncoder, UintOptRleEncoder, flushIntDiffOptRleEncoder, IntDiffOptRleEncoder, StringEncoder;
  var init_encoding = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/encoding.js"() {
      "use strict";
      init_math();
      init_number();
      init_binary();
      init_string();
      init_array();
      Encoder = class {
        constructor() {
          this.cpos = 0;
          this.cbuf = new Uint8Array(100);
          this.bufs = [];
        }
      };
      createEncoder = () => new Encoder();
      length = (encoder) => {
        let len = encoder.cpos;
        for (let i = 0; i < encoder.bufs.length; i++) {
          len += encoder.bufs[i].length;
        }
        return len;
      };
      toUint8Array = (encoder) => {
        const uint8arr = new Uint8Array(length(encoder));
        let curPos = 0;
        for (let i = 0; i < encoder.bufs.length; i++) {
          const d = encoder.bufs[i];
          uint8arr.set(d, curPos);
          curPos += d.length;
        }
        uint8arr.set(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
        return uint8arr;
      };
      verifyLen = (encoder, len) => {
        const bufferLen = encoder.cbuf.length;
        if (bufferLen - encoder.cpos < len) {
          encoder.bufs.push(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos));
          encoder.cbuf = new Uint8Array(max(bufferLen, len) * 2);
          encoder.cpos = 0;
        }
      };
      write = (encoder, num) => {
        const bufferLen = encoder.cbuf.length;
        if (encoder.cpos === bufferLen) {
          encoder.bufs.push(encoder.cbuf);
          encoder.cbuf = new Uint8Array(bufferLen * 2);
          encoder.cpos = 0;
        }
        encoder.cbuf[encoder.cpos++] = num;
      };
      writeUint8 = write;
      writeVarUint = (encoder, num) => {
        while (num > BITS7) {
          write(encoder, BIT8 | BITS7 & num);
          num = floor(num / 128);
        }
        write(encoder, BITS7 & num);
      };
      writeVarInt = (encoder, num) => {
        const isNegative = isNegativeZero(num);
        if (isNegative) {
          num = -num;
        }
        write(encoder, (num > BITS6 ? BIT8 : 0) | (isNegative ? BIT7 : 0) | BITS6 & num);
        num = floor(num / 64);
        while (num > 0) {
          write(encoder, (num > BITS7 ? BIT8 : 0) | BITS7 & num);
          num = floor(num / 128);
        }
      };
      _strBuffer = new Uint8Array(3e4);
      _maxStrBSize = _strBuffer.length / 3;
      _writeVarStringNative = (encoder, str) => {
        if (str.length < _maxStrBSize) {
          const written = utf8TextEncoder.encodeInto(str, _strBuffer).written || 0;
          writeVarUint(encoder, written);
          for (let i = 0; i < written; i++) {
            write(encoder, _strBuffer[i]);
          }
        } else {
          writeVarUint8Array(encoder, encodeUtf8(str));
        }
      };
      _writeVarStringPolyfill = (encoder, str) => {
        const encodedString = unescape(encodeURIComponent(str));
        const len = encodedString.length;
        writeVarUint(encoder, len);
        for (let i = 0; i < len; i++) {
          write(
            encoder,
            /** @type {number} */
            encodedString.codePointAt(i)
          );
        }
      };
      writeVarString = utf8TextEncoder && /** @type {any} */
      utf8TextEncoder.encodeInto ? _writeVarStringNative : _writeVarStringPolyfill;
      writeUint8Array = (encoder, uint8Array) => {
        const bufferLen = encoder.cbuf.length;
        const cpos = encoder.cpos;
        const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
        const rightCopyLen = uint8Array.length - leftCopyLen;
        encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
        encoder.cpos += leftCopyLen;
        if (rightCopyLen > 0) {
          encoder.bufs.push(encoder.cbuf);
          encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
          encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
          encoder.cpos = rightCopyLen;
        }
      };
      writeVarUint8Array = (encoder, uint8Array) => {
        writeVarUint(encoder, uint8Array.byteLength);
        writeUint8Array(encoder, uint8Array);
      };
      writeOnDataView = (encoder, len) => {
        verifyLen(encoder, len);
        const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len);
        encoder.cpos += len;
        return dview;
      };
      writeFloat32 = (encoder, num) => writeOnDataView(encoder, 4).setFloat32(0, num, false);
      writeFloat64 = (encoder, num) => writeOnDataView(encoder, 8).setFloat64(0, num, false);
      writeBigInt64 = (encoder, num) => (
        /** @type {any} */
        writeOnDataView(encoder, 8).setBigInt64(0, num, false)
      );
      floatTestBed = new DataView(new ArrayBuffer(4));
      isFloat32 = (num) => {
        floatTestBed.setFloat32(0, num);
        return floatTestBed.getFloat32(0) === num;
      };
      writeAny = (encoder, data) => {
        switch (typeof data) {
          case "string":
            write(encoder, 119);
            writeVarString(encoder, data);
            break;
          case "number":
            if (isInteger(data) && abs(data) <= BITS31) {
              write(encoder, 125);
              writeVarInt(encoder, data);
            } else if (isFloat32(data)) {
              write(encoder, 124);
              writeFloat32(encoder, data);
            } else {
              write(encoder, 123);
              writeFloat64(encoder, data);
            }
            break;
          case "bigint":
            write(encoder, 122);
            writeBigInt64(encoder, data);
            break;
          case "object":
            if (data === null) {
              write(encoder, 126);
            } else if (isArray(data)) {
              write(encoder, 117);
              writeVarUint(encoder, data.length);
              for (let i = 0; i < data.length; i++) {
                writeAny(encoder, data[i]);
              }
            } else if (data instanceof Uint8Array) {
              write(encoder, 116);
              writeVarUint8Array(encoder, data);
            } else {
              write(encoder, 118);
              const keys2 = Object.keys(data);
              writeVarUint(encoder, keys2.length);
              for (let i = 0; i < keys2.length; i++) {
                const key = keys2[i];
                writeVarString(encoder, key);
                writeAny(encoder, data[key]);
              }
            }
            break;
          case "boolean":
            write(encoder, data ? 120 : 121);
            break;
          default:
            write(encoder, 127);
        }
      };
      RleEncoder = class extends Encoder {
        /**
         * @param {function(Encoder, T):void} writer
         */
        constructor(writer) {
          super();
          this.w = writer;
          this.s = null;
          this.count = 0;
        }
        /**
         * @param {T} v
         */
        write(v) {
          if (this.s === v) {
            this.count++;
          } else {
            if (this.count > 0) {
              writeVarUint(this, this.count - 1);
            }
            this.count = 1;
            this.w(this, v);
            this.s = v;
          }
        }
      };
      flushUintOptRleEncoder = (encoder) => {
        if (encoder.count > 0) {
          writeVarInt(encoder.encoder, encoder.count === 1 ? encoder.s : -encoder.s);
          if (encoder.count > 1) {
            writeVarUint(encoder.encoder, encoder.count - 2);
          }
        }
      };
      UintOptRleEncoder = class {
        constructor() {
          this.encoder = new Encoder();
          this.s = 0;
          this.count = 0;
        }
        /**
         * @param {number} v
         */
        write(v) {
          if (this.s === v) {
            this.count++;
          } else {
            flushUintOptRleEncoder(this);
            this.count = 1;
            this.s = v;
          }
        }
        /**
         * Flush the encoded state and transform this to a Uint8Array.
         *
         * Note that this should only be called once.
         */
        toUint8Array() {
          flushUintOptRleEncoder(this);
          return toUint8Array(this.encoder);
        }
      };
      flushIntDiffOptRleEncoder = (encoder) => {
        if (encoder.count > 0) {
          const encodedDiff = encoder.diff * 2 + (encoder.count === 1 ? 0 : 1);
          writeVarInt(encoder.encoder, encodedDiff);
          if (encoder.count > 1) {
            writeVarUint(encoder.encoder, encoder.count - 2);
          }
        }
      };
      IntDiffOptRleEncoder = class {
        constructor() {
          this.encoder = new Encoder();
          this.s = 0;
          this.count = 0;
          this.diff = 0;
        }
        /**
         * @param {number} v
         */
        write(v) {
          if (this.diff === v - this.s) {
            this.s = v;
            this.count++;
          } else {
            flushIntDiffOptRleEncoder(this);
            this.count = 1;
            this.diff = v - this.s;
            this.s = v;
          }
        }
        /**
         * Flush the encoded state and transform this to a Uint8Array.
         *
         * Note that this should only be called once.
         */
        toUint8Array() {
          flushIntDiffOptRleEncoder(this);
          return toUint8Array(this.encoder);
        }
      };
      StringEncoder = class {
        constructor() {
          this.sarr = [];
          this.s = "";
          this.lensE = new UintOptRleEncoder();
        }
        /**
         * @param {string} string
         */
        write(string) {
          this.s += string;
          if (this.s.length > 19) {
            this.sarr.push(this.s);
            this.s = "";
          }
          this.lensE.write(string.length);
        }
        toUint8Array() {
          const encoder = new Encoder();
          this.sarr.push(this.s);
          this.s = "";
          writeVarString(encoder, this.sarr.join(""));
          writeUint8Array(encoder, this.lensE.toUint8Array());
          return toUint8Array(encoder);
        }
      };
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/error.js
  var create3, methodUnimplemented, unexpectedCase;
  var init_error = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/error.js"() {
      "use strict";
      create3 = (s) => new Error(s);
      methodUnimplemented = () => {
        throw create3("Method unimplemented");
      };
      unexpectedCase = () => {
        throw create3("Unexpected case");
      };
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/decoding.js
  var errorUnexpectedEndOfArray, errorIntegerOutOfRange, Decoder, createDecoder, hasContent, readUint8Array, readVarUint8Array, readUint8, readVarUint, readVarInt, _readVarStringPolyfill, _readVarStringNative, readVarString, readFromDataView, readFloat32, readFloat64, readBigInt64, readAnyLookupTable, readAny, RleDecoder, UintOptRleDecoder, IntDiffOptRleDecoder, StringDecoder;
  var init_decoding = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/decoding.js"() {
      "use strict";
      init_binary();
      init_math();
      init_number();
      init_string();
      init_error();
      errorUnexpectedEndOfArray = create3("Unexpected end of array");
      errorIntegerOutOfRange = create3("Integer out of Range");
      Decoder = class {
        /**
         * @param {Uint8Array<Buf>} uint8Array Binary data to decode
         */
        constructor(uint8Array) {
          this.arr = uint8Array;
          this.pos = 0;
        }
      };
      createDecoder = (uint8Array) => new Decoder(uint8Array);
      hasContent = (decoder) => decoder.pos !== decoder.arr.length;
      readUint8Array = (decoder, len) => {
        const view = new Uint8Array(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
        decoder.pos += len;
        return view;
      };
      readVarUint8Array = (decoder) => readUint8Array(decoder, readVarUint(decoder));
      readUint8 = (decoder) => decoder.arr[decoder.pos++];
      readVarUint = (decoder) => {
        let num = 0;
        let mult = 1;
        const len = decoder.arr.length;
        while (decoder.pos < len) {
          const r = decoder.arr[decoder.pos++];
          num = num + (r & BITS7) * mult;
          mult *= 128;
          if (r < BIT8) {
            return num;
          }
          if (num > MAX_SAFE_INTEGER) {
            throw errorIntegerOutOfRange;
          }
        }
        throw errorUnexpectedEndOfArray;
      };
      readVarInt = (decoder) => {
        let r = decoder.arr[decoder.pos++];
        let num = r & BITS6;
        let mult = 64;
        const sign = (r & BIT7) > 0 ? -1 : 1;
        if ((r & BIT8) === 0) {
          return sign * num;
        }
        const len = decoder.arr.length;
        while (decoder.pos < len) {
          r = decoder.arr[decoder.pos++];
          num = num + (r & BITS7) * mult;
          mult *= 128;
          if (r < BIT8) {
            return sign * num;
          }
          if (num > MAX_SAFE_INTEGER) {
            throw errorIntegerOutOfRange;
          }
        }
        throw errorUnexpectedEndOfArray;
      };
      _readVarStringPolyfill = (decoder) => {
        let remainingLen = readVarUint(decoder);
        if (remainingLen === 0) {
          return "";
        } else {
          let encodedString = String.fromCodePoint(readUint8(decoder));
          if (--remainingLen < 100) {
            while (remainingLen--) {
              encodedString += String.fromCodePoint(readUint8(decoder));
            }
          } else {
            while (remainingLen > 0) {
              const nextLen = remainingLen < 1e4 ? remainingLen : 1e4;
              const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
              decoder.pos += nextLen;
              encodedString += String.fromCodePoint.apply(
                null,
                /** @type {any} */
                bytes
              );
              remainingLen -= nextLen;
            }
          }
          return decodeURIComponent(escape(encodedString));
        }
      };
      _readVarStringNative = (decoder) => (
        /** @type any */
        utf8TextDecoder.decode(readVarUint8Array(decoder))
      );
      readVarString = utf8TextDecoder ? _readVarStringNative : _readVarStringPolyfill;
      readFromDataView = (decoder, len) => {
        const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len);
        decoder.pos += len;
        return dv;
      };
      readFloat32 = (decoder) => readFromDataView(decoder, 4).getFloat32(0, false);
      readFloat64 = (decoder) => readFromDataView(decoder, 8).getFloat64(0, false);
      readBigInt64 = (decoder) => (
        /** @type {any} */
        readFromDataView(decoder, 8).getBigInt64(0, false)
      );
      readAnyLookupTable = [
        (decoder) => void 0,
        // CASE 127: undefined
        (decoder) => null,
        // CASE 126: null
        readVarInt,
        // CASE 125: integer
        readFloat32,
        // CASE 124: float32
        readFloat64,
        // CASE 123: float64
        readBigInt64,
        // CASE 122: bigint
        (decoder) => false,
        // CASE 121: boolean (false)
        (decoder) => true,
        // CASE 120: boolean (true)
        readVarString,
        // CASE 119: string
        (decoder) => {
          const len = readVarUint(decoder);
          const obj = {};
          for (let i = 0; i < len; i++) {
            const key = readVarString(decoder);
            obj[key] = readAny(decoder);
          }
          return obj;
        },
        (decoder) => {
          const len = readVarUint(decoder);
          const arr = [];
          for (let i = 0; i < len; i++) {
            arr.push(readAny(decoder));
          }
          return arr;
        },
        readVarUint8Array
        // CASE 116: Uint8Array
      ];
      readAny = (decoder) => readAnyLookupTable[127 - readUint8(decoder)](decoder);
      RleDecoder = class extends Decoder {
        /**
         * @param {Uint8Array} uint8Array
         * @param {function(Decoder):T} reader
         */
        constructor(uint8Array, reader) {
          super(uint8Array);
          this.reader = reader;
          this.s = null;
          this.count = 0;
        }
        read() {
          if (this.count === 0) {
            this.s = this.reader(this);
            if (hasContent(this)) {
              this.count = readVarUint(this) + 1;
            } else {
              this.count = -1;
            }
          }
          this.count--;
          return (
            /** @type {T} */
            this.s
          );
        }
      };
      UintOptRleDecoder = class extends Decoder {
        /**
         * @param {Uint8Array} uint8Array
         */
        constructor(uint8Array) {
          super(uint8Array);
          this.s = 0;
          this.count = 0;
        }
        read() {
          if (this.count === 0) {
            this.s = readVarInt(this);
            const isNegative = isNegativeZero(this.s);
            this.count = 1;
            if (isNegative) {
              this.s = -this.s;
              this.count = readVarUint(this) + 2;
            }
          }
          this.count--;
          return (
            /** @type {number} */
            this.s
          );
        }
      };
      IntDiffOptRleDecoder = class extends Decoder {
        /**
         * @param {Uint8Array} uint8Array
         */
        constructor(uint8Array) {
          super(uint8Array);
          this.s = 0;
          this.count = 0;
          this.diff = 0;
        }
        /**
         * @return {number}
         */
        read() {
          if (this.count === 0) {
            const diff = readVarInt(this);
            const hasCount = diff & 1;
            this.diff = floor(diff / 2);
            this.count = 1;
            if (hasCount) {
              this.count = readVarUint(this) + 2;
            }
          }
          this.s += this.diff;
          this.count--;
          return this.s;
        }
      };
      StringDecoder = class {
        /**
         * @param {Uint8Array} uint8Array
         */
        constructor(uint8Array) {
          this.decoder = new UintOptRleDecoder(uint8Array);
          this.str = readVarString(this.decoder);
          this.spos = 0;
        }
        /**
         * @return {string}
         */
        read() {
          const end = this.spos + this.decoder.read();
          const res = this.str.slice(this.spos, end);
          this.spos = end;
          return res;
        }
      };
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/webcrypto.js
  var subtle, getRandomValues;
  var init_webcrypto = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/webcrypto.js"() {
      "use strict";
      subtle = crypto.subtle;
      getRandomValues = crypto.getRandomValues.bind(crypto);
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/random.js
  var rand, uint32, uuidv4Template, uuidv4;
  var init_random = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/random.js"() {
      "use strict";
      init_webcrypto();
      rand = Math.random;
      uint32 = () => getRandomValues(new Uint32Array(1))[0];
      uuidv4Template = "10000000-1000-4000-8000" + -1e11;
      uuidv4 = () => uuidv4Template.replace(
        /[018]/g,
        /** @param {number} c */
        (c) => (c ^ uint32() & 15 >> c / 4).toString(16)
      );
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/time.js
  var getUnixTime;
  var init_time = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/time.js"() {
      "use strict";
      getUnixTime = Date.now;
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/promise.js
  var create4, all, reject, resolve;
  var init_promise = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/promise.js"() {
      "use strict";
      create4 = (f) => (
        /** @type {Promise<T>} */
        new Promise(f)
      );
      all = Promise.all.bind(Promise);
      reject = (reason) => Promise.reject(reason);
      resolve = (res) => Promise.resolve(res);
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/conditions.js
  var undefinedToNull;
  var init_conditions = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/conditions.js"() {
      "use strict";
      undefinedToNull = (v) => v === void 0 ? null : v;
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/storage.js
  var VarStoragePolyfill, _localStorage, usePolyfill, varStorage, onChange, offChange;
  var init_storage = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/storage.js"() {
      "use strict";
      VarStoragePolyfill = class {
        constructor() {
          this.map = /* @__PURE__ */ new Map();
        }
        /**
         * @param {string} key
         * @param {any} newValue
         */
        setItem(key, newValue) {
          this.map.set(key, newValue);
        }
        /**
         * @param {string} key
         */
        getItem(key) {
          return this.map.get(key);
        }
      };
      _localStorage = new VarStoragePolyfill();
      usePolyfill = true;
      try {
        if (typeof localStorage !== "undefined" && localStorage) {
          _localStorage = localStorage;
          usePolyfill = false;
        }
      } catch (e) {
      }
      varStorage = _localStorage;
      onChange = (eventHandler) => usePolyfill || addEventListener(
        "storage",
        /** @type {any} */
        eventHandler
      );
      offChange = (eventHandler) => usePolyfill || removeEventListener(
        "storage",
        /** @type {any} */
        eventHandler
      );
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/trait/equality.js
  var EqualityTraitSymbol, equals;
  var init_equality = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/trait/equality.js"() {
      "use strict";
      EqualityTraitSymbol = /* @__PURE__ */ Symbol("Equality");
      equals = (a, b) => a === b || !!a?.[EqualityTraitSymbol]?.(b) || false;
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/object.js
  var isObject, assign, keys, forEach, map2, size, isEmpty, every2, hasProperty, equalFlat, freeze, deepFreeze;
  var init_object = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/object.js"() {
      "use strict";
      init_equality();
      isObject = (o) => typeof o === "object";
      assign = Object.assign;
      keys = Object.keys;
      forEach = (obj, f) => {
        for (const key in obj) {
          f(obj[key], key);
        }
      };
      map2 = (obj, f) => {
        const results = [];
        for (const key in obj) {
          results.push(f(obj[key], key));
        }
        return results;
      };
      size = (obj) => keys(obj).length;
      isEmpty = (obj) => {
        for (const _k in obj) {
          return false;
        }
        return true;
      };
      every2 = (obj, f) => {
        for (const key in obj) {
          if (!f(obj[key], key)) {
            return false;
          }
        }
        return true;
      };
      hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
      equalFlat = (a, b) => a === b || size(a) === size(b) && every2(a, (val, key) => (val !== void 0 || hasProperty(b, key)) && equals(b[key], val));
      freeze = Object.freeze;
      deepFreeze = (o) => {
        for (const key in o) {
          const c = o[key];
          if (typeof c === "object" || typeof c === "function") {
            deepFreeze(o[key]);
          }
        }
        return freeze(o);
      };
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/function.js
  var callAll, nop, id, equalityDeep, isOneOf;
  var init_function = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/function.js"() {
      "use strict";
      init_object();
      init_equality();
      callAll = (fs, args2, i = 0) => {
        try {
          for (; i < fs.length; i++) {
            fs[i](...args2);
          }
        } finally {
          if (i < fs.length) {
            callAll(fs, args2, i + 1);
          }
        }
      };
      nop = () => {
      };
      id = (a) => a;
      equalityDeep = (a, b) => {
        if (a === b) {
          return true;
        }
        if (a == null || b == null || a.constructor !== b.constructor && (a.constructor || Object) !== (b.constructor || Object)) {
          return false;
        }
        if (a[EqualityTraitSymbol] != null) {
          return a[EqualityTraitSymbol](b);
        }
        switch (a.constructor) {
          case ArrayBuffer:
            a = new Uint8Array(a);
            b = new Uint8Array(b);
          // eslint-disable-next-line no-fallthrough
          case Uint8Array: {
            if (a.byteLength !== b.byteLength) {
              return false;
            }
            for (let i = 0; i < a.length; i++) {
              if (a[i] !== b[i]) {
                return false;
              }
            }
            break;
          }
          case Set: {
            if (a.size !== b.size) {
              return false;
            }
            for (const value of a) {
              if (!b.has(value)) {
                return false;
              }
            }
            break;
          }
          case Map: {
            if (a.size !== b.size) {
              return false;
            }
            for (const key of a.keys()) {
              if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) {
                return false;
              }
            }
            break;
          }
          case void 0:
          case Object:
            if (size(a) !== size(b)) {
              return false;
            }
            for (const key in a) {
              if (!hasProperty(a, key) || !equalityDeep(a[key], b[key])) {
                return false;
              }
            }
            break;
          case Array:
            if (a.length !== b.length) {
              return false;
            }
            for (let i = 0; i < a.length; i++) {
              if (!equalityDeep(a[i], b[i])) {
                return false;
              }
            }
            break;
          default:
            return false;
        }
        return true;
      };
      isOneOf = (value, options) => options.includes(value);
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/environment.js
  var isNode, isBrowser, isMac, params, args, computeParams, hasParam, getVariable, hasConf, production, forceColor, supportsColor;
  var init_environment = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/environment.js"() {
      "use strict";
      init_map();
      init_string();
      init_conditions();
      init_storage();
      init_function();
      isNode = typeof process !== "undefined" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
      isBrowser = typeof window !== "undefined" && typeof document !== "undefined" && !isNode;
      isMac = typeof navigator !== "undefined" ? /Mac/.test(navigator.platform) : false;
      args = [];
      computeParams = () => {
        if (params === void 0) {
          if (isNode) {
            params = create();
            const pargs = process.argv;
            let currParamName = null;
            for (let i = 0; i < pargs.length; i++) {
              const parg = pargs[i];
              if (parg[0] === "-") {
                if (currParamName !== null) {
                  params.set(currParamName, "");
                }
                currParamName = parg;
              } else {
                if (currParamName !== null) {
                  params.set(currParamName, parg);
                  currParamName = null;
                } else {
                  args.push(parg);
                }
              }
            }
            if (currParamName !== null) {
              params.set(currParamName, "");
            }
          } else if (typeof location === "object") {
            params = create();
            (location.search || "?").slice(1).split("&").forEach((kv) => {
              if (kv.length !== 0) {
                const [key, value] = kv.split("=");
                params.set(`--${fromCamelCase(key, "-")}`, value);
                params.set(`-${fromCamelCase(key, "-")}`, value);
              }
            });
          } else {
            params = create();
          }
        }
        return params;
      };
      hasParam = (name) => computeParams().has(name);
      getVariable = (name) => isNode ? undefinedToNull(process.env[name.toUpperCase().replaceAll("-", "_")]) : undefinedToNull(varStorage.getItem(name));
      hasConf = (name) => hasParam("--" + name) || getVariable(name) !== null;
      production = hasConf("production");
      forceColor = isNode && isOneOf(process.env.FORCE_COLOR, ["true", "1", "2"]);
      supportsColor = forceColor || !hasParam("--no-colors") && // @todo deprecate --no-colors
      !hasConf("no-color") && (!isNode || process.stdout.isTTY) && (!isNode || hasParam("--color") || getVariable("COLORTERM") !== null || (getVariable("TERM") || "").includes("color"));
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/buffer.js
  var createUint8ArrayFromLen, createUint8ArrayViewFromArrayBuffer, createUint8ArrayFromArrayBuffer, toBase64Browser, toBase64Node, fromBase64Browser, fromBase64Node, toBase64, fromBase64, copyUint8Array;
  var init_buffer = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/buffer.js"() {
      "use strict";
      init_string();
      init_environment();
      createUint8ArrayFromLen = (len) => new Uint8Array(len);
      createUint8ArrayViewFromArrayBuffer = (buffer, byteOffset, length2) => new Uint8Array(buffer, byteOffset, length2);
      createUint8ArrayFromArrayBuffer = (buffer) => new Uint8Array(buffer);
      toBase64Browser = (bytes) => {
        let s = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          s += fromCharCode(bytes[i]);
        }
        return btoa(s);
      };
      toBase64Node = (bytes) => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64");
      fromBase64Browser = (s) => {
        const a = atob(s);
        const bytes = createUint8ArrayFromLen(a.length);
        for (let i = 0; i < a.length; i++) {
          bytes[i] = a.charCodeAt(i);
        }
        return bytes;
      };
      fromBase64Node = (s) => {
        const buf = Buffer.from(s, "base64");
        return createUint8ArrayViewFromArrayBuffer(buf.buffer, buf.byteOffset, buf.byteLength);
      };
      toBase64 = isBrowser ? toBase64Browser : toBase64Node;
      fromBase64 = isBrowser ? fromBase64Browser : fromBase64Node;
      copyUint8Array = (uint8Array) => {
        const newBuf = createUint8ArrayFromLen(uint8Array.byteLength);
        newBuf.set(uint8Array);
        return newBuf;
      };
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/pair.js
  var Pair, create5;
  var init_pair = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/pair.js"() {
      "use strict";
      Pair = class {
        /**
         * @param {L} left
         * @param {R} right
         */
        constructor(left, right) {
          this.left = left;
          this.right = right;
        }
      };
      create5 = (left, right) => new Pair(left, right);
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/prng.js
  var bool, int53, int32, int31, letter, word, oneOf;
  var init_prng = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/prng.js"() {
      "use strict";
      init_string();
      init_math();
      bool = (gen) => gen.next() >= 0.5;
      int53 = (gen, min2, max2) => floor(gen.next() * (max2 + 1 - min2) + min2);
      int32 = (gen, min2, max2) => floor(gen.next() * (max2 + 1 - min2) + min2);
      int31 = (gen, min2, max2) => int32(gen, min2, max2);
      letter = (gen) => fromCharCode(int31(gen, 97, 122));
      word = (gen, minLen = 0, maxLen = 20) => {
        const len = int31(gen, minLen, maxLen);
        let str = "";
        for (let i = 0; i < len; i++) {
          str += letter(gen);
        }
        return str;
      };
      oneOf = (gen, array) => array[int31(gen, 0, array.length - 1)];
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/schema.js
  var schemaSymbol, ValidationError, shapeExtends, Schema, $ConstructedBy, $constructedBy, $$constructedBy, $Custom, $custom, $$custom, $Literal, $literal, $$literal, _regexEscape, _schemaStringTemplateToRegex, $StringTemplate, $$stringTemplate, isOptionalSymbol, $Optional, $$optional, $Never, $never, $$never, _$Object, $Object, $object, $$object, $objectAny, $Record, $record, $$record, $Tuple, $tuple, $$tuple, $Array, $array, $$array, $arrayAny, $InstanceOf, $instanceOf, $$instanceOf, $$schema, $Lambda, $$lambda, $function, $Intersection, $$intersect, $Union, $union, $$union, _t, $any, $$any, $bigint, $$bigint, $symbol, $$symbol, $number, $$number, $string, $$string, $boolean, $$boolean, $undefined, $$undefined, $void, $null, $$null, $uint8Array, $$uint8Array, $primitive, $json, $, assert, PatternMatcher, match, _random, random;
  var init_schema = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/schema.js"() {
      "use strict";
      init_object();
      init_array();
      init_error();
      init_environment();
      init_equality();
      init_function();
      init_string();
      init_prng();
      init_number();
      schemaSymbol = /* @__PURE__ */ Symbol("0schema");
      ValidationError = class {
        constructor() {
          this._rerrs = [];
        }
        /**
         * @param {string?} path
         * @param {string} expected
         * @param {string} has
         * @param {string?} message
         */
        extend(path, expected, has, message = null) {
          this._rerrs.push({ path, expected, has, message });
        }
        toString() {
          const s = [];
          for (let i = this._rerrs.length - 1; i > 0; i--) {
            const r = this._rerrs[i];
            s.push(repeat(" ", (this._rerrs.length - i) * 2) + `${r.path != null ? `[${r.path}] ` : ""}${r.has} doesn't match ${r.expected}. ${r.message}`);
          }
          return s.join("\n");
        }
      };
      shapeExtends = (a, b) => {
        if (a === b) return true;
        if (a == null || b == null || a.constructor !== b.constructor) return false;
        if (a[EqualityTraitSymbol]) return equals(a, b);
        if (isArray(a)) {
          return every(
            a,
            (aitem) => some(b, (bitem) => shapeExtends(aitem, bitem))
          );
        } else if (isObject(a)) {
          return every2(
            a,
            (aitem, akey) => shapeExtends(aitem, b[akey])
          );
        }
        return false;
      };
      Schema = class {
        /**
         * @param {Schema<any>} other
         */
        extends(other) {
          let [a, b] = [
            /** @type {any} */
            this.shape,
            /** @type {any} */
            other.shape
          ];
          if (
            /** @type {typeof Schema<any>} */
            this.constructor._dilutes
          ) [b, a] = [a, b];
          return shapeExtends(a, b);
        }
        /**
         * Overwrite this when necessary. By default, we only check the `shape` property which every shape
         * should have.
         * @param {Schema<any>} other
         */
        equals(other) {
          return this.constructor === other.constructor && equalityDeep(this.shape, other.shape);
        }
        [schemaSymbol]() {
          return true;
        }
        /**
         * @param {object} other
         */
        [EqualityTraitSymbol](other) {
          return this.equals(
            /** @type {any} */
            other
          );
        }
        /**
         * Use `schema.validate(obj)` with a typed parameter that is already of typed to be an instance of
         * Schema. Validate will check the structure of the parameter and return true iff the instance
         * really is an instance of Schema.
         *
         * @param {T} o
         * @return {boolean}
         */
        validate(o) {
          return this.check(o);
        }
        /* c8 ignore start */
        /**
         * Similar to validate, but this method accepts untyped parameters.
         *
         * @param {any} _o
         * @param {ValidationError} [_err]
         * @return {_o is T}
         */
        check(_o, _err) {
          methodUnimplemented();
        }
        /* c8 ignore stop */
        /**
         * @type {Schema<T?>}
         */
        get nullable() {
          return $union(this, $null);
        }
        /**
         * @type {$Optional<Schema<T>>}
         */
        get optional() {
          return new $Optional(
            /** @type {Schema<T>} */
            this
          );
        }
        /**
         * Cast a variable to a specific type. Returns the casted value, or throws an exception otherwise.
         * Use this if you know that the type is of a specific type and you just want to convince the type
         * system.
         *
         * **Do not rely on these error messages!**
         * Performs an assertion check only if not in a production environment.
         *
         * @template OO
         * @param {OO} o
         * @return {Extract<OO, T> extends never ? T : (OO extends Array<never> ? T : Extract<OO,T>)}
         */
        cast(o) {
          assert(o, this);
          return (
            /** @type {any} */
            o
          );
        }
        /**
         * EXPECTO PATRONUM!! 🪄
         * This function protects against type errors. Though it may not work in the real world.
         *
         * "After all this time?"
         * "Always." - Snape, talking about type safety
         *
         * Ensures that a variable is a a specific type. Returns the value, or throws an exception if the assertion check failed.
         * Use this if you know that the type is of a specific type and you just want to convince the type
         * system.
         *
         * Can be useful when defining lambdas: `s.lambda(s.$number, s.$void).expect((n) => n + 1)`
         *
         * **Do not rely on these error messages!**
         * Performs an assertion check if not in a production environment.
         *
         * @param {T} o
         * @return {o extends T ? T : never}
         */
        expect(o) {
          assert(o, this);
          return o;
        }
      };
      // this.shape must not be defined on Schema. Otherwise typecheck on metatypes (e.g. $$object) won't work as expected anymore
      /**
       * If true, the more things are added to the shape the more objects this schema will accept (e.g.
       * union). By default, the more objects are added, the the fewer objects this schema will accept.
       * @protected
       */
      __publicField(Schema, "_dilutes", false);
      $ConstructedBy = class extends Schema {
        /**
         * @param {C} c
         * @param {((o:Instance<C>)=>boolean)|null} check
         */
        constructor(c, check) {
          super();
          this.shape = c;
          this._c = check;
        }
        /**
         * @param {any} o
         * @param {ValidationError} [err]
         * @return {o is C extends ((...args:any[]) => infer T) ? T : (C extends (new (...args:any[]) => any) ? InstanceType<C> : never)} o
         */
        check(o, err = void 0) {
          const c = o?.constructor === this.shape && (this._c == null || this._c(o));
          !c && err?.extend(null, this.shape.name, o?.constructor.name, o?.constructor !== this.shape ? "Constructor match failed" : "Check failed");
          return c;
        }
      };
      $constructedBy = (c, check = null) => new $ConstructedBy(c, check);
      $$constructedBy = $constructedBy($ConstructedBy);
      $Custom = class extends Schema {
        /**
         * @param {(o:any) => boolean} check
         */
        constructor(check) {
          super();
          this.shape = check;
        }
        /**
         * @param {any} o
         * @param {ValidationError} err
         * @return {o is any}
         */
        check(o, err) {
          const c = this.shape(o);
          !c && err?.extend(null, "custom prop", o?.constructor.name, "failed to check custom prop");
          return c;
        }
      };
      $custom = (check) => new $Custom(check);
      $$custom = $constructedBy($Custom);
      $Literal = class extends Schema {
        /**
         * @param {Array<T>} literals
         */
        constructor(literals) {
          super();
          this.shape = literals;
        }
        /**
         *
         * @param {any} o
         * @param {ValidationError} [err]
         * @return {o is T}
         */
        check(o, err) {
          const c = this.shape.some((a) => a === o);
          !c && err?.extend(null, this.shape.join(" | "), o.toString());
          return c;
        }
      };
      $literal = (...literals) => new $Literal(literals);
      $$literal = $constructedBy($Literal);
      _regexEscape = /** @type {any} */
      RegExp.escape || /** @type {(str:string) => string} */
      ((str) => str.replace(/[().|&,$^[\]]/g, (s) => "\\" + s));
      _schemaStringTemplateToRegex = (s) => {
        if ($string.check(s)) {
          return [_regexEscape(s)];
        }
        if ($$literal.check(s)) {
          return (
            /** @type {Array<string|number>} */
            s.shape.map((v) => v + "")
          );
        }
        if ($$number.check(s)) {
          return ["[+-]?\\d+.?\\d*"];
        }
        if ($$string.check(s)) {
          return [".*"];
        }
        if ($$union.check(s)) {
          return s.shape.map(_schemaStringTemplateToRegex).flat(1);
        }
        unexpectedCase();
      };
      $StringTemplate = class extends Schema {
        /**
         * @param {T} shape
         */
        constructor(shape) {
          super();
          this.shape = shape;
          this._r = new RegExp("^" + shape.map(_schemaStringTemplateToRegex).map((opts) => `(${opts.join("|")})`).join("") + "$");
        }
        /**
         * @param {any} o
         * @param {ValidationError} [err]
         * @return {o is CastStringTemplateArgsToTemplate<T>}
         */
        check(o, err) {
          const c = this._r.exec(o) != null;
          !c && err?.extend(null, this._r.toString(), o.toString(), "String doesn't match string template.");
          return c;
        }
      };
      $$stringTemplate = $constructedBy($StringTemplate);
      isOptionalSymbol = /* @__PURE__ */ Symbol("optional");
      $Optional = class extends Schema {
        /**
         * @param {S} shape
         */
        constructor(shape) {
          super();
          this.shape = shape;
        }
        /**
         * @param {any} o
         * @param {ValidationError} [err]
         * @return {o is (Unwrap<S>|undefined)}
         */
        check(o, err) {
          const c = o === void 0 || this.shape.check(o);
          !c && err?.extend(null, "undefined (optional)", "()");
          return c;
        }
        get [isOptionalSymbol]() {
          return true;
        }
      };
      $$optional = $constructedBy($Optional);
      $Never = class extends Schema {
        /**
         * @param {any} _o
         * @param {ValidationError} [err]
         * @return {_o is never}
         */
        check(_o, err) {
          err?.extend(null, "never", typeof _o);
          return false;
        }
      };
      $never = new $Never();
      $$never = $constructedBy($Never);
      _$Object = class _$Object extends Schema {
        /**
         * @param {S} shape
         * @param {boolean} partial
         */
        constructor(shape, partial = false) {
          super();
          this.shape = shape;
          this._isPartial = partial;
        }
        /**
         * @type {Schema<Partial<$ObjectToType<S>>>}
         */
        get partial() {
          return new _$Object(this.shape, true);
        }
        /**
         * @param {any} o
         * @param {ValidationError} err
         * @return {o is $ObjectToType<S>}
         */
        check(o, err) {
          if (o == null) {
            err?.extend(null, "object", "null");
            return false;
          }
          return every2(this.shape, (vv, vk) => {
            const c = this._isPartial && !hasProperty(o, vk) || vv.check(o[vk], err);
            !c && err?.extend(vk.toString(), vv.toString(), typeof o[vk], "Object property does not match");
            return c;
          });
        }
      };
      __publicField(_$Object, "_dilutes", true);
      $Object = _$Object;
      $object = (def) => (
        /** @type {any} */
        new $Object(def)
      );
      $$object = $constructedBy($Object);
      $objectAny = $custom((o) => o != null && (o.constructor === Object || o.constructor == null));
      $Record = class extends Schema {
        /**
         * @param {Keys} keys
         * @param {Values} values
         */
        constructor(keys2, values) {
          super();
          this.shape = {
            keys: keys2,
            values
          };
        }
        /**
         * @param {any} o
         * @param {ValidationError} err
         * @return {o is { [key in Unwrap<Keys>]: Unwrap<Values> }}
         */
        check(o, err) {
          return o != null && every2(o, (vv, vk) => {
            const ck = this.shape.keys.check(vk, err);
            !ck && err?.extend(vk + "", "Record", typeof o, ck ? "Key doesn't match schema" : "Value doesn't match value");
            return ck && this.shape.values.check(vv, err);
          });
        }
      };
      $record = (keys2, values) => new $Record(keys2, values);
      $$record = $constructedBy($Record);
      $Tuple = class extends Schema {
        /**
         * @param {S} shape
         */
        constructor(shape) {
          super();
          this.shape = shape;
        }
        /**
         * @param {any} o
         * @param {ValidationError} err
         * @return {o is { [K in keyof S]: S[K] extends Schema<infer Type> ? Type : never }}
         */
        check(o, err) {
          return o != null && every2(this.shape, (vv, vk) => {
            const c = (
              /** @type {Schema<any>} */
              vv.check(o[vk], err)
            );
            !c && err?.extend(vk.toString(), "Tuple", typeof vv);
            return c;
          });
        }
      };
      $tuple = (...def) => new $Tuple(def);
      $$tuple = $constructedBy($Tuple);
      $Array = class extends Schema {
        /**
         * @param {Array<S>} v
         */
        constructor(v) {
          super();
          this.shape = v.length === 1 ? v[0] : new $Union(v);
        }
        /**
         * @param {any} o
         * @param {ValidationError} [err]
         * @return {o is Array<S extends Schema<infer T> ? T : never>} o
         */
        check(o, err) {
          const c = isArray(o) && every(o, (oi) => this.shape.check(oi));
          !c && err?.extend(null, "Array", "");
          return c;
        }
      };
      $array = (...def) => new $Array(def);
      $$array = $constructedBy($Array);
      $arrayAny = $custom((o) => isArray(o));
      $InstanceOf = class extends Schema {
        /**
         * @param {new (...args:any) => T} constructor
         * @param {((o:T) => boolean)|null} check
         */
        constructor(constructor, check) {
          super();
          this.shape = constructor;
          this._c = check;
        }
        /**
         * @param {any} o
         * @param {ValidationError} err
         * @return {o is T}
         */
        check(o, err) {
          const c = o instanceof this.shape && (this._c == null || this._c(o));
          !c && err?.extend(null, this.shape.name, o?.constructor.name);
          return c;
        }
      };
      $instanceOf = (c, check = null) => new $InstanceOf(c, check);
      $$instanceOf = $constructedBy($InstanceOf);
      $$schema = $instanceOf(Schema);
      $Lambda = class extends Schema {
        /**
         * @param {Args} args
         */
        constructor(args2) {
          super();
          this.len = args2.length - 1;
          this.args = $tuple(...args2.slice(-1));
          this.res = args2[this.len];
        }
        /**
         * @param {any} f
         * @param {ValidationError} err
         * @return {f is _LArgsToLambdaDef<Args>}
         */
        check(f, err) {
          const c = f.constructor === Function && f.length <= this.len;
          !c && err?.extend(null, "function", typeof f);
          return c;
        }
      };
      $$lambda = $constructedBy($Lambda);
      $function = $custom((o) => typeof o === "function");
      $Intersection = class extends Schema {
        /**
         * @param {T} v
         */
        constructor(v) {
          super();
          this.shape = v;
        }
        /**
         * @param {any} o
         * @param {ValidationError} [err]
         * @return {o is Intersect<UnwrapArray<T>>}
         */
        check(o, err) {
          const c = every(this.shape, (check) => check.check(o, err));
          !c && err?.extend(null, "Intersectinon", typeof o);
          return c;
        }
      };
      $$intersect = $constructedBy($Intersection, (o) => o.shape.length > 0);
      $Union = class extends Schema {
        /**
         * @param {Array<Schema<S>>} v
         */
        constructor(v) {
          super();
          this.shape = v;
        }
        /**
         * @param {any} o
         * @param {ValidationError} [err]
         * @return {o is S}
         */
        check(o, err) {
          const c = some(this.shape, (vv) => vv.check(o, err));
          err?.extend(null, "Union", typeof o);
          return c;
        }
      };
      __publicField($Union, "_dilutes", true);
      $union = (...schemas) => schemas.findIndex(($s) => $$union.check($s)) >= 0 ? $union(...schemas.map(($s) => $($s)).map(($s) => $$union.check($s) ? $s.shape : [$s]).flat(1)) : schemas.length === 1 ? schemas[0] : new $Union(schemas);
      $$union = /** @type {Schema<$Union<any>>} */
      $constructedBy($Union);
      _t = () => true;
      $any = $custom(_t);
      $$any = /** @type {Schema<Schema<any>>} */
      $constructedBy($Custom, (o) => o.shape === _t);
      $bigint = $custom((o) => typeof o === "bigint");
      $$bigint = /** @type {Schema<Schema<BigInt>>} */
      $custom((o) => o === $bigint);
      $symbol = $custom((o) => typeof o === "symbol");
      $$symbol = /** @type {Schema<Schema<Symbol>>} */
      $custom((o) => o === $symbol);
      $number = $custom((o) => typeof o === "number");
      $$number = /** @type {Schema<Schema<number>>} */
      $custom((o) => o === $number);
      $string = $custom((o) => typeof o === "string");
      $$string = /** @type {Schema<Schema<string>>} */
      $custom((o) => o === $string);
      $boolean = $custom((o) => typeof o === "boolean");
      $$boolean = /** @type {Schema<Schema<Boolean>>} */
      $custom((o) => o === $boolean);
      $undefined = $literal(void 0);
      $$undefined = /** @type {Schema<Schema<undefined>>} */
      $constructedBy($Literal, (o) => o.shape.length === 1 && o.shape[0] === void 0);
      $void = $literal(void 0);
      $null = $literal(null);
      $$null = /** @type {Schema<Schema<null>>} */
      $constructedBy($Literal, (o) => o.shape.length === 1 && o.shape[0] === null);
      $uint8Array = $constructedBy(Uint8Array);
      $$uint8Array = /** @type {Schema<Schema<Uint8Array>>} */
      $constructedBy($ConstructedBy, (o) => o.shape === Uint8Array);
      $primitive = $union($number, $string, $null, $undefined, $bigint, $boolean, $symbol);
      $json = (() => {
        const $jsonArr = (
          /** @type {$Array<$any>} */
          $array($any)
        );
        const $jsonRecord = (
          /** @type {$Record<$string,$any>} */
          $record($string, $any)
        );
        const $json2 = $union($number, $string, $null, $boolean, $jsonArr, $jsonRecord);
        $jsonArr.shape = $json2;
        $jsonRecord.shape.values = $json2;
        return $json2;
      })();
      $ = (o) => {
        if ($$schema.check(o)) {
          return (
            /** @type {any} */
            o
          );
        } else if ($objectAny.check(o)) {
          const o2 = {};
          for (const k in o) {
            o2[k] = $(o[k]);
          }
          return (
            /** @type {any} */
            $object(o2)
          );
        } else if ($arrayAny.check(o)) {
          return (
            /** @type {any} */
            $union(...o.map($))
          );
        } else if ($primitive.check(o)) {
          return (
            /** @type {any} */
            $literal(o)
          );
        } else if ($function.check(o)) {
          return (
            /** @type {any} */
            $constructedBy(
              /** @type {any} */
              o
            )
          );
        }
        unexpectedCase();
      };
      assert = production ? () => {
      } : (o, schema) => {
        const err = new ValidationError();
        if (!schema.check(o, err)) {
          throw create3(`Expected value to be of type ${schema.constructor.name}.
${err.toString()}`);
        }
      };
      PatternMatcher = class {
        /**
         * @param {Schema<State>} [$state]
         */
        constructor($state) {
          this.patterns = [];
          this.$state = $state;
        }
        /**
         * @template P
         * @template R
         * @param {P} pattern
         * @param {(o:NoInfer<Unwrap<ReadSchema<P>>>,s:State)=>R} handler
         * @return {PatternMatcher<State,Patterns|Pattern<Unwrap<ReadSchema<P>>,R>>}
         */
        if(pattern, handler) {
          this.patterns.push({ if: $(pattern), h: handler });
          return this;
        }
        /**
         * @template R
         * @param {(o:any,s:State)=>R} h
         */
        else(h) {
          return this.if($any, h);
        }
        /**
         * @return {State extends undefined
         *   ? <In extends Unwrap<Patterns['if']>>(o:In,state?:undefined)=>PatternMatchResult<Patterns,In>
         *   : <In extends Unwrap<Patterns['if']>>(o:In,state:State)=>PatternMatchResult<Patterns,In>}
         */
        done() {
          return (
            /** @type {any} */
            (o, s) => {
              for (let i = 0; i < this.patterns.length; i++) {
                const p = this.patterns[i];
                if (p.if.check(o)) {
                  return p.h(o, s);
                }
              }
              throw create3("Unhandled pattern");
            }
          );
        }
      };
      match = (state) => new PatternMatcher(
        /** @type {any} */
        state
      );
      _random = /** @type {any} */
      match(
        /** @type {Schema<prng.PRNG>} */
        $any
      ).if($$number, (_o, gen) => int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER)).if($$string, (_o, gen) => word(gen)).if($$boolean, (_o, gen) => bool(gen)).if($$bigint, (_o, gen) => BigInt(int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER))).if($$union, (o, gen) => random(gen, oneOf(gen, o.shape))).if($$object, (o, gen) => {
        const res = {};
        for (const k in o.shape) {
          let prop = o.shape[k];
          if ($$optional.check(prop)) {
            if (bool(gen)) {
              continue;
            }
            prop = prop.shape;
          }
          res[k] = _random(prop, gen);
        }
        return res;
      }).if($$array, (o, gen) => {
        const arr = [];
        const n = int32(gen, 0, 42);
        for (let i = 0; i < n; i++) {
          arr.push(random(gen, o.shape));
        }
        return arr;
      }).if($$literal, (o, gen) => {
        return oneOf(gen, o.shape);
      }).if($$null, (o, gen) => {
        return null;
      }).if($$lambda, (o, gen) => {
        const res = random(gen, o.res);
        return () => res;
      }).if($$any, (o, gen) => random(gen, oneOf(gen, [
        $number,
        $string,
        $null,
        $undefined,
        $bigint,
        $boolean,
        $array($number),
        $record($union("a", "b", "c"), $number)
      ]))).if($$record, (o, gen) => {
        const res = {};
        const keysN = int53(gen, 0, 3);
        for (let i = 0; i < keysN; i++) {
          const key = random(gen, o.shape.keys);
          const val = random(gen, o.shape.values);
          res[key] = val;
        }
        return res;
      }).done();
      random = (gen, schema) => (
        /** @type {any} */
        _random($(schema), gen)
      );
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/dom.js
  var doc, $fragment, domParser, $element, $text, mapToStyleString, ELEMENT_NODE, TEXT_NODE, CDATA_SECTION_NODE, COMMENT_NODE, DOCUMENT_NODE, DOCUMENT_TYPE_NODE, DOCUMENT_FRAGMENT_NODE, $node;
  var init_dom = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/dom.js"() {
      "use strict";
      init_map();
      init_schema();
      doc = /** @type {Document} */
      typeof document !== "undefined" ? document : {};
      $fragment = $custom((el) => el.nodeType === DOCUMENT_FRAGMENT_NODE);
      domParser = /** @type {DOMParser} */
      typeof DOMParser !== "undefined" ? new DOMParser() : null;
      $element = $custom((el) => el.nodeType === ELEMENT_NODE);
      $text = $custom((el) => el.nodeType === TEXT_NODE);
      mapToStyleString = (m) => map(m, (value, key) => `${key}:${value};`).join("");
      ELEMENT_NODE = doc.ELEMENT_NODE;
      TEXT_NODE = doc.TEXT_NODE;
      CDATA_SECTION_NODE = doc.CDATA_SECTION_NODE;
      COMMENT_NODE = doc.COMMENT_NODE;
      DOCUMENT_NODE = doc.DOCUMENT_NODE;
      DOCUMENT_TYPE_NODE = doc.DOCUMENT_TYPE_NODE;
      DOCUMENT_FRAGMENT_NODE = doc.DOCUMENT_FRAGMENT_NODE;
      $node = $custom((el) => el.nodeType === DOCUMENT_NODE);
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/json.js
  var stringify;
  var init_json = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/json.js"() {
      "use strict";
      stringify = JSON.stringify;
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/symbol.js
  var create6;
  var init_symbol = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/symbol.js"() {
      "use strict";
      create6 = Symbol;
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/logging.common.js
  var BOLD, UNBOLD, BLUE, GREY, GREEN, RED, PURPLE, ORANGE, UNCOLOR, computeNoColorLoggingArgs, loggingColors, nextColor, lastLoggingTime, createModuleLogger;
  var init_logging_common = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/logging.common.js"() {
      "use strict";
      init_symbol();
      init_time();
      init_environment();
      init_function();
      init_json();
      BOLD = create6();
      UNBOLD = create6();
      BLUE = create6();
      GREY = create6();
      GREEN = create6();
      RED = create6();
      PURPLE = create6();
      ORANGE = create6();
      UNCOLOR = create6();
      computeNoColorLoggingArgs = (args2) => {
        if (args2.length === 1 && args2[0]?.constructor === Function) {
          args2 = /** @type {Array<string|Symbol|Object|number>} */
          /** @type {[function]} */
          args2[0]();
        }
        const strBuilder = [];
        const logArgs = [];
        let i = 0;
        for (; i < args2.length; i++) {
          const arg = args2[i];
          if (arg === void 0) {
            break;
          } else if (arg.constructor === String || arg.constructor === Number) {
            strBuilder.push(arg);
          } else if (arg.constructor === Object) {
            break;
          }
        }
        if (i > 0) {
          logArgs.push(strBuilder.join(""));
        }
        for (; i < args2.length; i++) {
          const arg = args2[i];
          if (!(arg instanceof Symbol)) {
            logArgs.push(arg);
          }
        }
        return logArgs;
      };
      loggingColors = [GREEN, PURPLE, ORANGE, BLUE];
      nextColor = 0;
      lastLoggingTime = getUnixTime();
      createModuleLogger = (_print, moduleName) => {
        const color = loggingColors[nextColor];
        const debugRegexVar = getVariable("log");
        const doLogging = debugRegexVar !== null && (debugRegexVar === "*" || debugRegexVar === "true" || new RegExp(debugRegexVar, "gi").test(moduleName));
        nextColor = (nextColor + 1) % loggingColors.length;
        moduleName += ": ";
        return !doLogging ? nop : (...args2) => {
          if (args2.length === 1 && args2[0]?.constructor === Function) {
            args2 = args2[0]();
          }
          const timeNow = getUnixTime();
          const timeDiff = timeNow - lastLoggingTime;
          lastLoggingTime = timeNow;
          _print(
            color,
            moduleName,
            UNCOLOR,
            ...args2.map((arg) => {
              if (arg != null && arg.constructor === Uint8Array) {
                arg = Array.from(arg);
              }
              const t = typeof arg;
              switch (t) {
                case "string":
                case "symbol":
                  return arg;
                default: {
                  return stringify(arg);
                }
              }
            }),
            color,
            " +" + timeDiff + "ms"
          );
        };
      };
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/logging.js
  var _browserStyleMap, computeBrowserLoggingArgs, computeLoggingArgs, print, warn, vconsoles, createModuleLogger2;
  var init_logging = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/logging.js"() {
      "use strict";
      init_environment();
      init_set();
      init_pair();
      init_dom();
      init_map();
      init_logging_common();
      init_logging_common();
      _browserStyleMap = {
        [BOLD]: create5("font-weight", "bold"),
        [UNBOLD]: create5("font-weight", "normal"),
        [BLUE]: create5("color", "blue"),
        [GREEN]: create5("color", "green"),
        [GREY]: create5("color", "grey"),
        [RED]: create5("color", "red"),
        [PURPLE]: create5("color", "purple"),
        [ORANGE]: create5("color", "orange"),
        // not well supported in chrome when debugging node with inspector - TODO: deprecate
        [UNCOLOR]: create5("color", "black")
      };
      computeBrowserLoggingArgs = (args2) => {
        if (args2.length === 1 && args2[0]?.constructor === Function) {
          args2 = /** @type {Array<string|Symbol|Object|number>} */
          /** @type {[function]} */
          args2[0]();
        }
        const strBuilder = [];
        const styles = [];
        const currentStyle = create();
        let logArgs = [];
        let i = 0;
        for (; i < args2.length; i++) {
          const arg = args2[i];
          const style = _browserStyleMap[arg];
          if (style !== void 0) {
            currentStyle.set(style.left, style.right);
          } else {
            if (arg === void 0) {
              break;
            }
            if (arg.constructor === String || arg.constructor === Number) {
              const style2 = mapToStyleString(currentStyle);
              if (i > 0 || style2.length > 0) {
                strBuilder.push("%c" + arg);
                styles.push(style2);
              } else {
                strBuilder.push(arg);
              }
            } else {
              break;
            }
          }
        }
        if (i > 0) {
          logArgs = styles;
          logArgs.unshift(strBuilder.join(""));
        }
        for (; i < args2.length; i++) {
          const arg = args2[i];
          if (!(arg instanceof Symbol)) {
            logArgs.push(arg);
          }
        }
        return logArgs;
      };
      computeLoggingArgs = supportsColor ? computeBrowserLoggingArgs : computeNoColorLoggingArgs;
      print = (...args2) => {
        console.log(...computeLoggingArgs(args2));
        vconsoles.forEach((vc) => vc.print(args2));
      };
      warn = (...args2) => {
        console.warn(...computeLoggingArgs(args2));
        args2.unshift(ORANGE);
        vconsoles.forEach((vc) => vc.print(args2));
      };
      vconsoles = create2();
      createModuleLogger2 = (moduleName) => createModuleLogger(print, moduleName);
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/iterator.js
  var createIterator, iteratorFilter, iteratorMap;
  var init_iterator = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/iterator.js"() {
      "use strict";
      createIterator = (next) => ({
        /**
         * @return {IterableIterator<T>}
         */
        [Symbol.iterator]() {
          return this;
        },
        // @ts-ignore
        next
      });
      iteratorFilter = (iterator, filter) => createIterator(() => {
        let res;
        do {
          res = iterator.next();
        } while (!res.done && !filter(res.value));
        return res;
      });
      iteratorMap = (iterator, fmap) => createIterator(() => {
        const { done, value } = iterator.next();
        return { done, value: done ? void 0 : fmap(value) };
      });
    }
  });

  // ../../node_modules/.pnpm/yjs@13.6.32/node_modules/yjs/dist/yjs.mjs
  function* lazyStructReaderGenerator(decoder) {
    const numOfStateUpdates = readVarUint(decoder.restDecoder);
    for (let i = 0; i < numOfStateUpdates; i++) {
      const numberOfStructs = readVarUint(decoder.restDecoder);
      const client = decoder.readClient();
      let clock = readVarUint(decoder.restDecoder);
      for (let i2 = 0; i2 < numberOfStructs; i2++) {
        const info = decoder.readInfo();
        if (info === 10) {
          const len = readVarUint(decoder.restDecoder);
          yield new Skip(createID(client, clock), len);
          clock += len;
        } else if ((BITS5 & info) !== 0) {
          const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
          const struct = new Item(
            createID(client, clock),
            null,
            // left
            (info & BIT8) === BIT8 ? decoder.readLeftID() : null,
            // origin
            null,
            // right
            (info & BIT7) === BIT7 ? decoder.readRightID() : null,
            // right origin
            // @ts-ignore Force writing a string here.
            cantCopyParentInfo ? decoder.readParentInfo() ? decoder.readString() : decoder.readLeftID() : null,
            // parent
            cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null,
            // parentSub
            readItemContent(decoder, info)
            // item content
          );
          yield struct;
          clock += struct.length;
        } else {
          const len = decoder.readLen();
          yield new GC(createID(client, clock), len);
          clock += len;
        }
      }
    }
  }
  var DeleteItem, DeleteSet, iterateDeletedStructs, findIndexDS, isDeleted, sortAndMergeDeleteSet, mergeDeleteSets, addToDeleteSet, createDeleteSet, createDeleteSetFromStructStore, writeDeleteSet, readDeleteSet, readAndApplyDeleteSet, generateNewClientId, Doc, DSDecoderV1, UpdateDecoderV1, DSDecoderV2, UpdateDecoderV2, DSEncoderV1, UpdateEncoderV1, DSEncoderV2, UpdateEncoderV2, writeStructs, writeClientsStructs, readClientsStructRefs, integrateStructs, writeStructsFromTransaction, readUpdateV2, applyUpdateV2, applyUpdate, writeStateAsUpdate, encodeStateAsUpdateV2, encodeStateAsUpdate, readStateVector, decodeStateVector, writeStateVector, writeDocumentStateVector, encodeStateVectorV2, encodeStateVector, EventHandler, createEventHandler, addEventHandlerListener, removeEventHandlerListener, callEventHandlerListeners, ID, compareIDs, createID, findRootTypeKey, Snapshot, equalSnapshots, encodeSnapshotV2, encodeSnapshot, decodeSnapshotV2, decodeSnapshot, createSnapshot, emptySnapshot, snapshot, isVisible, splitSnapshotAffectedStructs, createDocFromSnapshot, StructStore, getStateVector, getState, addStruct, findIndexSS, find, getItem, findIndexCleanStart, getItemCleanStart, getItemCleanEnd, replaceStruct, iterateStructs, Transaction, writeUpdateMessageFromTransaction, addChangedTypeToTransaction, tryToMergeWithLefts, tryGcDeleteSet, tryMergeDeleteSet, cleanupTransactions, transact, LazyStructReader, LazyStructWriter, mergeUpdates, sliceStruct, mergeUpdatesV2, diffUpdateV2, flushLazyStructWriter, writeStructToLazyStructWriter, finishLazyStructWriting, convertUpdateFormat, convertUpdateFormatV2ToV1, errorComputeChanges, YEvent, getPathTo, warnPrematureAccess, maxSearchMarker, globalSearchMarkerTimestamp, ArraySearchMarker, refreshMarkerTimestamp, overwriteMarker, markPosition, findMarker, updateMarkerChanges, callTypeObservers, AbstractType, typeListSlice, typeListToArray, typeListForEach, typeListMap, typeListCreateIterator, typeListGet, typeListInsertGenericsAfter, lengthExceeded, typeListInsertGenerics, typeListPushGenerics, typeListDelete, typeMapDelete, typeMapSet, typeMapGet, typeMapGetAll, typeMapHas, typeMapGetAllSnapshot, createMapIterator, YArrayEvent, YArray, readYArray, YMapEvent, YMap, readYMap, equalAttrs, ItemTextListPosition, findNextPosition, findPosition, insertNegatedAttributes, updateCurrentAttributes, minimizeAttributeChanges, insertAttributes, insertText, formatText, cleanupFormattingGap, cleanupContextlessFormattingGap, cleanupYTextFormatting, cleanupYTextAfterTransaction, deleteText, YTextEvent, YText, readYText, YXmlTreeWalker, YXmlFragment, readYXmlFragment, YXmlElement, readYXmlElement, YXmlEvent, YXmlHook, readYXmlHook, YXmlText, readYXmlText, AbstractStruct, structGCRefNumber, GC, ContentBinary, readContentBinary, ContentDeleted, readContentDeleted, createDocFromOpts, ContentDoc, readContentDoc, ContentEmbed, readContentEmbed, ContentFormat, readContentFormat, ContentJSON, readContentJSON, isDevMode, ContentAny, readContentAny, ContentString, readContentString, typeRefs, YArrayRefID, YMapRefID, YTextRefID, YXmlElementRefID, YXmlFragmentRefID, YXmlHookRefID, YXmlTextRefID, ContentType, readContentType, splitItem, Item, readItemContent, contentRefs, structSkipRefNumber, Skip, glo, importIdentifier;
  var init_yjs = __esm({
    "../../node_modules/.pnpm/yjs@13.6.32/node_modules/yjs/dist/yjs.mjs"() {
      "use strict";
      init_observable();
      init_array();
      init_math();
      init_map();
      init_encoding();
      init_decoding();
      init_random();
      init_promise();
      init_buffer();
      init_error();
      init_binary();
      init_function();
      init_function();
      init_set();
      init_logging();
      init_iterator();
      init_object();
      init_environment();
      DeleteItem = class {
        /**
         * @param {number} clock
         * @param {number} len
         */
        constructor(clock, len) {
          this.clock = clock;
          this.len = len;
        }
      };
      DeleteSet = class {
        constructor() {
          this.clients = /* @__PURE__ */ new Map();
        }
      };
      iterateDeletedStructs = (transaction, ds, f) => ds.clients.forEach((deletes, clientid) => {
        const structs = (
          /** @type {Array<GC|Item>} */
          transaction.doc.store.clients.get(clientid)
        );
        if (structs != null) {
          const lastStruct = structs[structs.length - 1];
          const clockState = lastStruct.id.clock + lastStruct.length;
          for (let i = 0, del2 = deletes[i]; i < deletes.length && del2.clock < clockState; del2 = deletes[++i]) {
            iterateStructs(transaction, structs, del2.clock, del2.len, f);
          }
        }
      });
      findIndexDS = (dis, clock) => {
        let left = 0;
        let right = dis.length - 1;
        while (left <= right) {
          const midindex = floor((left + right) / 2);
          const mid = dis[midindex];
          const midclock = mid.clock;
          if (midclock <= clock) {
            if (clock < midclock + mid.len) {
              return midindex;
            }
            left = midindex + 1;
          } else {
            right = midindex - 1;
          }
        }
        return null;
      };
      isDeleted = (ds, id2) => {
        const dis = ds.clients.get(id2.client);
        return dis !== void 0 && findIndexDS(dis, id2.clock) !== null;
      };
      sortAndMergeDeleteSet = (ds) => {
        ds.clients.forEach((dels) => {
          dels.sort((a, b) => a.clock - b.clock);
          let i, j;
          for (i = 1, j = 1; i < dels.length; i++) {
            const left = dels[j - 1];
            const right = dels[i];
            if (left.clock + left.len >= right.clock) {
              dels[j - 1] = new DeleteItem(left.clock, max(left.len, right.clock + right.len - left.clock));
            } else {
              if (j < i) {
                dels[j] = right;
              }
              j++;
            }
          }
          dels.length = j;
        });
      };
      mergeDeleteSets = (dss) => {
        const merged = new DeleteSet();
        for (let dssI = 0; dssI < dss.length; dssI++) {
          dss[dssI].clients.forEach((delsLeft, client) => {
            if (!merged.clients.has(client)) {
              const dels = delsLeft.slice();
              for (let i = dssI + 1; i < dss.length; i++) {
                appendTo(dels, dss[i].clients.get(client) || []);
              }
              merged.clients.set(client, dels);
            }
          });
        }
        sortAndMergeDeleteSet(merged);
        return merged;
      };
      addToDeleteSet = (ds, client, clock, length2) => {
        setIfUndefined(ds.clients, client, () => (
          /** @type {Array<DeleteItem>} */
          []
        )).push(new DeleteItem(clock, length2));
      };
      createDeleteSet = () => new DeleteSet();
      createDeleteSetFromStructStore = (ss) => {
        const ds = createDeleteSet();
        ss.clients.forEach((structs, client) => {
          const dsitems = [];
          for (let i = 0; i < structs.length; i++) {
            const struct = structs[i];
            if (struct.deleted) {
              const clock = struct.id.clock;
              let len = struct.length;
              if (i + 1 < structs.length) {
                for (let next = structs[i + 1]; i + 1 < structs.length && next.deleted; next = structs[++i + 1]) {
                  len += next.length;
                }
              }
              dsitems.push(new DeleteItem(clock, len));
            }
          }
          if (dsitems.length > 0) {
            ds.clients.set(client, dsitems);
          }
        });
        return ds;
      };
      writeDeleteSet = (encoder, ds) => {
        writeVarUint(encoder.restEncoder, ds.clients.size);
        from(ds.clients.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, dsitems]) => {
          encoder.resetDsCurVal();
          writeVarUint(encoder.restEncoder, client);
          const len = dsitems.length;
          writeVarUint(encoder.restEncoder, len);
          for (let i = 0; i < len; i++) {
            const item = dsitems[i];
            encoder.writeDsClock(item.clock);
            encoder.writeDsLen(item.len);
          }
        });
      };
      readDeleteSet = (decoder) => {
        const ds = new DeleteSet();
        const numClients = readVarUint(decoder.restDecoder);
        for (let i = 0; i < numClients; i++) {
          decoder.resetDsCurVal();
          const client = readVarUint(decoder.restDecoder);
          const numberOfDeletes = readVarUint(decoder.restDecoder);
          if (numberOfDeletes > 0) {
            const dsField = setIfUndefined(ds.clients, client, () => (
              /** @type {Array<DeleteItem>} */
              []
            ));
            for (let i2 = 0; i2 < numberOfDeletes; i2++) {
              dsField.push(new DeleteItem(decoder.readDsClock(), decoder.readDsLen()));
            }
          }
        }
        return ds;
      };
      readAndApplyDeleteSet = (decoder, transaction, store) => {
        const unappliedDS = new DeleteSet();
        const numClients = readVarUint(decoder.restDecoder);
        for (let i = 0; i < numClients; i++) {
          decoder.resetDsCurVal();
          const client = readVarUint(decoder.restDecoder);
          const numberOfDeletes = readVarUint(decoder.restDecoder);
          const structs = store.clients.get(client) || [];
          const state = getState(store, client);
          for (let i2 = 0; i2 < numberOfDeletes; i2++) {
            const clock = decoder.readDsClock();
            const clockEnd = clock + decoder.readDsLen();
            if (clock < state) {
              if (state < clockEnd) {
                addToDeleteSet(unappliedDS, client, state, clockEnd - state);
              }
              let index = findIndexSS(structs, clock);
              let struct = structs[index];
              if (!struct.deleted && struct.id.clock < clock) {
                structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
                index++;
              }
              while (index < structs.length) {
                struct = structs[index++];
                if (struct.id.clock < clockEnd) {
                  if (!struct.deleted) {
                    if (clockEnd < struct.id.clock + struct.length) {
                      structs.splice(index, 0, splitItem(transaction, struct, clockEnd - struct.id.clock));
                    }
                    struct.delete(transaction);
                  }
                } else {
                  break;
                }
              }
            } else {
              addToDeleteSet(unappliedDS, client, clock, clockEnd - clock);
            }
          }
        }
        if (unappliedDS.clients.size > 0) {
          const ds = new UpdateEncoderV2();
          writeVarUint(ds.restEncoder, 0);
          writeDeleteSet(ds, unappliedDS);
          return ds.toUint8Array();
        }
        return null;
      };
      generateNewClientId = uint32;
      Doc = class _Doc extends ObservableV2 {
        /**
         * @param {DocOpts} opts configuration
         */
        constructor({ guid = uuidv4(), collectionid = null, gc = true, gcFilter = () => true, meta = null, autoLoad = false, shouldLoad = true } = {}) {
          super();
          this.gc = gc;
          this.gcFilter = gcFilter;
          this.clientID = generateNewClientId();
          this.guid = guid;
          this.collectionid = collectionid;
          this.share = /* @__PURE__ */ new Map();
          this.store = new StructStore();
          this._transaction = null;
          this._transactionCleanups = [];
          this.subdocs = /* @__PURE__ */ new Set();
          this._item = null;
          this.shouldLoad = shouldLoad;
          this.autoLoad = autoLoad;
          this.meta = meta;
          this.isLoaded = false;
          this.isSynced = false;
          this.isDestroyed = false;
          this.whenLoaded = create4((resolve2) => {
            this.on("load", () => {
              this.isLoaded = true;
              resolve2(this);
            });
          });
          const provideSyncedPromise = () => create4((resolve2) => {
            const eventHandler = (isSynced) => {
              if (isSynced === void 0 || isSynced === true) {
                this.off("sync", eventHandler);
                resolve2();
              }
            };
            this.on("sync", eventHandler);
          });
          this.on("sync", (isSynced) => {
            if (isSynced === false && this.isSynced) {
              this.whenSynced = provideSyncedPromise();
            }
            this.isSynced = isSynced === void 0 || isSynced === true;
            if (this.isSynced && !this.isLoaded) {
              this.emit("load", [this]);
            }
          });
          this.whenSynced = provideSyncedPromise();
        }
        /**
         * Notify the parent document that you request to load data into this subdocument (if it is a subdocument).
         *
         * `load()` might be used in the future to request any provider to load the most current data.
         *
         * It is safe to call `load()` multiple times.
         */
        load() {
          const item = this._item;
          if (item !== null && !this.shouldLoad) {
            transact(
              /** @type {any} */
              item.parent.doc,
              (transaction) => {
                transaction.subdocsLoaded.add(this);
              },
              null,
              true
            );
          }
          this.shouldLoad = true;
        }
        getSubdocs() {
          return this.subdocs;
        }
        getSubdocGuids() {
          return new Set(from(this.subdocs).map((doc2) => doc2.guid));
        }
        /**
         * Changes that happen inside of a transaction are bundled. This means that
         * the observer fires _after_ the transaction is finished and that all changes
         * that happened inside of the transaction are sent as one message to the
         * other peers.
         *
         * @template T
         * @param {function(Transaction):T} f The function that should be executed as a transaction
         * @param {any} [origin] Origin of who started the transaction. Will be stored on transaction.origin
         * @return T
         *
         * @public
         */
        transact(f, origin = null) {
          return transact(this, f, origin);
        }
        /**
         * Define a shared data type.
         *
         * Multiple calls of `ydoc.get(name, TypeConstructor)` yield the same result
         * and do not overwrite each other. I.e.
         * `ydoc.get(name, Y.Array) === ydoc.get(name, Y.Array)`
         *
         * After this method is called, the type is also available on `ydoc.share.get(name)`.
         *
         * *Best Practices:*
         * Define all types right after the Y.Doc instance is created and store them in a separate object.
         * Also use the typed methods `getText(name)`, `getArray(name)`, ..
         *
         * @template {typeof AbstractType<any>} Type
         * @example
         *   const ydoc = new Y.Doc(..)
         *   const appState = {
         *     document: ydoc.getText('document')
         *     comments: ydoc.getArray('comments')
         *   }
         *
         * @param {string} name
         * @param {Type} TypeConstructor The constructor of the type definition. E.g. Y.Text, Y.Array, Y.Map, ...
         * @return {InstanceType<Type>} The created type. Constructed with TypeConstructor
         *
         * @public
         */
        get(name, TypeConstructor = (
          /** @type {any} */
          AbstractType
        )) {
          const type = setIfUndefined(this.share, name, () => {
            const t = new TypeConstructor();
            t._integrate(this, null);
            return t;
          });
          const Constr = type.constructor;
          if (TypeConstructor !== AbstractType && Constr !== TypeConstructor) {
            if (Constr === AbstractType) {
              const t = new TypeConstructor();
              t._map = type._map;
              type._map.forEach(
                /** @param {Item?} n */
                (n) => {
                  for (; n !== null; n = n.left) {
                    n.parent = t;
                  }
                }
              );
              t._start = type._start;
              for (let n = t._start; n !== null; n = n.right) {
                n.parent = t;
              }
              t._length = type._length;
              this.share.set(name, t);
              t._integrate(this, null);
              return (
                /** @type {InstanceType<Type>} */
                t
              );
            } else {
              throw new Error(`Type with the name ${name} has already been defined with a different constructor`);
            }
          }
          return (
            /** @type {InstanceType<Type>} */
            type
          );
        }
        /**
         * @template T
         * @param {string} [name]
         * @return {YArray<T>}
         *
         * @public
         */
        getArray(name = "") {
          return (
            /** @type {YArray<T>} */
            this.get(name, YArray)
          );
        }
        /**
         * @param {string} [name]
         * @return {YText}
         *
         * @public
         */
        getText(name = "") {
          return this.get(name, YText);
        }
        /**
         * @template T
         * @param {string} [name]
         * @return {YMap<T>}
         *
         * @public
         */
        getMap(name = "") {
          return (
            /** @type {YMap<T>} */
            this.get(name, YMap)
          );
        }
        /**
         * @param {string} [name]
         * @return {YXmlElement}
         *
         * @public
         */
        getXmlElement(name = "") {
          return (
            /** @type {YXmlElement<{[key:string]:string}>} */
            this.get(name, YXmlElement)
          );
        }
        /**
         * @param {string} [name]
         * @return {YXmlFragment}
         *
         * @public
         */
        getXmlFragment(name = "") {
          return this.get(name, YXmlFragment);
        }
        /**
         * Converts the entire document into a js object, recursively traversing each yjs type
         * Doesn't log types that have not been defined (using ydoc.getType(..)).
         *
         * @deprecated Do not use this method and rather call toJSON directly on the shared types.
         *
         * @return {Object<string, any>}
         */
        toJSON() {
          const doc2 = {};
          this.share.forEach((value, key) => {
            doc2[key] = value.toJSON();
          });
          return doc2;
        }
        /**
         * Emit `destroy` event and unregister all event handlers.
         */
        destroy() {
          this.isDestroyed = true;
          from(this.subdocs).forEach((subdoc) => subdoc.destroy());
          const item = this._item;
          if (item !== null) {
            this._item = null;
            const content = (
              /** @type {ContentDoc} */
              item.content
            );
            content.doc = new _Doc({ guid: this.guid, ...content.opts, shouldLoad: false });
            content.doc._item = item;
            transact(
              /** @type {any} */
              item.parent.doc,
              (transaction) => {
                const doc2 = content.doc;
                if (!item.deleted) {
                  transaction.subdocsAdded.add(doc2);
                }
                transaction.subdocsRemoved.add(this);
              },
              null,
              true
            );
          }
          this.emit("destroyed", [true]);
          this.emit("destroy", [this]);
          super.destroy();
        }
      };
      DSDecoderV1 = class {
        /**
         * @param {decoding.Decoder} decoder
         */
        constructor(decoder) {
          this.restDecoder = decoder;
        }
        resetDsCurVal() {
        }
        /**
         * @return {number}
         */
        readDsClock() {
          return readVarUint(this.restDecoder);
        }
        /**
         * @return {number}
         */
        readDsLen() {
          return readVarUint(this.restDecoder);
        }
      };
      UpdateDecoderV1 = class extends DSDecoderV1 {
        /**
         * @return {ID}
         */
        readLeftID() {
          return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
        }
        /**
         * @return {ID}
         */
        readRightID() {
          return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
        }
        /**
         * Read the next client id.
         * Use this in favor of readID whenever possible to reduce the number of objects created.
         */
        readClient() {
          return readVarUint(this.restDecoder);
        }
        /**
         * @return {number} info An unsigned 8-bit integer
         */
        readInfo() {
          return readUint8(this.restDecoder);
        }
        /**
         * @return {string}
         */
        readString() {
          return readVarString(this.restDecoder);
        }
        /**
         * @return {boolean} isKey
         */
        readParentInfo() {
          return readVarUint(this.restDecoder) === 1;
        }
        /**
         * @return {number} info An unsigned 8-bit integer
         */
        readTypeRef() {
          return readVarUint(this.restDecoder);
        }
        /**
         * Write len of a struct - well suited for Opt RLE encoder.
         *
         * @return {number} len
         */
        readLen() {
          return readVarUint(this.restDecoder);
        }
        /**
         * @return {any}
         */
        readAny() {
          return readAny(this.restDecoder);
        }
        /**
         * @return {Uint8Array}
         */
        readBuf() {
          return copyUint8Array(readVarUint8Array(this.restDecoder));
        }
        /**
         * Legacy implementation uses JSON parse. We use any-decoding in v2.
         *
         * @return {any}
         */
        readJSON() {
          return JSON.parse(readVarString(this.restDecoder));
        }
        /**
         * @return {string}
         */
        readKey() {
          return readVarString(this.restDecoder);
        }
      };
      DSDecoderV2 = class {
        /**
         * @param {decoding.Decoder} decoder
         */
        constructor(decoder) {
          this.dsCurrVal = 0;
          this.restDecoder = decoder;
        }
        resetDsCurVal() {
          this.dsCurrVal = 0;
        }
        /**
         * @return {number}
         */
        readDsClock() {
          this.dsCurrVal += readVarUint(this.restDecoder);
          return this.dsCurrVal;
        }
        /**
         * @return {number}
         */
        readDsLen() {
          const diff = readVarUint(this.restDecoder) + 1;
          this.dsCurrVal += diff;
          return diff;
        }
      };
      UpdateDecoderV2 = class extends DSDecoderV2 {
        /**
         * @param {decoding.Decoder} decoder
         */
        constructor(decoder) {
          super(decoder);
          this.keys = [];
          readVarUint(decoder);
          this.keyClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
          this.clientDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
          this.leftClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
          this.rightClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
          this.infoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
          this.stringDecoder = new StringDecoder(readVarUint8Array(decoder));
          this.parentInfoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
          this.typeRefDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
          this.lenDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
        }
        /**
         * @return {ID}
         */
        readLeftID() {
          return new ID(this.clientDecoder.read(), this.leftClockDecoder.read());
        }
        /**
         * @return {ID}
         */
        readRightID() {
          return new ID(this.clientDecoder.read(), this.rightClockDecoder.read());
        }
        /**
         * Read the next client id.
         * Use this in favor of readID whenever possible to reduce the number of objects created.
         */
        readClient() {
          return this.clientDecoder.read();
        }
        /**
         * @return {number} info An unsigned 8-bit integer
         */
        readInfo() {
          return (
            /** @type {number} */
            this.infoDecoder.read()
          );
        }
        /**
         * @return {string}
         */
        readString() {
          return this.stringDecoder.read();
        }
        /**
         * @return {boolean}
         */
        readParentInfo() {
          return this.parentInfoDecoder.read() === 1;
        }
        /**
         * @return {number} An unsigned 8-bit integer
         */
        readTypeRef() {
          return this.typeRefDecoder.read();
        }
        /**
         * Write len of a struct - well suited for Opt RLE encoder.
         *
         * @return {number}
         */
        readLen() {
          return this.lenDecoder.read();
        }
        /**
         * @return {any}
         */
        readAny() {
          return readAny(this.restDecoder);
        }
        /**
         * @return {Uint8Array}
         */
        readBuf() {
          return readVarUint8Array(this.restDecoder);
        }
        /**
         * This is mainly here for legacy purposes.
         *
         * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
         *
         * @return {any}
         */
        readJSON() {
          return readAny(this.restDecoder);
        }
        /**
         * @return {string}
         */
        readKey() {
          const keyClock = this.keyClockDecoder.read();
          if (keyClock < this.keys.length) {
            return this.keys[keyClock];
          } else {
            const key = this.stringDecoder.read();
            this.keys.push(key);
            return key;
          }
        }
      };
      DSEncoderV1 = class {
        constructor() {
          this.restEncoder = createEncoder();
        }
        toUint8Array() {
          return toUint8Array(this.restEncoder);
        }
        resetDsCurVal() {
        }
        /**
         * @param {number} clock
         */
        writeDsClock(clock) {
          writeVarUint(this.restEncoder, clock);
        }
        /**
         * @param {number} len
         */
        writeDsLen(len) {
          writeVarUint(this.restEncoder, len);
        }
      };
      UpdateEncoderV1 = class extends DSEncoderV1 {
        /**
         * @param {ID} id
         */
        writeLeftID(id2) {
          writeVarUint(this.restEncoder, id2.client);
          writeVarUint(this.restEncoder, id2.clock);
        }
        /**
         * @param {ID} id
         */
        writeRightID(id2) {
          writeVarUint(this.restEncoder, id2.client);
          writeVarUint(this.restEncoder, id2.clock);
        }
        /**
         * Use writeClient and writeClock instead of writeID if possible.
         * @param {number} client
         */
        writeClient(client) {
          writeVarUint(this.restEncoder, client);
        }
        /**
         * @param {number} info An unsigned 8-bit integer
         */
        writeInfo(info) {
          writeUint8(this.restEncoder, info);
        }
        /**
         * @param {string} s
         */
        writeString(s) {
          writeVarString(this.restEncoder, s);
        }
        /**
         * @param {boolean} isYKey
         */
        writeParentInfo(isYKey) {
          writeVarUint(this.restEncoder, isYKey ? 1 : 0);
        }
        /**
         * @param {number} info An unsigned 8-bit integer
         */
        writeTypeRef(info) {
          writeVarUint(this.restEncoder, info);
        }
        /**
         * Write len of a struct - well suited for Opt RLE encoder.
         *
         * @param {number} len
         */
        writeLen(len) {
          writeVarUint(this.restEncoder, len);
        }
        /**
         * @param {any} any
         */
        writeAny(any2) {
          writeAny(this.restEncoder, any2);
        }
        /**
         * @param {Uint8Array} buf
         */
        writeBuf(buf) {
          writeVarUint8Array(this.restEncoder, buf);
        }
        /**
         * @param {any} embed
         */
        writeJSON(embed) {
          writeVarString(this.restEncoder, JSON.stringify(embed));
        }
        /**
         * @param {string} key
         */
        writeKey(key) {
          writeVarString(this.restEncoder, key);
        }
      };
      DSEncoderV2 = class {
        constructor() {
          this.restEncoder = createEncoder();
          this.dsCurrVal = 0;
        }
        toUint8Array() {
          return toUint8Array(this.restEncoder);
        }
        resetDsCurVal() {
          this.dsCurrVal = 0;
        }
        /**
         * @param {number} clock
         */
        writeDsClock(clock) {
          const diff = clock - this.dsCurrVal;
          this.dsCurrVal = clock;
          writeVarUint(this.restEncoder, diff);
        }
        /**
         * @param {number} len
         */
        writeDsLen(len) {
          if (len === 0) {
            unexpectedCase();
          }
          writeVarUint(this.restEncoder, len - 1);
          this.dsCurrVal += len;
        }
      };
      UpdateEncoderV2 = class extends DSEncoderV2 {
        constructor() {
          super();
          this.keyMap = /* @__PURE__ */ new Map();
          this.keyClock = 0;
          this.keyClockEncoder = new IntDiffOptRleEncoder();
          this.clientEncoder = new UintOptRleEncoder();
          this.leftClockEncoder = new IntDiffOptRleEncoder();
          this.rightClockEncoder = new IntDiffOptRleEncoder();
          this.infoEncoder = new RleEncoder(writeUint8);
          this.stringEncoder = new StringEncoder();
          this.parentInfoEncoder = new RleEncoder(writeUint8);
          this.typeRefEncoder = new UintOptRleEncoder();
          this.lenEncoder = new UintOptRleEncoder();
        }
        toUint8Array() {
          const encoder = createEncoder();
          writeVarUint(encoder, 0);
          writeVarUint8Array(encoder, this.keyClockEncoder.toUint8Array());
          writeVarUint8Array(encoder, this.clientEncoder.toUint8Array());
          writeVarUint8Array(encoder, this.leftClockEncoder.toUint8Array());
          writeVarUint8Array(encoder, this.rightClockEncoder.toUint8Array());
          writeVarUint8Array(encoder, toUint8Array(this.infoEncoder));
          writeVarUint8Array(encoder, this.stringEncoder.toUint8Array());
          writeVarUint8Array(encoder, toUint8Array(this.parentInfoEncoder));
          writeVarUint8Array(encoder, this.typeRefEncoder.toUint8Array());
          writeVarUint8Array(encoder, this.lenEncoder.toUint8Array());
          writeUint8Array(encoder, toUint8Array(this.restEncoder));
          return toUint8Array(encoder);
        }
        /**
         * @param {ID} id
         */
        writeLeftID(id2) {
          this.clientEncoder.write(id2.client);
          this.leftClockEncoder.write(id2.clock);
        }
        /**
         * @param {ID} id
         */
        writeRightID(id2) {
          this.clientEncoder.write(id2.client);
          this.rightClockEncoder.write(id2.clock);
        }
        /**
         * @param {number} client
         */
        writeClient(client) {
          this.clientEncoder.write(client);
        }
        /**
         * @param {number} info An unsigned 8-bit integer
         */
        writeInfo(info) {
          this.infoEncoder.write(info);
        }
        /**
         * @param {string} s
         */
        writeString(s) {
          this.stringEncoder.write(s);
        }
        /**
         * @param {boolean} isYKey
         */
        writeParentInfo(isYKey) {
          this.parentInfoEncoder.write(isYKey ? 1 : 0);
        }
        /**
         * @param {number} info An unsigned 8-bit integer
         */
        writeTypeRef(info) {
          this.typeRefEncoder.write(info);
        }
        /**
         * Write len of a struct - well suited for Opt RLE encoder.
         *
         * @param {number} len
         */
        writeLen(len) {
          this.lenEncoder.write(len);
        }
        /**
         * @param {any} any
         */
        writeAny(any2) {
          writeAny(this.restEncoder, any2);
        }
        /**
         * @param {Uint8Array} buf
         */
        writeBuf(buf) {
          writeVarUint8Array(this.restEncoder, buf);
        }
        /**
         * This is mainly here for legacy purposes.
         *
         * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
         *
         * @param {any} embed
         */
        writeJSON(embed) {
          writeAny(this.restEncoder, embed);
        }
        /**
         * Property keys are often reused. For example, in y-prosemirror the key `bold` might
         * occur very often. For a 3d application, the key `position` might occur very often.
         *
         * We cache these keys in a Map and refer to them via a unique number.
         *
         * @param {string} key
         */
        writeKey(key) {
          const clock = this.keyMap.get(key);
          if (clock === void 0) {
            this.keyClockEncoder.write(this.keyClock++);
            this.stringEncoder.write(key);
          } else {
            this.keyClockEncoder.write(clock);
          }
        }
      };
      writeStructs = (encoder, structs, client, clock) => {
        clock = max(clock, structs[0].id.clock);
        const startNewStructs = findIndexSS(structs, clock);
        writeVarUint(encoder.restEncoder, structs.length - startNewStructs);
        encoder.writeClient(client);
        writeVarUint(encoder.restEncoder, clock);
        const firstStruct = structs[startNewStructs];
        firstStruct.write(encoder, clock - firstStruct.id.clock);
        for (let i = startNewStructs + 1; i < structs.length; i++) {
          structs[i].write(encoder, 0);
        }
      };
      writeClientsStructs = (encoder, store, _sm) => {
        const sm = /* @__PURE__ */ new Map();
        _sm.forEach((clock, client) => {
          if (getState(store, client) > clock) {
            sm.set(client, clock);
          }
        });
        getStateVector(store).forEach((_clock, client) => {
          if (!_sm.has(client)) {
            sm.set(client, 0);
          }
        });
        writeVarUint(encoder.restEncoder, sm.size);
        from(sm.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
          writeStructs(
            encoder,
            /** @type {Array<GC|Item>} */
            store.clients.get(client),
            client,
            clock
          );
        });
      };
      readClientsStructRefs = (decoder, doc2) => {
        const clientRefs = create();
        const numOfStateUpdates = readVarUint(decoder.restDecoder);
        for (let i = 0; i < numOfStateUpdates; i++) {
          const numberOfStructs = readVarUint(decoder.restDecoder);
          const refs = new Array(numberOfStructs);
          const client = decoder.readClient();
          let clock = readVarUint(decoder.restDecoder);
          clientRefs.set(client, { i: 0, refs });
          for (let i2 = 0; i2 < numberOfStructs; i2++) {
            const info = decoder.readInfo();
            switch (BITS5 & info) {
              case 0: {
                const len = decoder.readLen();
                refs[i2] = new GC(createID(client, clock), len);
                clock += len;
                break;
              }
              case 10: {
                const len = readVarUint(decoder.restDecoder);
                refs[i2] = new Skip(createID(client, clock), len);
                clock += len;
                break;
              }
              default: {
                const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
                const struct = new Item(
                  createID(client, clock),
                  null,
                  // left
                  (info & BIT8) === BIT8 ? decoder.readLeftID() : null,
                  // origin
                  null,
                  // right
                  (info & BIT7) === BIT7 ? decoder.readRightID() : null,
                  // right origin
                  cantCopyParentInfo ? decoder.readParentInfo() ? doc2.get(decoder.readString()) : decoder.readLeftID() : null,
                  // parent
                  cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null,
                  // parentSub
                  readItemContent(decoder, info)
                  // item content
                );
                refs[i2] = struct;
                clock += struct.length;
              }
            }
          }
        }
        return clientRefs;
      };
      integrateStructs = (transaction, store, clientsStructRefs) => {
        const stack = [];
        let clientsStructRefsIds = from(clientsStructRefs.keys()).sort((a, b) => a - b);
        if (clientsStructRefsIds.length === 0) {
          return null;
        }
        const getNextStructTarget = () => {
          if (clientsStructRefsIds.length === 0) {
            return null;
          }
          let nextStructsTarget = (
            /** @type {{i:number,refs:Array<GC|Item>}} */
            clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1])
          );
          while (nextStructsTarget.refs.length === nextStructsTarget.i) {
            clientsStructRefsIds.pop();
            if (clientsStructRefsIds.length > 0) {
              nextStructsTarget = /** @type {{i:number,refs:Array<GC|Item>}} */
              clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]);
            } else {
              return null;
            }
          }
          return nextStructsTarget;
        };
        let curStructsTarget = getNextStructTarget();
        if (curStructsTarget === null) {
          return null;
        }
        const restStructs = new StructStore();
        const missingSV = /* @__PURE__ */ new Map();
        const updateMissingSv = (client, clock) => {
          const mclock = missingSV.get(client);
          if (mclock == null || mclock > clock) {
            missingSV.set(client, clock);
          }
        };
        let stackHead = (
          /** @type {any} */
          curStructsTarget.refs[
            /** @type {any} */
            curStructsTarget.i++
          ]
        );
        const state = /* @__PURE__ */ new Map();
        const addStackToRestSS = () => {
          for (const item of stack) {
            const client = item.id.client;
            const inapplicableItems = clientsStructRefs.get(client);
            if (inapplicableItems) {
              inapplicableItems.i--;
              restStructs.clients.set(client, inapplicableItems.refs.slice(inapplicableItems.i));
              clientsStructRefs.delete(client);
              inapplicableItems.i = 0;
              inapplicableItems.refs = [];
            } else {
              restStructs.clients.set(client, [item]);
            }
            clientsStructRefsIds = clientsStructRefsIds.filter((c) => c !== client);
          }
          stack.length = 0;
        };
        while (true) {
          if (stackHead.constructor !== Skip) {
            const localClock = setIfUndefined(state, stackHead.id.client, () => getState(store, stackHead.id.client));
            const offset = localClock - stackHead.id.clock;
            if (offset < 0) {
              stack.push(stackHead);
              updateMissingSv(stackHead.id.client, stackHead.id.clock - 1);
              addStackToRestSS();
            } else {
              const missing = stackHead.getMissing(transaction, store);
              if (missing !== null) {
                stack.push(stackHead);
                const structRefs = clientsStructRefs.get(
                  /** @type {number} */
                  missing
                ) || { refs: [], i: 0 };
                if (structRefs.refs.length === structRefs.i) {
                  updateMissingSv(
                    /** @type {number} */
                    missing,
                    getState(store, missing)
                  );
                  addStackToRestSS();
                } else {
                  stackHead = structRefs.refs[structRefs.i++];
                  continue;
                }
              } else if (offset === 0 || offset < stackHead.length) {
                stackHead.integrate(transaction, offset);
                state.set(stackHead.id.client, stackHead.id.clock + stackHead.length);
              }
            }
          }
          if (stack.length > 0) {
            stackHead = /** @type {GC|Item} */
            stack.pop();
          } else if (curStructsTarget !== null && curStructsTarget.i < curStructsTarget.refs.length) {
            stackHead = /** @type {GC|Item} */
            curStructsTarget.refs[curStructsTarget.i++];
          } else {
            curStructsTarget = getNextStructTarget();
            if (curStructsTarget === null) {
              break;
            } else {
              stackHead = /** @type {GC|Item} */
              curStructsTarget.refs[curStructsTarget.i++];
            }
          }
        }
        if (restStructs.clients.size > 0) {
          const encoder = new UpdateEncoderV2();
          writeClientsStructs(encoder, restStructs, /* @__PURE__ */ new Map());
          writeVarUint(encoder.restEncoder, 0);
          return { missing: missingSV, update: encoder.toUint8Array() };
        }
        return null;
      };
      writeStructsFromTransaction = (encoder, transaction) => writeClientsStructs(encoder, transaction.doc.store, transaction.beforeState);
      readUpdateV2 = (decoder, ydoc, transactionOrigin, structDecoder = new UpdateDecoderV2(decoder)) => transact(ydoc, (transaction) => {
        transaction.local = false;
        let retry = false;
        const doc2 = transaction.doc;
        const store = doc2.store;
        const ss = readClientsStructRefs(structDecoder, doc2);
        const restStructs = integrateStructs(transaction, store, ss);
        const pending = store.pendingStructs;
        if (pending) {
          for (const [client, clock] of pending.missing) {
            if (clock < getState(store, client)) {
              retry = true;
              break;
            }
          }
          if (restStructs) {
            for (const [client, clock] of restStructs.missing) {
              const mclock = pending.missing.get(client);
              if (mclock == null || mclock > clock) {
                pending.missing.set(client, clock);
              }
            }
            pending.update = mergeUpdatesV2([pending.update, restStructs.update]);
          }
        } else {
          store.pendingStructs = restStructs;
        }
        const dsRest = readAndApplyDeleteSet(structDecoder, transaction, store);
        if (store.pendingDs) {
          const pendingDSUpdate = new UpdateDecoderV2(createDecoder(store.pendingDs));
          readVarUint(pendingDSUpdate.restDecoder);
          const dsRest2 = readAndApplyDeleteSet(pendingDSUpdate, transaction, store);
          if (dsRest && dsRest2) {
            store.pendingDs = mergeUpdatesV2([dsRest, dsRest2]);
          } else {
            store.pendingDs = dsRest || dsRest2;
          }
        } else {
          store.pendingDs = dsRest;
        }
        if (retry) {
          const update = (
            /** @type {{update: Uint8Array}} */
            store.pendingStructs.update
          );
          store.pendingStructs = null;
          applyUpdateV2(transaction.doc, update);
        }
      }, transactionOrigin, false);
      applyUpdateV2 = (ydoc, update, transactionOrigin, YDecoder = UpdateDecoderV2) => {
        const decoder = createDecoder(update);
        readUpdateV2(decoder, ydoc, transactionOrigin, new YDecoder(decoder));
      };
      applyUpdate = (ydoc, update, transactionOrigin) => applyUpdateV2(ydoc, update, transactionOrigin, UpdateDecoderV1);
      writeStateAsUpdate = (encoder, doc2, targetStateVector = /* @__PURE__ */ new Map()) => {
        writeClientsStructs(encoder, doc2.store, targetStateVector);
        writeDeleteSet(encoder, createDeleteSetFromStructStore(doc2.store));
      };
      encodeStateAsUpdateV2 = (doc2, encodedTargetStateVector = new Uint8Array([0]), encoder = new UpdateEncoderV2()) => {
        const targetStateVector = decodeStateVector(encodedTargetStateVector);
        writeStateAsUpdate(encoder, doc2, targetStateVector);
        const updates = [encoder.toUint8Array()];
        if (doc2.store.pendingDs) {
          updates.push(doc2.store.pendingDs);
        }
        if (doc2.store.pendingStructs) {
          updates.push(diffUpdateV2(doc2.store.pendingStructs.update, encodedTargetStateVector));
        }
        if (updates.length > 1) {
          if (encoder.constructor === UpdateEncoderV1) {
            return mergeUpdates(updates.map((update, i) => i === 0 ? update : convertUpdateFormatV2ToV1(update)));
          } else if (encoder.constructor === UpdateEncoderV2) {
            return mergeUpdatesV2(updates);
          }
        }
        return updates[0];
      };
      encodeStateAsUpdate = (doc2, encodedTargetStateVector) => encodeStateAsUpdateV2(doc2, encodedTargetStateVector, new UpdateEncoderV1());
      readStateVector = (decoder) => {
        const ss = /* @__PURE__ */ new Map();
        const ssLength = readVarUint(decoder.restDecoder);
        for (let i = 0; i < ssLength; i++) {
          const client = readVarUint(decoder.restDecoder);
          const clock = readVarUint(decoder.restDecoder);
          ss.set(client, clock);
        }
        return ss;
      };
      decodeStateVector = (decodedState) => readStateVector(new DSDecoderV1(createDecoder(decodedState)));
      writeStateVector = (encoder, sv) => {
        writeVarUint(encoder.restEncoder, sv.size);
        from(sv.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
          writeVarUint(encoder.restEncoder, client);
          writeVarUint(encoder.restEncoder, clock);
        });
        return encoder;
      };
      writeDocumentStateVector = (encoder, doc2) => writeStateVector(encoder, getStateVector(doc2.store));
      encodeStateVectorV2 = (doc2, encoder = new DSEncoderV2()) => {
        if (doc2 instanceof Map) {
          writeStateVector(encoder, doc2);
        } else {
          writeDocumentStateVector(encoder, doc2);
        }
        return encoder.toUint8Array();
      };
      encodeStateVector = (doc2) => encodeStateVectorV2(doc2, new DSEncoderV1());
      EventHandler = class {
        constructor() {
          this.l = [];
        }
      };
      createEventHandler = () => new EventHandler();
      addEventHandlerListener = (eventHandler, f) => eventHandler.l.push(f);
      removeEventHandlerListener = (eventHandler, f) => {
        const l = eventHandler.l;
        const len = l.length;
        eventHandler.l = l.filter((g) => f !== g);
        if (len === eventHandler.l.length) {
          console.error("[yjs] Tried to remove event handler that doesn't exist.");
        }
      };
      callEventHandlerListeners = (eventHandler, arg0, arg1) => callAll(eventHandler.l, [arg0, arg1]);
      ID = class {
        /**
         * @param {number} client client id
         * @param {number} clock unique per client id, continuous number
         */
        constructor(client, clock) {
          this.client = client;
          this.clock = clock;
        }
      };
      compareIDs = (a, b) => a === b || a !== null && b !== null && a.client === b.client && a.clock === b.clock;
      createID = (client, clock) => new ID(client, clock);
      findRootTypeKey = (type) => {
        for (const [key, value] of type.doc.share.entries()) {
          if (value === type) {
            return key;
          }
        }
        throw unexpectedCase();
      };
      Snapshot = class {
        /**
         * @param {DeleteSet} ds
         * @param {Map<number,number>} sv state map
         */
        constructor(ds, sv) {
          this.ds = ds;
          this.sv = sv;
        }
      };
      equalSnapshots = (snap1, snap2) => {
        const ds1 = snap1.ds.clients;
        const ds2 = snap2.ds.clients;
        const sv1 = snap1.sv;
        const sv2 = snap2.sv;
        if (sv1.size !== sv2.size || ds1.size !== ds2.size) {
          return false;
        }
        for (const [key, value] of sv1.entries()) {
          if (sv2.get(key) !== value) {
            return false;
          }
        }
        for (const [client, dsitems1] of ds1.entries()) {
          const dsitems2 = ds2.get(client) || [];
          if (dsitems1.length !== dsitems2.length) {
            return false;
          }
          for (let i = 0; i < dsitems1.length; i++) {
            const dsitem1 = dsitems1[i];
            const dsitem2 = dsitems2[i];
            if (dsitem1.clock !== dsitem2.clock || dsitem1.len !== dsitem2.len) {
              return false;
            }
          }
        }
        return true;
      };
      encodeSnapshotV2 = (snapshot2, encoder = new DSEncoderV2()) => {
        writeDeleteSet(encoder, snapshot2.ds);
        writeStateVector(encoder, snapshot2.sv);
        return encoder.toUint8Array();
      };
      encodeSnapshot = (snapshot2) => encodeSnapshotV2(snapshot2, new DSEncoderV1());
      decodeSnapshotV2 = (buf, decoder = new DSDecoderV2(createDecoder(buf))) => {
        return new Snapshot(readDeleteSet(decoder), readStateVector(decoder));
      };
      decodeSnapshot = (buf) => decodeSnapshotV2(buf, new DSDecoderV1(createDecoder(buf)));
      createSnapshot = (ds, sm) => new Snapshot(ds, sm);
      emptySnapshot = createSnapshot(createDeleteSet(), /* @__PURE__ */ new Map());
      snapshot = (doc2) => createSnapshot(createDeleteSetFromStructStore(doc2.store), getStateVector(doc2.store));
      isVisible = (item, snapshot2) => snapshot2 === void 0 ? !item.deleted : snapshot2.sv.has(item.id.client) && (snapshot2.sv.get(item.id.client) || 0) > item.id.clock && !isDeleted(snapshot2.ds, item.id);
      splitSnapshotAffectedStructs = (transaction, snapshot2) => {
        const meta = setIfUndefined(transaction.meta, splitSnapshotAffectedStructs, create2);
        const store = transaction.doc.store;
        if (!meta.has(snapshot2)) {
          snapshot2.sv.forEach((clock, client) => {
            if (clock < getState(store, client)) {
              getItemCleanStart(transaction, createID(client, clock));
            }
          });
          iterateDeletedStructs(transaction, snapshot2.ds, (_item) => {
          });
          meta.add(snapshot2);
        }
      };
      createDocFromSnapshot = (originDoc, snapshot2, newDoc = new Doc()) => {
        if (originDoc.gc) {
          throw new Error("Garbage-collection must be disabled in `originDoc`!");
        }
        const { sv, ds } = snapshot2;
        const encoder = new UpdateEncoderV2();
        originDoc.transact((transaction) => {
          let size2 = 0;
          sv.forEach((clock) => {
            if (clock > 0) {
              size2++;
            }
          });
          writeVarUint(encoder.restEncoder, size2);
          for (const [client, clock] of sv) {
            if (clock === 0) {
              continue;
            }
            if (clock < getState(originDoc.store, client)) {
              getItemCleanStart(transaction, createID(client, clock));
            }
            const structs = originDoc.store.clients.get(client) || [];
            const lastStructIndex = findIndexSS(structs, clock - 1);
            writeVarUint(encoder.restEncoder, lastStructIndex + 1);
            encoder.writeClient(client);
            writeVarUint(encoder.restEncoder, 0);
            for (let i = 0; i <= lastStructIndex; i++) {
              structs[i].write(encoder, 0);
            }
          }
          writeDeleteSet(encoder, ds);
        });
        applyUpdateV2(newDoc, encoder.toUint8Array(), "snapshot");
        return newDoc;
      };
      StructStore = class {
        constructor() {
          this.clients = /* @__PURE__ */ new Map();
          this.pendingStructs = null;
          this.pendingDs = null;
        }
      };
      getStateVector = (store) => {
        const sm = /* @__PURE__ */ new Map();
        store.clients.forEach((structs, client) => {
          const struct = structs[structs.length - 1];
          sm.set(client, struct.id.clock + struct.length);
        });
        return sm;
      };
      getState = (store, client) => {
        const structs = store.clients.get(client);
        if (structs === void 0) {
          return 0;
        }
        const lastStruct = structs[structs.length - 1];
        return lastStruct.id.clock + lastStruct.length;
      };
      addStruct = (store, struct) => {
        let structs = store.clients.get(struct.id.client);
        if (structs === void 0) {
          structs = [];
          store.clients.set(struct.id.client, structs);
        } else {
          const lastStruct = structs[structs.length - 1];
          if (lastStruct.id.clock + lastStruct.length !== struct.id.clock) {
            throw unexpectedCase();
          }
        }
        structs.push(struct);
      };
      findIndexSS = (structs, clock) => {
        let left = 0;
        let right = structs.length - 1;
        let mid = structs[right];
        let midclock = mid.id.clock;
        if (midclock === clock) {
          return right;
        }
        let midindex = floor(clock / (midclock + mid.length - 1) * right);
        while (left <= right) {
          mid = structs[midindex];
          midclock = mid.id.clock;
          if (midclock <= clock) {
            if (clock < midclock + mid.length) {
              return midindex;
            }
            left = midindex + 1;
          } else {
            right = midindex - 1;
          }
          midindex = floor((left + right) / 2);
        }
        throw unexpectedCase();
      };
      find = (store, id2) => {
        const structs = store.clients.get(id2.client);
        return structs[findIndexSS(structs, id2.clock)];
      };
      getItem = /** @type {function(StructStore,ID):Item} */
      find;
      findIndexCleanStart = (transaction, structs, clock) => {
        const index = findIndexSS(structs, clock);
        const struct = structs[index];
        if (struct.id.clock < clock && struct instanceof Item) {
          structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
          return index + 1;
        }
        return index;
      };
      getItemCleanStart = (transaction, id2) => {
        const structs = (
          /** @type {Array<Item>} */
          transaction.doc.store.clients.get(id2.client)
        );
        return structs[findIndexCleanStart(transaction, structs, id2.clock)];
      };
      getItemCleanEnd = (transaction, store, id2) => {
        const structs = store.clients.get(id2.client);
        const index = findIndexSS(structs, id2.clock);
        const struct = structs[index];
        if (id2.clock !== struct.id.clock + struct.length - 1 && struct.constructor !== GC) {
          structs.splice(index + 1, 0, splitItem(transaction, struct, id2.clock - struct.id.clock + 1));
        }
        return struct;
      };
      replaceStruct = (store, struct, newStruct) => {
        const structs = (
          /** @type {Array<GC|Item>} */
          store.clients.get(struct.id.client)
        );
        structs[findIndexSS(structs, struct.id.clock)] = newStruct;
      };
      iterateStructs = (transaction, structs, clockStart, len, f) => {
        if (len === 0) {
          return;
        }
        const clockEnd = clockStart + len;
        let index = findIndexCleanStart(transaction, structs, clockStart);
        let struct;
        do {
          struct = structs[index++];
          if (clockEnd < struct.id.clock + struct.length) {
            findIndexCleanStart(transaction, structs, clockEnd);
          }
          f(struct);
        } while (index < structs.length && structs[index].id.clock < clockEnd);
      };
      Transaction = class {
        /**
         * @param {Doc} doc
         * @param {any} origin
         * @param {boolean} local
         */
        constructor(doc2, origin, local) {
          this.doc = doc2;
          this.deleteSet = new DeleteSet();
          this.beforeState = getStateVector(doc2.store);
          this.afterState = /* @__PURE__ */ new Map();
          this.changed = /* @__PURE__ */ new Map();
          this.changedParentTypes = /* @__PURE__ */ new Map();
          this._mergeStructs = [];
          this.origin = origin;
          this.meta = /* @__PURE__ */ new Map();
          this.local = local;
          this.subdocsAdded = /* @__PURE__ */ new Set();
          this.subdocsRemoved = /* @__PURE__ */ new Set();
          this.subdocsLoaded = /* @__PURE__ */ new Set();
          this._needFormattingCleanup = false;
        }
      };
      writeUpdateMessageFromTransaction = (encoder, transaction) => {
        if (transaction.deleteSet.clients.size === 0 && !any(transaction.afterState, (clock, client) => transaction.beforeState.get(client) !== clock)) {
          return false;
        }
        sortAndMergeDeleteSet(transaction.deleteSet);
        writeStructsFromTransaction(encoder, transaction);
        writeDeleteSet(encoder, transaction.deleteSet);
        return true;
      };
      addChangedTypeToTransaction = (transaction, type, parentSub) => {
        const item = type._item;
        if (item === null || item.id.clock < (transaction.beforeState.get(item.id.client) || 0) && !item.deleted) {
          setIfUndefined(transaction.changed, type, create2).add(parentSub);
        }
      };
      tryToMergeWithLefts = (structs, pos) => {
        let right = structs[pos];
        let left = structs[pos - 1];
        let i = pos;
        for (; i > 0; right = left, left = structs[--i - 1]) {
          if (left.deleted === right.deleted && left.constructor === right.constructor) {
            if (left.mergeWith(right)) {
              if (right instanceof Item && right.parentSub !== null && /** @type {AbstractType<any>} */
              right.parent._map.get(right.parentSub) === right) {
                right.parent._map.set(
                  right.parentSub,
                  /** @type {Item} */
                  left
                );
              }
              continue;
            }
          }
          break;
        }
        const merged = pos - i;
        if (merged) {
          structs.splice(pos + 1 - merged, merged);
        }
        return merged;
      };
      tryGcDeleteSet = (ds, store, gcFilter) => {
        for (const [client, deleteItems] of ds.clients.entries()) {
          const structs = (
            /** @type {Array<GC|Item>} */
            store.clients.get(client)
          );
          for (let di = deleteItems.length - 1; di >= 0; di--) {
            const deleteItem = deleteItems[di];
            const endDeleteItemClock = deleteItem.clock + deleteItem.len;
            for (let si = findIndexSS(structs, deleteItem.clock), struct = structs[si]; si < structs.length && struct.id.clock < endDeleteItemClock; struct = structs[++si]) {
              const struct2 = structs[si];
              if (deleteItem.clock + deleteItem.len <= struct2.id.clock) {
                break;
              }
              if (struct2 instanceof Item && struct2.deleted && !struct2.keep && gcFilter(struct2)) {
                struct2.gc(store, false);
              }
            }
          }
        }
      };
      tryMergeDeleteSet = (ds, store) => {
        ds.clients.forEach((deleteItems, client) => {
          const structs = (
            /** @type {Array<GC|Item>} */
            store.clients.get(client)
          );
          for (let di = deleteItems.length - 1; di >= 0; di--) {
            const deleteItem = deleteItems[di];
            const mostRightIndexToCheck = min(structs.length - 1, 1 + findIndexSS(structs, deleteItem.clock + deleteItem.len - 1));
            for (let si = mostRightIndexToCheck, struct = structs[si]; si > 0 && struct.id.clock >= deleteItem.clock; struct = structs[si]) {
              si -= 1 + tryToMergeWithLefts(structs, si);
            }
          }
        });
      };
      cleanupTransactions = (transactionCleanups, i) => {
        if (i < transactionCleanups.length) {
          const transaction = transactionCleanups[i];
          const doc2 = transaction.doc;
          const store = doc2.store;
          const ds = transaction.deleteSet;
          const mergeStructs = transaction._mergeStructs;
          try {
            sortAndMergeDeleteSet(ds);
            transaction.afterState = getStateVector(transaction.doc.store);
            doc2.emit("beforeObserverCalls", [transaction, doc2]);
            const fs = [];
            transaction.changed.forEach(
              (subs, itemtype) => fs.push(() => {
                if (itemtype._item === null || !itemtype._item.deleted) {
                  itemtype._callObserver(transaction, subs);
                }
              })
            );
            fs.push(() => {
              transaction.changedParentTypes.forEach((events, type) => {
                if (type._dEH.l.length > 0 && (type._item === null || !type._item.deleted)) {
                  events = events.filter(
                    (event) => event.target._item === null || !event.target._item.deleted
                  );
                  events.forEach((event) => {
                    event.currentTarget = type;
                    event._path = null;
                  });
                  events.sort((event1, event2) => event1.path.length - event2.path.length);
                  fs.push(() => {
                    callEventHandlerListeners(type._dEH, events, transaction);
                  });
                }
              });
              fs.push(() => doc2.emit("afterTransaction", [transaction, doc2]));
              fs.push(() => {
                if (transaction._needFormattingCleanup) {
                  cleanupYTextAfterTransaction(transaction);
                }
              });
            });
            callAll(fs, []);
          } finally {
            if (doc2.gc) {
              tryGcDeleteSet(ds, store, doc2.gcFilter);
            }
            tryMergeDeleteSet(ds, store);
            transaction.afterState.forEach((clock, client) => {
              const beforeClock = transaction.beforeState.get(client) || 0;
              if (beforeClock !== clock) {
                const structs = (
                  /** @type {Array<GC|Item>} */
                  store.clients.get(client)
                );
                const firstChangePos = max(findIndexSS(structs, beforeClock), 1);
                for (let i2 = structs.length - 1; i2 >= firstChangePos; ) {
                  i2 -= 1 + tryToMergeWithLefts(structs, i2);
                }
              }
            });
            for (let i2 = mergeStructs.length - 1; i2 >= 0; i2--) {
              const { client, clock } = mergeStructs[i2].id;
              const structs = (
                /** @type {Array<GC|Item>} */
                store.clients.get(client)
              );
              const replacedStructPos = findIndexSS(structs, clock);
              if (replacedStructPos + 1 < structs.length) {
                if (tryToMergeWithLefts(structs, replacedStructPos + 1) > 1) {
                  continue;
                }
              }
              if (replacedStructPos > 0) {
                tryToMergeWithLefts(structs, replacedStructPos);
              }
            }
            if (!transaction.local && transaction.afterState.get(doc2.clientID) !== transaction.beforeState.get(doc2.clientID)) {
              print(ORANGE, BOLD, "[yjs] ", UNBOLD, RED, "Changed the client-id because another client seems to be using it.");
              doc2.clientID = generateNewClientId();
            }
            doc2.emit("afterTransactionCleanup", [transaction, doc2]);
            if (doc2._observers.has("update")) {
              const encoder = new UpdateEncoderV1();
              const hasContent2 = writeUpdateMessageFromTransaction(encoder, transaction);
              if (hasContent2) {
                doc2.emit("update", [encoder.toUint8Array(), transaction.origin, doc2, transaction]);
              }
            }
            if (doc2._observers.has("updateV2")) {
              const encoder = new UpdateEncoderV2();
              const hasContent2 = writeUpdateMessageFromTransaction(encoder, transaction);
              if (hasContent2) {
                doc2.emit("updateV2", [encoder.toUint8Array(), transaction.origin, doc2, transaction]);
              }
            }
            const { subdocsAdded, subdocsLoaded, subdocsRemoved } = transaction;
            if (subdocsAdded.size > 0 || subdocsRemoved.size > 0 || subdocsLoaded.size > 0) {
              subdocsAdded.forEach((subdoc) => {
                subdoc.clientID = doc2.clientID;
                if (subdoc.collectionid == null) {
                  subdoc.collectionid = doc2.collectionid;
                }
                doc2.subdocs.add(subdoc);
              });
              subdocsRemoved.forEach((subdoc) => doc2.subdocs.delete(subdoc));
              doc2.emit("subdocs", [{ loaded: subdocsLoaded, added: subdocsAdded, removed: subdocsRemoved }, doc2, transaction]);
              subdocsRemoved.forEach((subdoc) => subdoc.destroy());
            }
            if (transactionCleanups.length <= i + 1) {
              doc2._transactionCleanups = [];
              doc2.emit("afterAllTransactions", [doc2, transactionCleanups]);
            } else {
              cleanupTransactions(transactionCleanups, i + 1);
            }
          }
        }
      };
      transact = (doc2, f, origin = null, local = true) => {
        const transactionCleanups = doc2._transactionCleanups;
        let initialCall = false;
        let result = null;
        if (doc2._transaction === null) {
          initialCall = true;
          doc2._transaction = new Transaction(doc2, origin, local);
          transactionCleanups.push(doc2._transaction);
          if (transactionCleanups.length === 1) {
            doc2.emit("beforeAllTransactions", [doc2]);
          }
          doc2.emit("beforeTransaction", [doc2._transaction, doc2]);
        }
        try {
          result = f(doc2._transaction);
        } finally {
          if (initialCall) {
            const finishCleanup = doc2._transaction === transactionCleanups[0];
            doc2._transaction = null;
            if (finishCleanup) {
              cleanupTransactions(transactionCleanups, 0);
            }
          }
        }
        return result;
      };
      LazyStructReader = class {
        /**
         * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
         * @param {boolean} filterSkips
         */
        constructor(decoder, filterSkips) {
          this.gen = lazyStructReaderGenerator(decoder);
          this.curr = null;
          this.done = false;
          this.filterSkips = filterSkips;
          this.next();
        }
        /**
         * @return {Item | GC | Skip |null}
         */
        next() {
          do {
            this.curr = this.gen.next().value || null;
          } while (this.filterSkips && this.curr !== null && this.curr.constructor === Skip);
          return this.curr;
        }
      };
      LazyStructWriter = class {
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         */
        constructor(encoder) {
          this.currClient = 0;
          this.startClock = 0;
          this.written = 0;
          this.encoder = encoder;
          this.clientStructs = [];
        }
      };
      mergeUpdates = (updates) => mergeUpdatesV2(updates, UpdateDecoderV1, UpdateEncoderV1);
      sliceStruct = (left, diff) => {
        if (left.constructor === GC) {
          const { client, clock } = left.id;
          return new GC(createID(client, clock + diff), left.length - diff);
        } else if (left.constructor === Skip) {
          const { client, clock } = left.id;
          return new Skip(createID(client, clock + diff), left.length - diff);
        } else {
          const leftItem = (
            /** @type {Item} */
            left
          );
          const { client, clock } = leftItem.id;
          return new Item(
            createID(client, clock + diff),
            null,
            createID(client, clock + diff - 1),
            null,
            leftItem.rightOrigin,
            leftItem.parent,
            leftItem.parentSub,
            leftItem.content.splice(diff)
          );
        }
      };
      mergeUpdatesV2 = (updates, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
        if (updates.length === 1) {
          return updates[0];
        }
        const updateDecoders = updates.map((update) => new YDecoder(createDecoder(update)));
        let lazyStructDecoders = updateDecoders.map((decoder) => new LazyStructReader(decoder, true));
        let currWrite = null;
        const updateEncoder = new YEncoder();
        const lazyStructEncoder = new LazyStructWriter(updateEncoder);
        while (true) {
          lazyStructDecoders = lazyStructDecoders.filter((dec) => dec.curr !== null);
          lazyStructDecoders.sort(
            /** @type {function(any,any):number} */
            (dec1, dec2) => {
              if (dec1.curr.id.client === dec2.curr.id.client) {
                const clockDiff = dec1.curr.id.clock - dec2.curr.id.clock;
                if (clockDiff === 0) {
                  return dec1.curr.constructor === dec2.curr.constructor ? 0 : dec1.curr.constructor === Skip ? 1 : -1;
                } else {
                  return clockDiff;
                }
              } else {
                return dec2.curr.id.client - dec1.curr.id.client;
              }
            }
          );
          if (lazyStructDecoders.length === 0) {
            break;
          }
          const currDecoder = lazyStructDecoders[0];
          const firstClient = (
            /** @type {Item | GC} */
            currDecoder.curr.id.client
          );
          if (currWrite !== null) {
            let curr = (
              /** @type {Item | GC | null} */
              currDecoder.curr
            );
            let iterated = false;
            while (curr !== null && curr.id.clock + curr.length <= currWrite.struct.id.clock + currWrite.struct.length && curr.id.client >= currWrite.struct.id.client) {
              curr = currDecoder.next();
              iterated = true;
            }
            if (curr === null || // current decoder is empty
            curr.id.client !== firstClient || // check whether there is another decoder that has has updates from `firstClient`
            iterated && curr.id.clock > currWrite.struct.id.clock + currWrite.struct.length) {
              continue;
            }
            if (firstClient !== currWrite.struct.id.client) {
              writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
              currWrite = { struct: curr, offset: 0 };
              currDecoder.next();
            } else {
              if (currWrite.struct.id.clock + currWrite.struct.length < curr.id.clock) {
                if (currWrite.struct.constructor === Skip) {
                  currWrite.struct.length = curr.id.clock + curr.length - currWrite.struct.id.clock;
                } else {
                  writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
                  const diff = curr.id.clock - currWrite.struct.id.clock - currWrite.struct.length;
                  const struct = new Skip(createID(firstClient, currWrite.struct.id.clock + currWrite.struct.length), diff);
                  currWrite = { struct, offset: 0 };
                }
              } else {
                const diff = currWrite.struct.id.clock + currWrite.struct.length - curr.id.clock;
                if (diff > 0) {
                  if (currWrite.struct.constructor === Skip) {
                    currWrite.struct.length -= diff;
                  } else {
                    curr = sliceStruct(curr, diff);
                  }
                }
                if (!currWrite.struct.mergeWith(
                  /** @type {any} */
                  curr
                )) {
                  writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
                  currWrite = { struct: curr, offset: 0 };
                  currDecoder.next();
                }
              }
            }
          } else {
            currWrite = { struct: (
              /** @type {Item | GC} */
              currDecoder.curr
            ), offset: 0 };
            currDecoder.next();
          }
          for (let next = currDecoder.curr; next !== null && next.id.client === firstClient && next.id.clock === currWrite.struct.id.clock + currWrite.struct.length && next.constructor !== Skip; next = currDecoder.next()) {
            writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
            currWrite = { struct: next, offset: 0 };
          }
        }
        if (currWrite !== null) {
          writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
          currWrite = null;
        }
        finishLazyStructWriting(lazyStructEncoder);
        const dss = updateDecoders.map((decoder) => readDeleteSet(decoder));
        const ds = mergeDeleteSets(dss);
        writeDeleteSet(updateEncoder, ds);
        return updateEncoder.toUint8Array();
      };
      diffUpdateV2 = (update, sv, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
        const state = decodeStateVector(sv);
        const encoder = new YEncoder();
        const lazyStructWriter = new LazyStructWriter(encoder);
        const decoder = new YDecoder(createDecoder(update));
        const reader = new LazyStructReader(decoder, false);
        while (reader.curr) {
          const curr = reader.curr;
          const currClient = curr.id.client;
          const svClock = state.get(currClient) || 0;
          if (reader.curr.constructor === Skip) {
            reader.next();
            continue;
          }
          if (curr.id.clock + curr.length > svClock) {
            writeStructToLazyStructWriter(lazyStructWriter, curr, max(svClock - curr.id.clock, 0));
            reader.next();
            while (reader.curr && reader.curr.id.client === currClient) {
              writeStructToLazyStructWriter(lazyStructWriter, reader.curr, 0);
              reader.next();
            }
          } else {
            while (reader.curr && reader.curr.id.client === currClient && reader.curr.id.clock + reader.curr.length <= svClock) {
              reader.next();
            }
          }
        }
        finishLazyStructWriting(lazyStructWriter);
        const ds = readDeleteSet(decoder);
        writeDeleteSet(encoder, ds);
        return encoder.toUint8Array();
      };
      flushLazyStructWriter = (lazyWriter) => {
        if (lazyWriter.written > 0) {
          lazyWriter.clientStructs.push({ written: lazyWriter.written, restEncoder: toUint8Array(lazyWriter.encoder.restEncoder) });
          lazyWriter.encoder.restEncoder = createEncoder();
          lazyWriter.written = 0;
        }
      };
      writeStructToLazyStructWriter = (lazyWriter, struct, offset) => {
        if (lazyWriter.written > 0 && lazyWriter.currClient !== struct.id.client) {
          flushLazyStructWriter(lazyWriter);
        }
        if (lazyWriter.written === 0) {
          lazyWriter.currClient = struct.id.client;
          lazyWriter.encoder.writeClient(struct.id.client);
          writeVarUint(lazyWriter.encoder.restEncoder, struct.id.clock + offset);
        }
        struct.write(lazyWriter.encoder, offset);
        lazyWriter.written++;
      };
      finishLazyStructWriting = (lazyWriter) => {
        flushLazyStructWriter(lazyWriter);
        const restEncoder = lazyWriter.encoder.restEncoder;
        writeVarUint(restEncoder, lazyWriter.clientStructs.length);
        for (let i = 0; i < lazyWriter.clientStructs.length; i++) {
          const partStructs = lazyWriter.clientStructs[i];
          writeVarUint(restEncoder, partStructs.written);
          writeUint8Array(restEncoder, partStructs.restEncoder);
        }
      };
      convertUpdateFormat = (update, blockTransformer, YDecoder, YEncoder) => {
        const updateDecoder = new YDecoder(createDecoder(update));
        const lazyDecoder = new LazyStructReader(updateDecoder, false);
        const updateEncoder = new YEncoder();
        const lazyWriter = new LazyStructWriter(updateEncoder);
        for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) {
          writeStructToLazyStructWriter(lazyWriter, blockTransformer(curr), 0);
        }
        finishLazyStructWriting(lazyWriter);
        const ds = readDeleteSet(updateDecoder);
        writeDeleteSet(updateEncoder, ds);
        return updateEncoder.toUint8Array();
      };
      convertUpdateFormatV2ToV1 = (update) => convertUpdateFormat(update, id, UpdateDecoderV2, UpdateEncoderV1);
      errorComputeChanges = "You must not compute changes after the event-handler fired.";
      YEvent = class {
        /**
         * @param {T} target The changed type.
         * @param {Transaction} transaction
         */
        constructor(target, transaction) {
          this.target = target;
          this.currentTarget = target;
          this.transaction = transaction;
          this._changes = null;
          this._keys = null;
          this._delta = null;
          this._path = null;
        }
        /**
         * Computes the path from `y` to the changed type.
         *
         * @todo v14 should standardize on path: Array<{parent, index}> because that is easier to work with.
         *
         * The following property holds:
         * @example
         *   let type = y
         *   event.path.forEach(dir => {
         *     type = type.get(dir)
         *   })
         *   type === event.target // => true
         */
        get path() {
          return this._path || (this._path = getPathTo(this.currentTarget, this.target));
        }
        /**
         * Check if a struct is deleted by this event.
         *
         * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
         *
         * @param {AbstractStruct} struct
         * @return {boolean}
         */
        deletes(struct) {
          return isDeleted(this.transaction.deleteSet, struct.id);
        }
        /**
         * @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any }>}
         */
        get keys() {
          if (this._keys === null) {
            if (this.transaction.doc._transactionCleanups.length === 0) {
              throw create3(errorComputeChanges);
            }
            const keys2 = /* @__PURE__ */ new Map();
            const target = this.target;
            const changed = (
              /** @type Set<string|null> */
              this.transaction.changed.get(target)
            );
            changed.forEach((key) => {
              if (key !== null) {
                const item = (
                  /** @type {Item} */
                  target._map.get(key)
                );
                let action;
                let oldValue;
                if (this.adds(item)) {
                  let prev = item.left;
                  while (prev !== null && this.adds(prev)) {
                    prev = prev.left;
                  }
                  if (this.deletes(item)) {
                    if (prev !== null && this.deletes(prev)) {
                      action = "delete";
                      oldValue = last(prev.content.getContent());
                    } else {
                      return;
                    }
                  } else {
                    if (prev !== null && this.deletes(prev)) {
                      action = "update";
                      oldValue = last(prev.content.getContent());
                    } else {
                      action = "add";
                      oldValue = void 0;
                    }
                  }
                } else {
                  if (this.deletes(item)) {
                    action = "delete";
                    oldValue = last(
                      /** @type {Item} */
                      item.content.getContent()
                    );
                  } else {
                    return;
                  }
                }
                keys2.set(key, { action, oldValue });
              }
            });
            this._keys = keys2;
          }
          return this._keys;
        }
        /**
         * This is a computed property. Note that this can only be safely computed during the
         * event call. Computing this property after other changes happened might result in
         * unexpected behavior (incorrect computation of deltas). A safe way to collect changes
         * is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
         *
         * @type {Array<{insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any>}>}
         */
        get delta() {
          return this.changes.delta;
        }
        /**
         * Check if a struct is added by this event.
         *
         * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
         *
         * @param {AbstractStruct} struct
         * @return {boolean}
         */
        adds(struct) {
          return struct.id.clock >= (this.transaction.beforeState.get(struct.id.client) || 0);
        }
        /**
         * This is a computed property. Note that this can only be safely computed during the
         * event call. Computing this property after other changes happened might result in
         * unexpected behavior (incorrect computation of deltas). A safe way to collect changes
         * is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
         *
         * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
         */
        get changes() {
          let changes = this._changes;
          if (changes === null) {
            if (this.transaction.doc._transactionCleanups.length === 0) {
              throw create3(errorComputeChanges);
            }
            const target = this.target;
            const added = create2();
            const deleted = create2();
            const delta = [];
            changes = {
              added,
              deleted,
              delta,
              keys: this.keys
            };
            const changed = (
              /** @type Set<string|null> */
              this.transaction.changed.get(target)
            );
            if (changed.has(null)) {
              let lastOp = null;
              const packOp = () => {
                if (lastOp) {
                  delta.push(lastOp);
                }
              };
              for (let item = target._start; item !== null; item = item.right) {
                if (item.deleted) {
                  if (this.deletes(item) && !this.adds(item)) {
                    if (lastOp === null || lastOp.delete === void 0) {
                      packOp();
                      lastOp = { delete: 0 };
                    }
                    lastOp.delete += item.length;
                    deleted.add(item);
                  }
                } else {
                  if (this.adds(item)) {
                    if (lastOp === null || lastOp.insert === void 0) {
                      packOp();
                      lastOp = { insert: [] };
                    }
                    lastOp.insert = lastOp.insert.concat(item.content.getContent());
                    added.add(item);
                  } else {
                    if (lastOp === null || lastOp.retain === void 0) {
                      packOp();
                      lastOp = { retain: 0 };
                    }
                    lastOp.retain += item.length;
                  }
                }
              }
              if (lastOp !== null && lastOp.retain === void 0) {
                packOp();
              }
            }
            this._changes = changes;
          }
          return (
            /** @type {any} */
            changes
          );
        }
      };
      getPathTo = (parent, child) => {
        const path = [];
        while (child._item !== null && child !== parent) {
          if (child._item.parentSub !== null) {
            path.unshift(child._item.parentSub);
          } else {
            let i = 0;
            let c = (
              /** @type {AbstractType<any>} */
              child._item.parent._start
            );
            while (c !== child._item && c !== null) {
              if (!c.deleted && c.countable) {
                i += c.length;
              }
              c = c.right;
            }
            path.unshift(i);
          }
          child = /** @type {AbstractType<any>} */
          child._item.parent;
        }
        return path;
      };
      warnPrematureAccess = () => {
        warn("Invalid access: Add Yjs type to a document before reading data.");
      };
      maxSearchMarker = 80;
      globalSearchMarkerTimestamp = 0;
      ArraySearchMarker = class {
        /**
         * @param {Item} p
         * @param {number} index
         */
        constructor(p, index) {
          p.marker = true;
          this.p = p;
          this.index = index;
          this.timestamp = globalSearchMarkerTimestamp++;
        }
      };
      refreshMarkerTimestamp = (marker) => {
        marker.timestamp = globalSearchMarkerTimestamp++;
      };
      overwriteMarker = (marker, p, index) => {
        marker.p.marker = false;
        marker.p = p;
        p.marker = true;
        marker.index = index;
        marker.timestamp = globalSearchMarkerTimestamp++;
      };
      markPosition = (searchMarker, p, index) => {
        if (searchMarker.length >= maxSearchMarker) {
          const marker = searchMarker.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
          overwriteMarker(marker, p, index);
          return marker;
        } else {
          const pm = new ArraySearchMarker(p, index);
          searchMarker.push(pm);
          return pm;
        }
      };
      findMarker = (yarray, index) => {
        if (yarray._start === null || index === 0 || yarray._searchMarker === null) {
          return null;
        }
        const marker = yarray._searchMarker.length === 0 ? null : yarray._searchMarker.reduce((a, b) => abs(index - a.index) < abs(index - b.index) ? a : b);
        let p = yarray._start;
        let pindex = 0;
        if (marker !== null) {
          p = marker.p;
          pindex = marker.index;
          refreshMarkerTimestamp(marker);
        }
        while (p.right !== null && pindex < index) {
          if (!p.deleted && p.countable) {
            if (index < pindex + p.length) {
              break;
            }
            pindex += p.length;
          }
          p = p.right;
        }
        while (p.left !== null && pindex > index) {
          p = p.left;
          if (!p.deleted && p.countable) {
            pindex -= p.length;
          }
        }
        while (p.left !== null && p.left.id.client === p.id.client && p.left.id.clock + p.left.length === p.id.clock) {
          p = p.left;
          if (!p.deleted && p.countable) {
            pindex -= p.length;
          }
        }
        if (marker !== null && abs(marker.index - pindex) < /** @type {YText|YArray<any>} */
        p.parent.length / maxSearchMarker) {
          overwriteMarker(marker, p, pindex);
          return marker;
        } else {
          return markPosition(yarray._searchMarker, p, pindex);
        }
      };
      updateMarkerChanges = (searchMarker, index, len) => {
        for (let i = searchMarker.length - 1; i >= 0; i--) {
          const m = searchMarker[i];
          if (len > 0) {
            let p = m.p;
            p.marker = false;
            while (p && (p.deleted || !p.countable)) {
              p = p.left;
              if (p && !p.deleted && p.countable) {
                m.index -= p.length;
              }
            }
            if (p === null || p.marker === true) {
              searchMarker.splice(i, 1);
              continue;
            }
            m.p = p;
            p.marker = true;
          }
          if (index < m.index || len > 0 && index === m.index) {
            m.index = max(index, m.index + len);
          }
        }
      };
      callTypeObservers = (type, transaction, event) => {
        const changedType = type;
        const changedParentTypes = transaction.changedParentTypes;
        while (true) {
          setIfUndefined(changedParentTypes, type, () => []).push(event);
          if (type._item === null) {
            break;
          }
          type = /** @type {AbstractType<any>} */
          type._item.parent;
        }
        callEventHandlerListeners(changedType._eH, event, transaction);
      };
      AbstractType = class {
        constructor() {
          this._item = null;
          this._map = /* @__PURE__ */ new Map();
          this._start = null;
          this.doc = null;
          this._length = 0;
          this._eH = createEventHandler();
          this._dEH = createEventHandler();
          this._searchMarker = null;
        }
        /**
         * @return {AbstractType<any>|null}
         */
        get parent() {
          return this._item ? (
            /** @type {AbstractType<any>} */
            this._item.parent
          ) : null;
        }
        /**
         * Integrate this type into the Yjs instance.
         *
         * * Save this struct in the os
         * * This type is sent to other client
         * * Observer functions are fired
         *
         * @param {Doc} y The Yjs instance
         * @param {Item|null} item
         */
        _integrate(y, item) {
          this.doc = y;
          this._item = item;
        }
        /**
         * @return {AbstractType<EventType>}
         */
        _copy() {
          throw methodUnimplemented();
        }
        /**
         * Makes a copy of this data type that can be included somewhere else.
         *
         * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
         *
         * @return {AbstractType<EventType>}
         */
        clone() {
          throw methodUnimplemented();
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} _encoder
         */
        _write(_encoder) {
        }
        /**
         * The first non-deleted item
         */
        get _first() {
          let n = this._start;
          while (n !== null && n.deleted) {
            n = n.right;
          }
          return n;
        }
        /**
         * Creates YEvent and calls all type observers.
         * Must be implemented by each type.
         *
         * @param {Transaction} transaction
         * @param {Set<null|string>} _parentSubs Keys changed on this type. `null` if list was modified.
         */
        _callObserver(transaction, _parentSubs) {
          if (!transaction.local && this._searchMarker) {
            this._searchMarker.length = 0;
          }
        }
        /**
         * Observe all events that are created on this type.
         *
         * @param {function(EventType, Transaction):void} f Observer function
         */
        observe(f) {
          addEventHandlerListener(this._eH, f);
        }
        /**
         * Observe all events that are created by this type and its children.
         *
         * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
         */
        observeDeep(f) {
          addEventHandlerListener(this._dEH, f);
        }
        /**
         * Unregister an observer function.
         *
         * @param {function(EventType,Transaction):void} f Observer function
         */
        unobserve(f) {
          removeEventHandlerListener(this._eH, f);
        }
        /**
         * Unregister an observer function.
         *
         * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
         */
        unobserveDeep(f) {
          removeEventHandlerListener(this._dEH, f);
        }
        /**
         * @abstract
         * @return {any}
         */
        toJSON() {
        }
      };
      typeListSlice = (type, start, end) => {
        type.doc ?? warnPrematureAccess();
        if (start < 0) {
          start = type._length + start;
        }
        if (end < 0) {
          end = type._length + end;
        }
        let len = end - start;
        const cs = [];
        let n = type._start;
        while (n !== null && len > 0) {
          if (n.countable && !n.deleted) {
            const c = n.content.getContent();
            if (c.length <= start) {
              start -= c.length;
            } else {
              for (let i = start; i < c.length && len > 0; i++) {
                cs.push(c[i]);
                len--;
              }
              start = 0;
            }
          }
          n = n.right;
        }
        return cs;
      };
      typeListToArray = (type) => {
        type.doc ?? warnPrematureAccess();
        const cs = [];
        let n = type._start;
        while (n !== null) {
          if (n.countable && !n.deleted) {
            const c = n.content.getContent();
            for (let i = 0; i < c.length; i++) {
              cs.push(c[i]);
            }
          }
          n = n.right;
        }
        return cs;
      };
      typeListForEach = (type, f) => {
        let index = 0;
        let n = type._start;
        type.doc ?? warnPrematureAccess();
        while (n !== null) {
          if (n.countable && !n.deleted) {
            const c = n.content.getContent();
            for (let i = 0; i < c.length; i++) {
              f(c[i], index++, type);
            }
          }
          n = n.right;
        }
      };
      typeListMap = (type, f) => {
        const result = [];
        typeListForEach(type, (c, i) => {
          result.push(f(c, i, type));
        });
        return result;
      };
      typeListCreateIterator = (type) => {
        let n = type._start;
        let currentContent = null;
        let currentContentIndex = 0;
        return {
          [Symbol.iterator]() {
            return this;
          },
          next: () => {
            if (currentContent === null) {
              while (n !== null && n.deleted) {
                n = n.right;
              }
              if (n === null) {
                return {
                  done: true,
                  value: void 0
                };
              }
              currentContent = n.content.getContent();
              currentContentIndex = 0;
              n = n.right;
            }
            const value = currentContent[currentContentIndex++];
            if (currentContent.length <= currentContentIndex) {
              currentContent = null;
            }
            return {
              done: false,
              value
            };
          }
        };
      };
      typeListGet = (type, index) => {
        type.doc ?? warnPrematureAccess();
        const marker = findMarker(type, index);
        let n = type._start;
        if (marker !== null) {
          n = marker.p;
          index -= marker.index;
        }
        for (; n !== null; n = n.right) {
          if (!n.deleted && n.countable) {
            if (index < n.length) {
              return n.content.getContent()[index];
            }
            index -= n.length;
          }
        }
      };
      typeListInsertGenericsAfter = (transaction, parent, referenceItem, content) => {
        let left = referenceItem;
        const doc2 = transaction.doc;
        const ownClientId = doc2.clientID;
        const store = doc2.store;
        const right = referenceItem === null ? parent._start : referenceItem.right;
        let jsonContent = [];
        const packJsonContent = () => {
          if (jsonContent.length > 0) {
            left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentAny(jsonContent));
            left.integrate(transaction, 0);
            jsonContent = [];
          }
        };
        content.forEach((c) => {
          if (c === null) {
            jsonContent.push(c);
          } else {
            switch (c.constructor) {
              case Number:
              case Object:
              case Boolean:
              case Array:
              case String:
                jsonContent.push(c);
                break;
              default:
                packJsonContent();
                switch (c.constructor) {
                  case Uint8Array:
                  case ArrayBuffer:
                    left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentBinary(new Uint8Array(
                      /** @type {Uint8Array} */
                      c
                    )));
                    left.integrate(transaction, 0);
                    break;
                  case Doc:
                    left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentDoc(
                      /** @type {Doc} */
                      c
                    ));
                    left.integrate(transaction, 0);
                    break;
                  default:
                    if (c instanceof AbstractType) {
                      left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentType(c));
                      left.integrate(transaction, 0);
                    } else {
                      throw new Error("Unexpected content type in insert operation");
                    }
                }
            }
          }
        });
        packJsonContent();
      };
      lengthExceeded = () => create3("Length exceeded!");
      typeListInsertGenerics = (transaction, parent, index, content) => {
        if (index > parent._length) {
          throw lengthExceeded();
        }
        if (index === 0) {
          if (parent._searchMarker) {
            updateMarkerChanges(parent._searchMarker, index, content.length);
          }
          return typeListInsertGenericsAfter(transaction, parent, null, content);
        }
        const startIndex = index;
        const marker = findMarker(parent, index);
        let n = parent._start;
        if (marker !== null) {
          n = marker.p;
          index -= marker.index;
          if (index === 0) {
            n = n.prev;
            index += n && n.countable && !n.deleted ? n.length : 0;
          }
        }
        for (; n !== null; n = n.right) {
          if (!n.deleted && n.countable) {
            if (index <= n.length) {
              if (index < n.length) {
                getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
              }
              break;
            }
            index -= n.length;
          }
        }
        if (parent._searchMarker) {
          updateMarkerChanges(parent._searchMarker, startIndex, content.length);
        }
        return typeListInsertGenericsAfter(transaction, parent, n, content);
      };
      typeListPushGenerics = (transaction, parent, content) => {
        const marker = (parent._searchMarker || []).reduce((maxMarker, currMarker) => currMarker.index > maxMarker.index ? currMarker : maxMarker, { index: 0, p: parent._start });
        let n = marker.p;
        if (n) {
          while (n.right) {
            n = n.right;
          }
        }
        return typeListInsertGenericsAfter(transaction, parent, n, content);
      };
      typeListDelete = (transaction, parent, index, length2) => {
        if (length2 === 0) {
          return;
        }
        const startIndex = index;
        const startLength = length2;
        const marker = findMarker(parent, index);
        let n = parent._start;
        if (marker !== null) {
          n = marker.p;
          index -= marker.index;
        }
        for (; n !== null && index > 0; n = n.right) {
          if (!n.deleted && n.countable) {
            if (index < n.length) {
              getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
            }
            index -= n.length;
          }
        }
        while (length2 > 0 && n !== null) {
          if (!n.deleted) {
            if (length2 < n.length) {
              getItemCleanStart(transaction, createID(n.id.client, n.id.clock + length2));
            }
            n.delete(transaction);
            length2 -= n.length;
          }
          n = n.right;
        }
        if (length2 > 0) {
          throw lengthExceeded();
        }
        if (parent._searchMarker) {
          updateMarkerChanges(
            parent._searchMarker,
            startIndex,
            -startLength + length2
            /* in case we remove the above exception */
          );
        }
      };
      typeMapDelete = (transaction, parent, key) => {
        const c = parent._map.get(key);
        if (c !== void 0) {
          c.delete(transaction);
        }
      };
      typeMapSet = (transaction, parent, key, value) => {
        const left = parent._map.get(key) || null;
        const doc2 = transaction.doc;
        const ownClientId = doc2.clientID;
        let content;
        if (value == null) {
          content = new ContentAny([value]);
        } else {
          switch (value.constructor) {
            case Number:
            case Object:
            case Boolean:
            case Array:
            case String:
            case Date:
            case BigInt:
              content = new ContentAny([value]);
              break;
            case Uint8Array:
              content = new ContentBinary(
                /** @type {Uint8Array} */
                value
              );
              break;
            case Doc:
              content = new ContentDoc(
                /** @type {Doc} */
                value
              );
              break;
            default:
              if (value instanceof AbstractType) {
                content = new ContentType(value);
              } else {
                throw new Error("Unexpected content type");
              }
          }
        }
        new Item(createID(ownClientId, getState(doc2.store, ownClientId)), left, left && left.lastId, null, null, parent, key, content).integrate(transaction, 0);
      };
      typeMapGet = (parent, key) => {
        parent.doc ?? warnPrematureAccess();
        const val = parent._map.get(key);
        return val !== void 0 && !val.deleted ? val.content.getContent()[val.length - 1] : void 0;
      };
      typeMapGetAll = (parent) => {
        const res = {};
        parent.doc ?? warnPrematureAccess();
        parent._map.forEach((value, key) => {
          if (!value.deleted) {
            res[key] = value.content.getContent()[value.length - 1];
          }
        });
        return res;
      };
      typeMapHas = (parent, key) => {
        parent.doc ?? warnPrematureAccess();
        const val = parent._map.get(key);
        return val !== void 0 && !val.deleted;
      };
      typeMapGetAllSnapshot = (parent, snapshot2) => {
        const res = {};
        parent._map.forEach((value, key) => {
          let v = value;
          while (v !== null && (!snapshot2.sv.has(v.id.client) || v.id.clock >= (snapshot2.sv.get(v.id.client) || 0))) {
            v = v.left;
          }
          if (v !== null && isVisible(v, snapshot2)) {
            res[key] = v.content.getContent()[v.length - 1];
          }
        });
        return res;
      };
      createMapIterator = (type) => {
        type.doc ?? warnPrematureAccess();
        return iteratorFilter(
          type._map.entries(),
          /** @param {any} entry */
          (entry) => !entry[1].deleted
        );
      };
      YArrayEvent = class extends YEvent {
      };
      YArray = class _YArray extends AbstractType {
        constructor() {
          super();
          this._prelimContent = [];
          this._searchMarker = [];
        }
        /**
         * Construct a new YArray containing the specified items.
         * @template {Object<string,any>|Array<any>|number|null|string|Uint8Array} T
         * @param {Array<T>} items
         * @return {YArray<T>}
         */
        static from(items) {
          const a = new _YArray();
          a.push(items);
          return a;
        }
        /**
         * Integrate this type into the Yjs instance.
         *
         * * Save this struct in the os
         * * This type is sent to other client
         * * Observer functions are fired
         *
         * @param {Doc} y The Yjs instance
         * @param {Item} item
         */
        _integrate(y, item) {
          super._integrate(y, item);
          this.insert(
            0,
            /** @type {Array<any>} */
            this._prelimContent
          );
          this._prelimContent = null;
        }
        /**
         * @return {YArray<T>}
         */
        _copy() {
          return new _YArray();
        }
        /**
         * Makes a copy of this data type that can be included somewhere else.
         *
         * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
         *
         * @return {YArray<T>}
         */
        clone() {
          const arr = new _YArray();
          arr.insert(0, this.toArray().map(
            (el) => el instanceof AbstractType ? (
              /** @type {typeof el} */
              el.clone()
            ) : el
          ));
          return arr;
        }
        get length() {
          this.doc ?? warnPrematureAccess();
          return this._length;
        }
        /**
         * Creates YArrayEvent and calls observers.
         *
         * @param {Transaction} transaction
         * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
         */
        _callObserver(transaction, parentSubs) {
          super._callObserver(transaction, parentSubs);
          callTypeObservers(this, transaction, new YArrayEvent(this, transaction));
        }
        /**
         * Inserts new content at an index.
         *
         * Important: This function expects an array of content. Not just a content
         * object. The reason for this "weirdness" is that inserting several elements
         * is very efficient when it is done as a single operation.
         *
         * @example
         *  // Insert character 'a' at position 0
         *  yarray.insert(0, ['a'])
         *  // Insert numbers 1, 2 at position 1
         *  yarray.insert(1, [1, 2])
         *
         * @param {number} index The index to insert content at.
         * @param {Array<T>} content The array of content
         */
        insert(index, content) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              typeListInsertGenerics(
                transaction,
                this,
                index,
                /** @type {any} */
                content
              );
            });
          } else {
            this._prelimContent.splice(index, 0, ...content);
          }
        }
        /**
         * Appends content to this YArray.
         *
         * @param {Array<T>} content Array of content to append.
         *
         * @todo Use the following implementation in all types.
         */
        push(content) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              typeListPushGenerics(
                transaction,
                this,
                /** @type {any} */
                content
              );
            });
          } else {
            this._prelimContent.push(...content);
          }
        }
        /**
         * Prepends content to this YArray.
         *
         * @param {Array<T>} content Array of content to prepend.
         */
        unshift(content) {
          this.insert(0, content);
        }
        /**
         * Deletes elements starting from an index.
         *
         * @param {number} index Index at which to start deleting elements
         * @param {number} length The number of elements to remove. Defaults to 1.
         */
        delete(index, length2 = 1) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              typeListDelete(transaction, this, index, length2);
            });
          } else {
            this._prelimContent.splice(index, length2);
          }
        }
        /**
         * Returns the i-th element from a YArray.
         *
         * @param {number} index The index of the element to return from the YArray
         * @return {T}
         */
        get(index) {
          return typeListGet(this, index);
        }
        /**
         * Transforms this YArray to a JavaScript Array.
         *
         * @return {Array<T>}
         */
        toArray() {
          return typeListToArray(this);
        }
        /**
         * Returns a portion of this YArray into a JavaScript Array selected
         * from start to end (end not included).
         *
         * @param {number} [start]
         * @param {number} [end]
         * @return {Array<T>}
         */
        slice(start = 0, end = this.length) {
          return typeListSlice(this, start, end);
        }
        /**
         * Transforms this Shared Type to a JSON object.
         *
         * @return {Array<any>}
         */
        toJSON() {
          return this.map((c) => c instanceof AbstractType ? c.toJSON() : c);
        }
        /**
         * Returns an Array with the result of calling a provided function on every
         * element of this YArray.
         *
         * @template M
         * @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
         * @return {Array<M>} A new array with each element being the result of the
         *                 callback function
         */
        map(f) {
          return typeListMap(
            this,
            /** @type {any} */
            f
          );
        }
        /**
         * Executes a provided function once on every element of this YArray.
         *
         * @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
         */
        forEach(f) {
          typeListForEach(this, f);
        }
        /**
         * @return {IterableIterator<T>}
         */
        [Symbol.iterator]() {
          return typeListCreateIterator(this);
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         */
        _write(encoder) {
          encoder.writeTypeRef(YArrayRefID);
        }
      };
      readYArray = (_decoder) => new YArray();
      YMapEvent = class extends YEvent {
        /**
         * @param {YMap<T>} ymap The YArray that changed.
         * @param {Transaction} transaction
         * @param {Set<any>} subs The keys that changed.
         */
        constructor(ymap, transaction, subs) {
          super(ymap, transaction);
          this.keysChanged = subs;
        }
      };
      YMap = class _YMap extends AbstractType {
        /**
         *
         * @param {Iterable<readonly [string, any]>=} entries - an optional iterable to initialize the YMap
         */
        constructor(entries) {
          super();
          this._prelimContent = null;
          if (entries === void 0) {
            this._prelimContent = /* @__PURE__ */ new Map();
          } else {
            this._prelimContent = new Map(entries);
          }
        }
        /**
         * Integrate this type into the Yjs instance.
         *
         * * Save this struct in the os
         * * This type is sent to other client
         * * Observer functions are fired
         *
         * @param {Doc} y The Yjs instance
         * @param {Item} item
         */
        _integrate(y, item) {
          super._integrate(y, item);
          this._prelimContent.forEach((value, key) => {
            this.set(key, value);
          });
          this._prelimContent = null;
        }
        /**
         * @return {YMap<MapType>}
         */
        _copy() {
          return new _YMap();
        }
        /**
         * Makes a copy of this data type that can be included somewhere else.
         *
         * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
         *
         * @return {YMap<MapType>}
         */
        clone() {
          const map3 = new _YMap();
          this.forEach((value, key) => {
            map3.set(key, value instanceof AbstractType ? (
              /** @type {typeof value} */
              value.clone()
            ) : value);
          });
          return map3;
        }
        /**
         * Creates YMapEvent and calls observers.
         *
         * @param {Transaction} transaction
         * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
         */
        _callObserver(transaction, parentSubs) {
          callTypeObservers(this, transaction, new YMapEvent(this, transaction, parentSubs));
        }
        /**
         * Transforms this Shared Type to a JSON object.
         *
         * @return {Object<string,any>}
         */
        toJSON() {
          this.doc ?? warnPrematureAccess();
          const map3 = {};
          this._map.forEach((item, key) => {
            if (!item.deleted) {
              const v = item.content.getContent()[item.length - 1];
              map3[key] = v instanceof AbstractType ? v.toJSON() : v;
            }
          });
          return map3;
        }
        /**
         * Returns the size of the YMap (count of key/value pairs)
         *
         * @return {number}
         */
        get size() {
          return [...createMapIterator(this)].length;
        }
        /**
         * Returns the keys for each element in the YMap Type.
         *
         * @return {IterableIterator<string>}
         */
        keys() {
          return iteratorMap(
            createMapIterator(this),
            /** @param {any} v */
            (v) => v[0]
          );
        }
        /**
         * Returns the values for each element in the YMap Type.
         *
         * @return {IterableIterator<MapType>}
         */
        values() {
          return iteratorMap(
            createMapIterator(this),
            /** @param {any} v */
            (v) => v[1].content.getContent()[v[1].length - 1]
          );
        }
        /**
         * Returns an Iterator of [key, value] pairs
         *
         * @return {IterableIterator<[string, MapType]>}
         */
        entries() {
          return iteratorMap(
            createMapIterator(this),
            /** @param {any} v */
            (v) => (
              /** @type {any} */
              [v[0], v[1].content.getContent()[v[1].length - 1]]
            )
          );
        }
        /**
         * Executes a provided function on once on every key-value pair.
         *
         * @param {function(MapType,string,YMap<MapType>):void} f A function to execute on every element of this YArray.
         */
        forEach(f) {
          this.doc ?? warnPrematureAccess();
          this._map.forEach((item, key) => {
            if (!item.deleted) {
              f(item.content.getContent()[item.length - 1], key, this);
            }
          });
        }
        /**
         * Returns an Iterator of [key, value] pairs
         *
         * @return {IterableIterator<[string, MapType]>}
         */
        [Symbol.iterator]() {
          return this.entries();
        }
        /**
         * Remove a specified element from this YMap.
         *
         * @param {string} key The key of the element to remove.
         */
        delete(key) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              typeMapDelete(transaction, this, key);
            });
          } else {
            this._prelimContent.delete(key);
          }
        }
        /**
         * Adds or updates an element with a specified key and value.
         * @template {MapType} VAL
         *
         * @param {string} key The key of the element to add to this YMap
         * @param {VAL} value The value of the element to add
         * @return {VAL}
         */
        set(key, value) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              typeMapSet(
                transaction,
                this,
                key,
                /** @type {any} */
                value
              );
            });
          } else {
            this._prelimContent.set(key, value);
          }
          return value;
        }
        /**
         * Returns a specified element from this YMap.
         *
         * @param {string} key
         * @return {MapType|undefined}
         */
        get(key) {
          return (
            /** @type {any} */
            typeMapGet(this, key)
          );
        }
        /**
         * Returns a boolean indicating whether the specified key exists or not.
         *
         * @param {string} key The key to test.
         * @return {boolean}
         */
        has(key) {
          return typeMapHas(this, key);
        }
        /**
         * Removes all elements from this YMap.
         */
        clear() {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              this.forEach(function(_value, key, map3) {
                typeMapDelete(transaction, map3, key);
              });
            });
          } else {
            this._prelimContent.clear();
          }
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         */
        _write(encoder) {
          encoder.writeTypeRef(YMapRefID);
        }
      };
      readYMap = (_decoder) => new YMap();
      equalAttrs = (a, b) => a === b || typeof a === "object" && typeof b === "object" && a && b && equalFlat(a, b);
      ItemTextListPosition = class {
        /**
         * @param {Item|null} left
         * @param {Item|null} right
         * @param {number} index
         * @param {Map<string,any>} currentAttributes
         */
        constructor(left, right, index, currentAttributes) {
          this.left = left;
          this.right = right;
          this.index = index;
          this.currentAttributes = currentAttributes;
        }
        /**
         * Only call this if you know that this.right is defined
         */
        forward() {
          if (this.right === null) {
            unexpectedCase();
          }
          switch (this.right.content.constructor) {
            case ContentFormat:
              if (!this.right.deleted) {
                updateCurrentAttributes(
                  this.currentAttributes,
                  /** @type {ContentFormat} */
                  this.right.content
                );
              }
              break;
            default:
              if (!this.right.deleted) {
                this.index += this.right.length;
              }
              break;
          }
          this.left = this.right;
          this.right = this.right.right;
        }
      };
      findNextPosition = (transaction, pos, count2) => {
        while (pos.right !== null && count2 > 0) {
          switch (pos.right.content.constructor) {
            case ContentFormat:
              if (!pos.right.deleted) {
                updateCurrentAttributes(
                  pos.currentAttributes,
                  /** @type {ContentFormat} */
                  pos.right.content
                );
              }
              break;
            default:
              if (!pos.right.deleted) {
                if (count2 < pos.right.length) {
                  getItemCleanStart(transaction, createID(pos.right.id.client, pos.right.id.clock + count2));
                }
                pos.index += pos.right.length;
                count2 -= pos.right.length;
              }
              break;
          }
          pos.left = pos.right;
          pos.right = pos.right.right;
        }
        return pos;
      };
      findPosition = (transaction, parent, index, useSearchMarker) => {
        const currentAttributes = /* @__PURE__ */ new Map();
        const marker = useSearchMarker ? findMarker(parent, index) : null;
        if (marker) {
          const pos = new ItemTextListPosition(marker.p.left, marker.p, marker.index, currentAttributes);
          return findNextPosition(transaction, pos, index - marker.index);
        } else {
          const pos = new ItemTextListPosition(null, parent._start, 0, currentAttributes);
          return findNextPosition(transaction, pos, index);
        }
      };
      insertNegatedAttributes = (transaction, parent, currPos, negatedAttributes) => {
        while (currPos.right !== null && (currPos.right.deleted === true || currPos.right.content.constructor === ContentFormat && equalAttrs(
          negatedAttributes.get(
            /** @type {ContentFormat} */
            currPos.right.content.key
          ),
          /** @type {ContentFormat} */
          currPos.right.content.value
        ))) {
          if (!currPos.right.deleted) {
            negatedAttributes.delete(
              /** @type {ContentFormat} */
              currPos.right.content.key
            );
          }
          currPos.forward();
        }
        const doc2 = transaction.doc;
        const ownClientId = doc2.clientID;
        negatedAttributes.forEach((val, key) => {
          const left = currPos.left;
          const right = currPos.right;
          const nextFormat = new Item(createID(ownClientId, getState(doc2.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
          nextFormat.integrate(transaction, 0);
          currPos.right = nextFormat;
          currPos.forward();
        });
      };
      updateCurrentAttributes = (currentAttributes, format) => {
        const { key, value } = format;
        if (value === null) {
          currentAttributes.delete(key);
        } else {
          currentAttributes.set(key, value);
        }
      };
      minimizeAttributeChanges = (currPos, attributes) => {
        while (true) {
          if (currPos.right === null) {
            break;
          } else if (currPos.right.deleted || currPos.right.content.constructor === ContentFormat && equalAttrs(
            attributes[
              /** @type {ContentFormat} */
              currPos.right.content.key
            ] ?? null,
            /** @type {ContentFormat} */
            currPos.right.content.value
          )) ;
          else {
            break;
          }
          currPos.forward();
        }
      };
      insertAttributes = (transaction, parent, currPos, attributes) => {
        const doc2 = transaction.doc;
        const ownClientId = doc2.clientID;
        const negatedAttributes = /* @__PURE__ */ new Map();
        for (const key in attributes) {
          const val = attributes[key];
          const currentVal = currPos.currentAttributes.get(key) ?? null;
          if (!equalAttrs(currentVal, val)) {
            negatedAttributes.set(key, currentVal);
            const { left, right } = currPos;
            currPos.right = new Item(createID(ownClientId, getState(doc2.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
            currPos.right.integrate(transaction, 0);
            currPos.forward();
          }
        }
        return negatedAttributes;
      };
      insertText = (transaction, parent, currPos, text2, attributes) => {
        currPos.currentAttributes.forEach((_val, key) => {
          if (attributes[key] === void 0) {
            attributes[key] = null;
          }
        });
        const doc2 = transaction.doc;
        const ownClientId = doc2.clientID;
        minimizeAttributeChanges(currPos, attributes);
        const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
        const content = text2.constructor === String ? new ContentString(
          /** @type {string} */
          text2
        ) : text2 instanceof AbstractType ? new ContentType(text2) : new ContentEmbed(text2);
        let { left, right, index } = currPos;
        if (parent._searchMarker) {
          updateMarkerChanges(parent._searchMarker, currPos.index, content.getLength());
        }
        right = new Item(createID(ownClientId, getState(doc2.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, content);
        right.integrate(transaction, 0);
        currPos.right = right;
        currPos.index = index;
        currPos.forward();
        insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
      };
      formatText = (transaction, parent, currPos, length2, attributes) => {
        const doc2 = transaction.doc;
        const ownClientId = doc2.clientID;
        minimizeAttributeChanges(currPos, attributes);
        const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
        iterationLoop: while (currPos.right !== null && (length2 > 0 || negatedAttributes.size > 0 && (currPos.right.deleted || currPos.right.content.constructor === ContentFormat))) {
          if (!currPos.right.deleted) {
            switch (currPos.right.content.constructor) {
              case ContentFormat: {
                const { key, value } = (
                  /** @type {ContentFormat} */
                  currPos.right.content
                );
                const attr = attributes[key];
                if (attr !== void 0) {
                  if (equalAttrs(attr, value)) {
                    negatedAttributes.delete(key);
                  } else {
                    if (length2 === 0) {
                      break iterationLoop;
                    }
                    negatedAttributes.set(key, value);
                  }
                  currPos.right.delete(transaction);
                } else {
                  currPos.currentAttributes.set(key, value);
                }
                break;
              }
              default:
                if (length2 < currPos.right.length) {
                  getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length2));
                }
                length2 -= currPos.right.length;
                break;
            }
          }
          currPos.forward();
        }
        if (length2 > 0) {
          let newlines = "";
          for (; length2 > 0; length2--) {
            newlines += "\n";
          }
          currPos.right = new Item(createID(ownClientId, getState(doc2.store, ownClientId)), currPos.left, currPos.left && currPos.left.lastId, currPos.right, currPos.right && currPos.right.id, parent, null, new ContentString(newlines));
          currPos.right.integrate(transaction, 0);
          currPos.forward();
        }
        insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
      };
      cleanupFormattingGap = (transaction, start, curr, startAttributes, currAttributes) => {
        let end = start;
        const endFormats = create();
        while (end && (!end.countable || end.deleted)) {
          if (!end.deleted && end.content.constructor === ContentFormat) {
            const cf = (
              /** @type {ContentFormat} */
              end.content
            );
            endFormats.set(cf.key, cf);
          }
          end = end.right;
        }
        let cleanups = 0;
        let reachedCurr = false;
        while (start !== end) {
          if (curr === start) {
            reachedCurr = true;
          }
          if (!start.deleted) {
            const content = start.content;
            switch (content.constructor) {
              case ContentFormat: {
                const { key, value } = (
                  /** @type {ContentFormat} */
                  content
                );
                const startAttrValue = startAttributes.get(key) ?? null;
                if (endFormats.get(key) !== content || startAttrValue === value) {
                  start.delete(transaction);
                  cleanups++;
                  if (!reachedCurr && (currAttributes.get(key) ?? null) === value && startAttrValue !== value) {
                    if (startAttrValue === null) {
                      currAttributes.delete(key);
                    } else {
                      currAttributes.set(key, startAttrValue);
                    }
                  }
                }
                if (!reachedCurr && !start.deleted) {
                  updateCurrentAttributes(
                    currAttributes,
                    /** @type {ContentFormat} */
                    content
                  );
                }
                break;
              }
            }
          }
          start = /** @type {Item} */
          start.right;
        }
        return cleanups;
      };
      cleanupContextlessFormattingGap = (transaction, item) => {
        while (item && item.right && (item.right.deleted || !item.right.countable)) {
          item = item.right;
        }
        const attrs = /* @__PURE__ */ new Set();
        while (item && (item.deleted || !item.countable)) {
          if (!item.deleted && item.content.constructor === ContentFormat) {
            const key = (
              /** @type {ContentFormat} */
              item.content.key
            );
            if (attrs.has(key)) {
              item.delete(transaction);
            } else {
              attrs.add(key);
            }
          }
          item = item.left;
        }
      };
      cleanupYTextFormatting = (type) => {
        let res = 0;
        transact(
          /** @type {Doc} */
          type.doc,
          (transaction) => {
            let start = (
              /** @type {Item} */
              type._start
            );
            let end = type._start;
            let startAttributes = create();
            const currentAttributes = copy(startAttributes);
            while (end) {
              if (end.deleted === false) {
                switch (end.content.constructor) {
                  case ContentFormat:
                    updateCurrentAttributes(
                      currentAttributes,
                      /** @type {ContentFormat} */
                      end.content
                    );
                    break;
                  default:
                    res += cleanupFormattingGap(transaction, start, end, startAttributes, currentAttributes);
                    startAttributes = copy(currentAttributes);
                    start = end;
                    break;
                }
              }
              end = end.right;
            }
          }
        );
        return res;
      };
      cleanupYTextAfterTransaction = (transaction) => {
        const needFullCleanup = /* @__PURE__ */ new Set();
        const doc2 = transaction.doc;
        for (const [client, afterClock] of transaction.afterState.entries()) {
          const clock = transaction.beforeState.get(client) || 0;
          if (afterClock === clock) {
            continue;
          }
          iterateStructs(
            transaction,
            /** @type {Array<Item|GC>} */
            doc2.store.clients.get(client),
            clock,
            afterClock,
            (item) => {
              if (!item.deleted && /** @type {Item} */
              item.content.constructor === ContentFormat && item.constructor !== GC) {
                needFullCleanup.add(
                  /** @type {any} */
                  item.parent
                );
              }
            }
          );
        }
        transact(doc2, (t) => {
          iterateDeletedStructs(transaction, transaction.deleteSet, (item) => {
            if (item instanceof GC || !/** @type {YText} */
            item.parent._hasFormatting || needFullCleanup.has(
              /** @type {YText} */
              item.parent
            )) {
              return;
            }
            const parent = (
              /** @type {YText} */
              item.parent
            );
            if (item.content.constructor === ContentFormat) {
              needFullCleanup.add(parent);
            } else {
              cleanupContextlessFormattingGap(t, item);
            }
          });
          for (const yText of needFullCleanup) {
            cleanupYTextFormatting(yText);
          }
        });
      };
      deleteText = (transaction, currPos, length2) => {
        const startLength = length2;
        const startAttrs = copy(currPos.currentAttributes);
        const start = currPos.right;
        while (length2 > 0 && currPos.right !== null) {
          if (currPos.right.deleted === false) {
            switch (currPos.right.content.constructor) {
              case ContentType:
              case ContentEmbed:
              case ContentString:
                if (length2 < currPos.right.length) {
                  getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length2));
                }
                length2 -= currPos.right.length;
                currPos.right.delete(transaction);
                break;
            }
          }
          currPos.forward();
        }
        if (start) {
          cleanupFormattingGap(transaction, start, currPos.right, startAttrs, currPos.currentAttributes);
        }
        const parent = (
          /** @type {AbstractType<any>} */
          /** @type {Item} */
          (currPos.left || currPos.right).parent
        );
        if (parent._searchMarker) {
          updateMarkerChanges(parent._searchMarker, currPos.index, -startLength + length2);
        }
        return currPos;
      };
      YTextEvent = class extends YEvent {
        /**
         * @param {YText} ytext
         * @param {Transaction} transaction
         * @param {Set<any>} subs The keys that changed
         */
        constructor(ytext, transaction, subs) {
          super(ytext, transaction);
          this.childListChanged = false;
          this.keysChanged = /* @__PURE__ */ new Set();
          subs.forEach((sub) => {
            if (sub === null) {
              this.childListChanged = true;
            } else {
              this.keysChanged.add(sub);
            }
          });
        }
        /**
         * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
         */
        get changes() {
          if (this._changes === null) {
            const changes = {
              keys: this.keys,
              delta: this.delta,
              added: /* @__PURE__ */ new Set(),
              deleted: /* @__PURE__ */ new Set()
            };
            this._changes = changes;
          }
          return (
            /** @type {any} */
            this._changes
          );
        }
        /**
         * Compute the changes in the delta format.
         * A {@link https://quilljs.com/docs/delta/|Quill Delta}) that represents the changes on the document.
         *
         * @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
         *
         * @public
         */
        get delta() {
          if (this._delta === null) {
            const y = (
              /** @type {Doc} */
              this.target.doc
            );
            const delta = [];
            transact(y, (transaction) => {
              const currentAttributes = /* @__PURE__ */ new Map();
              const oldAttributes = /* @__PURE__ */ new Map();
              let item = this.target._start;
              let action = null;
              const attributes = {};
              let insert = "";
              let retain = 0;
              let deleteLen = 0;
              const addOp = () => {
                if (action !== null) {
                  let op = null;
                  switch (action) {
                    case "delete":
                      if (deleteLen > 0) {
                        op = { delete: deleteLen };
                      }
                      deleteLen = 0;
                      break;
                    case "insert":
                      if (typeof insert === "object" || insert.length > 0) {
                        op = { insert };
                        if (currentAttributes.size > 0) {
                          op.attributes = {};
                          currentAttributes.forEach((value, key) => {
                            if (value !== null) {
                              op.attributes[key] = value;
                            }
                          });
                        }
                      }
                      insert = "";
                      break;
                    case "retain":
                      if (retain > 0) {
                        op = { retain };
                        if (!isEmpty(attributes)) {
                          op.attributes = assign({}, attributes);
                        }
                      }
                      retain = 0;
                      break;
                  }
                  if (op) delta.push(op);
                  action = null;
                }
              };
              while (item !== null) {
                switch (item.content.constructor) {
                  case ContentType:
                  case ContentEmbed:
                    if (this.adds(item)) {
                      if (!this.deletes(item)) {
                        addOp();
                        action = "insert";
                        insert = item.content.getContent()[0];
                        addOp();
                      }
                    } else if (this.deletes(item)) {
                      if (action !== "delete") {
                        addOp();
                        action = "delete";
                      }
                      deleteLen += 1;
                    } else if (!item.deleted) {
                      if (action !== "retain") {
                        addOp();
                        action = "retain";
                      }
                      retain += 1;
                    }
                    break;
                  case ContentString:
                    if (this.adds(item)) {
                      if (!this.deletes(item)) {
                        if (action !== "insert") {
                          addOp();
                          action = "insert";
                        }
                        insert += /** @type {ContentString} */
                        item.content.str;
                      }
                    } else if (this.deletes(item)) {
                      if (action !== "delete") {
                        addOp();
                        action = "delete";
                      }
                      deleteLen += item.length;
                    } else if (!item.deleted) {
                      if (action !== "retain") {
                        addOp();
                        action = "retain";
                      }
                      retain += item.length;
                    }
                    break;
                  case ContentFormat: {
                    const { key, value } = (
                      /** @type {ContentFormat} */
                      item.content
                    );
                    if (this.adds(item)) {
                      if (!this.deletes(item)) {
                        const curVal = currentAttributes.get(key) ?? null;
                        if (!equalAttrs(curVal, value)) {
                          if (action === "retain") {
                            addOp();
                          }
                          if (equalAttrs(value, oldAttributes.get(key) ?? null)) {
                            delete attributes[key];
                          } else {
                            attributes[key] = value;
                          }
                        } else if (value !== null) {
                          item.delete(transaction);
                        }
                      }
                    } else if (this.deletes(item)) {
                      oldAttributes.set(key, value);
                      const curVal = currentAttributes.get(key) ?? null;
                      if (!equalAttrs(curVal, value)) {
                        if (action === "retain") {
                          addOp();
                        }
                        attributes[key] = curVal;
                      }
                    } else if (!item.deleted) {
                      oldAttributes.set(key, value);
                      const attr = attributes[key];
                      if (attr !== void 0) {
                        if (!equalAttrs(attr, value)) {
                          if (action === "retain") {
                            addOp();
                          }
                          if (value === null) {
                            delete attributes[key];
                          } else {
                            attributes[key] = value;
                          }
                        } else if (attr !== null) {
                          item.delete(transaction);
                        }
                      }
                    }
                    if (!item.deleted) {
                      if (action === "insert") {
                        addOp();
                      }
                      updateCurrentAttributes(
                        currentAttributes,
                        /** @type {ContentFormat} */
                        item.content
                      );
                    }
                    break;
                  }
                }
                item = item.right;
              }
              addOp();
              while (delta.length > 0) {
                const lastOp = delta[delta.length - 1];
                if (lastOp.retain !== void 0 && lastOp.attributes === void 0) {
                  delta.pop();
                } else {
                  break;
                }
              }
            });
            this._delta = delta;
          }
          return (
            /** @type {any} */
            this._delta
          );
        }
      };
      YText = class _YText extends AbstractType {
        /**
         * @param {String} [string] The initial value of the YText.
         */
        constructor(string) {
          super();
          this._pending = string !== void 0 ? [() => this.insert(0, string)] : [];
          this._searchMarker = [];
          this._hasFormatting = false;
        }
        /**
         * Number of characters of this text type.
         *
         * @type {number}
         */
        get length() {
          this.doc ?? warnPrematureAccess();
          return this._length;
        }
        /**
         * @param {Doc} y
         * @param {Item} item
         */
        _integrate(y, item) {
          super._integrate(y, item);
          try {
            this._pending.forEach((f) => f());
          } catch (e) {
            console.error(e);
          }
          this._pending = null;
        }
        _copy() {
          return new _YText();
        }
        /**
         * Makes a copy of this data type that can be included somewhere else.
         *
         * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
         *
         * @return {YText}
         */
        clone() {
          const text2 = new _YText();
          text2.applyDelta(this.toDelta());
          return text2;
        }
        /**
         * Creates YTextEvent and calls observers.
         *
         * @param {Transaction} transaction
         * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
         */
        _callObserver(transaction, parentSubs) {
          super._callObserver(transaction, parentSubs);
          const event = new YTextEvent(this, transaction, parentSubs);
          callTypeObservers(this, transaction, event);
          if (!transaction.local && this._hasFormatting) {
            transaction._needFormattingCleanup = true;
          }
        }
        /**
         * Returns the unformatted string representation of this YText type.
         *
         * @public
         */
        toString() {
          this.doc ?? warnPrematureAccess();
          let str = "";
          let n = this._start;
          while (n !== null) {
            if (!n.deleted && n.countable && n.content.constructor === ContentString) {
              str += /** @type {ContentString} */
              n.content.str;
            }
            n = n.right;
          }
          return str;
        }
        /**
         * Returns the unformatted string representation of this YText type.
         *
         * @return {string}
         * @public
         */
        toJSON() {
          return this.toString();
        }
        /**
         * Apply a {@link Delta} on this shared YText type.
         *
         * @param {Array<any>} delta The changes to apply on this element.
         * @param {object}  opts
         * @param {boolean} [opts.sanitize] Sanitize input delta. Removes ending newlines if set to true.
         *
         *
         * @public
         */
        applyDelta(delta, { sanitize = true } = {}) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              const currPos = new ItemTextListPosition(null, this._start, 0, /* @__PURE__ */ new Map());
              for (let i = 0; i < delta.length; i++) {
                const op = delta[i];
                if (op.insert !== void 0) {
                  const ins = !sanitize && typeof op.insert === "string" && i === delta.length - 1 && currPos.right === null && op.insert.slice(-1) === "\n" ? op.insert.slice(0, -1) : op.insert;
                  if (typeof ins !== "string" || ins.length > 0) {
                    insertText(transaction, this, currPos, ins, op.attributes || {});
                  }
                } else if (op.retain !== void 0) {
                  formatText(transaction, this, currPos, op.retain, op.attributes || {});
                } else if (op.delete !== void 0) {
                  deleteText(transaction, currPos, op.delete);
                }
              }
            });
          } else {
            this._pending.push(() => this.applyDelta(delta));
          }
        }
        /**
         * Returns the Delta representation of this YText type.
         *
         * @param {Snapshot} [snapshot]
         * @param {Snapshot} [prevSnapshot]
         * @param {function('removed' | 'added', ID):any} [computeYChange]
         * @return {any} The Delta representation of this type.
         *
         * @public
         */
        toDelta(snapshot2, prevSnapshot, computeYChange) {
          this.doc ?? warnPrematureAccess();
          const ops = [];
          const currentAttributes = /* @__PURE__ */ new Map();
          const doc2 = (
            /** @type {Doc} */
            this.doc
          );
          let str = "";
          let n = this._start;
          function packStr() {
            if (str.length > 0) {
              const attributes = {};
              let addAttributes = false;
              currentAttributes.forEach((value, key) => {
                addAttributes = true;
                attributes[key] = value;
              });
              const op = { insert: str };
              if (addAttributes) {
                op.attributes = attributes;
              }
              ops.push(op);
              str = "";
            }
          }
          const computeDelta = () => {
            while (n !== null) {
              if (isVisible(n, snapshot2) || prevSnapshot !== void 0 && isVisible(n, prevSnapshot)) {
                switch (n.content.constructor) {
                  case ContentString: {
                    const cur = currentAttributes.get("ychange");
                    if (snapshot2 !== void 0 && !isVisible(n, snapshot2)) {
                      if (cur === void 0 || cur.user !== n.id.client || cur.type !== "removed") {
                        packStr();
                        currentAttributes.set("ychange", computeYChange ? computeYChange("removed", n.id) : { type: "removed" });
                      }
                    } else if (prevSnapshot !== void 0 && !isVisible(n, prevSnapshot)) {
                      if (cur === void 0 || cur.user !== n.id.client || cur.type !== "added") {
                        packStr();
                        currentAttributes.set("ychange", computeYChange ? computeYChange("added", n.id) : { type: "added" });
                      }
                    } else if (cur !== void 0) {
                      packStr();
                      currentAttributes.delete("ychange");
                    }
                    str += /** @type {ContentString} */
                    n.content.str;
                    break;
                  }
                  case ContentType:
                  case ContentEmbed: {
                    packStr();
                    const op = {
                      insert: n.content.getContent()[0]
                    };
                    if (currentAttributes.size > 0) {
                      const attrs = (
                        /** @type {Object<string,any>} */
                        {}
                      );
                      op.attributes = attrs;
                      currentAttributes.forEach((value, key) => {
                        attrs[key] = value;
                      });
                    }
                    ops.push(op);
                    break;
                  }
                  case ContentFormat:
                    if (isVisible(n, snapshot2)) {
                      packStr();
                      updateCurrentAttributes(
                        currentAttributes,
                        /** @type {ContentFormat} */
                        n.content
                      );
                    }
                    break;
                }
              }
              n = n.right;
            }
            packStr();
          };
          if (snapshot2 || prevSnapshot) {
            transact(doc2, (transaction) => {
              if (snapshot2) {
                splitSnapshotAffectedStructs(transaction, snapshot2);
              }
              if (prevSnapshot) {
                splitSnapshotAffectedStructs(transaction, prevSnapshot);
              }
              computeDelta();
            }, "cleanup");
          } else {
            computeDelta();
          }
          return ops;
        }
        /**
         * Insert text at a given index.
         *
         * @param {number} index The index at which to start inserting.
         * @param {String} text The text to insert at the specified position.
         * @param {TextAttributes} [attributes] Optionally define some formatting
         *                                    information to apply on the inserted
         *                                    Text.
         * @public
         */
        insert(index, text2, attributes) {
          if (text2.length <= 0) {
            return;
          }
          const y = this.doc;
          if (y !== null) {
            transact(y, (transaction) => {
              const pos = findPosition(transaction, this, index, !attributes);
              if (!attributes) {
                attributes = {};
                pos.currentAttributes.forEach((v, k) => {
                  attributes[k] = v;
                });
              }
              insertText(transaction, this, pos, text2, attributes);
            });
          } else {
            this._pending.push(() => this.insert(index, text2, attributes));
          }
        }
        /**
         * Inserts an embed at a index.
         *
         * @param {number} index The index to insert the embed at.
         * @param {Object | AbstractType<any>} embed The Object that represents the embed.
         * @param {TextAttributes} [attributes] Attribute information to apply on the
         *                                    embed
         *
         * @public
         */
        insertEmbed(index, embed, attributes) {
          const y = this.doc;
          if (y !== null) {
            transact(y, (transaction) => {
              const pos = findPosition(transaction, this, index, !attributes);
              insertText(transaction, this, pos, embed, attributes || {});
            });
          } else {
            this._pending.push(() => this.insertEmbed(index, embed, attributes || {}));
          }
        }
        /**
         * Deletes text starting from an index.
         *
         * @param {number} index Index at which to start deleting.
         * @param {number} length The number of characters to remove. Defaults to 1.
         *
         * @public
         */
        delete(index, length2) {
          if (length2 === 0) {
            return;
          }
          const y = this.doc;
          if (y !== null) {
            transact(y, (transaction) => {
              deleteText(transaction, findPosition(transaction, this, index, true), length2);
            });
          } else {
            this._pending.push(() => this.delete(index, length2));
          }
        }
        /**
         * Assigns properties to a range of text.
         *
         * @param {number} index The position where to start formatting.
         * @param {number} length The amount of characters to assign properties to.
         * @param {TextAttributes} attributes Attribute information to apply on the
         *                                    text.
         *
         * @public
         */
        format(index, length2, attributes) {
          if (length2 === 0) {
            return;
          }
          const y = this.doc;
          if (y !== null) {
            transact(y, (transaction) => {
              const pos = findPosition(transaction, this, index, false);
              if (pos.right === null) {
                return;
              }
              formatText(transaction, this, pos, length2, attributes);
            });
          } else {
            this._pending.push(() => this.format(index, length2, attributes));
          }
        }
        /**
         * Removes an attribute.
         *
         * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
         *
         * @param {String} attributeName The attribute name that is to be removed.
         *
         * @public
         */
        removeAttribute(attributeName) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              typeMapDelete(transaction, this, attributeName);
            });
          } else {
            this._pending.push(() => this.removeAttribute(attributeName));
          }
        }
        /**
         * Sets or updates an attribute.
         *
         * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
         *
         * @param {String} attributeName The attribute name that is to be set.
         * @param {any} attributeValue The attribute value that is to be set.
         *
         * @public
         */
        setAttribute(attributeName, attributeValue) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              typeMapSet(transaction, this, attributeName, attributeValue);
            });
          } else {
            this._pending.push(() => this.setAttribute(attributeName, attributeValue));
          }
        }
        /**
         * Returns an attribute value that belongs to the attribute name.
         *
         * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
         *
         * @param {String} attributeName The attribute name that identifies the
         *                               queried value.
         * @return {any} The queried attribute value.
         *
         * @public
         */
        getAttribute(attributeName) {
          return (
            /** @type {any} */
            typeMapGet(this, attributeName)
          );
        }
        /**
         * Returns all attribute name/value pairs in a JSON Object.
         *
         * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
         *
         * @return {Object<string, any>} A JSON Object that describes the attributes.
         *
         * @public
         */
        getAttributes() {
          return typeMapGetAll(this);
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         */
        _write(encoder) {
          encoder.writeTypeRef(YTextRefID);
        }
      };
      readYText = (_decoder) => new YText();
      YXmlTreeWalker = class {
        /**
         * @param {YXmlFragment | YXmlElement} root
         * @param {function(AbstractType<any>):boolean} [f]
         */
        constructor(root, f = () => true) {
          this._filter = f;
          this._root = root;
          this._currentNode = /** @type {Item} */
          root._start;
          this._firstCall = true;
          root.doc ?? warnPrematureAccess();
        }
        [Symbol.iterator]() {
          return this;
        }
        /**
         * Get the next node.
         *
         * @return {IteratorResult<YXmlElement|YXmlText|YXmlHook>} The next node.
         *
         * @public
         */
        next() {
          let n = this._currentNode;
          let type = n && n.content && /** @type {any} */
          n.content.type;
          if (n !== null && (!this._firstCall || n.deleted || !this._filter(type))) {
            do {
              type = /** @type {any} */
              n.content.type;
              if (!n.deleted && (type.constructor === YXmlElement || type.constructor === YXmlFragment) && type._start !== null) {
                n = type._start;
              } else {
                while (n !== null) {
                  const nxt = n.next;
                  if (nxt !== null) {
                    n = nxt;
                    break;
                  } else if (n.parent === this._root) {
                    n = null;
                  } else {
                    n = /** @type {AbstractType<any>} */
                    n.parent._item;
                  }
                }
              }
            } while (n !== null && (n.deleted || !this._filter(
              /** @type {ContentType} */
              n.content.type
            )));
          }
          this._firstCall = false;
          if (n === null) {
            return { value: void 0, done: true };
          }
          this._currentNode = n;
          return { value: (
            /** @type {any} */
            n.content.type
          ), done: false };
        }
      };
      YXmlFragment = class _YXmlFragment extends AbstractType {
        constructor() {
          super();
          this._prelimContent = [];
        }
        /**
         * @type {YXmlElement|YXmlText|null}
         */
        get firstChild() {
          const first = this._first;
          return first ? first.content.getContent()[0] : null;
        }
        /**
         * Integrate this type into the Yjs instance.
         *
         * * Save this struct in the os
         * * This type is sent to other client
         * * Observer functions are fired
         *
         * @param {Doc} y The Yjs instance
         * @param {Item} item
         */
        _integrate(y, item) {
          super._integrate(y, item);
          this.insert(
            0,
            /** @type {Array<any>} */
            this._prelimContent
          );
          this._prelimContent = null;
        }
        _copy() {
          return new _YXmlFragment();
        }
        /**
         * Makes a copy of this data type that can be included somewhere else.
         *
         * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
         *
         * @return {YXmlFragment}
         */
        clone() {
          const el = new _YXmlFragment();
          el.insert(0, this.toArray().map((item) => item instanceof AbstractType ? item.clone() : item));
          return el;
        }
        get length() {
          this.doc ?? warnPrematureAccess();
          return this._prelimContent === null ? this._length : this._prelimContent.length;
        }
        /**
         * Create a subtree of childNodes.
         *
         * @example
         * const walker = elem.createTreeWalker(dom => dom.nodeName === 'div')
         * for (let node in walker) {
         *   // `node` is a div node
         *   nop(node)
         * }
         *
         * @param {function(AbstractType<any>):boolean} filter Function that is called on each child element and
         *                          returns a Boolean indicating whether the child
         *                          is to be included in the subtree.
         * @return {YXmlTreeWalker} A subtree and a position within it.
         *
         * @public
         */
        createTreeWalker(filter) {
          return new YXmlTreeWalker(this, filter);
        }
        /**
         * Returns the first YXmlElement that matches the query.
         * Similar to DOM's {@link querySelector}.
         *
         * Query support:
         *   - tagname
         * TODO:
         *   - id
         *   - attribute
         *
         * @param {CSS_Selector} query The query on the children.
         * @return {YXmlElement|YXmlText|YXmlHook|null} The first element that matches the query or null.
         *
         * @public
         */
        querySelector(query) {
          query = query.toUpperCase();
          const iterator = new YXmlTreeWalker(this, (element2) => element2.nodeName && element2.nodeName.toUpperCase() === query);
          const next = iterator.next();
          if (next.done) {
            return null;
          } else {
            return next.value;
          }
        }
        /**
         * Returns all YXmlElements that match the query.
         * Similar to Dom's {@link querySelectorAll}.
         *
         * @todo Does not yet support all queries. Currently only query by tagName.
         *
         * @param {CSS_Selector} query The query on the children
         * @return {Array<YXmlElement|YXmlText|YXmlHook|null>} The elements that match this query.
         *
         * @public
         */
        querySelectorAll(query) {
          query = query.toUpperCase();
          return from(new YXmlTreeWalker(this, (element2) => element2.nodeName && element2.nodeName.toUpperCase() === query));
        }
        /**
         * Creates YXmlEvent and calls observers.
         *
         * @param {Transaction} transaction
         * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
         */
        _callObserver(transaction, parentSubs) {
          callTypeObservers(this, transaction, new YXmlEvent(this, parentSubs, transaction));
        }
        /**
         * Get the string representation of all the children of this YXmlFragment.
         *
         * @return {string} The string representation of all children.
         */
        toString() {
          return typeListMap(this, (xml) => xml.toString()).join("");
        }
        /**
         * @return {string}
         */
        toJSON() {
          return this.toString();
        }
        /**
         * Creates a Dom Element that mirrors this YXmlElement.
         *
         * @param {Document} [_document=document] The document object (you must define
         *                                        this when calling this method in
         *                                        nodejs)
         * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
         *                                             are presented in the DOM
         * @param {any} [binding] You should not set this property. This is
         *                               used if DomBinding wants to create a
         *                               association to the created DOM type.
         * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
         *
         * @public
         */
        toDOM(_document = document, hooks = {}, binding) {
          const fragment = _document.createDocumentFragment();
          if (binding !== void 0) {
            binding._createAssociation(fragment, this);
          }
          typeListForEach(this, (xmlType) => {
            fragment.insertBefore(xmlType.toDOM(_document, hooks, binding), null);
          });
          return fragment;
        }
        /**
         * Inserts new content at an index.
         *
         * @example
         *  // Insert character 'a' at position 0
         *  xml.insert(0, [new Y.XmlText('text')])
         *
         * @param {number} index The index to insert content at
         * @param {Array<YXmlElement|YXmlText>} content The array of content
         */
        insert(index, content) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              typeListInsertGenerics(transaction, this, index, content);
            });
          } else {
            this._prelimContent.splice(index, 0, ...content);
          }
        }
        /**
         * Inserts new content at an index.
         *
         * @example
         *  // Insert character 'a' at position 0
         *  xml.insert(0, [new Y.XmlText('text')])
         *
         * @param {null|Item|YXmlElement|YXmlText} ref The index to insert content at
         * @param {Array<YXmlElement|YXmlText>} content The array of content
         */
        insertAfter(ref, content) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              const refItem = ref && ref instanceof AbstractType ? ref._item : ref;
              typeListInsertGenericsAfter(transaction, this, refItem, content);
            });
          } else {
            const pc = (
              /** @type {Array<any>} */
              this._prelimContent
            );
            const index = ref === null ? 0 : pc.findIndex((el) => el === ref) + 1;
            if (index === 0 && ref !== null) {
              throw create3("Reference item not found");
            }
            pc.splice(index, 0, ...content);
          }
        }
        /**
         * Deletes elements starting from an index.
         *
         * @param {number} index Index at which to start deleting elements
         * @param {number} [length=1] The number of elements to remove. Defaults to 1.
         */
        delete(index, length2 = 1) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              typeListDelete(transaction, this, index, length2);
            });
          } else {
            this._prelimContent.splice(index, length2);
          }
        }
        /**
         * Transforms this YArray to a JavaScript Array.
         *
         * @return {Array<YXmlElement|YXmlText|YXmlHook>}
         */
        toArray() {
          return typeListToArray(this);
        }
        /**
         * Appends content to this YArray.
         *
         * @param {Array<YXmlElement|YXmlText>} content Array of content to append.
         */
        push(content) {
          this.insert(this.length, content);
        }
        /**
         * Prepends content to this YArray.
         *
         * @param {Array<YXmlElement|YXmlText>} content Array of content to prepend.
         */
        unshift(content) {
          this.insert(0, content);
        }
        /**
         * Returns the i-th element from a YArray.
         *
         * @param {number} index The index of the element to return from the YArray
         * @return {YXmlElement|YXmlText}
         */
        get(index) {
          return typeListGet(this, index);
        }
        /**
         * Returns a portion of this YXmlFragment into a JavaScript Array selected
         * from start to end (end not included).
         *
         * @param {number} [start]
         * @param {number} [end]
         * @return {Array<YXmlElement|YXmlText>}
         */
        slice(start = 0, end = this.length) {
          return typeListSlice(this, start, end);
        }
        /**
         * Executes a provided function on once on every child element.
         *
         * @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
         */
        forEach(f) {
          typeListForEach(this, f);
        }
        /**
         * Transform the properties of this type to binary and write it to an
         * BinaryEncoder.
         *
         * This is called when this Item is sent to a remote peer.
         *
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
         */
        _write(encoder) {
          encoder.writeTypeRef(YXmlFragmentRefID);
        }
      };
      readYXmlFragment = (_decoder) => new YXmlFragment();
      YXmlElement = class _YXmlElement extends YXmlFragment {
        constructor(nodeName = "UNDEFINED") {
          super();
          this.nodeName = nodeName;
          this._prelimAttrs = /* @__PURE__ */ new Map();
        }
        /**
         * @type {YXmlElement|YXmlText|null}
         */
        get nextSibling() {
          const n = this._item ? this._item.next : null;
          return n ? (
            /** @type {YXmlElement|YXmlText} */
            /** @type {ContentType} */
            n.content.type
          ) : null;
        }
        /**
         * @type {YXmlElement|YXmlText|null}
         */
        get prevSibling() {
          const n = this._item ? this._item.prev : null;
          return n ? (
            /** @type {YXmlElement|YXmlText} */
            /** @type {ContentType} */
            n.content.type
          ) : null;
        }
        /**
         * Integrate this type into the Yjs instance.
         *
         * * Save this struct in the os
         * * This type is sent to other client
         * * Observer functions are fired
         *
         * @param {Doc} y The Yjs instance
         * @param {Item} item
         */
        _integrate(y, item) {
          super._integrate(y, item);
          /** @type {Map<string, any>} */
          this._prelimAttrs.forEach((value, key) => {
            this.setAttribute(key, value);
          });
          this._prelimAttrs = null;
        }
        /**
         * Creates an Item with the same effect as this Item (without position effect)
         *
         * @return {YXmlElement}
         */
        _copy() {
          return new _YXmlElement(this.nodeName);
        }
        /**
         * Makes a copy of this data type that can be included somewhere else.
         *
         * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
         *
         * @return {YXmlElement<KV>}
         */
        clone() {
          const el = new _YXmlElement(this.nodeName);
          const attrs = this.getAttributes();
          forEach(attrs, (value, key) => {
            el.setAttribute(
              key,
              /** @type {any} */
              value
            );
          });
          el.insert(0, this.toArray().map((v) => v instanceof AbstractType ? v.clone() : v));
          return el;
        }
        /**
         * Returns the XML serialization of this YXmlElement.
         * The attributes are ordered by attribute-name, so you can easily use this
         * method to compare YXmlElements
         *
         * @return {string} The string representation of this type.
         *
         * @public
         */
        toString() {
          const attrs = this.getAttributes();
          const stringBuilder = [];
          const keys2 = [];
          for (const key in attrs) {
            keys2.push(key);
          }
          keys2.sort();
          const keysLen = keys2.length;
          for (let i = 0; i < keysLen; i++) {
            const key = keys2[i];
            stringBuilder.push(key + '="' + attrs[key] + '"');
          }
          const nodeName = this.nodeName.toLocaleLowerCase();
          const attrsString = stringBuilder.length > 0 ? " " + stringBuilder.join(" ") : "";
          return `<${nodeName}${attrsString}>${super.toString()}</${nodeName}>`;
        }
        /**
         * Removes an attribute from this YXmlElement.
         *
         * @param {string} attributeName The attribute name that is to be removed.
         *
         * @public
         */
        removeAttribute(attributeName) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              typeMapDelete(transaction, this, attributeName);
            });
          } else {
            this._prelimAttrs.delete(attributeName);
          }
        }
        /**
         * Sets or updates an attribute.
         *
         * @template {keyof KV & string} KEY
         *
         * @param {KEY} attributeName The attribute name that is to be set.
         * @param {KV[KEY]} attributeValue The attribute value that is to be set.
         *
         * @public
         */
        setAttribute(attributeName, attributeValue) {
          if (this.doc !== null) {
            transact(this.doc, (transaction) => {
              typeMapSet(transaction, this, attributeName, attributeValue);
            });
          } else {
            this._prelimAttrs.set(attributeName, attributeValue);
          }
        }
        /**
         * Returns an attribute value that belongs to the attribute name.
         *
         * @template {keyof KV & string} KEY
         *
         * @param {KEY} attributeName The attribute name that identifies the
         *                               queried value.
         * @return {KV[KEY]|undefined} The queried attribute value.
         *
         * @public
         */
        getAttribute(attributeName) {
          return (
            /** @type {any} */
            typeMapGet(this, attributeName)
          );
        }
        /**
         * Returns whether an attribute exists
         *
         * @param {string} attributeName The attribute name to check for existence.
         * @return {boolean} whether the attribute exists.
         *
         * @public
         */
        hasAttribute(attributeName) {
          return (
            /** @type {any} */
            typeMapHas(this, attributeName)
          );
        }
        /**
         * Returns all attribute name/value pairs in a JSON Object.
         *
         * @param {Snapshot} [snapshot]
         * @return {{ [Key in Extract<keyof KV,string>]?: KV[Key]}} A JSON Object that describes the attributes.
         *
         * @public
         */
        getAttributes(snapshot2) {
          return (
            /** @type {any} */
            snapshot2 ? typeMapGetAllSnapshot(this, snapshot2) : typeMapGetAll(this)
          );
        }
        /**
         * Creates a Dom Element that mirrors this YXmlElement.
         *
         * @param {Document} [_document=document] The document object (you must define
         *                                        this when calling this method in
         *                                        nodejs)
         * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
         *                                             are presented in the DOM
         * @param {any} [binding] You should not set this property. This is
         *                               used if DomBinding wants to create a
         *                               association to the created DOM type.
         * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
         *
         * @public
         */
        toDOM(_document = document, hooks = {}, binding) {
          const dom = _document.createElement(this.nodeName);
          const attrs = this.getAttributes();
          for (const key in attrs) {
            const value = attrs[key];
            if (typeof value === "string") {
              dom.setAttribute(key, value);
            }
          }
          typeListForEach(this, (yxml) => {
            dom.appendChild(yxml.toDOM(_document, hooks, binding));
          });
          if (binding !== void 0) {
            binding._createAssociation(dom, this);
          }
          return dom;
        }
        /**
         * Transform the properties of this type to binary and write it to an
         * BinaryEncoder.
         *
         * This is called when this Item is sent to a remote peer.
         *
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
         */
        _write(encoder) {
          encoder.writeTypeRef(YXmlElementRefID);
          encoder.writeKey(this.nodeName);
        }
      };
      readYXmlElement = (decoder) => new YXmlElement(decoder.readKey());
      YXmlEvent = class extends YEvent {
        /**
         * @param {YXmlElement|YXmlText|YXmlFragment} target The target on which the event is created.
         * @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
         *                   child list changed.
         * @param {Transaction} transaction The transaction instance with which the
         *                                  change was created.
         */
        constructor(target, subs, transaction) {
          super(target, transaction);
          this.childListChanged = false;
          this.attributesChanged = /* @__PURE__ */ new Set();
          subs.forEach((sub) => {
            if (sub === null) {
              this.childListChanged = true;
            } else {
              this.attributesChanged.add(sub);
            }
          });
        }
      };
      YXmlHook = class _YXmlHook extends YMap {
        /**
         * @param {string} hookName nodeName of the Dom Node.
         */
        constructor(hookName) {
          super();
          this.hookName = hookName;
        }
        /**
         * Creates an Item with the same effect as this Item (without position effect)
         */
        _copy() {
          return new _YXmlHook(this.hookName);
        }
        /**
         * Makes a copy of this data type that can be included somewhere else.
         *
         * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
         *
         * @return {YXmlHook}
         */
        clone() {
          const el = new _YXmlHook(this.hookName);
          this.forEach((value, key) => {
            el.set(key, value);
          });
          return el;
        }
        /**
         * Creates a Dom Element that mirrors this YXmlElement.
         *
         * @param {Document} [_document=document] The document object (you must define
         *                                        this when calling this method in
         *                                        nodejs)
         * @param {Object.<string, any>} [hooks] Optional property to customize how hooks
         *                                             are presented in the DOM
         * @param {any} [binding] You should not set this property. This is
         *                               used if DomBinding wants to create a
         *                               association to the created DOM type
         * @return {Element} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
         *
         * @public
         */
        toDOM(_document = document, hooks = {}, binding) {
          const hook = hooks[this.hookName];
          let dom;
          if (hook !== void 0) {
            dom = hook.createDom(this);
          } else {
            dom = document.createElement(this.hookName);
          }
          dom.setAttribute("data-yjs-hook", this.hookName);
          if (binding !== void 0) {
            binding._createAssociation(dom, this);
          }
          return dom;
        }
        /**
         * Transform the properties of this type to binary and write it to an
         * BinaryEncoder.
         *
         * This is called when this Item is sent to a remote peer.
         *
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
         */
        _write(encoder) {
          encoder.writeTypeRef(YXmlHookRefID);
          encoder.writeKey(this.hookName);
        }
      };
      readYXmlHook = (decoder) => new YXmlHook(decoder.readKey());
      YXmlText = class _YXmlText extends YText {
        /**
         * @type {YXmlElement|YXmlText|null}
         */
        get nextSibling() {
          const n = this._item ? this._item.next : null;
          return n ? (
            /** @type {YXmlElement|YXmlText} */
            /** @type {ContentType} */
            n.content.type
          ) : null;
        }
        /**
         * @type {YXmlElement|YXmlText|null}
         */
        get prevSibling() {
          const n = this._item ? this._item.prev : null;
          return n ? (
            /** @type {YXmlElement|YXmlText} */
            /** @type {ContentType} */
            n.content.type
          ) : null;
        }
        _copy() {
          return new _YXmlText();
        }
        /**
         * Makes a copy of this data type that can be included somewhere else.
         *
         * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
         *
         * @return {YXmlText}
         */
        clone() {
          const text2 = new _YXmlText();
          text2.applyDelta(this.toDelta());
          return text2;
        }
        /**
         * Creates a Dom Element that mirrors this YXmlText.
         *
         * @param {Document} [_document=document] The document object (you must define
         *                                        this when calling this method in
         *                                        nodejs)
         * @param {Object<string, any>} [hooks] Optional property to customize how hooks
         *                                             are presented in the DOM
         * @param {any} [binding] You should not set this property. This is
         *                               used if DomBinding wants to create a
         *                               association to the created DOM type.
         * @return {Text} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
         *
         * @public
         */
        toDOM(_document = document, hooks, binding) {
          const dom = _document.createTextNode(this.toString());
          if (binding !== void 0) {
            binding._createAssociation(dom, this);
          }
          return dom;
        }
        toString() {
          return this.toDelta().map((delta) => {
            const nestedNodes = [];
            for (const nodeName in delta.attributes) {
              const attrs = [];
              for (const key in delta.attributes[nodeName]) {
                attrs.push({ key, value: delta.attributes[nodeName][key] });
              }
              attrs.sort((a, b) => a.key < b.key ? -1 : 1);
              nestedNodes.push({ nodeName, attrs });
            }
            nestedNodes.sort((a, b) => a.nodeName < b.nodeName ? -1 : 1);
            let str = "";
            for (let i = 0; i < nestedNodes.length; i++) {
              const node = nestedNodes[i];
              str += `<${node.nodeName}`;
              for (let j = 0; j < node.attrs.length; j++) {
                const attr = node.attrs[j];
                str += ` ${attr.key}="${attr.value}"`;
              }
              str += ">";
            }
            str += delta.insert;
            for (let i = nestedNodes.length - 1; i >= 0; i--) {
              str += `</${nestedNodes[i].nodeName}>`;
            }
            return str;
          }).join("");
        }
        /**
         * @return {string}
         */
        toJSON() {
          return this.toString();
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         */
        _write(encoder) {
          encoder.writeTypeRef(YXmlTextRefID);
        }
      };
      readYXmlText = (decoder) => new YXmlText();
      AbstractStruct = class {
        /**
         * @param {ID} id
         * @param {number} length
         */
        constructor(id2, length2) {
          this.id = id2;
          this.length = length2;
        }
        /**
         * @type {boolean}
         */
        get deleted() {
          throw methodUnimplemented();
        }
        /**
         * Merge this struct with the item to the right.
         * This method is already assuming that `this.id.clock + this.length === this.id.clock`.
         * Also this method does *not* remove right from StructStore!
         * @param {AbstractStruct} right
         * @return {boolean} whether this merged with right
         */
        mergeWith(right) {
          return false;
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
         * @param {number} offset
         * @param {number} encodingRef
         */
        write(encoder, offset, encodingRef) {
          throw methodUnimplemented();
        }
        /**
         * @param {Transaction} transaction
         * @param {number} offset
         */
        integrate(transaction, offset) {
          throw methodUnimplemented();
        }
      };
      structGCRefNumber = 0;
      GC = class extends AbstractStruct {
        get deleted() {
          return true;
        }
        delete() {
        }
        /**
         * @param {GC} right
         * @return {boolean}
         */
        mergeWith(right) {
          if (this.constructor !== right.constructor) {
            return false;
          }
          this.length += right.length;
          return true;
        }
        /**
         * @param {Transaction} transaction
         * @param {number} offset
         */
        integrate(transaction, offset) {
          if (offset > 0) {
            this.id.clock += offset;
            this.length -= offset;
          }
          addStruct(transaction.doc.store, this);
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         * @param {number} offset
         */
        write(encoder, offset) {
          encoder.writeInfo(structGCRefNumber);
          encoder.writeLen(this.length - offset);
        }
        /**
         * @param {Transaction} transaction
         * @param {StructStore} store
         * @return {null | number}
         */
        getMissing(transaction, store) {
          return null;
        }
      };
      ContentBinary = class _ContentBinary {
        /**
         * @param {Uint8Array} content
         */
        constructor(content) {
          this.content = content;
        }
        /**
         * @return {number}
         */
        getLength() {
          return 1;
        }
        /**
         * @return {Array<any>}
         */
        getContent() {
          return [this.content];
        }
        /**
         * @return {boolean}
         */
        isCountable() {
          return true;
        }
        /**
         * @return {ContentBinary}
         */
        copy() {
          return new _ContentBinary(this.content);
        }
        /**
         * @param {number} offset
         * @return {ContentBinary}
         */
        splice(offset) {
          throw methodUnimplemented();
        }
        /**
         * @param {ContentBinary} right
         * @return {boolean}
         */
        mergeWith(right) {
          return false;
        }
        /**
         * @param {Transaction} transaction
         * @param {Item} item
         */
        integrate(transaction, item) {
        }
        /**
         * @param {Transaction} transaction
         */
        delete(transaction) {
        }
        /**
         * @param {StructStore} store
         */
        gc(store) {
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         * @param {number} offset
         */
        write(encoder, offset) {
          encoder.writeBuf(this.content);
        }
        /**
         * @return {number}
         */
        getRef() {
          return 3;
        }
      };
      readContentBinary = (decoder) => new ContentBinary(decoder.readBuf());
      ContentDeleted = class _ContentDeleted {
        /**
         * @param {number} len
         */
        constructor(len) {
          this.len = len;
        }
        /**
         * @return {number}
         */
        getLength() {
          return this.len;
        }
        /**
         * @return {Array<any>}
         */
        getContent() {
          return [];
        }
        /**
         * @return {boolean}
         */
        isCountable() {
          return false;
        }
        /**
         * @return {ContentDeleted}
         */
        copy() {
          return new _ContentDeleted(this.len);
        }
        /**
         * @param {number} offset
         * @return {ContentDeleted}
         */
        splice(offset) {
          const right = new _ContentDeleted(this.len - offset);
          this.len = offset;
          return right;
        }
        /**
         * @param {ContentDeleted} right
         * @return {boolean}
         */
        mergeWith(right) {
          this.len += right.len;
          return true;
        }
        /**
         * @param {Transaction} transaction
         * @param {Item} item
         */
        integrate(transaction, item) {
          addToDeleteSet(transaction.deleteSet, item.id.client, item.id.clock, this.len);
          item.markDeleted();
        }
        /**
         * @param {Transaction} transaction
         */
        delete(transaction) {
        }
        /**
         * @param {StructStore} store
         */
        gc(store) {
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         * @param {number} offset
         */
        write(encoder, offset) {
          encoder.writeLen(this.len - offset);
        }
        /**
         * @return {number}
         */
        getRef() {
          return 1;
        }
      };
      readContentDeleted = (decoder) => new ContentDeleted(decoder.readLen());
      createDocFromOpts = (guid, opts) => new Doc({ guid, ...opts, shouldLoad: opts.shouldLoad || opts.autoLoad || false });
      ContentDoc = class _ContentDoc {
        /**
         * @param {Doc} doc
         */
        constructor(doc2) {
          if (doc2._item) {
            console.error("This document was already integrated as a sub-document. You should create a second instance instead with the same guid.");
          }
          this.doc = doc2;
          const opts = {};
          this.opts = opts;
          if (!doc2.gc) {
            opts.gc = false;
          }
          if (doc2.autoLoad) {
            opts.autoLoad = true;
          }
          if (doc2.meta !== null) {
            opts.meta = doc2.meta;
          }
        }
        /**
         * @return {number}
         */
        getLength() {
          return 1;
        }
        /**
         * @return {Array<any>}
         */
        getContent() {
          return [this.doc];
        }
        /**
         * @return {boolean}
         */
        isCountable() {
          return true;
        }
        /**
         * @return {ContentDoc}
         */
        copy() {
          return new _ContentDoc(createDocFromOpts(this.doc.guid, this.opts));
        }
        /**
         * @param {number} offset
         * @return {ContentDoc}
         */
        splice(offset) {
          throw methodUnimplemented();
        }
        /**
         * @param {ContentDoc} right
         * @return {boolean}
         */
        mergeWith(right) {
          return false;
        }
        /**
         * @param {Transaction} transaction
         * @param {Item} item
         */
        integrate(transaction, item) {
          this.doc._item = item;
          transaction.subdocsAdded.add(this.doc);
          if (this.doc.shouldLoad) {
            transaction.subdocsLoaded.add(this.doc);
          }
        }
        /**
         * @param {Transaction} transaction
         */
        delete(transaction) {
          if (transaction.subdocsAdded.has(this.doc)) {
            transaction.subdocsAdded.delete(this.doc);
          } else {
            transaction.subdocsRemoved.add(this.doc);
          }
        }
        /**
         * @param {StructStore} store
         */
        gc(store) {
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         * @param {number} offset
         */
        write(encoder, offset) {
          encoder.writeString(this.doc.guid);
          encoder.writeAny(this.opts);
        }
        /**
         * @return {number}
         */
        getRef() {
          return 9;
        }
      };
      readContentDoc = (decoder) => new ContentDoc(createDocFromOpts(decoder.readString(), decoder.readAny()));
      ContentEmbed = class _ContentEmbed {
        /**
         * @param {Object} embed
         */
        constructor(embed) {
          this.embed = embed;
        }
        /**
         * @return {number}
         */
        getLength() {
          return 1;
        }
        /**
         * @return {Array<any>}
         */
        getContent() {
          return [this.embed];
        }
        /**
         * @return {boolean}
         */
        isCountable() {
          return true;
        }
        /**
         * @return {ContentEmbed}
         */
        copy() {
          return new _ContentEmbed(this.embed);
        }
        /**
         * @param {number} offset
         * @return {ContentEmbed}
         */
        splice(offset) {
          throw methodUnimplemented();
        }
        /**
         * @param {ContentEmbed} right
         * @return {boolean}
         */
        mergeWith(right) {
          return false;
        }
        /**
         * @param {Transaction} transaction
         * @param {Item} item
         */
        integrate(transaction, item) {
        }
        /**
         * @param {Transaction} transaction
         */
        delete(transaction) {
        }
        /**
         * @param {StructStore} store
         */
        gc(store) {
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         * @param {number} offset
         */
        write(encoder, offset) {
          encoder.writeJSON(this.embed);
        }
        /**
         * @return {number}
         */
        getRef() {
          return 5;
        }
      };
      readContentEmbed = (decoder) => new ContentEmbed(decoder.readJSON());
      ContentFormat = class _ContentFormat {
        /**
         * @param {string} key
         * @param {Object} value
         */
        constructor(key, value) {
          this.key = key;
          this.value = value;
        }
        /**
         * @return {number}
         */
        getLength() {
          return 1;
        }
        /**
         * @return {Array<any>}
         */
        getContent() {
          return [];
        }
        /**
         * @return {boolean}
         */
        isCountable() {
          return false;
        }
        /**
         * @return {ContentFormat}
         */
        copy() {
          return new _ContentFormat(this.key, this.value);
        }
        /**
         * @param {number} _offset
         * @return {ContentFormat}
         */
        splice(_offset) {
          throw methodUnimplemented();
        }
        /**
         * @param {ContentFormat} _right
         * @return {boolean}
         */
        mergeWith(_right) {
          return false;
        }
        /**
         * @param {Transaction} _transaction
         * @param {Item} item
         */
        integrate(_transaction, item) {
          const p = (
            /** @type {YText} */
            item.parent
          );
          p._searchMarker = null;
          p._hasFormatting = true;
        }
        /**
         * @param {Transaction} transaction
         */
        delete(transaction) {
        }
        /**
         * @param {StructStore} store
         */
        gc(store) {
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         * @param {number} offset
         */
        write(encoder, offset) {
          encoder.writeKey(this.key);
          encoder.writeJSON(this.value);
        }
        /**
         * @return {number}
         */
        getRef() {
          return 6;
        }
      };
      readContentFormat = (decoder) => new ContentFormat(decoder.readKey(), decoder.readJSON());
      ContentJSON = class _ContentJSON {
        /**
         * @param {Array<any>} arr
         */
        constructor(arr) {
          this.arr = arr;
        }
        /**
         * @return {number}
         */
        getLength() {
          return this.arr.length;
        }
        /**
         * @return {Array<any>}
         */
        getContent() {
          return this.arr;
        }
        /**
         * @return {boolean}
         */
        isCountable() {
          return true;
        }
        /**
         * @return {ContentJSON}
         */
        copy() {
          return new _ContentJSON(this.arr);
        }
        /**
         * @param {number} offset
         * @return {ContentJSON}
         */
        splice(offset) {
          const right = new _ContentJSON(this.arr.slice(offset));
          this.arr = this.arr.slice(0, offset);
          return right;
        }
        /**
         * @param {ContentJSON} right
         * @return {boolean}
         */
        mergeWith(right) {
          this.arr = this.arr.concat(right.arr);
          return true;
        }
        /**
         * @param {Transaction} transaction
         * @param {Item} item
         */
        integrate(transaction, item) {
        }
        /**
         * @param {Transaction} transaction
         */
        delete(transaction) {
        }
        /**
         * @param {StructStore} store
         */
        gc(store) {
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         * @param {number} offset
         */
        write(encoder, offset) {
          const len = this.arr.length;
          encoder.writeLen(len - offset);
          for (let i = offset; i < len; i++) {
            const c = this.arr[i];
            encoder.writeString(c === void 0 ? "undefined" : JSON.stringify(c));
          }
        }
        /**
         * @return {number}
         */
        getRef() {
          return 2;
        }
      };
      readContentJSON = (decoder) => {
        const len = decoder.readLen();
        const cs = [];
        for (let i = 0; i < len; i++) {
          const c = decoder.readString();
          if (c === "undefined") {
            cs.push(void 0);
          } else {
            cs.push(JSON.parse(c));
          }
        }
        return new ContentJSON(cs);
      };
      isDevMode = getVariable("node_env") === "development";
      ContentAny = class _ContentAny {
        /**
         * @param {Array<any>} arr
         */
        constructor(arr) {
          this.arr = arr;
          isDevMode && deepFreeze(arr);
        }
        /**
         * @return {number}
         */
        getLength() {
          return this.arr.length;
        }
        /**
         * @return {Array<any>}
         */
        getContent() {
          return this.arr;
        }
        /**
         * @return {boolean}
         */
        isCountable() {
          return true;
        }
        /**
         * @return {ContentAny}
         */
        copy() {
          return new _ContentAny(this.arr);
        }
        /**
         * @param {number} offset
         * @return {ContentAny}
         */
        splice(offset) {
          const right = new _ContentAny(this.arr.slice(offset));
          this.arr = this.arr.slice(0, offset);
          return right;
        }
        /**
         * @param {ContentAny} right
         * @return {boolean}
         */
        mergeWith(right) {
          this.arr = this.arr.concat(right.arr);
          return true;
        }
        /**
         * @param {Transaction} transaction
         * @param {Item} item
         */
        integrate(transaction, item) {
        }
        /**
         * @param {Transaction} transaction
         */
        delete(transaction) {
        }
        /**
         * @param {StructStore} store
         */
        gc(store) {
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         * @param {number} offset
         */
        write(encoder, offset) {
          const len = this.arr.length;
          encoder.writeLen(len - offset);
          for (let i = offset; i < len; i++) {
            const c = this.arr[i];
            encoder.writeAny(c);
          }
        }
        /**
         * @return {number}
         */
        getRef() {
          return 8;
        }
      };
      readContentAny = (decoder) => {
        const len = decoder.readLen();
        const cs = [];
        for (let i = 0; i < len; i++) {
          cs.push(decoder.readAny());
        }
        return new ContentAny(cs);
      };
      ContentString = class _ContentString {
        /**
         * @param {string} str
         */
        constructor(str) {
          this.str = str;
        }
        /**
         * @return {number}
         */
        getLength() {
          return this.str.length;
        }
        /**
         * @return {Array<any>}
         */
        getContent() {
          return this.str.split("");
        }
        /**
         * @return {boolean}
         */
        isCountable() {
          return true;
        }
        /**
         * @return {ContentString}
         */
        copy() {
          return new _ContentString(this.str);
        }
        /**
         * @param {number} offset
         * @return {ContentString}
         */
        splice(offset) {
          const right = new _ContentString(this.str.slice(offset));
          this.str = this.str.slice(0, offset);
          const firstCharCode = this.str.charCodeAt(offset - 1);
          if (firstCharCode >= 55296 && firstCharCode <= 56319) {
            this.str = this.str.slice(0, offset - 1) + "\uFFFD";
            right.str = "\uFFFD" + right.str.slice(1);
          }
          return right;
        }
        /**
         * @param {ContentString} right
         * @return {boolean}
         */
        mergeWith(right) {
          this.str += right.str;
          return true;
        }
        /**
         * @param {Transaction} transaction
         * @param {Item} item
         */
        integrate(transaction, item) {
        }
        /**
         * @param {Transaction} transaction
         */
        delete(transaction) {
        }
        /**
         * @param {StructStore} store
         */
        gc(store) {
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         * @param {number} offset
         */
        write(encoder, offset) {
          encoder.writeString(offset === 0 ? this.str : this.str.slice(offset));
        }
        /**
         * @return {number}
         */
        getRef() {
          return 4;
        }
      };
      readContentString = (decoder) => new ContentString(decoder.readString());
      typeRefs = [
        readYArray,
        readYMap,
        readYText,
        readYXmlElement,
        readYXmlFragment,
        readYXmlHook,
        readYXmlText
      ];
      YArrayRefID = 0;
      YMapRefID = 1;
      YTextRefID = 2;
      YXmlElementRefID = 3;
      YXmlFragmentRefID = 4;
      YXmlHookRefID = 5;
      YXmlTextRefID = 6;
      ContentType = class _ContentType {
        /**
         * @param {AbstractType<any>} type
         */
        constructor(type) {
          this.type = type;
        }
        /**
         * @return {number}
         */
        getLength() {
          return 1;
        }
        /**
         * @return {Array<any>}
         */
        getContent() {
          return [this.type];
        }
        /**
         * @return {boolean}
         */
        isCountable() {
          return true;
        }
        /**
         * @return {ContentType}
         */
        copy() {
          return new _ContentType(this.type._copy());
        }
        /**
         * @param {number} offset
         * @return {ContentType}
         */
        splice(offset) {
          throw methodUnimplemented();
        }
        /**
         * @param {ContentType} right
         * @return {boolean}
         */
        mergeWith(right) {
          return false;
        }
        /**
         * @param {Transaction} transaction
         * @param {Item} item
         */
        integrate(transaction, item) {
          this.type._integrate(transaction.doc, item);
        }
        /**
         * @param {Transaction} transaction
         */
        delete(transaction) {
          let item = this.type._start;
          while (item !== null) {
            if (!item.deleted) {
              item.delete(transaction);
            } else if (item.id.clock < (transaction.beforeState.get(item.id.client) || 0)) {
              transaction._mergeStructs.push(item);
            }
            item = item.right;
          }
          this.type._map.forEach((item2) => {
            if (!item2.deleted) {
              item2.delete(transaction);
            } else if (item2.id.clock < (transaction.beforeState.get(item2.id.client) || 0)) {
              transaction._mergeStructs.push(item2);
            }
          });
          transaction.changed.delete(this.type);
        }
        /**
         * @param {StructStore} store
         */
        gc(store) {
          let item = this.type._start;
          while (item !== null) {
            item.gc(store, true);
            item = item.right;
          }
          this.type._start = null;
          this.type._map.forEach(
            /** @param {Item | null} item */
            (item2) => {
              while (item2 !== null) {
                item2.gc(store, true);
                item2 = item2.left;
              }
            }
          );
          this.type._map = /* @__PURE__ */ new Map();
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         * @param {number} offset
         */
        write(encoder, offset) {
          this.type._write(encoder);
        }
        /**
         * @return {number}
         */
        getRef() {
          return 7;
        }
      };
      readContentType = (decoder) => new ContentType(typeRefs[decoder.readTypeRef()](decoder));
      splitItem = (transaction, leftItem, diff) => {
        const { client, clock } = leftItem.id;
        const rightItem = new Item(
          createID(client, clock + diff),
          leftItem,
          createID(client, clock + diff - 1),
          leftItem.right,
          leftItem.rightOrigin,
          leftItem.parent,
          leftItem.parentSub,
          leftItem.content.splice(diff)
        );
        if (leftItem.deleted) {
          rightItem.markDeleted();
        }
        if (leftItem.keep) {
          rightItem.keep = true;
        }
        if (leftItem.redone !== null) {
          rightItem.redone = createID(leftItem.redone.client, leftItem.redone.clock + diff);
        }
        leftItem.right = rightItem;
        if (rightItem.right !== null) {
          rightItem.right.left = rightItem;
        }
        transaction._mergeStructs.push(rightItem);
        if (rightItem.parentSub !== null && rightItem.right === null) {
          rightItem.parent._map.set(rightItem.parentSub, rightItem);
        }
        leftItem.length = diff;
        return rightItem;
      };
      Item = class _Item extends AbstractStruct {
        /**
         * @param {ID} id
         * @param {Item | null} left
         * @param {ID | null} origin
         * @param {Item | null} right
         * @param {ID | null} rightOrigin
         * @param {AbstractType<any>|ID|null} parent Is a type if integrated, is null if it is possible to copy parent from left or right, is ID before integration to search for it.
         * @param {string | null} parentSub
         * @param {AbstractContent} content
         */
        constructor(id2, left, origin, right, rightOrigin, parent, parentSub, content) {
          super(id2, content.getLength());
          this.origin = origin;
          this.left = left;
          this.right = right;
          this.rightOrigin = rightOrigin;
          this.parent = parent;
          this.parentSub = parentSub;
          this.redone = null;
          this.content = content;
          this.info = this.content.isCountable() ? BIT2 : 0;
        }
        /**
         * This is used to mark the item as an indexed fast-search marker
         *
         * @type {boolean}
         */
        set marker(isMarked) {
          if ((this.info & BIT4) > 0 !== isMarked) {
            this.info ^= BIT4;
          }
        }
        get marker() {
          return (this.info & BIT4) > 0;
        }
        /**
         * If true, do not garbage collect this Item.
         */
        get keep() {
          return (this.info & BIT1) > 0;
        }
        set keep(doKeep) {
          if (this.keep !== doKeep) {
            this.info ^= BIT1;
          }
        }
        get countable() {
          return (this.info & BIT2) > 0;
        }
        /**
         * Whether this item was deleted or not.
         * @type {Boolean}
         */
        get deleted() {
          return (this.info & BIT3) > 0;
        }
        set deleted(doDelete) {
          if (this.deleted !== doDelete) {
            this.info ^= BIT3;
          }
        }
        markDeleted() {
          this.info |= BIT3;
        }
        /**
         * Return the creator clientID of the missing op or define missing items and return null.
         *
         * @param {Transaction} transaction
         * @param {StructStore} store
         * @return {null | number}
         */
        getMissing(transaction, store) {
          if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= getState(store, this.origin.client)) {
            return this.origin.client;
          }
          if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= getState(store, this.rightOrigin.client)) {
            return this.rightOrigin.client;
          }
          if (this.parent && this.parent.constructor === ID && this.id.client !== this.parent.client && this.parent.clock >= getState(store, this.parent.client)) {
            return this.parent.client;
          }
          if (this.origin) {
            this.left = getItemCleanEnd(transaction, store, this.origin);
            this.origin = this.left.lastId;
          }
          if (this.rightOrigin) {
            this.right = getItemCleanStart(transaction, this.rightOrigin);
            this.rightOrigin = this.right.id;
          }
          if (this.left && this.left.constructor === GC || this.right && this.right.constructor === GC) {
            this.parent = null;
          } else if (!this.parent) {
            if (this.left && this.left.constructor === _Item) {
              this.parent = this.left.parent;
              this.parentSub = this.left.parentSub;
            } else if (this.right && this.right.constructor === _Item) {
              this.parent = this.right.parent;
              this.parentSub = this.right.parentSub;
            }
          } else if (this.parent.constructor === ID) {
            const parentItem = getItem(store, this.parent);
            if (parentItem.constructor === GC) {
              this.parent = null;
            } else {
              this.parent = /** @type {ContentType} */
              parentItem.content.type;
            }
          }
          return null;
        }
        /**
         * @param {Transaction} transaction
         * @param {number} offset
         */
        integrate(transaction, offset) {
          if (offset > 0) {
            this.id.clock += offset;
            this.left = getItemCleanEnd(transaction, transaction.doc.store, createID(this.id.client, this.id.clock - 1));
            this.origin = this.left.lastId;
            this.content = this.content.splice(offset);
            this.length -= offset;
          }
          if (this.parent) {
            if (!this.left && (!this.right || this.right.left !== null) || this.left && this.left.right !== this.right) {
              let left = this.left;
              let o;
              if (left !== null) {
                o = left.right;
              } else if (this.parentSub !== null) {
                o = /** @type {AbstractType<any>} */
                this.parent._map.get(this.parentSub) || null;
                while (o !== null && o.left !== null) {
                  o = o.left;
                }
              } else {
                o = /** @type {AbstractType<any>} */
                this.parent._start;
              }
              const conflictingItems = /* @__PURE__ */ new Set();
              const itemsBeforeOrigin = /* @__PURE__ */ new Set();
              while (o !== null && o !== this.right) {
                itemsBeforeOrigin.add(o);
                conflictingItems.add(o);
                if (compareIDs(this.origin, o.origin)) {
                  if (o.id.client < this.id.client) {
                    left = o;
                    conflictingItems.clear();
                  } else if (compareIDs(this.rightOrigin, o.rightOrigin)) {
                    break;
                  }
                } else if (o.origin !== null && itemsBeforeOrigin.has(getItem(transaction.doc.store, o.origin))) {
                  if (!conflictingItems.has(getItem(transaction.doc.store, o.origin))) {
                    left = o;
                    conflictingItems.clear();
                  }
                } else {
                  break;
                }
                o = o.right;
              }
              this.left = left;
            }
            if (this.left !== null) {
              const right = this.left.right;
              this.right = right;
              this.left.right = this;
            } else {
              let r;
              if (this.parentSub !== null) {
                r = /** @type {AbstractType<any>} */
                this.parent._map.get(this.parentSub) || null;
                while (r !== null && r.left !== null) {
                  r = r.left;
                }
              } else {
                r = /** @type {AbstractType<any>} */
                this.parent._start;
                this.parent._start = this;
              }
              this.right = r;
            }
            if (this.right !== null) {
              this.right.left = this;
            } else if (this.parentSub !== null) {
              this.parent._map.set(this.parentSub, this);
              if (this.left !== null) {
                this.left.delete(transaction);
              }
            }
            if (this.parentSub === null && this.countable && !this.deleted) {
              this.parent._length += this.length;
            }
            addStruct(transaction.doc.store, this);
            this.content.integrate(transaction, this);
            addChangedTypeToTransaction(
              transaction,
              /** @type {AbstractType<any>} */
              this.parent,
              this.parentSub
            );
            if (
              /** @type {AbstractType<any>} */
              this.parent._item !== null && /** @type {AbstractType<any>} */
              this.parent._item.deleted || this.parentSub !== null && this.right !== null
            ) {
              this.delete(transaction);
            }
          } else {
            new GC(this.id, this.length).integrate(transaction, 0);
          }
        }
        /**
         * Returns the next non-deleted item
         */
        get next() {
          let n = this.right;
          while (n !== null && n.deleted) {
            n = n.right;
          }
          return n;
        }
        /**
         * Returns the previous non-deleted item
         */
        get prev() {
          let n = this.left;
          while (n !== null && n.deleted) {
            n = n.left;
          }
          return n;
        }
        /**
         * Computes the last content address of this Item.
         */
        get lastId() {
          return this.length === 1 ? this.id : createID(this.id.client, this.id.clock + this.length - 1);
        }
        /**
         * Try to merge two items
         *
         * @param {Item} right
         * @return {boolean}
         */
        mergeWith(right) {
          if (this.constructor === right.constructor && compareIDs(right.origin, this.lastId) && this.right === right && compareIDs(this.rightOrigin, right.rightOrigin) && this.id.client === right.id.client && this.id.clock + this.length === right.id.clock && this.deleted === right.deleted && this.redone === null && right.redone === null && this.content.constructor === right.content.constructor && this.content.mergeWith(right.content)) {
            const searchMarker = (
              /** @type {AbstractType<any>} */
              this.parent._searchMarker
            );
            if (searchMarker) {
              searchMarker.forEach((marker) => {
                if (marker.p === right) {
                  marker.p = this;
                  if (!this.deleted && this.countable) {
                    marker.index -= this.length;
                  }
                }
              });
            }
            if (right.keep) {
              this.keep = true;
            }
            this.right = right.right;
            if (this.right !== null) {
              this.right.left = this;
            }
            this.length += right.length;
            return true;
          }
          return false;
        }
        /**
         * Mark this Item as deleted.
         *
         * @param {Transaction} transaction
         */
        delete(transaction) {
          if (!this.deleted) {
            const parent = (
              /** @type {AbstractType<any>} */
              this.parent
            );
            if (this.countable && this.parentSub === null) {
              parent._length -= this.length;
            }
            this.markDeleted();
            addToDeleteSet(transaction.deleteSet, this.id.client, this.id.clock, this.length);
            addChangedTypeToTransaction(transaction, parent, this.parentSub);
            this.content.delete(transaction);
          }
        }
        /**
         * @param {StructStore} store
         * @param {boolean} parentGCd
         */
        gc(store, parentGCd) {
          if (!this.deleted) {
            throw unexpectedCase();
          }
          this.content.gc(store);
          if (parentGCd) {
            replaceStruct(store, this, new GC(this.id, this.length));
          } else {
            this.content = new ContentDeleted(this.length);
          }
        }
        /**
         * Transform the properties of this type to binary and write it to an
         * BinaryEncoder.
         *
         * This is called when this Item is sent to a remote peer.
         *
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
         * @param {number} offset
         */
        write(encoder, offset) {
          const origin = offset > 0 ? createID(this.id.client, this.id.clock + offset - 1) : this.origin;
          const rightOrigin = this.rightOrigin;
          const parentSub = this.parentSub;
          const info = this.content.getRef() & BITS5 | (origin === null ? 0 : BIT8) | // origin is defined
          (rightOrigin === null ? 0 : BIT7) | // right origin is defined
          (parentSub === null ? 0 : BIT6);
          encoder.writeInfo(info);
          if (origin !== null) {
            encoder.writeLeftID(origin);
          }
          if (rightOrigin !== null) {
            encoder.writeRightID(rightOrigin);
          }
          if (origin === null && rightOrigin === null) {
            const parent = (
              /** @type {AbstractType<any>} */
              this.parent
            );
            if (parent._item !== void 0) {
              const parentItem = parent._item;
              if (parentItem === null) {
                const ykey = findRootTypeKey(parent);
                encoder.writeParentInfo(true);
                encoder.writeString(ykey);
              } else {
                encoder.writeParentInfo(false);
                encoder.writeLeftID(parentItem.id);
              }
            } else if (parent.constructor === String) {
              encoder.writeParentInfo(true);
              encoder.writeString(parent);
            } else if (parent.constructor === ID) {
              encoder.writeParentInfo(false);
              encoder.writeLeftID(parent);
            } else {
              unexpectedCase();
            }
            if (parentSub !== null) {
              encoder.writeString(parentSub);
            }
          }
          this.content.write(encoder, offset);
        }
      };
      readItemContent = (decoder, info) => contentRefs[info & BITS5](decoder);
      contentRefs = [
        () => {
          unexpectedCase();
        },
        // GC is not ItemContent
        readContentDeleted,
        // 1
        readContentJSON,
        // 2
        readContentBinary,
        // 3
        readContentString,
        // 4
        readContentEmbed,
        // 5
        readContentFormat,
        // 6
        readContentType,
        // 7
        readContentAny,
        // 8
        readContentDoc,
        // 9
        () => {
          unexpectedCase();
        }
        // 10 - Skip is not ItemContent
      ];
      structSkipRefNumber = 10;
      Skip = class extends AbstractStruct {
        get deleted() {
          return true;
        }
        delete() {
        }
        /**
         * @param {Skip} right
         * @return {boolean}
         */
        mergeWith(right) {
          if (this.constructor !== right.constructor) {
            return false;
          }
          this.length += right.length;
          return true;
        }
        /**
         * @param {Transaction} transaction
         * @param {number} offset
         */
        integrate(transaction, offset) {
          unexpectedCase();
        }
        /**
         * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
         * @param {number} offset
         */
        write(encoder, offset) {
          encoder.writeInfo(structSkipRefNumber);
          writeVarUint(encoder.restEncoder, this.length - offset);
        }
        /**
         * @param {Transaction} transaction
         * @param {StructStore} store
         * @return {null | number}
         */
        getMissing(transaction, store) {
          return null;
        }
      };
      glo = /** @type {any} */
      typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
      importIdentifier = "__ $YJS$ __";
      if (glo[importIdentifier] === true) {
        console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");
      }
      glo[importIdentifier] = true;
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/broadcastchannel.js
  var channels, LocalStoragePolyfill, BC, getChannel, subscribe, unsubscribe, publish;
  var init_broadcastchannel = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/broadcastchannel.js"() {
      "use strict";
      init_map();
      init_set();
      init_buffer();
      init_storage();
      channels = /* @__PURE__ */ new Map();
      LocalStoragePolyfill = class {
        /**
         * @param {string} room
         */
        constructor(room) {
          this.room = room;
          this.onmessage = null;
          this._onChange = (e) => e.key === room && this.onmessage !== null && this.onmessage({ data: fromBase64(e.newValue || "") });
          onChange(this._onChange);
        }
        /**
         * @param {ArrayBuffer} buf
         */
        postMessage(buf) {
          varStorage.setItem(this.room, toBase64(createUint8ArrayFromArrayBuffer(buf)));
        }
        close() {
          offChange(this._onChange);
        }
      };
      BC = typeof BroadcastChannel === "undefined" ? LocalStoragePolyfill : BroadcastChannel;
      getChannel = (room) => setIfUndefined(channels, room, () => {
        const subs = create2();
        const bc = new BC(room);
        bc.onmessage = (e) => subs.forEach((sub) => sub(e.data, "broadcastchannel"));
        return {
          bc,
          subs
        };
      });
      subscribe = (room, f) => {
        getChannel(room).subs.add(f);
        return f;
      };
      unsubscribe = (room, f) => {
        const channel = getChannel(room);
        const unsubscribed = channel.subs.delete(f);
        if (unsubscribed && channel.subs.size === 0) {
          channel.bc.close();
          channels.delete(room);
        }
        return unsubscribed;
      };
      publish = (room, data, origin = null) => {
        const c = getChannel(room);
        c.bc.postMessage(data);
        c.subs.forEach((sub) => sub(data, origin));
      };
    }
  });

  // ../../node_modules/.pnpm/y-protocols@1.0.7_yjs@13.6.32/node_modules/y-protocols/sync.js
  var messageYjsSyncStep1, messageYjsSyncStep2, messageYjsUpdate, writeSyncStep1, writeSyncStep2, readSyncStep1, readSyncStep2, writeUpdate, readUpdate, readSyncMessage;
  var init_sync = __esm({
    "../../node_modules/.pnpm/y-protocols@1.0.7_yjs@13.6.32/node_modules/y-protocols/sync.js"() {
      "use strict";
      init_encoding();
      init_decoding();
      init_yjs();
      messageYjsSyncStep1 = 0;
      messageYjsSyncStep2 = 1;
      messageYjsUpdate = 2;
      writeSyncStep1 = (encoder, doc2) => {
        writeVarUint(encoder, messageYjsSyncStep1);
        const sv = encodeStateVector(doc2);
        writeVarUint8Array(encoder, sv);
      };
      writeSyncStep2 = (encoder, doc2, encodedStateVector) => {
        writeVarUint(encoder, messageYjsSyncStep2);
        writeVarUint8Array(encoder, encodeStateAsUpdate(doc2, encodedStateVector));
      };
      readSyncStep1 = (decoder, encoder, doc2) => writeSyncStep2(encoder, doc2, readVarUint8Array(decoder));
      readSyncStep2 = (decoder, doc2, transactionOrigin, errorHandler) => {
        try {
          applyUpdate(doc2, readVarUint8Array(decoder), transactionOrigin);
        } catch (error) {
          if (errorHandler != null) errorHandler(
            /** @type {Error} */
            error
          );
          console.error("Caught error while handling a Yjs update", error);
        }
      };
      writeUpdate = (encoder, update) => {
        writeVarUint(encoder, messageYjsUpdate);
        writeVarUint8Array(encoder, update);
      };
      readUpdate = readSyncStep2;
      readSyncMessage = (decoder, encoder, doc2, transactionOrigin, errorHandler) => {
        const messageType = readVarUint(decoder);
        switch (messageType) {
          case messageYjsSyncStep1:
            readSyncStep1(decoder, encoder, doc2);
            break;
          case messageYjsSyncStep2:
            readSyncStep2(decoder, doc2, transactionOrigin, errorHandler);
            break;
          case messageYjsUpdate:
            readUpdate(decoder, doc2, transactionOrigin, errorHandler);
            break;
          default:
            throw new Error("Unknown message type");
        }
        return messageType;
      };
    }
  });

  // ../../node_modules/.pnpm/y-protocols@1.0.7_yjs@13.6.32/node_modules/y-protocols/awareness.js
  var outdatedTimeout, Awareness, removeAwarenessStates, encodeAwarenessUpdate, applyAwarenessUpdate;
  var init_awareness = __esm({
    "../../node_modules/.pnpm/y-protocols@1.0.7_yjs@13.6.32/node_modules/y-protocols/awareness.js"() {
      "use strict";
      init_encoding();
      init_decoding();
      init_time();
      init_math();
      init_observable();
      init_function();
      outdatedTimeout = 3e4;
      Awareness = class extends Observable {
        /**
         * @param {Y.Doc} doc
         */
        constructor(doc2) {
          super();
          this.doc = doc2;
          this.clientID = doc2.clientID;
          this.states = /* @__PURE__ */ new Map();
          this.meta = /* @__PURE__ */ new Map();
          this._checkInterval = /** @type {any} */
          setInterval(() => {
            const now = getUnixTime();
            if (this.getLocalState() !== null && outdatedTimeout / 2 <= now - /** @type {{lastUpdated:number}} */
            this.meta.get(this.clientID).lastUpdated) {
              this.setLocalState(this.getLocalState());
            }
            const remove = [];
            this.meta.forEach((meta, clientid) => {
              if (clientid !== this.clientID && outdatedTimeout <= now - meta.lastUpdated && this.states.has(clientid)) {
                remove.push(clientid);
              }
            });
            if (remove.length > 0) {
              removeAwarenessStates(this, remove, "timeout");
            }
          }, floor(outdatedTimeout / 10));
          doc2.on("destroy", () => {
            this.destroy();
          });
          this.setLocalState({});
        }
        destroy() {
          this.emit("destroy", [this]);
          this.setLocalState(null);
          super.destroy();
          clearInterval(this._checkInterval);
        }
        /**
         * @return {Object<string,any>|null}
         */
        getLocalState() {
          return this.states.get(this.clientID) || null;
        }
        /**
         * @param {Object<string,any>|null} state
         */
        setLocalState(state) {
          const clientID = this.clientID;
          const currLocalMeta = this.meta.get(clientID);
          const clock = currLocalMeta === void 0 ? 0 : currLocalMeta.clock + 1;
          const prevState = this.states.get(clientID);
          if (state === null) {
            this.states.delete(clientID);
          } else {
            this.states.set(clientID, state);
          }
          this.meta.set(clientID, {
            clock,
            lastUpdated: getUnixTime()
          });
          const added = [];
          const updated = [];
          const filteredUpdated = [];
          const removed = [];
          if (state === null) {
            removed.push(clientID);
          } else if (prevState == null) {
            if (state != null) {
              added.push(clientID);
            }
          } else {
            updated.push(clientID);
            if (!equalityDeep(prevState, state)) {
              filteredUpdated.push(clientID);
            }
          }
          if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
            this.emit("change", [{ added, updated: filteredUpdated, removed }, "local"]);
          }
          this.emit("update", [{ added, updated, removed }, "local"]);
        }
        /**
         * @param {string} field
         * @param {any} value
         */
        setLocalStateField(field, value) {
          const state = this.getLocalState();
          if (state !== null) {
            this.setLocalState({
              ...state,
              [field]: value
            });
          }
        }
        /**
         * @return {Map<number,Object<string,any>>}
         */
        getStates() {
          return this.states;
        }
      };
      removeAwarenessStates = (awareness, clients, origin) => {
        const removed = [];
        for (let i = 0; i < clients.length; i++) {
          const clientID = clients[i];
          if (awareness.states.has(clientID)) {
            awareness.states.delete(clientID);
            if (clientID === awareness.clientID) {
              const curMeta = (
                /** @type {MetaClientState} */
                awareness.meta.get(clientID)
              );
              awareness.meta.set(clientID, {
                clock: curMeta.clock + 1,
                lastUpdated: getUnixTime()
              });
            }
            removed.push(clientID);
          }
        }
        if (removed.length > 0) {
          awareness.emit("change", [{ added: [], updated: [], removed }, origin]);
          awareness.emit("update", [{ added: [], updated: [], removed }, origin]);
        }
      };
      encodeAwarenessUpdate = (awareness, clients, states = awareness.states) => {
        const len = clients.length;
        const encoder = createEncoder();
        writeVarUint(encoder, len);
        for (let i = 0; i < len; i++) {
          const clientID = clients[i];
          const state = states.get(clientID) || null;
          const clock = (
            /** @type {MetaClientState} */
            awareness.meta.get(clientID).clock
          );
          writeVarUint(encoder, clientID);
          writeVarUint(encoder, clock);
          writeVarString(encoder, JSON.stringify(state));
        }
        return toUint8Array(encoder);
      };
      applyAwarenessUpdate = (awareness, update, origin) => {
        const decoder = createDecoder(update);
        const timestamp = getUnixTime();
        const added = [];
        const updated = [];
        const filteredUpdated = [];
        const removed = [];
        const len = readVarUint(decoder);
        for (let i = 0; i < len; i++) {
          const clientID = readVarUint(decoder);
          let clock = readVarUint(decoder);
          const state = JSON.parse(readVarString(decoder));
          const clientMeta = awareness.meta.get(clientID);
          const prevState = awareness.states.get(clientID);
          const currClock = clientMeta === void 0 ? 0 : clientMeta.clock;
          if (currClock < clock || currClock === clock && state === null && awareness.states.has(clientID)) {
            if (state === null) {
              if (clientID === awareness.clientID && awareness.getLocalState() != null) {
                clock++;
              } else {
                awareness.states.delete(clientID);
              }
            } else {
              awareness.states.set(clientID, state);
            }
            awareness.meta.set(clientID, {
              clock,
              lastUpdated: timestamp
            });
            if (clientMeta === void 0 && state !== null) {
              added.push(clientID);
            } else if (clientMeta !== void 0 && state === null) {
              removed.push(clientID);
            } else if (state !== null) {
              if (!equalityDeep(state, prevState)) {
                filteredUpdated.push(clientID);
              }
              updated.push(clientID);
            }
          }
        }
        if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
          awareness.emit("change", [{
            added,
            updated: filteredUpdated,
            removed
          }, origin]);
        }
        if (added.length > 0 || updated.length > 0 || removed.length > 0) {
          awareness.emit("update", [{
            added,
            updated,
            removed
          }, origin]);
        }
      };
    }
  });

  // (disabled):crypto
  var require_crypto = __commonJS({
    "(disabled):crypto"() {
      "use strict";
    }
  });

  // ../../node_modules/.pnpm/tweetnacl@1.0.3/node_modules/tweetnacl/nacl-fast.js
  var require_nacl_fast = __commonJS({
    "../../node_modules/.pnpm/tweetnacl@1.0.3/node_modules/tweetnacl/nacl-fast.js"(exports, module) {
      "use strict";
      (function(nacl3) {
        "use strict";
        var gf = function(init) {
          var i, r = new Float64Array(16);
          if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
          return r;
        };
        var randombytes = function() {
          throw new Error("no PRNG");
        };
        var _0 = new Uint8Array(16);
        var _9 = new Uint8Array(32);
        _9[0] = 9;
        var gf0 = gf(), gf1 = gf([1]), _121665 = gf([56129, 1]), D = gf([30883, 4953, 19914, 30187, 55467, 16705, 2637, 112, 59544, 30585, 16505, 36039, 65139, 11119, 27886, 20995]), D2 = gf([61785, 9906, 39828, 60374, 45398, 33411, 5274, 224, 53552, 61171, 33010, 6542, 64743, 22239, 55772, 9222]), X = gf([54554, 36645, 11616, 51542, 42930, 38181, 51040, 26924, 56412, 64982, 57905, 49316, 21502, 52590, 14035, 8553]), Y = gf([26200, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214]), I = gf([41136, 18958, 6951, 50414, 58488, 44335, 6150, 12099, 55207, 15867, 153, 11085, 57099, 20417, 9344, 11139]);
        function ts64(x, i, h, l) {
          x[i] = h >> 24 & 255;
          x[i + 1] = h >> 16 & 255;
          x[i + 2] = h >> 8 & 255;
          x[i + 3] = h & 255;
          x[i + 4] = l >> 24 & 255;
          x[i + 5] = l >> 16 & 255;
          x[i + 6] = l >> 8 & 255;
          x[i + 7] = l & 255;
        }
        function vn(x, xi, y, yi, n) {
          var i, d = 0;
          for (i = 0; i < n; i++) d |= x[xi + i] ^ y[yi + i];
          return (1 & d - 1 >>> 8) - 1;
        }
        function crypto_verify_16(x, xi, y, yi) {
          return vn(x, xi, y, yi, 16);
        }
        function crypto_verify_32(x, xi, y, yi) {
          return vn(x, xi, y, yi, 32);
        }
        function core_salsa20(o, p, k, c) {
          var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
          var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
          for (var i = 0; i < 20; i += 2) {
            u = x0 + x12 | 0;
            x4 ^= u << 7 | u >>> 32 - 7;
            u = x4 + x0 | 0;
            x8 ^= u << 9 | u >>> 32 - 9;
            u = x8 + x4 | 0;
            x12 ^= u << 13 | u >>> 32 - 13;
            u = x12 + x8 | 0;
            x0 ^= u << 18 | u >>> 32 - 18;
            u = x5 + x1 | 0;
            x9 ^= u << 7 | u >>> 32 - 7;
            u = x9 + x5 | 0;
            x13 ^= u << 9 | u >>> 32 - 9;
            u = x13 + x9 | 0;
            x1 ^= u << 13 | u >>> 32 - 13;
            u = x1 + x13 | 0;
            x5 ^= u << 18 | u >>> 32 - 18;
            u = x10 + x6 | 0;
            x14 ^= u << 7 | u >>> 32 - 7;
            u = x14 + x10 | 0;
            x2 ^= u << 9 | u >>> 32 - 9;
            u = x2 + x14 | 0;
            x6 ^= u << 13 | u >>> 32 - 13;
            u = x6 + x2 | 0;
            x10 ^= u << 18 | u >>> 32 - 18;
            u = x15 + x11 | 0;
            x3 ^= u << 7 | u >>> 32 - 7;
            u = x3 + x15 | 0;
            x7 ^= u << 9 | u >>> 32 - 9;
            u = x7 + x3 | 0;
            x11 ^= u << 13 | u >>> 32 - 13;
            u = x11 + x7 | 0;
            x15 ^= u << 18 | u >>> 32 - 18;
            u = x0 + x3 | 0;
            x1 ^= u << 7 | u >>> 32 - 7;
            u = x1 + x0 | 0;
            x2 ^= u << 9 | u >>> 32 - 9;
            u = x2 + x1 | 0;
            x3 ^= u << 13 | u >>> 32 - 13;
            u = x3 + x2 | 0;
            x0 ^= u << 18 | u >>> 32 - 18;
            u = x5 + x4 | 0;
            x6 ^= u << 7 | u >>> 32 - 7;
            u = x6 + x5 | 0;
            x7 ^= u << 9 | u >>> 32 - 9;
            u = x7 + x6 | 0;
            x4 ^= u << 13 | u >>> 32 - 13;
            u = x4 + x7 | 0;
            x5 ^= u << 18 | u >>> 32 - 18;
            u = x10 + x9 | 0;
            x11 ^= u << 7 | u >>> 32 - 7;
            u = x11 + x10 | 0;
            x8 ^= u << 9 | u >>> 32 - 9;
            u = x8 + x11 | 0;
            x9 ^= u << 13 | u >>> 32 - 13;
            u = x9 + x8 | 0;
            x10 ^= u << 18 | u >>> 32 - 18;
            u = x15 + x14 | 0;
            x12 ^= u << 7 | u >>> 32 - 7;
            u = x12 + x15 | 0;
            x13 ^= u << 9 | u >>> 32 - 9;
            u = x13 + x12 | 0;
            x14 ^= u << 13 | u >>> 32 - 13;
            u = x14 + x13 | 0;
            x15 ^= u << 18 | u >>> 32 - 18;
          }
          x0 = x0 + j0 | 0;
          x1 = x1 + j1 | 0;
          x2 = x2 + j2 | 0;
          x3 = x3 + j3 | 0;
          x4 = x4 + j4 | 0;
          x5 = x5 + j5 | 0;
          x6 = x6 + j6 | 0;
          x7 = x7 + j7 | 0;
          x8 = x8 + j8 | 0;
          x9 = x9 + j9 | 0;
          x10 = x10 + j10 | 0;
          x11 = x11 + j11 | 0;
          x12 = x12 + j12 | 0;
          x13 = x13 + j13 | 0;
          x14 = x14 + j14 | 0;
          x15 = x15 + j15 | 0;
          o[0] = x0 >>> 0 & 255;
          o[1] = x0 >>> 8 & 255;
          o[2] = x0 >>> 16 & 255;
          o[3] = x0 >>> 24 & 255;
          o[4] = x1 >>> 0 & 255;
          o[5] = x1 >>> 8 & 255;
          o[6] = x1 >>> 16 & 255;
          o[7] = x1 >>> 24 & 255;
          o[8] = x2 >>> 0 & 255;
          o[9] = x2 >>> 8 & 255;
          o[10] = x2 >>> 16 & 255;
          o[11] = x2 >>> 24 & 255;
          o[12] = x3 >>> 0 & 255;
          o[13] = x3 >>> 8 & 255;
          o[14] = x3 >>> 16 & 255;
          o[15] = x3 >>> 24 & 255;
          o[16] = x4 >>> 0 & 255;
          o[17] = x4 >>> 8 & 255;
          o[18] = x4 >>> 16 & 255;
          o[19] = x4 >>> 24 & 255;
          o[20] = x5 >>> 0 & 255;
          o[21] = x5 >>> 8 & 255;
          o[22] = x5 >>> 16 & 255;
          o[23] = x5 >>> 24 & 255;
          o[24] = x6 >>> 0 & 255;
          o[25] = x6 >>> 8 & 255;
          o[26] = x6 >>> 16 & 255;
          o[27] = x6 >>> 24 & 255;
          o[28] = x7 >>> 0 & 255;
          o[29] = x7 >>> 8 & 255;
          o[30] = x7 >>> 16 & 255;
          o[31] = x7 >>> 24 & 255;
          o[32] = x8 >>> 0 & 255;
          o[33] = x8 >>> 8 & 255;
          o[34] = x8 >>> 16 & 255;
          o[35] = x8 >>> 24 & 255;
          o[36] = x9 >>> 0 & 255;
          o[37] = x9 >>> 8 & 255;
          o[38] = x9 >>> 16 & 255;
          o[39] = x9 >>> 24 & 255;
          o[40] = x10 >>> 0 & 255;
          o[41] = x10 >>> 8 & 255;
          o[42] = x10 >>> 16 & 255;
          o[43] = x10 >>> 24 & 255;
          o[44] = x11 >>> 0 & 255;
          o[45] = x11 >>> 8 & 255;
          o[46] = x11 >>> 16 & 255;
          o[47] = x11 >>> 24 & 255;
          o[48] = x12 >>> 0 & 255;
          o[49] = x12 >>> 8 & 255;
          o[50] = x12 >>> 16 & 255;
          o[51] = x12 >>> 24 & 255;
          o[52] = x13 >>> 0 & 255;
          o[53] = x13 >>> 8 & 255;
          o[54] = x13 >>> 16 & 255;
          o[55] = x13 >>> 24 & 255;
          o[56] = x14 >>> 0 & 255;
          o[57] = x14 >>> 8 & 255;
          o[58] = x14 >>> 16 & 255;
          o[59] = x14 >>> 24 & 255;
          o[60] = x15 >>> 0 & 255;
          o[61] = x15 >>> 8 & 255;
          o[62] = x15 >>> 16 & 255;
          o[63] = x15 >>> 24 & 255;
        }
        function core_hsalsa20(o, p, k, c) {
          var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
          var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
          for (var i = 0; i < 20; i += 2) {
            u = x0 + x12 | 0;
            x4 ^= u << 7 | u >>> 32 - 7;
            u = x4 + x0 | 0;
            x8 ^= u << 9 | u >>> 32 - 9;
            u = x8 + x4 | 0;
            x12 ^= u << 13 | u >>> 32 - 13;
            u = x12 + x8 | 0;
            x0 ^= u << 18 | u >>> 32 - 18;
            u = x5 + x1 | 0;
            x9 ^= u << 7 | u >>> 32 - 7;
            u = x9 + x5 | 0;
            x13 ^= u << 9 | u >>> 32 - 9;
            u = x13 + x9 | 0;
            x1 ^= u << 13 | u >>> 32 - 13;
            u = x1 + x13 | 0;
            x5 ^= u << 18 | u >>> 32 - 18;
            u = x10 + x6 | 0;
            x14 ^= u << 7 | u >>> 32 - 7;
            u = x14 + x10 | 0;
            x2 ^= u << 9 | u >>> 32 - 9;
            u = x2 + x14 | 0;
            x6 ^= u << 13 | u >>> 32 - 13;
            u = x6 + x2 | 0;
            x10 ^= u << 18 | u >>> 32 - 18;
            u = x15 + x11 | 0;
            x3 ^= u << 7 | u >>> 32 - 7;
            u = x3 + x15 | 0;
            x7 ^= u << 9 | u >>> 32 - 9;
            u = x7 + x3 | 0;
            x11 ^= u << 13 | u >>> 32 - 13;
            u = x11 + x7 | 0;
            x15 ^= u << 18 | u >>> 32 - 18;
            u = x0 + x3 | 0;
            x1 ^= u << 7 | u >>> 32 - 7;
            u = x1 + x0 | 0;
            x2 ^= u << 9 | u >>> 32 - 9;
            u = x2 + x1 | 0;
            x3 ^= u << 13 | u >>> 32 - 13;
            u = x3 + x2 | 0;
            x0 ^= u << 18 | u >>> 32 - 18;
            u = x5 + x4 | 0;
            x6 ^= u << 7 | u >>> 32 - 7;
            u = x6 + x5 | 0;
            x7 ^= u << 9 | u >>> 32 - 9;
            u = x7 + x6 | 0;
            x4 ^= u << 13 | u >>> 32 - 13;
            u = x4 + x7 | 0;
            x5 ^= u << 18 | u >>> 32 - 18;
            u = x10 + x9 | 0;
            x11 ^= u << 7 | u >>> 32 - 7;
            u = x11 + x10 | 0;
            x8 ^= u << 9 | u >>> 32 - 9;
            u = x8 + x11 | 0;
            x9 ^= u << 13 | u >>> 32 - 13;
            u = x9 + x8 | 0;
            x10 ^= u << 18 | u >>> 32 - 18;
            u = x15 + x14 | 0;
            x12 ^= u << 7 | u >>> 32 - 7;
            u = x12 + x15 | 0;
            x13 ^= u << 9 | u >>> 32 - 9;
            u = x13 + x12 | 0;
            x14 ^= u << 13 | u >>> 32 - 13;
            u = x14 + x13 | 0;
            x15 ^= u << 18 | u >>> 32 - 18;
          }
          o[0] = x0 >>> 0 & 255;
          o[1] = x0 >>> 8 & 255;
          o[2] = x0 >>> 16 & 255;
          o[3] = x0 >>> 24 & 255;
          o[4] = x5 >>> 0 & 255;
          o[5] = x5 >>> 8 & 255;
          o[6] = x5 >>> 16 & 255;
          o[7] = x5 >>> 24 & 255;
          o[8] = x10 >>> 0 & 255;
          o[9] = x10 >>> 8 & 255;
          o[10] = x10 >>> 16 & 255;
          o[11] = x10 >>> 24 & 255;
          o[12] = x15 >>> 0 & 255;
          o[13] = x15 >>> 8 & 255;
          o[14] = x15 >>> 16 & 255;
          o[15] = x15 >>> 24 & 255;
          o[16] = x6 >>> 0 & 255;
          o[17] = x6 >>> 8 & 255;
          o[18] = x6 >>> 16 & 255;
          o[19] = x6 >>> 24 & 255;
          o[20] = x7 >>> 0 & 255;
          o[21] = x7 >>> 8 & 255;
          o[22] = x7 >>> 16 & 255;
          o[23] = x7 >>> 24 & 255;
          o[24] = x8 >>> 0 & 255;
          o[25] = x8 >>> 8 & 255;
          o[26] = x8 >>> 16 & 255;
          o[27] = x8 >>> 24 & 255;
          o[28] = x9 >>> 0 & 255;
          o[29] = x9 >>> 8 & 255;
          o[30] = x9 >>> 16 & 255;
          o[31] = x9 >>> 24 & 255;
        }
        function crypto_core_salsa20(out, inp, k, c) {
          core_salsa20(out, inp, k, c);
        }
        function crypto_core_hsalsa20(out, inp, k, c) {
          core_hsalsa20(out, inp, k, c);
        }
        var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]);
        function crypto_stream_salsa20_xor(c, cpos, m, mpos, b, n, k) {
          var z = new Uint8Array(16), x = new Uint8Array(64);
          var u, i;
          for (i = 0; i < 16; i++) z[i] = 0;
          for (i = 0; i < 8; i++) z[i] = n[i];
          while (b >= 64) {
            crypto_core_salsa20(x, z, k, sigma);
            for (i = 0; i < 64; i++) c[cpos + i] = m[mpos + i] ^ x[i];
            u = 1;
            for (i = 8; i < 16; i++) {
              u = u + (z[i] & 255) | 0;
              z[i] = u & 255;
              u >>>= 8;
            }
            b -= 64;
            cpos += 64;
            mpos += 64;
          }
          if (b > 0) {
            crypto_core_salsa20(x, z, k, sigma);
            for (i = 0; i < b; i++) c[cpos + i] = m[mpos + i] ^ x[i];
          }
          return 0;
        }
        function crypto_stream_salsa20(c, cpos, b, n, k) {
          var z = new Uint8Array(16), x = new Uint8Array(64);
          var u, i;
          for (i = 0; i < 16; i++) z[i] = 0;
          for (i = 0; i < 8; i++) z[i] = n[i];
          while (b >= 64) {
            crypto_core_salsa20(x, z, k, sigma);
            for (i = 0; i < 64; i++) c[cpos + i] = x[i];
            u = 1;
            for (i = 8; i < 16; i++) {
              u = u + (z[i] & 255) | 0;
              z[i] = u & 255;
              u >>>= 8;
            }
            b -= 64;
            cpos += 64;
          }
          if (b > 0) {
            crypto_core_salsa20(x, z, k, sigma);
            for (i = 0; i < b; i++) c[cpos + i] = x[i];
          }
          return 0;
        }
        function crypto_stream(c, cpos, d, n, k) {
          var s = new Uint8Array(32);
          crypto_core_hsalsa20(s, n, k, sigma);
          var sn = new Uint8Array(8);
          for (var i = 0; i < 8; i++) sn[i] = n[i + 16];
          return crypto_stream_salsa20(c, cpos, d, sn, s);
        }
        function crypto_stream_xor(c, cpos, m, mpos, d, n, k) {
          var s = new Uint8Array(32);
          crypto_core_hsalsa20(s, n, k, sigma);
          var sn = new Uint8Array(8);
          for (var i = 0; i < 8; i++) sn[i] = n[i + 16];
          return crypto_stream_salsa20_xor(c, cpos, m, mpos, d, sn, s);
        }
        var poly1305 = function(key) {
          this.buffer = new Uint8Array(16);
          this.r = new Uint16Array(10);
          this.h = new Uint16Array(10);
          this.pad = new Uint16Array(8);
          this.leftover = 0;
          this.fin = 0;
          var t0, t1, t2, t3, t4, t5, t6, t7;
          t0 = key[0] & 255 | (key[1] & 255) << 8;
          this.r[0] = t0 & 8191;
          t1 = key[2] & 255 | (key[3] & 255) << 8;
          this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
          t2 = key[4] & 255 | (key[5] & 255) << 8;
          this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
          t3 = key[6] & 255 | (key[7] & 255) << 8;
          this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
          t4 = key[8] & 255 | (key[9] & 255) << 8;
          this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
          this.r[5] = t4 >>> 1 & 8190;
          t5 = key[10] & 255 | (key[11] & 255) << 8;
          this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
          t6 = key[12] & 255 | (key[13] & 255) << 8;
          this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
          t7 = key[14] & 255 | (key[15] & 255) << 8;
          this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
          this.r[9] = t7 >>> 5 & 127;
          this.pad[0] = key[16] & 255 | (key[17] & 255) << 8;
          this.pad[1] = key[18] & 255 | (key[19] & 255) << 8;
          this.pad[2] = key[20] & 255 | (key[21] & 255) << 8;
          this.pad[3] = key[22] & 255 | (key[23] & 255) << 8;
          this.pad[4] = key[24] & 255 | (key[25] & 255) << 8;
          this.pad[5] = key[26] & 255 | (key[27] & 255) << 8;
          this.pad[6] = key[28] & 255 | (key[29] & 255) << 8;
          this.pad[7] = key[30] & 255 | (key[31] & 255) << 8;
        };
        poly1305.prototype.blocks = function(m, mpos, bytes) {
          var hibit = this.fin ? 0 : 1 << 11;
          var t0, t1, t2, t3, t4, t5, t6, t7, c;
          var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;
          var h0 = this.h[0], h1 = this.h[1], h2 = this.h[2], h3 = this.h[3], h4 = this.h[4], h5 = this.h[5], h6 = this.h[6], h7 = this.h[7], h8 = this.h[8], h9 = this.h[9];
          var r0 = this.r[0], r1 = this.r[1], r2 = this.r[2], r3 = this.r[3], r4 = this.r[4], r5 = this.r[5], r6 = this.r[6], r7 = this.r[7], r8 = this.r[8], r9 = this.r[9];
          while (bytes >= 16) {
            t0 = m[mpos + 0] & 255 | (m[mpos + 1] & 255) << 8;
            h0 += t0 & 8191;
            t1 = m[mpos + 2] & 255 | (m[mpos + 3] & 255) << 8;
            h1 += (t0 >>> 13 | t1 << 3) & 8191;
            t2 = m[mpos + 4] & 255 | (m[mpos + 5] & 255) << 8;
            h2 += (t1 >>> 10 | t2 << 6) & 8191;
            t3 = m[mpos + 6] & 255 | (m[mpos + 7] & 255) << 8;
            h3 += (t2 >>> 7 | t3 << 9) & 8191;
            t4 = m[mpos + 8] & 255 | (m[mpos + 9] & 255) << 8;
            h4 += (t3 >>> 4 | t4 << 12) & 8191;
            h5 += t4 >>> 1 & 8191;
            t5 = m[mpos + 10] & 255 | (m[mpos + 11] & 255) << 8;
            h6 += (t4 >>> 14 | t5 << 2) & 8191;
            t6 = m[mpos + 12] & 255 | (m[mpos + 13] & 255) << 8;
            h7 += (t5 >>> 11 | t6 << 5) & 8191;
            t7 = m[mpos + 14] & 255 | (m[mpos + 15] & 255) << 8;
            h8 += (t6 >>> 8 | t7 << 8) & 8191;
            h9 += t7 >>> 5 | hibit;
            c = 0;
            d0 = c;
            d0 += h0 * r0;
            d0 += h1 * (5 * r9);
            d0 += h2 * (5 * r8);
            d0 += h3 * (5 * r7);
            d0 += h4 * (5 * r6);
            c = d0 >>> 13;
            d0 &= 8191;
            d0 += h5 * (5 * r5);
            d0 += h6 * (5 * r4);
            d0 += h7 * (5 * r3);
            d0 += h8 * (5 * r2);
            d0 += h9 * (5 * r1);
            c += d0 >>> 13;
            d0 &= 8191;
            d1 = c;
            d1 += h0 * r1;
            d1 += h1 * r0;
            d1 += h2 * (5 * r9);
            d1 += h3 * (5 * r8);
            d1 += h4 * (5 * r7);
            c = d1 >>> 13;
            d1 &= 8191;
            d1 += h5 * (5 * r6);
            d1 += h6 * (5 * r5);
            d1 += h7 * (5 * r4);
            d1 += h8 * (5 * r3);
            d1 += h9 * (5 * r2);
            c += d1 >>> 13;
            d1 &= 8191;
            d2 = c;
            d2 += h0 * r2;
            d2 += h1 * r1;
            d2 += h2 * r0;
            d2 += h3 * (5 * r9);
            d2 += h4 * (5 * r8);
            c = d2 >>> 13;
            d2 &= 8191;
            d2 += h5 * (5 * r7);
            d2 += h6 * (5 * r6);
            d2 += h7 * (5 * r5);
            d2 += h8 * (5 * r4);
            d2 += h9 * (5 * r3);
            c += d2 >>> 13;
            d2 &= 8191;
            d3 = c;
            d3 += h0 * r3;
            d3 += h1 * r2;
            d3 += h2 * r1;
            d3 += h3 * r0;
            d3 += h4 * (5 * r9);
            c = d3 >>> 13;
            d3 &= 8191;
            d3 += h5 * (5 * r8);
            d3 += h6 * (5 * r7);
            d3 += h7 * (5 * r6);
            d3 += h8 * (5 * r5);
            d3 += h9 * (5 * r4);
            c += d3 >>> 13;
            d3 &= 8191;
            d4 = c;
            d4 += h0 * r4;
            d4 += h1 * r3;
            d4 += h2 * r2;
            d4 += h3 * r1;
            d4 += h4 * r0;
            c = d4 >>> 13;
            d4 &= 8191;
            d4 += h5 * (5 * r9);
            d4 += h6 * (5 * r8);
            d4 += h7 * (5 * r7);
            d4 += h8 * (5 * r6);
            d4 += h9 * (5 * r5);
            c += d4 >>> 13;
            d4 &= 8191;
            d5 = c;
            d5 += h0 * r5;
            d5 += h1 * r4;
            d5 += h2 * r3;
            d5 += h3 * r2;
            d5 += h4 * r1;
            c = d5 >>> 13;
            d5 &= 8191;
            d5 += h5 * r0;
            d5 += h6 * (5 * r9);
            d5 += h7 * (5 * r8);
            d5 += h8 * (5 * r7);
            d5 += h9 * (5 * r6);
            c += d5 >>> 13;
            d5 &= 8191;
            d6 = c;
            d6 += h0 * r6;
            d6 += h1 * r5;
            d6 += h2 * r4;
            d6 += h3 * r3;
            d6 += h4 * r2;
            c = d6 >>> 13;
            d6 &= 8191;
            d6 += h5 * r1;
            d6 += h6 * r0;
            d6 += h7 * (5 * r9);
            d6 += h8 * (5 * r8);
            d6 += h9 * (5 * r7);
            c += d6 >>> 13;
            d6 &= 8191;
            d7 = c;
            d7 += h0 * r7;
            d7 += h1 * r6;
            d7 += h2 * r5;
            d7 += h3 * r4;
            d7 += h4 * r3;
            c = d7 >>> 13;
            d7 &= 8191;
            d7 += h5 * r2;
            d7 += h6 * r1;
            d7 += h7 * r0;
            d7 += h8 * (5 * r9);
            d7 += h9 * (5 * r8);
            c += d7 >>> 13;
            d7 &= 8191;
            d8 = c;
            d8 += h0 * r8;
            d8 += h1 * r7;
            d8 += h2 * r6;
            d8 += h3 * r5;
            d8 += h4 * r4;
            c = d8 >>> 13;
            d8 &= 8191;
            d8 += h5 * r3;
            d8 += h6 * r2;
            d8 += h7 * r1;
            d8 += h8 * r0;
            d8 += h9 * (5 * r9);
            c += d8 >>> 13;
            d8 &= 8191;
            d9 = c;
            d9 += h0 * r9;
            d9 += h1 * r8;
            d9 += h2 * r7;
            d9 += h3 * r6;
            d9 += h4 * r5;
            c = d9 >>> 13;
            d9 &= 8191;
            d9 += h5 * r4;
            d9 += h6 * r3;
            d9 += h7 * r2;
            d9 += h8 * r1;
            d9 += h9 * r0;
            c += d9 >>> 13;
            d9 &= 8191;
            c = (c << 2) + c | 0;
            c = c + d0 | 0;
            d0 = c & 8191;
            c = c >>> 13;
            d1 += c;
            h0 = d0;
            h1 = d1;
            h2 = d2;
            h3 = d3;
            h4 = d4;
            h5 = d5;
            h6 = d6;
            h7 = d7;
            h8 = d8;
            h9 = d9;
            mpos += 16;
            bytes -= 16;
          }
          this.h[0] = h0;
          this.h[1] = h1;
          this.h[2] = h2;
          this.h[3] = h3;
          this.h[4] = h4;
          this.h[5] = h5;
          this.h[6] = h6;
          this.h[7] = h7;
          this.h[8] = h8;
          this.h[9] = h9;
        };
        poly1305.prototype.finish = function(mac, macpos) {
          var g = new Uint16Array(10);
          var c, mask, f, i;
          if (this.leftover) {
            i = this.leftover;
            this.buffer[i++] = 1;
            for (; i < 16; i++) this.buffer[i] = 0;
            this.fin = 1;
            this.blocks(this.buffer, 0, 16);
          }
          c = this.h[1] >>> 13;
          this.h[1] &= 8191;
          for (i = 2; i < 10; i++) {
            this.h[i] += c;
            c = this.h[i] >>> 13;
            this.h[i] &= 8191;
          }
          this.h[0] += c * 5;
          c = this.h[0] >>> 13;
          this.h[0] &= 8191;
          this.h[1] += c;
          c = this.h[1] >>> 13;
          this.h[1] &= 8191;
          this.h[2] += c;
          g[0] = this.h[0] + 5;
          c = g[0] >>> 13;
          g[0] &= 8191;
          for (i = 1; i < 10; i++) {
            g[i] = this.h[i] + c;
            c = g[i] >>> 13;
            g[i] &= 8191;
          }
          g[9] -= 1 << 13;
          mask = (c ^ 1) - 1;
          for (i = 0; i < 10; i++) g[i] &= mask;
          mask = ~mask;
          for (i = 0; i < 10; i++) this.h[i] = this.h[i] & mask | g[i];
          this.h[0] = (this.h[0] | this.h[1] << 13) & 65535;
          this.h[1] = (this.h[1] >>> 3 | this.h[2] << 10) & 65535;
          this.h[2] = (this.h[2] >>> 6 | this.h[3] << 7) & 65535;
          this.h[3] = (this.h[3] >>> 9 | this.h[4] << 4) & 65535;
          this.h[4] = (this.h[4] >>> 12 | this.h[5] << 1 | this.h[6] << 14) & 65535;
          this.h[5] = (this.h[6] >>> 2 | this.h[7] << 11) & 65535;
          this.h[6] = (this.h[7] >>> 5 | this.h[8] << 8) & 65535;
          this.h[7] = (this.h[8] >>> 8 | this.h[9] << 5) & 65535;
          f = this.h[0] + this.pad[0];
          this.h[0] = f & 65535;
          for (i = 1; i < 8; i++) {
            f = (this.h[i] + this.pad[i] | 0) + (f >>> 16) | 0;
            this.h[i] = f & 65535;
          }
          mac[macpos + 0] = this.h[0] >>> 0 & 255;
          mac[macpos + 1] = this.h[0] >>> 8 & 255;
          mac[macpos + 2] = this.h[1] >>> 0 & 255;
          mac[macpos + 3] = this.h[1] >>> 8 & 255;
          mac[macpos + 4] = this.h[2] >>> 0 & 255;
          mac[macpos + 5] = this.h[2] >>> 8 & 255;
          mac[macpos + 6] = this.h[3] >>> 0 & 255;
          mac[macpos + 7] = this.h[3] >>> 8 & 255;
          mac[macpos + 8] = this.h[4] >>> 0 & 255;
          mac[macpos + 9] = this.h[4] >>> 8 & 255;
          mac[macpos + 10] = this.h[5] >>> 0 & 255;
          mac[macpos + 11] = this.h[5] >>> 8 & 255;
          mac[macpos + 12] = this.h[6] >>> 0 & 255;
          mac[macpos + 13] = this.h[6] >>> 8 & 255;
          mac[macpos + 14] = this.h[7] >>> 0 & 255;
          mac[macpos + 15] = this.h[7] >>> 8 & 255;
        };
        poly1305.prototype.update = function(m, mpos, bytes) {
          var i, want;
          if (this.leftover) {
            want = 16 - this.leftover;
            if (want > bytes)
              want = bytes;
            for (i = 0; i < want; i++)
              this.buffer[this.leftover + i] = m[mpos + i];
            bytes -= want;
            mpos += want;
            this.leftover += want;
            if (this.leftover < 16)
              return;
            this.blocks(this.buffer, 0, 16);
            this.leftover = 0;
          }
          if (bytes >= 16) {
            want = bytes - bytes % 16;
            this.blocks(m, mpos, want);
            mpos += want;
            bytes -= want;
          }
          if (bytes) {
            for (i = 0; i < bytes; i++)
              this.buffer[this.leftover + i] = m[mpos + i];
            this.leftover += bytes;
          }
        };
        function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
          var s = new poly1305(k);
          s.update(m, mpos, n);
          s.finish(out, outpos);
          return 0;
        }
        function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
          var x = new Uint8Array(16);
          crypto_onetimeauth(x, 0, m, mpos, n, k);
          return crypto_verify_16(h, hpos, x, 0);
        }
        function crypto_secretbox(c, m, d, n, k) {
          var i;
          if (d < 32) return -1;
          crypto_stream_xor(c, 0, m, 0, d, n, k);
          crypto_onetimeauth(c, 16, c, 32, d - 32, c);
          for (i = 0; i < 16; i++) c[i] = 0;
          return 0;
        }
        function crypto_secretbox_open(m, c, d, n, k) {
          var i;
          var x = new Uint8Array(32);
          if (d < 32) return -1;
          crypto_stream(x, 0, 32, n, k);
          if (crypto_onetimeauth_verify(c, 16, c, 32, d - 32, x) !== 0) return -1;
          crypto_stream_xor(m, 0, c, 0, d, n, k);
          for (i = 0; i < 32; i++) m[i] = 0;
          return 0;
        }
        function set25519(r, a) {
          var i;
          for (i = 0; i < 16; i++) r[i] = a[i] | 0;
        }
        function car25519(o) {
          var i, v, c = 1;
          for (i = 0; i < 16; i++) {
            v = o[i] + c + 65535;
            c = Math.floor(v / 65536);
            o[i] = v - c * 65536;
          }
          o[0] += c - 1 + 37 * (c - 1);
        }
        function sel25519(p, q, b) {
          var t, c = ~(b - 1);
          for (var i = 0; i < 16; i++) {
            t = c & (p[i] ^ q[i]);
            p[i] ^= t;
            q[i] ^= t;
          }
        }
        function pack25519(o, n) {
          var i, j, b;
          var m = gf(), t = gf();
          for (i = 0; i < 16; i++) t[i] = n[i];
          car25519(t);
          car25519(t);
          car25519(t);
          for (j = 0; j < 2; j++) {
            m[0] = t[0] - 65517;
            for (i = 1; i < 15; i++) {
              m[i] = t[i] - 65535 - (m[i - 1] >> 16 & 1);
              m[i - 1] &= 65535;
            }
            m[15] = t[15] - 32767 - (m[14] >> 16 & 1);
            b = m[15] >> 16 & 1;
            m[14] &= 65535;
            sel25519(t, m, 1 - b);
          }
          for (i = 0; i < 16; i++) {
            o[2 * i] = t[i] & 255;
            o[2 * i + 1] = t[i] >> 8;
          }
        }
        function neq25519(a, b) {
          var c = new Uint8Array(32), d = new Uint8Array(32);
          pack25519(c, a);
          pack25519(d, b);
          return crypto_verify_32(c, 0, d, 0);
        }
        function par25519(a) {
          var d = new Uint8Array(32);
          pack25519(d, a);
          return d[0] & 1;
        }
        function unpack25519(o, n) {
          var i;
          for (i = 0; i < 16; i++) o[i] = n[2 * i] + (n[2 * i + 1] << 8);
          o[15] &= 32767;
        }
        function A(o, a, b) {
          for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
        }
        function Z(o, a, b) {
          for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
        }
        function M(o, a, b) {
          var v, c, t0 = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0, t8 = 0, t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0, t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0, t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0, b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11], b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
          v = a[0];
          t0 += v * b0;
          t1 += v * b1;
          t2 += v * b2;
          t3 += v * b3;
          t4 += v * b4;
          t5 += v * b5;
          t6 += v * b6;
          t7 += v * b7;
          t8 += v * b8;
          t9 += v * b9;
          t10 += v * b10;
          t11 += v * b11;
          t12 += v * b12;
          t13 += v * b13;
          t14 += v * b14;
          t15 += v * b15;
          v = a[1];
          t1 += v * b0;
          t2 += v * b1;
          t3 += v * b2;
          t4 += v * b3;
          t5 += v * b4;
          t6 += v * b5;
          t7 += v * b6;
          t8 += v * b7;
          t9 += v * b8;
          t10 += v * b9;
          t11 += v * b10;
          t12 += v * b11;
          t13 += v * b12;
          t14 += v * b13;
          t15 += v * b14;
          t16 += v * b15;
          v = a[2];
          t2 += v * b0;
          t3 += v * b1;
          t4 += v * b2;
          t5 += v * b3;
          t6 += v * b4;
          t7 += v * b5;
          t8 += v * b6;
          t9 += v * b7;
          t10 += v * b8;
          t11 += v * b9;
          t12 += v * b10;
          t13 += v * b11;
          t14 += v * b12;
          t15 += v * b13;
          t16 += v * b14;
          t17 += v * b15;
          v = a[3];
          t3 += v * b0;
          t4 += v * b1;
          t5 += v * b2;
          t6 += v * b3;
          t7 += v * b4;
          t8 += v * b5;
          t9 += v * b6;
          t10 += v * b7;
          t11 += v * b8;
          t12 += v * b9;
          t13 += v * b10;
          t14 += v * b11;
          t15 += v * b12;
          t16 += v * b13;
          t17 += v * b14;
          t18 += v * b15;
          v = a[4];
          t4 += v * b0;
          t5 += v * b1;
          t6 += v * b2;
          t7 += v * b3;
          t8 += v * b4;
          t9 += v * b5;
          t10 += v * b6;
          t11 += v * b7;
          t12 += v * b8;
          t13 += v * b9;
          t14 += v * b10;
          t15 += v * b11;
          t16 += v * b12;
          t17 += v * b13;
          t18 += v * b14;
          t19 += v * b15;
          v = a[5];
          t5 += v * b0;
          t6 += v * b1;
          t7 += v * b2;
          t8 += v * b3;
          t9 += v * b4;
          t10 += v * b5;
          t11 += v * b6;
          t12 += v * b7;
          t13 += v * b8;
          t14 += v * b9;
          t15 += v * b10;
          t16 += v * b11;
          t17 += v * b12;
          t18 += v * b13;
          t19 += v * b14;
          t20 += v * b15;
          v = a[6];
          t6 += v * b0;
          t7 += v * b1;
          t8 += v * b2;
          t9 += v * b3;
          t10 += v * b4;
          t11 += v * b5;
          t12 += v * b6;
          t13 += v * b7;
          t14 += v * b8;
          t15 += v * b9;
          t16 += v * b10;
          t17 += v * b11;
          t18 += v * b12;
          t19 += v * b13;
          t20 += v * b14;
          t21 += v * b15;
          v = a[7];
          t7 += v * b0;
          t8 += v * b1;
          t9 += v * b2;
          t10 += v * b3;
          t11 += v * b4;
          t12 += v * b5;
          t13 += v * b6;
          t14 += v * b7;
          t15 += v * b8;
          t16 += v * b9;
          t17 += v * b10;
          t18 += v * b11;
          t19 += v * b12;
          t20 += v * b13;
          t21 += v * b14;
          t22 += v * b15;
          v = a[8];
          t8 += v * b0;
          t9 += v * b1;
          t10 += v * b2;
          t11 += v * b3;
          t12 += v * b4;
          t13 += v * b5;
          t14 += v * b6;
          t15 += v * b7;
          t16 += v * b8;
          t17 += v * b9;
          t18 += v * b10;
          t19 += v * b11;
          t20 += v * b12;
          t21 += v * b13;
          t22 += v * b14;
          t23 += v * b15;
          v = a[9];
          t9 += v * b0;
          t10 += v * b1;
          t11 += v * b2;
          t12 += v * b3;
          t13 += v * b4;
          t14 += v * b5;
          t15 += v * b6;
          t16 += v * b7;
          t17 += v * b8;
          t18 += v * b9;
          t19 += v * b10;
          t20 += v * b11;
          t21 += v * b12;
          t22 += v * b13;
          t23 += v * b14;
          t24 += v * b15;
          v = a[10];
          t10 += v * b0;
          t11 += v * b1;
          t12 += v * b2;
          t13 += v * b3;
          t14 += v * b4;
          t15 += v * b5;
          t16 += v * b6;
          t17 += v * b7;
          t18 += v * b8;
          t19 += v * b9;
          t20 += v * b10;
          t21 += v * b11;
          t22 += v * b12;
          t23 += v * b13;
          t24 += v * b14;
          t25 += v * b15;
          v = a[11];
          t11 += v * b0;
          t12 += v * b1;
          t13 += v * b2;
          t14 += v * b3;
          t15 += v * b4;
          t16 += v * b5;
          t17 += v * b6;
          t18 += v * b7;
          t19 += v * b8;
          t20 += v * b9;
          t21 += v * b10;
          t22 += v * b11;
          t23 += v * b12;
          t24 += v * b13;
          t25 += v * b14;
          t26 += v * b15;
          v = a[12];
          t12 += v * b0;
          t13 += v * b1;
          t14 += v * b2;
          t15 += v * b3;
          t16 += v * b4;
          t17 += v * b5;
          t18 += v * b6;
          t19 += v * b7;
          t20 += v * b8;
          t21 += v * b9;
          t22 += v * b10;
          t23 += v * b11;
          t24 += v * b12;
          t25 += v * b13;
          t26 += v * b14;
          t27 += v * b15;
          v = a[13];
          t13 += v * b0;
          t14 += v * b1;
          t15 += v * b2;
          t16 += v * b3;
          t17 += v * b4;
          t18 += v * b5;
          t19 += v * b6;
          t20 += v * b7;
          t21 += v * b8;
          t22 += v * b9;
          t23 += v * b10;
          t24 += v * b11;
          t25 += v * b12;
          t26 += v * b13;
          t27 += v * b14;
          t28 += v * b15;
          v = a[14];
          t14 += v * b0;
          t15 += v * b1;
          t16 += v * b2;
          t17 += v * b3;
          t18 += v * b4;
          t19 += v * b5;
          t20 += v * b6;
          t21 += v * b7;
          t22 += v * b8;
          t23 += v * b9;
          t24 += v * b10;
          t25 += v * b11;
          t26 += v * b12;
          t27 += v * b13;
          t28 += v * b14;
          t29 += v * b15;
          v = a[15];
          t15 += v * b0;
          t16 += v * b1;
          t17 += v * b2;
          t18 += v * b3;
          t19 += v * b4;
          t20 += v * b5;
          t21 += v * b6;
          t22 += v * b7;
          t23 += v * b8;
          t24 += v * b9;
          t25 += v * b10;
          t26 += v * b11;
          t27 += v * b12;
          t28 += v * b13;
          t29 += v * b14;
          t30 += v * b15;
          t0 += 38 * t16;
          t1 += 38 * t17;
          t2 += 38 * t18;
          t3 += 38 * t19;
          t4 += 38 * t20;
          t5 += 38 * t21;
          t6 += 38 * t22;
          t7 += 38 * t23;
          t8 += 38 * t24;
          t9 += 38 * t25;
          t10 += 38 * t26;
          t11 += 38 * t27;
          t12 += 38 * t28;
          t13 += 38 * t29;
          t14 += 38 * t30;
          c = 1;
          v = t0 + c + 65535;
          c = Math.floor(v / 65536);
          t0 = v - c * 65536;
          v = t1 + c + 65535;
          c = Math.floor(v / 65536);
          t1 = v - c * 65536;
          v = t2 + c + 65535;
          c = Math.floor(v / 65536);
          t2 = v - c * 65536;
          v = t3 + c + 65535;
          c = Math.floor(v / 65536);
          t3 = v - c * 65536;
          v = t4 + c + 65535;
          c = Math.floor(v / 65536);
          t4 = v - c * 65536;
          v = t5 + c + 65535;
          c = Math.floor(v / 65536);
          t5 = v - c * 65536;
          v = t6 + c + 65535;
          c = Math.floor(v / 65536);
          t6 = v - c * 65536;
          v = t7 + c + 65535;
          c = Math.floor(v / 65536);
          t7 = v - c * 65536;
          v = t8 + c + 65535;
          c = Math.floor(v / 65536);
          t8 = v - c * 65536;
          v = t9 + c + 65535;
          c = Math.floor(v / 65536);
          t9 = v - c * 65536;
          v = t10 + c + 65535;
          c = Math.floor(v / 65536);
          t10 = v - c * 65536;
          v = t11 + c + 65535;
          c = Math.floor(v / 65536);
          t11 = v - c * 65536;
          v = t12 + c + 65535;
          c = Math.floor(v / 65536);
          t12 = v - c * 65536;
          v = t13 + c + 65535;
          c = Math.floor(v / 65536);
          t13 = v - c * 65536;
          v = t14 + c + 65535;
          c = Math.floor(v / 65536);
          t14 = v - c * 65536;
          v = t15 + c + 65535;
          c = Math.floor(v / 65536);
          t15 = v - c * 65536;
          t0 += c - 1 + 37 * (c - 1);
          c = 1;
          v = t0 + c + 65535;
          c = Math.floor(v / 65536);
          t0 = v - c * 65536;
          v = t1 + c + 65535;
          c = Math.floor(v / 65536);
          t1 = v - c * 65536;
          v = t2 + c + 65535;
          c = Math.floor(v / 65536);
          t2 = v - c * 65536;
          v = t3 + c + 65535;
          c = Math.floor(v / 65536);
          t3 = v - c * 65536;
          v = t4 + c + 65535;
          c = Math.floor(v / 65536);
          t4 = v - c * 65536;
          v = t5 + c + 65535;
          c = Math.floor(v / 65536);
          t5 = v - c * 65536;
          v = t6 + c + 65535;
          c = Math.floor(v / 65536);
          t6 = v - c * 65536;
          v = t7 + c + 65535;
          c = Math.floor(v / 65536);
          t7 = v - c * 65536;
          v = t8 + c + 65535;
          c = Math.floor(v / 65536);
          t8 = v - c * 65536;
          v = t9 + c + 65535;
          c = Math.floor(v / 65536);
          t9 = v - c * 65536;
          v = t10 + c + 65535;
          c = Math.floor(v / 65536);
          t10 = v - c * 65536;
          v = t11 + c + 65535;
          c = Math.floor(v / 65536);
          t11 = v - c * 65536;
          v = t12 + c + 65535;
          c = Math.floor(v / 65536);
          t12 = v - c * 65536;
          v = t13 + c + 65535;
          c = Math.floor(v / 65536);
          t13 = v - c * 65536;
          v = t14 + c + 65535;
          c = Math.floor(v / 65536);
          t14 = v - c * 65536;
          v = t15 + c + 65535;
          c = Math.floor(v / 65536);
          t15 = v - c * 65536;
          t0 += c - 1 + 37 * (c - 1);
          o[0] = t0;
          o[1] = t1;
          o[2] = t2;
          o[3] = t3;
          o[4] = t4;
          o[5] = t5;
          o[6] = t6;
          o[7] = t7;
          o[8] = t8;
          o[9] = t9;
          o[10] = t10;
          o[11] = t11;
          o[12] = t12;
          o[13] = t13;
          o[14] = t14;
          o[15] = t15;
        }
        function S(o, a) {
          M(o, a, a);
        }
        function inv25519(o, i) {
          var c = gf();
          var a;
          for (a = 0; a < 16; a++) c[a] = i[a];
          for (a = 253; a >= 0; a--) {
            S(c, c);
            if (a !== 2 && a !== 4) M(c, c, i);
          }
          for (a = 0; a < 16; a++) o[a] = c[a];
        }
        function pow2523(o, i) {
          var c = gf();
          var a;
          for (a = 0; a < 16; a++) c[a] = i[a];
          for (a = 250; a >= 0; a--) {
            S(c, c);
            if (a !== 1) M(c, c, i);
          }
          for (a = 0; a < 16; a++) o[a] = c[a];
        }
        function crypto_scalarmult(q, n, p) {
          var z = new Uint8Array(32);
          var x = new Float64Array(80), r, i;
          var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf();
          for (i = 0; i < 31; i++) z[i] = n[i];
          z[31] = n[31] & 127 | 64;
          z[0] &= 248;
          unpack25519(x, p);
          for (i = 0; i < 16; i++) {
            b[i] = x[i];
            d[i] = a[i] = c[i] = 0;
          }
          a[0] = d[0] = 1;
          for (i = 254; i >= 0; --i) {
            r = z[i >>> 3] >>> (i & 7) & 1;
            sel25519(a, b, r);
            sel25519(c, d, r);
            A(e, a, c);
            Z(a, a, c);
            A(c, b, d);
            Z(b, b, d);
            S(d, e);
            S(f, a);
            M(a, c, a);
            M(c, b, e);
            A(e, a, c);
            Z(a, a, c);
            S(b, a);
            Z(c, d, f);
            M(a, c, _121665);
            A(a, a, d);
            M(c, c, a);
            M(a, d, f);
            M(d, b, x);
            S(b, e);
            sel25519(a, b, r);
            sel25519(c, d, r);
          }
          for (i = 0; i < 16; i++) {
            x[i + 16] = a[i];
            x[i + 32] = c[i];
            x[i + 48] = b[i];
            x[i + 64] = d[i];
          }
          var x32 = x.subarray(32);
          var x16 = x.subarray(16);
          inv25519(x32, x32);
          M(x16, x16, x32);
          pack25519(q, x16);
          return 0;
        }
        function crypto_scalarmult_base(q, n) {
          return crypto_scalarmult(q, n, _9);
        }
        function crypto_box_keypair(y, x) {
          randombytes(x, 32);
          return crypto_scalarmult_base(y, x);
        }
        function crypto_box_beforenm(k, y, x) {
          var s = new Uint8Array(32);
          crypto_scalarmult(s, x, y);
          return crypto_core_hsalsa20(k, _0, s, sigma);
        }
        var crypto_box_afternm = crypto_secretbox;
        var crypto_box_open_afternm = crypto_secretbox_open;
        function crypto_box(c, m, d, n, y, x) {
          var k = new Uint8Array(32);
          crypto_box_beforenm(k, y, x);
          return crypto_box_afternm(c, m, d, n, k);
        }
        function crypto_box_open(m, c, d, n, y, x) {
          var k = new Uint8Array(32);
          crypto_box_beforenm(k, y, x);
          return crypto_box_open_afternm(m, c, d, n, k);
        }
        var K = [
          1116352408,
          3609767458,
          1899447441,
          602891725,
          3049323471,
          3964484399,
          3921009573,
          2173295548,
          961987163,
          4081628472,
          1508970993,
          3053834265,
          2453635748,
          2937671579,
          2870763221,
          3664609560,
          3624381080,
          2734883394,
          310598401,
          1164996542,
          607225278,
          1323610764,
          1426881987,
          3590304994,
          1925078388,
          4068182383,
          2162078206,
          991336113,
          2614888103,
          633803317,
          3248222580,
          3479774868,
          3835390401,
          2666613458,
          4022224774,
          944711139,
          264347078,
          2341262773,
          604807628,
          2007800933,
          770255983,
          1495990901,
          1249150122,
          1856431235,
          1555081692,
          3175218132,
          1996064986,
          2198950837,
          2554220882,
          3999719339,
          2821834349,
          766784016,
          2952996808,
          2566594879,
          3210313671,
          3203337956,
          3336571891,
          1034457026,
          3584528711,
          2466948901,
          113926993,
          3758326383,
          338241895,
          168717936,
          666307205,
          1188179964,
          773529912,
          1546045734,
          1294757372,
          1522805485,
          1396182291,
          2643833823,
          1695183700,
          2343527390,
          1986661051,
          1014477480,
          2177026350,
          1206759142,
          2456956037,
          344077627,
          2730485921,
          1290863460,
          2820302411,
          3158454273,
          3259730800,
          3505952657,
          3345764771,
          106217008,
          3516065817,
          3606008344,
          3600352804,
          1432725776,
          4094571909,
          1467031594,
          275423344,
          851169720,
          430227734,
          3100823752,
          506948616,
          1363258195,
          659060556,
          3750685593,
          883997877,
          3785050280,
          958139571,
          3318307427,
          1322822218,
          3812723403,
          1537002063,
          2003034995,
          1747873779,
          3602036899,
          1955562222,
          1575990012,
          2024104815,
          1125592928,
          2227730452,
          2716904306,
          2361852424,
          442776044,
          2428436474,
          593698344,
          2756734187,
          3733110249,
          3204031479,
          2999351573,
          3329325298,
          3815920427,
          3391569614,
          3928383900,
          3515267271,
          566280711,
          3940187606,
          3454069534,
          4118630271,
          4000239992,
          116418474,
          1914138554,
          174292421,
          2731055270,
          289380356,
          3203993006,
          460393269,
          320620315,
          685471733,
          587496836,
          852142971,
          1086792851,
          1017036298,
          365543100,
          1126000580,
          2618297676,
          1288033470,
          3409855158,
          1501505948,
          4234509866,
          1607167915,
          987167468,
          1816402316,
          1246189591
        ];
        function crypto_hashblocks_hl(hh, hl, m, n) {
          var wh = new Int32Array(16), wl = new Int32Array(16), bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7, bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7, th, tl, i, j, h, l, a, b, c, d;
          var ah0 = hh[0], ah1 = hh[1], ah2 = hh[2], ah3 = hh[3], ah4 = hh[4], ah5 = hh[5], ah6 = hh[6], ah7 = hh[7], al0 = hl[0], al1 = hl[1], al2 = hl[2], al3 = hl[3], al4 = hl[4], al5 = hl[5], al6 = hl[6], al7 = hl[7];
          var pos = 0;
          while (n >= 128) {
            for (i = 0; i < 16; i++) {
              j = 8 * i + pos;
              wh[i] = m[j + 0] << 24 | m[j + 1] << 16 | m[j + 2] << 8 | m[j + 3];
              wl[i] = m[j + 4] << 24 | m[j + 5] << 16 | m[j + 6] << 8 | m[j + 7];
            }
            for (i = 0; i < 80; i++) {
              bh0 = ah0;
              bh1 = ah1;
              bh2 = ah2;
              bh3 = ah3;
              bh4 = ah4;
              bh5 = ah5;
              bh6 = ah6;
              bh7 = ah7;
              bl0 = al0;
              bl1 = al1;
              bl2 = al2;
              bl3 = al3;
              bl4 = al4;
              bl5 = al5;
              bl6 = al6;
              bl7 = al7;
              h = ah7;
              l = al7;
              a = l & 65535;
              b = l >>> 16;
              c = h & 65535;
              d = h >>> 16;
              h = (ah4 >>> 14 | al4 << 32 - 14) ^ (ah4 >>> 18 | al4 << 32 - 18) ^ (al4 >>> 41 - 32 | ah4 << 32 - (41 - 32));
              l = (al4 >>> 14 | ah4 << 32 - 14) ^ (al4 >>> 18 | ah4 << 32 - 18) ^ (ah4 >>> 41 - 32 | al4 << 32 - (41 - 32));
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              h = ah4 & ah5 ^ ~ah4 & ah6;
              l = al4 & al5 ^ ~al4 & al6;
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              h = K[i * 2];
              l = K[i * 2 + 1];
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              h = wh[i % 16];
              l = wl[i % 16];
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              th = c & 65535 | d << 16;
              tl = a & 65535 | b << 16;
              h = th;
              l = tl;
              a = l & 65535;
              b = l >>> 16;
              c = h & 65535;
              d = h >>> 16;
              h = (ah0 >>> 28 | al0 << 32 - 28) ^ (al0 >>> 34 - 32 | ah0 << 32 - (34 - 32)) ^ (al0 >>> 39 - 32 | ah0 << 32 - (39 - 32));
              l = (al0 >>> 28 | ah0 << 32 - 28) ^ (ah0 >>> 34 - 32 | al0 << 32 - (34 - 32)) ^ (ah0 >>> 39 - 32 | al0 << 32 - (39 - 32));
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              h = ah0 & ah1 ^ ah0 & ah2 ^ ah1 & ah2;
              l = al0 & al1 ^ al0 & al2 ^ al1 & al2;
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              bh7 = c & 65535 | d << 16;
              bl7 = a & 65535 | b << 16;
              h = bh3;
              l = bl3;
              a = l & 65535;
              b = l >>> 16;
              c = h & 65535;
              d = h >>> 16;
              h = th;
              l = tl;
              a += l & 65535;
              b += l >>> 16;
              c += h & 65535;
              d += h >>> 16;
              b += a >>> 16;
              c += b >>> 16;
              d += c >>> 16;
              bh3 = c & 65535 | d << 16;
              bl3 = a & 65535 | b << 16;
              ah1 = bh0;
              ah2 = bh1;
              ah3 = bh2;
              ah4 = bh3;
              ah5 = bh4;
              ah6 = bh5;
              ah7 = bh6;
              ah0 = bh7;
              al1 = bl0;
              al2 = bl1;
              al3 = bl2;
              al4 = bl3;
              al5 = bl4;
              al6 = bl5;
              al7 = bl6;
              al0 = bl7;
              if (i % 16 === 15) {
                for (j = 0; j < 16; j++) {
                  h = wh[j];
                  l = wl[j];
                  a = l & 65535;
                  b = l >>> 16;
                  c = h & 65535;
                  d = h >>> 16;
                  h = wh[(j + 9) % 16];
                  l = wl[(j + 9) % 16];
                  a += l & 65535;
                  b += l >>> 16;
                  c += h & 65535;
                  d += h >>> 16;
                  th = wh[(j + 1) % 16];
                  tl = wl[(j + 1) % 16];
                  h = (th >>> 1 | tl << 32 - 1) ^ (th >>> 8 | tl << 32 - 8) ^ th >>> 7;
                  l = (tl >>> 1 | th << 32 - 1) ^ (tl >>> 8 | th << 32 - 8) ^ (tl >>> 7 | th << 32 - 7);
                  a += l & 65535;
                  b += l >>> 16;
                  c += h & 65535;
                  d += h >>> 16;
                  th = wh[(j + 14) % 16];
                  tl = wl[(j + 14) % 16];
                  h = (th >>> 19 | tl << 32 - 19) ^ (tl >>> 61 - 32 | th << 32 - (61 - 32)) ^ th >>> 6;
                  l = (tl >>> 19 | th << 32 - 19) ^ (th >>> 61 - 32 | tl << 32 - (61 - 32)) ^ (tl >>> 6 | th << 32 - 6);
                  a += l & 65535;
                  b += l >>> 16;
                  c += h & 65535;
                  d += h >>> 16;
                  b += a >>> 16;
                  c += b >>> 16;
                  d += c >>> 16;
                  wh[j] = c & 65535 | d << 16;
                  wl[j] = a & 65535 | b << 16;
                }
              }
            }
            h = ah0;
            l = al0;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[0];
            l = hl[0];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[0] = ah0 = c & 65535 | d << 16;
            hl[0] = al0 = a & 65535 | b << 16;
            h = ah1;
            l = al1;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[1];
            l = hl[1];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[1] = ah1 = c & 65535 | d << 16;
            hl[1] = al1 = a & 65535 | b << 16;
            h = ah2;
            l = al2;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[2];
            l = hl[2];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[2] = ah2 = c & 65535 | d << 16;
            hl[2] = al2 = a & 65535 | b << 16;
            h = ah3;
            l = al3;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[3];
            l = hl[3];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[3] = ah3 = c & 65535 | d << 16;
            hl[3] = al3 = a & 65535 | b << 16;
            h = ah4;
            l = al4;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[4];
            l = hl[4];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[4] = ah4 = c & 65535 | d << 16;
            hl[4] = al4 = a & 65535 | b << 16;
            h = ah5;
            l = al5;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[5];
            l = hl[5];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[5] = ah5 = c & 65535 | d << 16;
            hl[5] = al5 = a & 65535 | b << 16;
            h = ah6;
            l = al6;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[6];
            l = hl[6];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[6] = ah6 = c & 65535 | d << 16;
            hl[6] = al6 = a & 65535 | b << 16;
            h = ah7;
            l = al7;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = hh[7];
            l = hl[7];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            hh[7] = ah7 = c & 65535 | d << 16;
            hl[7] = al7 = a & 65535 | b << 16;
            pos += 128;
            n -= 128;
          }
          return n;
        }
        function crypto_hash(out, m, n) {
          var hh = new Int32Array(8), hl = new Int32Array(8), x = new Uint8Array(256), i, b = n;
          hh[0] = 1779033703;
          hh[1] = 3144134277;
          hh[2] = 1013904242;
          hh[3] = 2773480762;
          hh[4] = 1359893119;
          hh[5] = 2600822924;
          hh[6] = 528734635;
          hh[7] = 1541459225;
          hl[0] = 4089235720;
          hl[1] = 2227873595;
          hl[2] = 4271175723;
          hl[3] = 1595750129;
          hl[4] = 2917565137;
          hl[5] = 725511199;
          hl[6] = 4215389547;
          hl[7] = 327033209;
          crypto_hashblocks_hl(hh, hl, m, n);
          n %= 128;
          for (i = 0; i < n; i++) x[i] = m[b - n + i];
          x[n] = 128;
          n = 256 - 128 * (n < 112 ? 1 : 0);
          x[n - 9] = 0;
          ts64(x, n - 8, b / 536870912 | 0, b << 3);
          crypto_hashblocks_hl(hh, hl, x, n);
          for (i = 0; i < 8; i++) ts64(out, 8 * i, hh[i], hl[i]);
          return 0;
        }
        function add(p, q) {
          var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf(), g = gf(), h = gf(), t = gf();
          Z(a, p[1], p[0]);
          Z(t, q[1], q[0]);
          M(a, a, t);
          A(b, p[0], p[1]);
          A(t, q[0], q[1]);
          M(b, b, t);
          M(c, p[3], q[3]);
          M(c, c, D2);
          M(d, p[2], q[2]);
          A(d, d, d);
          Z(e, b, a);
          Z(f, d, c);
          A(g, d, c);
          A(h, b, a);
          M(p[0], e, f);
          M(p[1], h, g);
          M(p[2], g, f);
          M(p[3], e, h);
        }
        function cswap(p, q, b) {
          var i;
          for (i = 0; i < 4; i++) {
            sel25519(p[i], q[i], b);
          }
        }
        function pack(r, p) {
          var tx = gf(), ty = gf(), zi = gf();
          inv25519(zi, p[2]);
          M(tx, p[0], zi);
          M(ty, p[1], zi);
          pack25519(r, ty);
          r[31] ^= par25519(tx) << 7;
        }
        function scalarmult(p, q, s) {
          var b, i;
          set25519(p[0], gf0);
          set25519(p[1], gf1);
          set25519(p[2], gf1);
          set25519(p[3], gf0);
          for (i = 255; i >= 0; --i) {
            b = s[i / 8 | 0] >> (i & 7) & 1;
            cswap(p, q, b);
            add(q, p);
            add(p, p);
            cswap(p, q, b);
          }
        }
        function scalarbase(p, s) {
          var q = [gf(), gf(), gf(), gf()];
          set25519(q[0], X);
          set25519(q[1], Y);
          set25519(q[2], gf1);
          M(q[3], X, Y);
          scalarmult(p, q, s);
        }
        function crypto_sign_keypair(pk, sk, seeded) {
          var d = new Uint8Array(64);
          var p = [gf(), gf(), gf(), gf()];
          var i;
          if (!seeded) randombytes(sk, 32);
          crypto_hash(d, sk, 32);
          d[0] &= 248;
          d[31] &= 127;
          d[31] |= 64;
          scalarbase(p, d);
          pack(pk, p);
          for (i = 0; i < 32; i++) sk[i + 32] = pk[i];
          return 0;
        }
        var L = new Float64Array([237, 211, 245, 92, 26, 99, 18, 88, 214, 156, 247, 162, 222, 249, 222, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16]);
        function modL(r, x) {
          var carry, i, j, k;
          for (i = 63; i >= 32; --i) {
            carry = 0;
            for (j = i - 32, k = i - 12; j < k; ++j) {
              x[j] += carry - 16 * x[i] * L[j - (i - 32)];
              carry = Math.floor((x[j] + 128) / 256);
              x[j] -= carry * 256;
            }
            x[j] += carry;
            x[i] = 0;
          }
          carry = 0;
          for (j = 0; j < 32; j++) {
            x[j] += carry - (x[31] >> 4) * L[j];
            carry = x[j] >> 8;
            x[j] &= 255;
          }
          for (j = 0; j < 32; j++) x[j] -= carry * L[j];
          for (i = 0; i < 32; i++) {
            x[i + 1] += x[i] >> 8;
            r[i] = x[i] & 255;
          }
        }
        function reduce(r) {
          var x = new Float64Array(64), i;
          for (i = 0; i < 64; i++) x[i] = r[i];
          for (i = 0; i < 64; i++) r[i] = 0;
          modL(r, x);
        }
        function crypto_sign(sm, m, n, sk) {
          var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
          var i, j, x = new Float64Array(64);
          var p = [gf(), gf(), gf(), gf()];
          crypto_hash(d, sk, 32);
          d[0] &= 248;
          d[31] &= 127;
          d[31] |= 64;
          var smlen = n + 64;
          for (i = 0; i < n; i++) sm[64 + i] = m[i];
          for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];
          crypto_hash(r, sm.subarray(32), n + 32);
          reduce(r);
          scalarbase(p, r);
          pack(sm, p);
          for (i = 32; i < 64; i++) sm[i] = sk[i];
          crypto_hash(h, sm, n + 64);
          reduce(h);
          for (i = 0; i < 64; i++) x[i] = 0;
          for (i = 0; i < 32; i++) x[i] = r[i];
          for (i = 0; i < 32; i++) {
            for (j = 0; j < 32; j++) {
              x[i + j] += h[i] * d[j];
            }
          }
          modL(sm.subarray(32), x);
          return smlen;
        }
        function unpackneg(r, p) {
          var t = gf(), chk = gf(), num = gf(), den = gf(), den2 = gf(), den4 = gf(), den6 = gf();
          set25519(r[2], gf1);
          unpack25519(r[1], p);
          S(num, r[1]);
          M(den, num, D);
          Z(num, num, r[2]);
          A(den, r[2], den);
          S(den2, den);
          S(den4, den2);
          M(den6, den4, den2);
          M(t, den6, num);
          M(t, t, den);
          pow2523(t, t);
          M(t, t, num);
          M(t, t, den);
          M(t, t, den);
          M(r[0], t, den);
          S(chk, r[0]);
          M(chk, chk, den);
          if (neq25519(chk, num)) M(r[0], r[0], I);
          S(chk, r[0]);
          M(chk, chk, den);
          if (neq25519(chk, num)) return -1;
          if (par25519(r[0]) === p[31] >> 7) Z(r[0], gf0, r[0]);
          M(r[3], r[0], r[1]);
          return 0;
        }
        function crypto_sign_open(m, sm, n, pk) {
          var i;
          var t = new Uint8Array(32), h = new Uint8Array(64);
          var p = [gf(), gf(), gf(), gf()], q = [gf(), gf(), gf(), gf()];
          if (n < 64) return -1;
          if (unpackneg(q, pk)) return -1;
          for (i = 0; i < n; i++) m[i] = sm[i];
          for (i = 0; i < 32; i++) m[i + 32] = pk[i];
          crypto_hash(h, m, n);
          reduce(h);
          scalarmult(p, q, h);
          scalarbase(q, sm.subarray(32));
          add(p, q);
          pack(t, p);
          n -= 64;
          if (crypto_verify_32(sm, 0, t, 0)) {
            for (i = 0; i < n; i++) m[i] = 0;
            return -1;
          }
          for (i = 0; i < n; i++) m[i] = sm[i + 64];
          return n;
        }
        var crypto_secretbox_KEYBYTES = 32, crypto_secretbox_NONCEBYTES = 24, crypto_secretbox_ZEROBYTES = 32, crypto_secretbox_BOXZEROBYTES = 16, crypto_scalarmult_BYTES = 32, crypto_scalarmult_SCALARBYTES = 32, crypto_box_PUBLICKEYBYTES = 32, crypto_box_SECRETKEYBYTES = 32, crypto_box_BEFORENMBYTES = 32, crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES, crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES, crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES, crypto_sign_BYTES = 64, crypto_sign_PUBLICKEYBYTES = 32, crypto_sign_SECRETKEYBYTES = 64, crypto_sign_SEEDBYTES = 32, crypto_hash_BYTES = 64;
        nacl3.lowlevel = {
          crypto_core_hsalsa20,
          crypto_stream_xor,
          crypto_stream,
          crypto_stream_salsa20_xor,
          crypto_stream_salsa20,
          crypto_onetimeauth,
          crypto_onetimeauth_verify,
          crypto_verify_16,
          crypto_verify_32,
          crypto_secretbox,
          crypto_secretbox_open,
          crypto_scalarmult,
          crypto_scalarmult_base,
          crypto_box_beforenm,
          crypto_box_afternm,
          crypto_box,
          crypto_box_open,
          crypto_box_keypair,
          crypto_hash,
          crypto_sign,
          crypto_sign_keypair,
          crypto_sign_open,
          crypto_secretbox_KEYBYTES,
          crypto_secretbox_NONCEBYTES,
          crypto_secretbox_ZEROBYTES,
          crypto_secretbox_BOXZEROBYTES,
          crypto_scalarmult_BYTES,
          crypto_scalarmult_SCALARBYTES,
          crypto_box_PUBLICKEYBYTES,
          crypto_box_SECRETKEYBYTES,
          crypto_box_BEFORENMBYTES,
          crypto_box_NONCEBYTES,
          crypto_box_ZEROBYTES,
          crypto_box_BOXZEROBYTES,
          crypto_sign_BYTES,
          crypto_sign_PUBLICKEYBYTES,
          crypto_sign_SECRETKEYBYTES,
          crypto_sign_SEEDBYTES,
          crypto_hash_BYTES,
          gf,
          D,
          L,
          pack25519,
          unpack25519,
          M,
          A,
          S,
          Z,
          pow2523,
          add,
          set25519,
          modL,
          scalarmult,
          scalarbase
        };
        function checkLengths(k, n) {
          if (k.length !== crypto_secretbox_KEYBYTES) throw new Error("bad key size");
          if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error("bad nonce size");
        }
        function checkBoxLengths(pk, sk) {
          if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error("bad public key size");
          if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error("bad secret key size");
        }
        function checkArrayTypes() {
          for (var i = 0; i < arguments.length; i++) {
            if (!(arguments[i] instanceof Uint8Array))
              throw new TypeError("unexpected type, use Uint8Array");
          }
        }
        function cleanup(arr) {
          for (var i = 0; i < arr.length; i++) arr[i] = 0;
        }
        nacl3.randomBytes = function(n) {
          var b = new Uint8Array(n);
          randombytes(b, n);
          return b;
        };
        nacl3.secretbox = function(msg, nonce, key) {
          checkArrayTypes(msg, nonce, key);
          checkLengths(key, nonce);
          var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
          var c = new Uint8Array(m.length);
          for (var i = 0; i < msg.length; i++) m[i + crypto_secretbox_ZEROBYTES] = msg[i];
          crypto_secretbox(c, m, m.length, nonce, key);
          return c.subarray(crypto_secretbox_BOXZEROBYTES);
        };
        nacl3.secretbox.open = function(box, nonce, key) {
          checkArrayTypes(box, nonce, key);
          checkLengths(key, nonce);
          var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
          var m = new Uint8Array(c.length);
          for (var i = 0; i < box.length; i++) c[i + crypto_secretbox_BOXZEROBYTES] = box[i];
          if (c.length < 32) return null;
          if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return null;
          return m.subarray(crypto_secretbox_ZEROBYTES);
        };
        nacl3.secretbox.keyLength = crypto_secretbox_KEYBYTES;
        nacl3.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
        nacl3.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;
        nacl3.scalarMult = function(n, p) {
          checkArrayTypes(n, p);
          if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
          if (p.length !== crypto_scalarmult_BYTES) throw new Error("bad p size");
          var q = new Uint8Array(crypto_scalarmult_BYTES);
          crypto_scalarmult(q, n, p);
          return q;
        };
        nacl3.scalarMult.base = function(n) {
          checkArrayTypes(n);
          if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
          var q = new Uint8Array(crypto_scalarmult_BYTES);
          crypto_scalarmult_base(q, n);
          return q;
        };
        nacl3.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
        nacl3.scalarMult.groupElementLength = crypto_scalarmult_BYTES;
        nacl3.box = function(msg, nonce, publicKey, secretKey) {
          var k = nacl3.box.before(publicKey, secretKey);
          return nacl3.secretbox(msg, nonce, k);
        };
        nacl3.box.before = function(publicKey, secretKey) {
          checkArrayTypes(publicKey, secretKey);
          checkBoxLengths(publicKey, secretKey);
          var k = new Uint8Array(crypto_box_BEFORENMBYTES);
          crypto_box_beforenm(k, publicKey, secretKey);
          return k;
        };
        nacl3.box.after = nacl3.secretbox;
        nacl3.box.open = function(msg, nonce, publicKey, secretKey) {
          var k = nacl3.box.before(publicKey, secretKey);
          return nacl3.secretbox.open(msg, nonce, k);
        };
        nacl3.box.open.after = nacl3.secretbox.open;
        nacl3.box.keyPair = function() {
          var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
          var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
          crypto_box_keypair(pk, sk);
          return { publicKey: pk, secretKey: sk };
        };
        nacl3.box.keyPair.fromSecretKey = function(secretKey) {
          checkArrayTypes(secretKey);
          if (secretKey.length !== crypto_box_SECRETKEYBYTES)
            throw new Error("bad secret key size");
          var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
          crypto_scalarmult_base(pk, secretKey);
          return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
        };
        nacl3.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
        nacl3.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
        nacl3.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
        nacl3.box.nonceLength = crypto_box_NONCEBYTES;
        nacl3.box.overheadLength = nacl3.secretbox.overheadLength;
        nacl3.sign = function(msg, secretKey) {
          checkArrayTypes(msg, secretKey);
          if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
            throw new Error("bad secret key size");
          var signedMsg = new Uint8Array(crypto_sign_BYTES + msg.length);
          crypto_sign(signedMsg, msg, msg.length, secretKey);
          return signedMsg;
        };
        nacl3.sign.open = function(signedMsg, publicKey) {
          checkArrayTypes(signedMsg, publicKey);
          if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
            throw new Error("bad public key size");
          var tmp = new Uint8Array(signedMsg.length);
          var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
          if (mlen < 0) return null;
          var m = new Uint8Array(mlen);
          for (var i = 0; i < m.length; i++) m[i] = tmp[i];
          return m;
        };
        nacl3.sign.detached = function(msg, secretKey) {
          var signedMsg = nacl3.sign(msg, secretKey);
          var sig = new Uint8Array(crypto_sign_BYTES);
          for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
          return sig;
        };
        nacl3.sign.detached.verify = function(msg, sig, publicKey) {
          checkArrayTypes(msg, sig, publicKey);
          if (sig.length !== crypto_sign_BYTES)
            throw new Error("bad signature size");
          if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
            throw new Error("bad public key size");
          var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
          var m = new Uint8Array(crypto_sign_BYTES + msg.length);
          var i;
          for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
          for (i = 0; i < msg.length; i++) sm[i + crypto_sign_BYTES] = msg[i];
          return crypto_sign_open(m, sm, sm.length, publicKey) >= 0;
        };
        nacl3.sign.keyPair = function() {
          var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
          var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
          crypto_sign_keypair(pk, sk);
          return { publicKey: pk, secretKey: sk };
        };
        nacl3.sign.keyPair.fromSecretKey = function(secretKey) {
          checkArrayTypes(secretKey);
          if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
            throw new Error("bad secret key size");
          var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
          for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32 + i];
          return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
        };
        nacl3.sign.keyPair.fromSeed = function(seed) {
          checkArrayTypes(seed);
          if (seed.length !== crypto_sign_SEEDBYTES)
            throw new Error("bad seed size");
          var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
          var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
          for (var i = 0; i < 32; i++) sk[i] = seed[i];
          crypto_sign_keypair(pk, sk, true);
          return { publicKey: pk, secretKey: sk };
        };
        nacl3.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
        nacl3.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
        nacl3.sign.seedLength = crypto_sign_SEEDBYTES;
        nacl3.sign.signatureLength = crypto_sign_BYTES;
        nacl3.hash = function(msg) {
          checkArrayTypes(msg);
          var h = new Uint8Array(crypto_hash_BYTES);
          crypto_hash(h, msg, msg.length);
          return h;
        };
        nacl3.hash.hashLength = crypto_hash_BYTES;
        nacl3.verify = function(x, y) {
          checkArrayTypes(x, y);
          if (x.length === 0 || y.length === 0) return false;
          if (x.length !== y.length) return false;
          return vn(x, 0, y, 0, x.length) === 0 ? true : false;
        };
        nacl3.setPRNG = function(fn) {
          randombytes = fn;
        };
        (function() {
          var crypto2 = typeof self !== "undefined" ? self.crypto || self.msCrypto : null;
          if (crypto2 && crypto2.getRandomValues) {
            var QUOTA = 65536;
            nacl3.setPRNG(function(x, n) {
              var i, v = new Uint8Array(n);
              for (i = 0; i < n; i += QUOTA) {
                crypto2.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
              }
              for (i = 0; i < n; i++) x[i] = v[i];
              cleanup(v);
            });
          } else if (typeof __require !== "undefined") {
            crypto2 = require_crypto();
            if (crypto2 && crypto2.randomBytes) {
              nacl3.setPRNG(function(x, n) {
                var i, v = crypto2.randomBytes(n);
                for (i = 0; i < n; i++) x[i] = v[i];
                cleanup(v);
              });
            }
          }
        })();
      })(typeof module !== "undefined" && module.exports ? module.exports : self.nacl = self.nacl || {});
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/websocket.js
  var reconnectTimeoutBase, maxReconnectTimeout, messageReconnectTimeout2, setupWS2, WebsocketClient;
  var init_websocket = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/websocket.js"() {
      "use strict";
      init_observable();
      init_time();
      init_math();
      reconnectTimeoutBase = 1200;
      maxReconnectTimeout = 2500;
      messageReconnectTimeout2 = 3e4;
      setupWS2 = (wsclient) => {
        if (wsclient.shouldConnect && wsclient.ws === null) {
          const websocket = new WebSocket(wsclient.url);
          const binaryType = wsclient.binaryType;
          let pingTimeout = null;
          if (binaryType) {
            websocket.binaryType = binaryType;
          }
          wsclient.ws = websocket;
          wsclient.connecting = true;
          wsclient.connected = false;
          websocket.onmessage = (event) => {
            wsclient.lastMessageReceived = getUnixTime();
            const data = event.data;
            const message = typeof data === "string" ? JSON.parse(data) : data;
            if (message && message.type === "pong") {
              clearTimeout(pingTimeout);
              pingTimeout = setTimeout(sendPing, messageReconnectTimeout2 / 2);
            }
            wsclient.emit("message", [message, wsclient]);
          };
          const onclose = (error) => {
            if (wsclient.ws !== null) {
              wsclient.ws = null;
              wsclient.connecting = false;
              if (wsclient.connected) {
                wsclient.connected = false;
                wsclient.emit("disconnect", [{ type: "disconnect", error }, wsclient]);
              } else {
                wsclient.unsuccessfulReconnects++;
              }
              setTimeout(setupWS2, min(log10(wsclient.unsuccessfulReconnects + 1) * reconnectTimeoutBase, maxReconnectTimeout), wsclient);
            }
            clearTimeout(pingTimeout);
          };
          const sendPing = () => {
            if (wsclient.ws === websocket) {
              wsclient.send({
                type: "ping"
              });
            }
          };
          websocket.onclose = () => onclose(null);
          websocket.onerror = (error) => onclose(error);
          websocket.onopen = () => {
            wsclient.lastMessageReceived = getUnixTime();
            wsclient.connecting = false;
            wsclient.connected = true;
            wsclient.unsuccessfulReconnects = 0;
            wsclient.emit("connect", [{ type: "connect" }, wsclient]);
            pingTimeout = setTimeout(sendPing, messageReconnectTimeout2 / 2);
          };
        }
      };
      WebsocketClient = class extends Observable {
        /**
         * @param {string} url
         * @param {object} opts
         * @param {'arraybuffer' | 'blob' | null} [opts.binaryType] Set `ws.binaryType`
         */
        constructor(url, { binaryType } = {}) {
          super();
          this.url = url;
          this.ws = null;
          this.binaryType = binaryType || null;
          this.connected = false;
          this.connecting = false;
          this.unsuccessfulReconnects = 0;
          this.lastMessageReceived = 0;
          this.shouldConnect = true;
          this._checkInterval = setInterval(() => {
            if (this.connected && messageReconnectTimeout2 < getUnixTime() - this.lastMessageReceived) {
              this.ws.close();
            }
          }, messageReconnectTimeout2 / 2);
          setupWS2(this);
        }
        /**
         * @param {any} message
         */
        send(message) {
          if (this.ws) {
            this.ws.send(JSON.stringify(message));
          }
        }
        destroy() {
          clearInterval(this._checkInterval);
          this.disconnect();
          super.destroy();
        }
        disconnect() {
          this.shouldConnect = false;
          if (this.ws !== null) {
            this.ws.close();
          }
        }
        connect() {
          this.shouldConnect = true;
          if (!this.connected && this.ws === null) {
            setupWS2(this);
          }
        }
      };
    }
  });

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/mutex.js
  var createMutex;
  var init_mutex = __esm({
    "../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/mutex.js"() {
      "use strict";
      createMutex = () => {
        let token = true;
        return (f, g) => {
          if (token) {
            token = false;
            try {
              f();
            } finally {
              token = true;
            }
          } else if (g !== void 0) {
            g();
          }
        };
      };
    }
  });

  // ../../node_modules/.pnpm/simple-peer@9.11.1/node_modules/simple-peer/simplepeer.min.js
  var require_simplepeer_min = __commonJS({
    "../../node_modules/.pnpm/simple-peer@9.11.1/node_modules/simple-peer/simplepeer.min.js"(exports, module) {
      "use strict";
      (function(e) {
        if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
        else if ("function" == typeof define && define.amd) define([], e);
        else {
          var t;
          t = "undefined" == typeof window ? "undefined" == typeof global ? "undefined" == typeof self ? this : self : global : window, t.SimplePeer = e();
        }
      })(function() {
        var t = Math.floor, n = Math.abs, r = Math.pow;
        return (/* @__PURE__ */ (function() {
          function d(s, e, n2) {
            function t2(o, i) {
              if (!e[o]) {
                if (!s[o]) {
                  var l = "function" == typeof __require && __require;
                  if (!i && l) return l(o, true);
                  if (r2) return r2(o, true);
                  var c = new Error("Cannot find module '" + o + "'");
                  throw c.code = "MODULE_NOT_FOUND", c;
                }
                var a2 = e[o] = { exports: {} };
                s[o][0].call(a2.exports, function(e2) {
                  var r3 = s[o][1][e2];
                  return t2(r3 || e2);
                }, a2, a2.exports, d, s, e, n2);
              }
              return e[o].exports;
            }
            for (var r2 = "function" == typeof __require && __require, a = 0; a < n2.length; a++) t2(n2[a]);
            return t2;
          }
          return d;
        })())({ 1: [function(e, t2, n2) {
          "use strict";
          function r2(e2) {
            var t3 = e2.length;
            if (0 < t3 % 4) throw new Error("Invalid string. Length must be a multiple of 4");
            var n3 = e2.indexOf("=");
            -1 === n3 && (n3 = t3);
            var r3 = n3 === t3 ? 0 : 4 - n3 % 4;
            return [n3, r3];
          }
          function a(e2, t3, n3) {
            return 3 * (t3 + n3) / 4 - n3;
          }
          function o(e2) {
            var t3, n3, o2 = r2(e2), d2 = o2[0], s2 = o2[1], l2 = new p(a(e2, d2, s2)), c2 = 0, f2 = 0 < s2 ? d2 - 4 : d2;
            for (n3 = 0; n3 < f2; n3 += 4) t3 = u[e2.charCodeAt(n3)] << 18 | u[e2.charCodeAt(n3 + 1)] << 12 | u[e2.charCodeAt(n3 + 2)] << 6 | u[e2.charCodeAt(n3 + 3)], l2[c2++] = 255 & t3 >> 16, l2[c2++] = 255 & t3 >> 8, l2[c2++] = 255 & t3;
            return 2 === s2 && (t3 = u[e2.charCodeAt(n3)] << 2 | u[e2.charCodeAt(n3 + 1)] >> 4, l2[c2++] = 255 & t3), 1 === s2 && (t3 = u[e2.charCodeAt(n3)] << 10 | u[e2.charCodeAt(n3 + 1)] << 4 | u[e2.charCodeAt(n3 + 2)] >> 2, l2[c2++] = 255 & t3 >> 8, l2[c2++] = 255 & t3), l2;
          }
          function d(e2) {
            return c[63 & e2 >> 18] + c[63 & e2 >> 12] + c[63 & e2 >> 6] + c[63 & e2];
          }
          function s(e2, t3, n3) {
            for (var r3, a2 = [], o2 = t3; o2 < n3; o2 += 3) r3 = (16711680 & e2[o2] << 16) + (65280 & e2[o2 + 1] << 8) + (255 & e2[o2 + 2]), a2.push(d(r3));
            return a2.join("");
          }
          function l(e2) {
            for (var t3, n3 = e2.length, r3 = n3 % 3, a2 = [], o2 = 16383, d2 = 0, l2 = n3 - r3; d2 < l2; d2 += o2) a2.push(s(e2, d2, d2 + o2 > l2 ? l2 : d2 + o2));
            return 1 === r3 ? (t3 = e2[n3 - 1], a2.push(c[t3 >> 2] + c[63 & t3 << 4] + "==")) : 2 === r3 && (t3 = (e2[n3 - 2] << 8) + e2[n3 - 1], a2.push(c[t3 >> 10] + c[63 & t3 >> 4] + c[63 & t3 << 2] + "=")), a2.join("");
          }
          n2.byteLength = function(e2) {
            var t3 = r2(e2), n3 = t3[0], a2 = t3[1];
            return 3 * (n3 + a2) / 4 - a2;
          }, n2.toByteArray = o, n2.fromByteArray = l;
          for (var c = [], u = [], p = "undefined" == typeof Uint8Array ? Array : Uint8Array, f = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", g = 0, _ = f.length; g < _; ++g) c[g] = f[g], u[f.charCodeAt(g)] = g;
          u[45] = 62, u[95] = 63;
        }, {}], 2: [function() {
        }, {}], 3: [function(e, t2, n2) {
          (function() {
            (function() {
              "use strict";
              var t3 = String.fromCharCode, o = Math.min;
              function d(e2) {
                if (2147483647 < e2) throw new RangeError('The value "' + e2 + '" is invalid for option "size"');
                var t4 = new Uint8Array(e2);
                return t4.__proto__ = s.prototype, t4;
              }
              function s(e2, t4, n3) {
                if ("number" == typeof e2) {
                  if ("string" == typeof t4) throw new TypeError('The "string" argument must be of type string. Received type number');
                  return p(e2);
                }
                return l(e2, t4, n3);
              }
              function l(e2, t4, n3) {
                if ("string" == typeof e2) return f(e2, t4);
                if (ArrayBuffer.isView(e2)) return g(e2);
                if (null == e2) throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e2);
                if (K(e2, ArrayBuffer) || e2 && K(e2.buffer, ArrayBuffer)) return _(e2, t4, n3);
                if ("number" == typeof e2) throw new TypeError('The "value" argument must not be of type number. Received type number');
                var r2 = e2.valueOf && e2.valueOf();
                if (null != r2 && r2 !== e2) return s.from(r2, t4, n3);
                var a = h(e2);
                if (a) return a;
                if ("undefined" != typeof Symbol && null != Symbol.toPrimitive && "function" == typeof e2[Symbol.toPrimitive]) return s.from(e2[Symbol.toPrimitive]("string"), t4, n3);
                throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e2);
              }
              function c(e2) {
                if ("number" != typeof e2) throw new TypeError('"size" argument must be of type number');
                else if (0 > e2) throw new RangeError('The value "' + e2 + '" is invalid for option "size"');
              }
              function u(e2, t4, n3) {
                return c(e2), 0 >= e2 ? d(e2) : void 0 === t4 ? d(e2) : "string" == typeof n3 ? d(e2).fill(t4, n3) : d(e2).fill(t4);
              }
              function p(e2) {
                return c(e2), d(0 > e2 ? 0 : 0 | m(e2));
              }
              function f(e2, t4) {
                if (("string" != typeof t4 || "" === t4) && (t4 = "utf8"), !s.isEncoding(t4)) throw new TypeError("Unknown encoding: " + t4);
                var n3 = 0 | b(e2, t4), r2 = d(n3), a = r2.write(e2, t4);
                return a !== n3 && (r2 = r2.slice(0, a)), r2;
              }
              function g(e2) {
                for (var t4 = 0 > e2.length ? 0 : 0 | m(e2.length), n3 = d(t4), r2 = 0; r2 < t4; r2 += 1) n3[r2] = 255 & e2[r2];
                return n3;
              }
              function _(e2, t4, n3) {
                if (0 > t4 || e2.byteLength < t4) throw new RangeError('"offset" is outside of buffer bounds');
                if (e2.byteLength < t4 + (n3 || 0)) throw new RangeError('"length" is outside of buffer bounds');
                var r2;
                return r2 = void 0 === t4 && void 0 === n3 ? new Uint8Array(e2) : void 0 === n3 ? new Uint8Array(e2, t4) : new Uint8Array(e2, t4, n3), r2.__proto__ = s.prototype, r2;
              }
              function h(e2) {
                if (s.isBuffer(e2)) {
                  var t4 = 0 | m(e2.length), n3 = d(t4);
                  return 0 === n3.length ? n3 : (e2.copy(n3, 0, 0, t4), n3);
                }
                return void 0 === e2.length ? "Buffer" === e2.type && Array.isArray(e2.data) ? g(e2.data) : void 0 : "number" != typeof e2.length || X(e2.length) ? d(0) : g(e2);
              }
              function m(e2) {
                if (e2 >= 2147483647) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + 2147483647 .toString(16) + " bytes");
                return 0 | e2;
              }
              function b(e2, t4) {
                if (s.isBuffer(e2)) return e2.length;
                if (ArrayBuffer.isView(e2) || K(e2, ArrayBuffer)) return e2.byteLength;
                if ("string" != typeof e2) throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof e2);
                var n3 = e2.length, r2 = 2 < arguments.length && true === arguments[2];
                if (!r2 && 0 === n3) return 0;
                for (var a = false; ; ) switch (t4) {
                  case "ascii":
                  case "latin1":
                  case "binary":
                    return n3;
                  case "utf8":
                  case "utf-8":
                    return H(e2).length;
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return 2 * n3;
                  case "hex":
                    return n3 >>> 1;
                  case "base64":
                    return z(e2).length;
                  default:
                    if (a) return r2 ? -1 : H(e2).length;
                    t4 = ("" + t4).toLowerCase(), a = true;
                }
              }
              function y(e2, t4, n3) {
                var r2 = false;
                if ((void 0 === t4 || 0 > t4) && (t4 = 0), t4 > this.length) return "";
                if ((void 0 === n3 || n3 > this.length) && (n3 = this.length), 0 >= n3) return "";
                if (n3 >>>= 0, t4 >>>= 0, n3 <= t4) return "";
                for (e2 || (e2 = "utf8"); ; ) switch (e2) {
                  case "hex":
                    return P(this, t4, n3);
                  case "utf8":
                  case "utf-8":
                    return x(this, t4, n3);
                  case "ascii":
                    return D(this, t4, n3);
                  case "latin1":
                  case "binary":
                    return I(this, t4, n3);
                  case "base64":
                    return A(this, t4, n3);
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return M(this, t4, n3);
                  default:
                    if (r2) throw new TypeError("Unknown encoding: " + e2);
                    e2 = (e2 + "").toLowerCase(), r2 = true;
                }
              }
              function C(e2, t4, n3) {
                var r2 = e2[t4];
                e2[t4] = e2[n3], e2[n3] = r2;
              }
              function R(e2, t4, n3, r2, a) {
                if (0 === e2.length) return -1;
                if ("string" == typeof n3 ? (r2 = n3, n3 = 0) : 2147483647 < n3 ? n3 = 2147483647 : -2147483648 > n3 && (n3 = -2147483648), n3 = +n3, X(n3) && (n3 = a ? 0 : e2.length - 1), 0 > n3 && (n3 = e2.length + n3), n3 >= e2.length) {
                  if (a) return -1;
                  n3 = e2.length - 1;
                } else if (0 > n3) if (a) n3 = 0;
                else return -1;
                if ("string" == typeof t4 && (t4 = s.from(t4, r2)), s.isBuffer(t4)) return 0 === t4.length ? -1 : E(e2, t4, n3, r2, a);
                if ("number" == typeof t4) return t4 &= 255, "function" == typeof Uint8Array.prototype.indexOf ? a ? Uint8Array.prototype.indexOf.call(e2, t4, n3) : Uint8Array.prototype.lastIndexOf.call(e2, t4, n3) : E(e2, [t4], n3, r2, a);
                throw new TypeError("val must be string, number or Buffer");
              }
              function E(e2, t4, n3, r2, a) {
                function o2(e3, t5) {
                  return 1 === d2 ? e3[t5] : e3.readUInt16BE(t5 * d2);
                }
                var d2 = 1, s2 = e2.length, l2 = t4.length;
                if (void 0 !== r2 && (r2 = (r2 + "").toLowerCase(), "ucs2" === r2 || "ucs-2" === r2 || "utf16le" === r2 || "utf-16le" === r2)) {
                  if (2 > e2.length || 2 > t4.length) return -1;
                  d2 = 2, s2 /= 2, l2 /= 2, n3 /= 2;
                }
                var c2;
                if (a) {
                  var u2 = -1;
                  for (c2 = n3; c2 < s2; c2++) if (o2(e2, c2) !== o2(t4, -1 === u2 ? 0 : c2 - u2)) -1 !== u2 && (c2 -= c2 - u2), u2 = -1;
                  else if (-1 === u2 && (u2 = c2), c2 - u2 + 1 === l2) return u2 * d2;
                } else for (n3 + l2 > s2 && (n3 = s2 - l2), c2 = n3; 0 <= c2; c2--) {
                  for (var p2 = true, f2 = 0; f2 < l2; f2++) if (o2(e2, c2 + f2) !== o2(t4, f2)) {
                    p2 = false;
                    break;
                  }
                  if (p2) return c2;
                }
                return -1;
              }
              function w(e2, t4, n3, r2) {
                n3 = +n3 || 0;
                var a = e2.length - n3;
                r2 ? (r2 = +r2, r2 > a && (r2 = a)) : r2 = a;
                var o2 = t4.length;
                r2 > o2 / 2 && (r2 = o2 / 2);
                for (var d2, s2 = 0; s2 < r2; ++s2) {
                  if (d2 = parseInt(t4.substr(2 * s2, 2), 16), X(d2)) return s2;
                  e2[n3 + s2] = d2;
                }
                return s2;
              }
              function S(e2, t4, n3, r2) {
                return G(H(t4, e2.length - n3), e2, n3, r2);
              }
              function T(e2, t4, n3, r2) {
                return G(Y(t4), e2, n3, r2);
              }
              function v(e2, t4, n3, r2) {
                return T(e2, t4, n3, r2);
              }
              function k(e2, t4, n3, r2) {
                return G(z(t4), e2, n3, r2);
              }
              function L(e2, t4, n3, r2) {
                return G(V(t4, e2.length - n3), e2, n3, r2);
              }
              function A(e2, t4, n3) {
                return 0 === t4 && n3 === e2.length ? $2.fromByteArray(e2) : $2.fromByteArray(e2.slice(t4, n3));
              }
              function x(e2, t4, n3) {
                n3 = o(e2.length, n3);
                for (var r2 = [], a = t4; a < n3; ) {
                  var d2 = e2[a], s2 = null, l2 = 239 < d2 ? 4 : 223 < d2 ? 3 : 191 < d2 ? 2 : 1;
                  if (a + l2 <= n3) {
                    var c2, u2, p2, f2;
                    1 === l2 ? 128 > d2 && (s2 = d2) : 2 === l2 ? (c2 = e2[a + 1], 128 == (192 & c2) && (f2 = (31 & d2) << 6 | 63 & c2, 127 < f2 && (s2 = f2))) : 3 === l2 ? (c2 = e2[a + 1], u2 = e2[a + 2], 128 == (192 & c2) && 128 == (192 & u2) && (f2 = (15 & d2) << 12 | (63 & c2) << 6 | 63 & u2, 2047 < f2 && (55296 > f2 || 57343 < f2) && (s2 = f2))) : 4 === l2 ? (c2 = e2[a + 1], u2 = e2[a + 2], p2 = e2[a + 3], 128 == (192 & c2) && 128 == (192 & u2) && 128 == (192 & p2) && (f2 = (15 & d2) << 18 | (63 & c2) << 12 | (63 & u2) << 6 | 63 & p2, 65535 < f2 && 1114112 > f2 && (s2 = f2))) : void 0;
                  }
                  null === s2 ? (s2 = 65533, l2 = 1) : 65535 < s2 && (s2 -= 65536, r2.push(55296 | 1023 & s2 >>> 10), s2 = 56320 | 1023 & s2), r2.push(s2), a += l2;
                }
                return N(r2);
              }
              function N(e2) {
                var n3 = e2.length;
                if (n3 <= 4096) return t3.apply(String, e2);
                for (var r2 = "", a = 0; a < n3; ) r2 += t3.apply(String, e2.slice(a, a += 4096));
                return r2;
              }
              function D(e2, n3, r2) {
                var a = "";
                r2 = o(e2.length, r2);
                for (var d2 = n3; d2 < r2; ++d2) a += t3(127 & e2[d2]);
                return a;
              }
              function I(e2, n3, r2) {
                var a = "";
                r2 = o(e2.length, r2);
                for (var d2 = n3; d2 < r2; ++d2) a += t3(e2[d2]);
                return a;
              }
              function P(e2, t4, n3) {
                var r2 = e2.length;
                (!t4 || 0 > t4) && (t4 = 0), (!n3 || 0 > n3 || n3 > r2) && (n3 = r2);
                for (var a = "", o2 = t4; o2 < n3; ++o2) a += W(e2[o2]);
                return a;
              }
              function M(e2, n3, r2) {
                for (var a = e2.slice(n3, r2), o2 = "", d2 = 0; d2 < a.length; d2 += 2) o2 += t3(a[d2] + 256 * a[d2 + 1]);
                return o2;
              }
              function O(e2, t4, n3) {
                if (0 != e2 % 1 || 0 > e2) throw new RangeError("offset is not uint");
                if (e2 + t4 > n3) throw new RangeError("Trying to access beyond buffer length");
              }
              function F(e2, t4, n3, r2, a, o2) {
                if (!s.isBuffer(e2)) throw new TypeError('"buffer" argument must be a Buffer instance');
                if (t4 > a || t4 < o2) throw new RangeError('"value" argument is out of bounds');
                if (n3 + r2 > e2.length) throw new RangeError("Index out of range");
              }
              function B(e2, t4, n3, r2) {
                if (n3 + r2 > e2.length) throw new RangeError("Index out of range");
                if (0 > n3) throw new RangeError("Index out of range");
              }
              function U(e2, t4, n3, r2, a) {
                return t4 = +t4, n3 >>>= 0, a || B(e2, t4, n3, 4, 34028234663852886e22, -34028234663852886e22), J.write(e2, t4, n3, r2, 23, 4), n3 + 4;
              }
              function j(e2, t4, n3, r2, a) {
                return t4 = +t4, n3 >>>= 0, a || B(e2, t4, n3, 8, 17976931348623157e292, -17976931348623157e292), J.write(e2, t4, n3, r2, 52, 8), n3 + 8;
              }
              function q(e2) {
                if (e2 = e2.split("=")[0], e2 = e2.trim().replace(Q, ""), 2 > e2.length) return "";
                for (; 0 != e2.length % 4; ) e2 += "=";
                return e2;
              }
              function W(e2) {
                return 16 > e2 ? "0" + e2.toString(16) : e2.toString(16);
              }
              function H(e2, t4) {
                t4 = t4 || 1 / 0;
                for (var n3, r2 = e2.length, a = null, o2 = [], d2 = 0; d2 < r2; ++d2) {
                  if (n3 = e2.charCodeAt(d2), 55295 < n3 && 57344 > n3) {
                    if (!a) {
                      if (56319 < n3) {
                        -1 < (t4 -= 3) && o2.push(239, 191, 189);
                        continue;
                      } else if (d2 + 1 === r2) {
                        -1 < (t4 -= 3) && o2.push(239, 191, 189);
                        continue;
                      }
                      a = n3;
                      continue;
                    }
                    if (56320 > n3) {
                      -1 < (t4 -= 3) && o2.push(239, 191, 189), a = n3;
                      continue;
                    }
                    n3 = (a - 55296 << 10 | n3 - 56320) + 65536;
                  } else a && -1 < (t4 -= 3) && o2.push(239, 191, 189);
                  if (a = null, 128 > n3) {
                    if (0 > (t4 -= 1)) break;
                    o2.push(n3);
                  } else if (2048 > n3) {
                    if (0 > (t4 -= 2)) break;
                    o2.push(192 | n3 >> 6, 128 | 63 & n3);
                  } else if (65536 > n3) {
                    if (0 > (t4 -= 3)) break;
                    o2.push(224 | n3 >> 12, 128 | 63 & n3 >> 6, 128 | 63 & n3);
                  } else if (1114112 > n3) {
                    if (0 > (t4 -= 4)) break;
                    o2.push(240 | n3 >> 18, 128 | 63 & n3 >> 12, 128 | 63 & n3 >> 6, 128 | 63 & n3);
                  } else throw new Error("Invalid code point");
                }
                return o2;
              }
              function Y(e2) {
                for (var t4 = [], n3 = 0; n3 < e2.length; ++n3) t4.push(255 & e2.charCodeAt(n3));
                return t4;
              }
              function V(e2, t4) {
                for (var n3, r2, a, o2 = [], d2 = 0; d2 < e2.length && !(0 > (t4 -= 2)); ++d2) n3 = e2.charCodeAt(d2), r2 = n3 >> 8, a = n3 % 256, o2.push(a), o2.push(r2);
                return o2;
              }
              function z(e2) {
                return $2.toByteArray(q(e2));
              }
              function G(e2, t4, n3, r2) {
                for (var a = 0; a < r2 && !(a + n3 >= t4.length || a >= e2.length); ++a) t4[a + n3] = e2[a];
                return a;
              }
              function K(e2, t4) {
                return e2 instanceof t4 || null != e2 && null != e2.constructor && null != e2.constructor.name && e2.constructor.name === t4.name;
              }
              function X(e2) {
                return e2 !== e2;
              }
              var $2 = e("base64-js"), J = e("ieee754");
              n2.Buffer = s, n2.SlowBuffer = function(e2) {
                return +e2 != e2 && (e2 = 0), s.alloc(+e2);
              }, n2.INSPECT_MAX_BYTES = 50;
              n2.kMaxLength = 2147483647, s.TYPED_ARRAY_SUPPORT = (function() {
                try {
                  var e2 = new Uint8Array(1);
                  return e2.__proto__ = { __proto__: Uint8Array.prototype, foo: function() {
                    return 42;
                  } }, 42 === e2.foo();
                } catch (t4) {
                  return false;
                }
              })(), s.TYPED_ARRAY_SUPPORT || "undefined" == typeof console || "function" != typeof console.error || console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."), Object.defineProperty(s.prototype, "parent", { enumerable: true, get: function() {
                return s.isBuffer(this) ? this.buffer : void 0;
              } }), Object.defineProperty(s.prototype, "offset", { enumerable: true, get: function() {
                return s.isBuffer(this) ? this.byteOffset : void 0;
              } }), "undefined" != typeof Symbol && null != Symbol.species && s[Symbol.species] === s && Object.defineProperty(s, Symbol.species, { value: null, configurable: true, enumerable: false, writable: false }), s.poolSize = 8192, s.from = function(e2, t4, n3) {
                return l(e2, t4, n3);
              }, s.prototype.__proto__ = Uint8Array.prototype, s.__proto__ = Uint8Array, s.alloc = function(e2, t4, n3) {
                return u(e2, t4, n3);
              }, s.allocUnsafe = function(e2) {
                return p(e2);
              }, s.allocUnsafeSlow = function(e2) {
                return p(e2);
              }, s.isBuffer = function(e2) {
                return null != e2 && true === e2._isBuffer && e2 !== s.prototype;
              }, s.compare = function(e2, t4) {
                if (K(e2, Uint8Array) && (e2 = s.from(e2, e2.offset, e2.byteLength)), K(t4, Uint8Array) && (t4 = s.from(t4, t4.offset, t4.byteLength)), !s.isBuffer(e2) || !s.isBuffer(t4)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
                if (e2 === t4) return 0;
                for (var n3 = e2.length, r2 = t4.length, d2 = 0, l2 = o(n3, r2); d2 < l2; ++d2) if (e2[d2] !== t4[d2]) {
                  n3 = e2[d2], r2 = t4[d2];
                  break;
                }
                return n3 < r2 ? -1 : r2 < n3 ? 1 : 0;
              }, s.isEncoding = function(e2) {
                switch ((e2 + "").toLowerCase()) {
                  case "hex":
                  case "utf8":
                  case "utf-8":
                  case "ascii":
                  case "latin1":
                  case "binary":
                  case "base64":
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return true;
                  default:
                    return false;
                }
              }, s.concat = function(e2, t4) {
                if (!Array.isArray(e2)) throw new TypeError('"list" argument must be an Array of Buffers');
                if (0 === e2.length) return s.alloc(0);
                var n3;
                if (t4 === void 0) for (t4 = 0, n3 = 0; n3 < e2.length; ++n3) t4 += e2[n3].length;
                var r2 = s.allocUnsafe(t4), a = 0;
                for (n3 = 0; n3 < e2.length; ++n3) {
                  var o2 = e2[n3];
                  if (K(o2, Uint8Array) && (o2 = s.from(o2)), !s.isBuffer(o2)) throw new TypeError('"list" argument must be an Array of Buffers');
                  o2.copy(r2, a), a += o2.length;
                }
                return r2;
              }, s.byteLength = b, s.prototype._isBuffer = true, s.prototype.swap16 = function() {
                var e2 = this.length;
                if (0 != e2 % 2) throw new RangeError("Buffer size must be a multiple of 16-bits");
                for (var t4 = 0; t4 < e2; t4 += 2) C(this, t4, t4 + 1);
                return this;
              }, s.prototype.swap32 = function() {
                var e2 = this.length;
                if (0 != e2 % 4) throw new RangeError("Buffer size must be a multiple of 32-bits");
                for (var t4 = 0; t4 < e2; t4 += 4) C(this, t4, t4 + 3), C(this, t4 + 1, t4 + 2);
                return this;
              }, s.prototype.swap64 = function() {
                var e2 = this.length;
                if (0 != e2 % 8) throw new RangeError("Buffer size must be a multiple of 64-bits");
                for (var t4 = 0; t4 < e2; t4 += 8) C(this, t4, t4 + 7), C(this, t4 + 1, t4 + 6), C(this, t4 + 2, t4 + 5), C(this, t4 + 3, t4 + 4);
                return this;
              }, s.prototype.toString = function() {
                var e2 = this.length;
                return 0 === e2 ? "" : 0 === arguments.length ? x(this, 0, e2) : y.apply(this, arguments);
              }, s.prototype.toLocaleString = s.prototype.toString, s.prototype.equals = function(e2) {
                if (!s.isBuffer(e2)) throw new TypeError("Argument must be a Buffer");
                return this === e2 || 0 === s.compare(this, e2);
              }, s.prototype.inspect = function() {
                var e2 = "", t4 = n2.INSPECT_MAX_BYTES;
                return e2 = this.toString("hex", 0, t4).replace(/(.{2})/g, "$1 ").trim(), this.length > t4 && (e2 += " ... "), "<Buffer " + e2 + ">";
              }, s.prototype.compare = function(e2, t4, n3, r2, a) {
                if (K(e2, Uint8Array) && (e2 = s.from(e2, e2.offset, e2.byteLength)), !s.isBuffer(e2)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e2);
                if (void 0 === t4 && (t4 = 0), void 0 === n3 && (n3 = e2 ? e2.length : 0), void 0 === r2 && (r2 = 0), void 0 === a && (a = this.length), 0 > t4 || n3 > e2.length || 0 > r2 || a > this.length) throw new RangeError("out of range index");
                if (r2 >= a && t4 >= n3) return 0;
                if (r2 >= a) return -1;
                if (t4 >= n3) return 1;
                if (t4 >>>= 0, n3 >>>= 0, r2 >>>= 0, a >>>= 0, this === e2) return 0;
                for (var d2 = a - r2, l2 = n3 - t4, c2 = o(d2, l2), u2 = this.slice(r2, a), p2 = e2.slice(t4, n3), f2 = 0; f2 < c2; ++f2) if (u2[f2] !== p2[f2]) {
                  d2 = u2[f2], l2 = p2[f2];
                  break;
                }
                return d2 < l2 ? -1 : l2 < d2 ? 1 : 0;
              }, s.prototype.includes = function(e2, t4, n3) {
                return -1 !== this.indexOf(e2, t4, n3);
              }, s.prototype.indexOf = function(e2, t4, n3) {
                return R(this, e2, t4, n3, true);
              }, s.prototype.lastIndexOf = function(e2, t4, n3) {
                return R(this, e2, t4, n3, false);
              }, s.prototype.write = function(e2, t4, n3, r2) {
                if (void 0 === t4) r2 = "utf8", n3 = this.length, t4 = 0;
                else if (void 0 === n3 && "string" == typeof t4) r2 = t4, n3 = this.length, t4 = 0;
                else if (isFinite(t4)) t4 >>>= 0, isFinite(n3) ? (n3 >>>= 0, void 0 === r2 && (r2 = "utf8")) : (r2 = n3, n3 = void 0);
                else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                var a = this.length - t4;
                if ((void 0 === n3 || n3 > a) && (n3 = a), 0 < e2.length && (0 > n3 || 0 > t4) || t4 > this.length) throw new RangeError("Attempt to write outside buffer bounds");
                r2 || (r2 = "utf8");
                for (var o2 = false; ; ) switch (r2) {
                  case "hex":
                    return w(this, e2, t4, n3);
                  case "utf8":
                  case "utf-8":
                    return S(this, e2, t4, n3);
                  case "ascii":
                    return T(this, e2, t4, n3);
                  case "latin1":
                  case "binary":
                    return v(this, e2, t4, n3);
                  case "base64":
                    return k(this, e2, t4, n3);
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return L(this, e2, t4, n3);
                  default:
                    if (o2) throw new TypeError("Unknown encoding: " + r2);
                    r2 = ("" + r2).toLowerCase(), o2 = true;
                }
              }, s.prototype.toJSON = function() {
                return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
              };
              s.prototype.slice = function(e2, t4) {
                var n3 = this.length;
                e2 = ~~e2, t4 = t4 === void 0 ? n3 : ~~t4, 0 > e2 ? (e2 += n3, 0 > e2 && (e2 = 0)) : e2 > n3 && (e2 = n3), 0 > t4 ? (t4 += n3, 0 > t4 && (t4 = 0)) : t4 > n3 && (t4 = n3), t4 < e2 && (t4 = e2);
                var r2 = this.subarray(e2, t4);
                return r2.__proto__ = s.prototype, r2;
              }, s.prototype.readUIntLE = function(e2, t4, n3) {
                e2 >>>= 0, t4 >>>= 0, n3 || O(e2, t4, this.length);
                for (var r2 = this[e2], a = 1, o2 = 0; ++o2 < t4 && (a *= 256); ) r2 += this[e2 + o2] * a;
                return r2;
              }, s.prototype.readUIntBE = function(e2, t4, n3) {
                e2 >>>= 0, t4 >>>= 0, n3 || O(e2, t4, this.length);
                for (var r2 = this[e2 + --t4], a = 1; 0 < t4 && (a *= 256); ) r2 += this[e2 + --t4] * a;
                return r2;
              }, s.prototype.readUInt8 = function(e2, t4) {
                return e2 >>>= 0, t4 || O(e2, 1, this.length), this[e2];
              }, s.prototype.readUInt16LE = function(e2, t4) {
                return e2 >>>= 0, t4 || O(e2, 2, this.length), this[e2] | this[e2 + 1] << 8;
              }, s.prototype.readUInt16BE = function(e2, t4) {
                return e2 >>>= 0, t4 || O(e2, 2, this.length), this[e2] << 8 | this[e2 + 1];
              }, s.prototype.readUInt32LE = function(e2, t4) {
                return e2 >>>= 0, t4 || O(e2, 4, this.length), (this[e2] | this[e2 + 1] << 8 | this[e2 + 2] << 16) + 16777216 * this[e2 + 3];
              }, s.prototype.readUInt32BE = function(e2, t4) {
                return e2 >>>= 0, t4 || O(e2, 4, this.length), 16777216 * this[e2] + (this[e2 + 1] << 16 | this[e2 + 2] << 8 | this[e2 + 3]);
              }, s.prototype.readIntLE = function(e2, t4, n3) {
                e2 >>>= 0, t4 >>>= 0, n3 || O(e2, t4, this.length);
                for (var a = this[e2], o2 = 1, d2 = 0; ++d2 < t4 && (o2 *= 256); ) a += this[e2 + d2] * o2;
                return o2 *= 128, a >= o2 && (a -= r(2, 8 * t4)), a;
              }, s.prototype.readIntBE = function(e2, t4, n3) {
                e2 >>>= 0, t4 >>>= 0, n3 || O(e2, t4, this.length);
                for (var a = t4, o2 = 1, d2 = this[e2 + --a]; 0 < a && (o2 *= 256); ) d2 += this[e2 + --a] * o2;
                return o2 *= 128, d2 >= o2 && (d2 -= r(2, 8 * t4)), d2;
              }, s.prototype.readInt8 = function(e2, t4) {
                return e2 >>>= 0, t4 || O(e2, 1, this.length), 128 & this[e2] ? -1 * (255 - this[e2] + 1) : this[e2];
              }, s.prototype.readInt16LE = function(e2, t4) {
                e2 >>>= 0, t4 || O(e2, 2, this.length);
                var n3 = this[e2] | this[e2 + 1] << 8;
                return 32768 & n3 ? 4294901760 | n3 : n3;
              }, s.prototype.readInt16BE = function(e2, t4) {
                e2 >>>= 0, t4 || O(e2, 2, this.length);
                var n3 = this[e2 + 1] | this[e2] << 8;
                return 32768 & n3 ? 4294901760 | n3 : n3;
              }, s.prototype.readInt32LE = function(e2, t4) {
                return e2 >>>= 0, t4 || O(e2, 4, this.length), this[e2] | this[e2 + 1] << 8 | this[e2 + 2] << 16 | this[e2 + 3] << 24;
              }, s.prototype.readInt32BE = function(e2, t4) {
                return e2 >>>= 0, t4 || O(e2, 4, this.length), this[e2] << 24 | this[e2 + 1] << 16 | this[e2 + 2] << 8 | this[e2 + 3];
              }, s.prototype.readFloatLE = function(e2, t4) {
                return e2 >>>= 0, t4 || O(e2, 4, this.length), J.read(this, e2, true, 23, 4);
              }, s.prototype.readFloatBE = function(e2, t4) {
                return e2 >>>= 0, t4 || O(e2, 4, this.length), J.read(this, e2, false, 23, 4);
              }, s.prototype.readDoubleLE = function(e2, t4) {
                return e2 >>>= 0, t4 || O(e2, 8, this.length), J.read(this, e2, true, 52, 8);
              }, s.prototype.readDoubleBE = function(e2, t4) {
                return e2 >>>= 0, t4 || O(e2, 8, this.length), J.read(this, e2, false, 52, 8);
              }, s.prototype.writeUIntLE = function(e2, t4, n3, a) {
                if (e2 = +e2, t4 >>>= 0, n3 >>>= 0, !a) {
                  var o2 = r(2, 8 * n3) - 1;
                  F(this, e2, t4, n3, o2, 0);
                }
                var d2 = 1, s2 = 0;
                for (this[t4] = 255 & e2; ++s2 < n3 && (d2 *= 256); ) this[t4 + s2] = 255 & e2 / d2;
                return t4 + n3;
              }, s.prototype.writeUIntBE = function(e2, t4, n3, a) {
                if (e2 = +e2, t4 >>>= 0, n3 >>>= 0, !a) {
                  var o2 = r(2, 8 * n3) - 1;
                  F(this, e2, t4, n3, o2, 0);
                }
                var d2 = n3 - 1, s2 = 1;
                for (this[t4 + d2] = 255 & e2; 0 <= --d2 && (s2 *= 256); ) this[t4 + d2] = 255 & e2 / s2;
                return t4 + n3;
              }, s.prototype.writeUInt8 = function(e2, t4, n3) {
                return e2 = +e2, t4 >>>= 0, n3 || F(this, e2, t4, 1, 255, 0), this[t4] = 255 & e2, t4 + 1;
              }, s.prototype.writeUInt16LE = function(e2, t4, n3) {
                return e2 = +e2, t4 >>>= 0, n3 || F(this, e2, t4, 2, 65535, 0), this[t4] = 255 & e2, this[t4 + 1] = e2 >>> 8, t4 + 2;
              }, s.prototype.writeUInt16BE = function(e2, t4, n3) {
                return e2 = +e2, t4 >>>= 0, n3 || F(this, e2, t4, 2, 65535, 0), this[t4] = e2 >>> 8, this[t4 + 1] = 255 & e2, t4 + 2;
              }, s.prototype.writeUInt32LE = function(e2, t4, n3) {
                return e2 = +e2, t4 >>>= 0, n3 || F(this, e2, t4, 4, 4294967295, 0), this[t4 + 3] = e2 >>> 24, this[t4 + 2] = e2 >>> 16, this[t4 + 1] = e2 >>> 8, this[t4] = 255 & e2, t4 + 4;
              }, s.prototype.writeUInt32BE = function(e2, t4, n3) {
                return e2 = +e2, t4 >>>= 0, n3 || F(this, e2, t4, 4, 4294967295, 0), this[t4] = e2 >>> 24, this[t4 + 1] = e2 >>> 16, this[t4 + 2] = e2 >>> 8, this[t4 + 3] = 255 & e2, t4 + 4;
              }, s.prototype.writeIntLE = function(e2, t4, n3, a) {
                if (e2 = +e2, t4 >>>= 0, !a) {
                  var o2 = r(2, 8 * n3 - 1);
                  F(this, e2, t4, n3, o2 - 1, -o2);
                }
                var d2 = 0, s2 = 1, l2 = 0;
                for (this[t4] = 255 & e2; ++d2 < n3 && (s2 *= 256); ) 0 > e2 && 0 === l2 && 0 !== this[t4 + d2 - 1] && (l2 = 1), this[t4 + d2] = 255 & (e2 / s2 >> 0) - l2;
                return t4 + n3;
              }, s.prototype.writeIntBE = function(e2, t4, n3, a) {
                if (e2 = +e2, t4 >>>= 0, !a) {
                  var o2 = r(2, 8 * n3 - 1);
                  F(this, e2, t4, n3, o2 - 1, -o2);
                }
                var d2 = n3 - 1, s2 = 1, l2 = 0;
                for (this[t4 + d2] = 255 & e2; 0 <= --d2 && (s2 *= 256); ) 0 > e2 && 0 === l2 && 0 !== this[t4 + d2 + 1] && (l2 = 1), this[t4 + d2] = 255 & (e2 / s2 >> 0) - l2;
                return t4 + n3;
              }, s.prototype.writeInt8 = function(e2, t4, n3) {
                return e2 = +e2, t4 >>>= 0, n3 || F(this, e2, t4, 1, 127, -128), 0 > e2 && (e2 = 255 + e2 + 1), this[t4] = 255 & e2, t4 + 1;
              }, s.prototype.writeInt16LE = function(e2, t4, n3) {
                return e2 = +e2, t4 >>>= 0, n3 || F(this, e2, t4, 2, 32767, -32768), this[t4] = 255 & e2, this[t4 + 1] = e2 >>> 8, t4 + 2;
              }, s.prototype.writeInt16BE = function(e2, t4, n3) {
                return e2 = +e2, t4 >>>= 0, n3 || F(this, e2, t4, 2, 32767, -32768), this[t4] = e2 >>> 8, this[t4 + 1] = 255 & e2, t4 + 2;
              }, s.prototype.writeInt32LE = function(e2, t4, n3) {
                return e2 = +e2, t4 >>>= 0, n3 || F(this, e2, t4, 4, 2147483647, -2147483648), this[t4] = 255 & e2, this[t4 + 1] = e2 >>> 8, this[t4 + 2] = e2 >>> 16, this[t4 + 3] = e2 >>> 24, t4 + 4;
              }, s.prototype.writeInt32BE = function(e2, t4, n3) {
                return e2 = +e2, t4 >>>= 0, n3 || F(this, e2, t4, 4, 2147483647, -2147483648), 0 > e2 && (e2 = 4294967295 + e2 + 1), this[t4] = e2 >>> 24, this[t4 + 1] = e2 >>> 16, this[t4 + 2] = e2 >>> 8, this[t4 + 3] = 255 & e2, t4 + 4;
              }, s.prototype.writeFloatLE = function(e2, t4, n3) {
                return U(this, e2, t4, true, n3);
              }, s.prototype.writeFloatBE = function(e2, t4, n3) {
                return U(this, e2, t4, false, n3);
              }, s.prototype.writeDoubleLE = function(e2, t4, n3) {
                return j(this, e2, t4, true, n3);
              }, s.prototype.writeDoubleBE = function(e2, t4, n3) {
                return j(this, e2, t4, false, n3);
              }, s.prototype.copy = function(e2, t4, n3, r2) {
                if (!s.isBuffer(e2)) throw new TypeError("argument should be a Buffer");
                if (n3 || (n3 = 0), r2 || 0 === r2 || (r2 = this.length), t4 >= e2.length && (t4 = e2.length), t4 || (t4 = 0), 0 < r2 && r2 < n3 && (r2 = n3), r2 === n3) return 0;
                if (0 === e2.length || 0 === this.length) return 0;
                if (0 > t4) throw new RangeError("targetStart out of bounds");
                if (0 > n3 || n3 >= this.length) throw new RangeError("Index out of range");
                if (0 > r2) throw new RangeError("sourceEnd out of bounds");
                r2 > this.length && (r2 = this.length), e2.length - t4 < r2 - n3 && (r2 = e2.length - t4 + n3);
                var a = r2 - n3;
                if (this === e2 && "function" == typeof Uint8Array.prototype.copyWithin) this.copyWithin(t4, n3, r2);
                else if (this === e2 && n3 < t4 && t4 < r2) for (var o2 = a - 1; 0 <= o2; --o2) e2[o2 + t4] = this[o2 + n3];
                else Uint8Array.prototype.set.call(e2, this.subarray(n3, r2), t4);
                return a;
              }, s.prototype.fill = function(e2, t4, n3, r2) {
                if ("string" == typeof e2) {
                  if ("string" == typeof t4 ? (r2 = t4, t4 = 0, n3 = this.length) : "string" == typeof n3 && (r2 = n3, n3 = this.length), void 0 !== r2 && "string" != typeof r2) throw new TypeError("encoding must be a string");
                  if ("string" == typeof r2 && !s.isEncoding(r2)) throw new TypeError("Unknown encoding: " + r2);
                  if (1 === e2.length) {
                    var a = e2.charCodeAt(0);
                    ("utf8" === r2 && 128 > a || "latin1" === r2) && (e2 = a);
                  }
                } else "number" == typeof e2 && (e2 &= 255);
                if (0 > t4 || this.length < t4 || this.length < n3) throw new RangeError("Out of range index");
                if (n3 <= t4) return this;
                t4 >>>= 0, n3 = n3 === void 0 ? this.length : n3 >>> 0, e2 || (e2 = 0);
                var o2;
                if ("number" == typeof e2) for (o2 = t4; o2 < n3; ++o2) this[o2] = e2;
                else {
                  var d2 = s.isBuffer(e2) ? e2 : s.from(e2, r2), l2 = d2.length;
                  if (0 === l2) throw new TypeError('The value "' + e2 + '" is invalid for argument "value"');
                  for (o2 = 0; o2 < n3 - t4; ++o2) this[o2 + t4] = d2[o2 % l2];
                }
                return this;
              };
              var Q = /[^+/0-9A-Za-z-_]/g;
            }).call(this);
          }).call(this, e("buffer").Buffer);
        }, { "base64-js": 1, buffer: 3, ieee754: 9 }], 4: [function(e, t2, n2) {
          (function(a) {
            (function() {
              function r2() {
                let e2;
                try {
                  e2 = n2.storage.getItem("debug");
                } catch (e3) {
                }
                return !e2 && "undefined" != typeof a && "env" in a && (e2 = a.env.DEBUG), e2;
              }
              n2.formatArgs = function(e2) {
                if (e2[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + e2[0] + (this.useColors ? "%c " : " ") + "+" + t2.exports.humanize(this.diff), !this.useColors) return;
                const n3 = "color: " + this.color;
                e2.splice(1, 0, n3, "color: inherit");
                let r3 = 0, a2 = 0;
                e2[0].replace(/%[a-zA-Z%]/g, (e3) => {
                  "%%" === e3 || (r3++, "%c" === e3 && (a2 = r3));
                }), e2.splice(a2, 0, n3);
              }, n2.save = function(e2) {
                try {
                  e2 ? n2.storage.setItem("debug", e2) : n2.storage.removeItem("debug");
                } catch (e3) {
                }
              }, n2.load = r2, n2.useColors = function() {
                return !!("undefined" != typeof window && window.process && ("renderer" === window.process.type || window.process.__nwjs)) || !("undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) && ("undefined" != typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" != typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && 31 <= parseInt(RegExp.$1, 10) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
              }, n2.storage = (function() {
                try {
                  return localStorage;
                } catch (e2) {
                }
              })(), n2.destroy = /* @__PURE__ */ (() => {
                let e2 = false;
                return () => {
                  e2 || (e2 = true, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
                };
              })(), n2.colors = ["#0000CC", "#0000FF", "#0033CC", "#0033FF", "#0066CC", "#0066FF", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#3300CC", "#3300FF", "#3333CC", "#3333FF", "#3366CC", "#3366FF", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#6600CC", "#6600FF", "#6633CC", "#6633FF", "#66CC00", "#66CC33", "#9900CC", "#9900FF", "#9933CC", "#9933FF", "#99CC00", "#99CC33", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC9900", "#CC9933", "#CCCC00", "#CCCC33", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF9900", "#FF9933", "#FFCC00", "#FFCC33"], n2.log = console.debug || console.log || (() => {
              }), t2.exports = e("./common")(n2);
              const { formatters: o } = t2.exports;
              o.j = function(e2) {
                try {
                  return JSON.stringify(e2);
                } catch (e3) {
                  return "[UnexpectedJSONParseError]: " + e3.message;
                }
              };
            }).call(this);
          }).call(this, e("_process"));
        }, { "./common": 5, _process: 12 }], 5: [function(e, t2) {
          t2.exports = function(t3) {
            function r2(e2) {
              function t4(...e3) {
                if (!t4.enabled) return;
                const a2 = t4, o3 = +/* @__PURE__ */ new Date(), i = o3 - (n2 || o3);
                a2.diff = i, a2.prev = n2, a2.curr = o3, n2 = o3, e3[0] = r2.coerce(e3[0]), "string" != typeof e3[0] && e3.unshift("%O");
                let d = 0;
                e3[0] = e3[0].replace(/%([a-zA-Z%])/g, (t5, n3) => {
                  if ("%%" === t5) return "%";
                  d++;
                  const o4 = r2.formatters[n3];
                  if ("function" == typeof o4) {
                    const n4 = e3[d];
                    t5 = o4.call(a2, n4), e3.splice(d, 1), d--;
                  }
                  return t5;
                }), r2.formatArgs.call(a2, e3);
                const s = a2.log || r2.log;
                s.apply(a2, e3);
              }
              let n2, o2 = null;
              return t4.namespace = e2, t4.useColors = r2.useColors(), t4.color = r2.selectColor(e2), t4.extend = a, t4.destroy = r2.destroy, Object.defineProperty(t4, "enabled", { enumerable: true, configurable: false, get: () => null === o2 ? r2.enabled(e2) : o2, set: (e3) => {
                o2 = e3;
              } }), "function" == typeof r2.init && r2.init(t4), t4;
            }
            function a(e2, t4) {
              const n2 = r2(this.namespace + ("undefined" == typeof t4 ? ":" : t4) + e2);
              return n2.log = this.log, n2;
            }
            function o(e2) {
              return e2.toString().substring(2, e2.toString().length - 2).replace(/\.\*\?$/, "*");
            }
            return r2.debug = r2, r2.default = r2, r2.coerce = function(e2) {
              return e2 instanceof Error ? e2.stack || e2.message : e2;
            }, r2.disable = function() {
              const e2 = [...r2.names.map(o), ...r2.skips.map(o).map((e3) => "-" + e3)].join(",");
              return r2.enable(""), e2;
            }, r2.enable = function(e2) {
              r2.save(e2), r2.names = [], r2.skips = [];
              let t4;
              const n2 = ("string" == typeof e2 ? e2 : "").split(/[\s,]+/), a2 = n2.length;
              for (t4 = 0; t4 < a2; t4++) n2[t4] && (e2 = n2[t4].replace(/\*/g, ".*?"), "-" === e2[0] ? r2.skips.push(new RegExp("^" + e2.substr(1) + "$")) : r2.names.push(new RegExp("^" + e2 + "$")));
            }, r2.enabled = function(e2) {
              if ("*" === e2[e2.length - 1]) return true;
              let t4, n2;
              for (t4 = 0, n2 = r2.skips.length; t4 < n2; t4++) if (r2.skips[t4].test(e2)) return false;
              for (t4 = 0, n2 = r2.names.length; t4 < n2; t4++) if (r2.names[t4].test(e2)) return true;
              return false;
            }, r2.humanize = e("ms"), r2.destroy = function() {
              console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
            }, Object.keys(t3).forEach((e2) => {
              r2[e2] = t3[e2];
            }), r2.names = [], r2.skips = [], r2.formatters = {}, r2.selectColor = function(e2) {
              let t4 = 0;
              for (let n2 = 0; n2 < e2.length; n2++) t4 = (t4 << 5) - t4 + e2.charCodeAt(n2), t4 |= 0;
              return r2.colors[n(t4) % r2.colors.length];
            }, r2.enable(r2.load()), r2;
          };
        }, { ms: 11 }], 6: [function(e, t2) {
          "use strict";
          function n2(e2, t3) {
            for (const n3 in t3) Object.defineProperty(e2, n3, { value: t3[n3], enumerable: true, configurable: true });
            return e2;
          }
          t2.exports = function(e2, t3, r2) {
            if (!e2 || "string" == typeof e2) throw new TypeError("Please pass an Error to err-code");
            r2 || (r2 = {}), "object" == typeof t3 && (r2 = t3, t3 = ""), t3 && (r2.code = t3);
            try {
              return n2(e2, r2);
            } catch (t4) {
              r2.message = e2.message, r2.stack = e2.stack;
              const a = function() {
              };
              a.prototype = Object.create(Object.getPrototypeOf(e2));
              const o = n2(new a(), r2);
              return o;
            }
          };
        }, {}], 7: [function(e, t2) {
          "use strict";
          function n2(e2) {
            console && console.warn && console.warn(e2);
          }
          function r2() {
            r2.init.call(this);
          }
          function a(e2) {
            if ("function" != typeof e2) throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof e2);
          }
          function o(e2) {
            return void 0 === e2._maxListeners ? r2.defaultMaxListeners : e2._maxListeners;
          }
          function i(e2, t3, r3, i2) {
            var d2, s2, l2;
            if (a(r3), s2 = e2._events, void 0 === s2 ? (s2 = e2._events = /* @__PURE__ */ Object.create(null), e2._eventsCount = 0) : (void 0 !== s2.newListener && (e2.emit("newListener", t3, r3.listener ? r3.listener : r3), s2 = e2._events), l2 = s2[t3]), void 0 === l2) l2 = s2[t3] = r3, ++e2._eventsCount;
            else if ("function" == typeof l2 ? l2 = s2[t3] = i2 ? [r3, l2] : [l2, r3] : i2 ? l2.unshift(r3) : l2.push(r3), d2 = o(e2), 0 < d2 && l2.length > d2 && !l2.warned) {
              l2.warned = true;
              var c2 = new Error("Possible EventEmitter memory leak detected. " + l2.length + " " + (t3 + " listeners added. Use emitter.setMaxListeners() to increase limit"));
              c2.name = "MaxListenersExceededWarning", c2.emitter = e2, c2.type = t3, c2.count = l2.length, n2(c2);
            }
            return e2;
          }
          function d() {
            if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = true, 0 === arguments.length ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
          }
          function s(e2, t3, n3) {
            var r3 = { fired: false, wrapFn: void 0, target: e2, type: t3, listener: n3 }, a2 = d.bind(r3);
            return a2.listener = n3, r3.wrapFn = a2, a2;
          }
          function l(e2, t3, n3) {
            var r3 = e2._events;
            if (r3 === void 0) return [];
            var a2 = r3[t3];
            return void 0 === a2 ? [] : "function" == typeof a2 ? n3 ? [a2.listener || a2] : [a2] : n3 ? f(a2) : u(a2, a2.length);
          }
          function c(e2) {
            var t3 = this._events;
            if (t3 !== void 0) {
              var n3 = t3[e2];
              if ("function" == typeof n3) return 1;
              if (void 0 !== n3) return n3.length;
            }
            return 0;
          }
          function u(e2, t3) {
            for (var n3 = Array(t3), r3 = 0; r3 < t3; ++r3) n3[r3] = e2[r3];
            return n3;
          }
          function p(e2, t3) {
            for (; t3 + 1 < e2.length; t3++) e2[t3] = e2[t3 + 1];
            e2.pop();
          }
          function f(e2) {
            for (var t3 = Array(e2.length), n3 = 0; n3 < t3.length; ++n3) t3[n3] = e2[n3].listener || e2[n3];
            return t3;
          }
          function g(e2, t3, n3) {
            "function" == typeof e2.on && _(e2, "error", t3, n3);
          }
          function _(e2, t3, n3, r3) {
            if ("function" == typeof e2.on) r3.once ? e2.once(t3, n3) : e2.on(t3, n3);
            else if ("function" == typeof e2.addEventListener) e2.addEventListener(t3, function a2(o2) {
              r3.once && e2.removeEventListener(t3, a2), n3(o2);
            });
            else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof e2);
          }
          var h, m = "object" == typeof Reflect ? Reflect : null, b = m && "function" == typeof m.apply ? m.apply : function(e2, t3, n3) {
            return Function.prototype.apply.call(e2, t3, n3);
          };
          h = m && "function" == typeof m.ownKeys ? m.ownKeys : Object.getOwnPropertySymbols ? function(e2) {
            return Object.getOwnPropertyNames(e2).concat(Object.getOwnPropertySymbols(e2));
          } : function(e2) {
            return Object.getOwnPropertyNames(e2);
          };
          var y = Number.isNaN || function(e2) {
            return e2 !== e2;
          };
          t2.exports = r2, t2.exports.once = function(e2, t3) {
            return new Promise(function(n3, r3) {
              function a2(n4) {
                e2.removeListener(t3, o2), r3(n4);
              }
              function o2() {
                "function" == typeof e2.removeListener && e2.removeListener("error", a2), n3([].slice.call(arguments));
              }
              _(e2, t3, o2, { once: true }), "error" !== t3 && g(e2, a2, { once: true });
            });
          }, r2.EventEmitter = r2, r2.prototype._events = void 0, r2.prototype._eventsCount = 0, r2.prototype._maxListeners = void 0;
          var C = 10;
          Object.defineProperty(r2, "defaultMaxListeners", { enumerable: true, get: function() {
            return C;
          }, set: function(e2) {
            if ("number" != typeof e2 || 0 > e2 || y(e2)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + e2 + ".");
            C = e2;
          } }), r2.init = function() {
            (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
          }, r2.prototype.setMaxListeners = function(e2) {
            if ("number" != typeof e2 || 0 > e2 || y(e2)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e2 + ".");
            return this._maxListeners = e2, this;
          }, r2.prototype.getMaxListeners = function() {
            return o(this);
          }, r2.prototype.emit = function(e2) {
            for (var t3 = [], n3 = 1; n3 < arguments.length; n3++) t3.push(arguments[n3]);
            var r3 = "error" === e2, a2 = this._events;
            if (a2 !== void 0) r3 = r3 && a2.error === void 0;
            else if (!r3) return false;
            if (r3) {
              var o2;
              if (0 < t3.length && (o2 = t3[0]), o2 instanceof Error) throw o2;
              var d2 = new Error("Unhandled error." + (o2 ? " (" + o2.message + ")" : ""));
              throw d2.context = o2, d2;
            }
            var s2 = a2[e2];
            if (s2 === void 0) return false;
            if ("function" == typeof s2) b(s2, this, t3);
            else for (var l2 = s2.length, c2 = u(s2, l2), n3 = 0; n3 < l2; ++n3) b(c2[n3], this, t3);
            return true;
          }, r2.prototype.addListener = function(e2, t3) {
            return i(this, e2, t3, false);
          }, r2.prototype.on = r2.prototype.addListener, r2.prototype.prependListener = function(e2, t3) {
            return i(this, e2, t3, true);
          }, r2.prototype.once = function(e2, t3) {
            return a(t3), this.on(e2, s(this, e2, t3)), this;
          }, r2.prototype.prependOnceListener = function(e2, t3) {
            return a(t3), this.prependListener(e2, s(this, e2, t3)), this;
          }, r2.prototype.removeListener = function(e2, t3) {
            var n3, r3, o2, d2, s2;
            if (a(t3), r3 = this._events, void 0 === r3) return this;
            if (n3 = r3[e2], void 0 === n3) return this;
            if (n3 === t3 || n3.listener === t3) 0 == --this._eventsCount ? this._events = /* @__PURE__ */ Object.create(null) : (delete r3[e2], r3.removeListener && this.emit("removeListener", e2, n3.listener || t3));
            else if ("function" != typeof n3) {
              for (o2 = -1, d2 = n3.length - 1; 0 <= d2; d2--) if (n3[d2] === t3 || n3[d2].listener === t3) {
                s2 = n3[d2].listener, o2 = d2;
                break;
              }
              if (0 > o2) return this;
              0 === o2 ? n3.shift() : p(n3, o2), 1 === n3.length && (r3[e2] = n3[0]), void 0 !== r3.removeListener && this.emit("removeListener", e2, s2 || t3);
            }
            return this;
          }, r2.prototype.off = r2.prototype.removeListener, r2.prototype.removeAllListeners = function(e2) {
            var t3, n3, r3;
            if (n3 = this._events, void 0 === n3) return this;
            if (void 0 === n3.removeListener) return 0 === arguments.length ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : void 0 !== n3[e2] && (0 == --this._eventsCount ? this._events = /* @__PURE__ */ Object.create(null) : delete n3[e2]), this;
            if (0 === arguments.length) {
              var a2, o2 = Object.keys(n3);
              for (r3 = 0; r3 < o2.length; ++r3) a2 = o2[r3], "removeListener" !== a2 && this.removeAllListeners(a2);
              return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
            }
            if (t3 = n3[e2], "function" == typeof t3) this.removeListener(e2, t3);
            else if (void 0 !== t3) for (r3 = t3.length - 1; 0 <= r3; r3--) this.removeListener(e2, t3[r3]);
            return this;
          }, r2.prototype.listeners = function(e2) {
            return l(this, e2, true);
          }, r2.prototype.rawListeners = function(e2) {
            return l(this, e2, false);
          }, r2.listenerCount = function(e2, t3) {
            return "function" == typeof e2.listenerCount ? e2.listenerCount(t3) : c.call(e2, t3);
          }, r2.prototype.listenerCount = c, r2.prototype.eventNames = function() {
            return 0 < this._eventsCount ? h(this._events) : [];
          };
        }, {}], 8: [function(e, t2) {
          t2.exports = function() {
            if ("undefined" == typeof globalThis) return null;
            var e2 = { RTCPeerConnection: globalThis.RTCPeerConnection || globalThis.mozRTCPeerConnection || globalThis.webkitRTCPeerConnection, RTCSessionDescription: globalThis.RTCSessionDescription || globalThis.mozRTCSessionDescription || globalThis.webkitRTCSessionDescription, RTCIceCandidate: globalThis.RTCIceCandidate || globalThis.mozRTCIceCandidate || globalThis.webkitRTCIceCandidate };
            return e2.RTCPeerConnection ? e2 : null;
          };
        }, {}], 9: [function(e, a, o) {
          o.read = function(t2, n2, a2, o2, l) {
            var c, u, p = 8 * l - o2 - 1, f = (1 << p) - 1, g = f >> 1, _ = -7, h = a2 ? l - 1 : 0, b = a2 ? -1 : 1, d = t2[n2 + h];
            for (h += b, c = d & (1 << -_) - 1, d >>= -_, _ += p; 0 < _; c = 256 * c + t2[n2 + h], h += b, _ -= 8) ;
            for (u = c & (1 << -_) - 1, c >>= -_, _ += o2; 0 < _; u = 256 * u + t2[n2 + h], h += b, _ -= 8) ;
            if (0 === c) c = 1 - g;
            else {
              if (c === f) return u ? NaN : (d ? -1 : 1) * (1 / 0);
              u += r(2, o2), c -= g;
            }
            return (d ? -1 : 1) * u * r(2, c - o2);
          }, o.write = function(a2, o2, l, u, p, f) {
            var h, b, y, g = Math.LN2, _ = Math.log, C = 8 * f - p - 1, R = (1 << C) - 1, E = R >> 1, w = 23 === p ? r(2, -24) - r(2, -77) : 0, S = u ? 0 : f - 1, T = u ? 1 : -1, d = 0 > o2 || 0 === o2 && 0 > 1 / o2 ? 1 : 0;
            for (o2 = n(o2), isNaN(o2) || o2 === 1 / 0 ? (b = isNaN(o2) ? 1 : 0, h = R) : (h = t(_(o2) / g), 1 > o2 * (y = r(2, -h)) && (h--, y *= 2), o2 += 1 <= h + E ? w / y : w * r(2, 1 - E), 2 <= o2 * y && (h++, y /= 2), h + E >= R ? (b = 0, h = R) : 1 <= h + E ? (b = (o2 * y - 1) * r(2, p), h += E) : (b = o2 * r(2, E - 1) * r(2, p), h = 0)); 8 <= p; a2[l + S] = 255 & b, S += T, b /= 256, p -= 8) ;
            for (h = h << p | b, C += p; 0 < C; a2[l + S] = 255 & h, S += T, h /= 256, C -= 8) ;
            a2[l + S - T] |= 128 * d;
          };
        }, {}], 10: [function(e, t2) {
          t2.exports = "function" == typeof Object.create ? function(e2, t3) {
            t3 && (e2.super_ = t3, e2.prototype = Object.create(t3.prototype, { constructor: { value: e2, enumerable: false, writable: true, configurable: true } }));
          } : function(e2, t3) {
            if (t3) {
              e2.super_ = t3;
              var n2 = function() {
              };
              n2.prototype = t3.prototype, e2.prototype = new n2(), e2.prototype.constructor = e2;
            }
          };
        }, {}], 11: [function(e, t2) {
          var r2 = Math.round;
          function a(e2) {
            if (e2 += "", !(100 < e2.length)) {
              var t3 = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(e2);
              if (t3) {
                var r3 = parseFloat(t3[1]), n2 = (t3[2] || "ms").toLowerCase();
                return "years" === n2 || "year" === n2 || "yrs" === n2 || "yr" === n2 || "y" === n2 ? 315576e5 * r3 : "weeks" === n2 || "week" === n2 || "w" === n2 ? 6048e5 * r3 : "days" === n2 || "day" === n2 || "d" === n2 ? 864e5 * r3 : "hours" === n2 || "hour" === n2 || "hrs" === n2 || "hr" === n2 || "h" === n2 ? 36e5 * r3 : "minutes" === n2 || "minute" === n2 || "mins" === n2 || "min" === n2 || "m" === n2 ? 6e4 * r3 : "seconds" === n2 || "second" === n2 || "secs" === n2 || "sec" === n2 || "s" === n2 ? 1e3 * r3 : "milliseconds" === n2 || "millisecond" === n2 || "msecs" === n2 || "msec" === n2 || "ms" === n2 ? r3 : void 0;
              }
            }
          }
          function o(e2) {
            var t3 = n(e2);
            return 864e5 <= t3 ? r2(e2 / 864e5) + "d" : 36e5 <= t3 ? r2(e2 / 36e5) + "h" : 6e4 <= t3 ? r2(e2 / 6e4) + "m" : 1e3 <= t3 ? r2(e2 / 1e3) + "s" : e2 + "ms";
          }
          function i(e2) {
            var t3 = n(e2);
            return 864e5 <= t3 ? s(e2, t3, 864e5, "day") : 36e5 <= t3 ? s(e2, t3, 36e5, "hour") : 6e4 <= t3 ? s(e2, t3, 6e4, "minute") : 1e3 <= t3 ? s(e2, t3, 1e3, "second") : e2 + " ms";
          }
          function s(e2, t3, a2, n2) {
            return r2(e2 / a2) + " " + n2 + (t3 >= 1.5 * a2 ? "s" : "");
          }
          var l = 24 * (60 * 6e4);
          t2.exports = function(e2, t3) {
            t3 = t3 || {};
            var n2 = typeof e2;
            if ("string" == n2 && 0 < e2.length) return a(e2);
            if ("number" === n2 && isFinite(e2)) return t3.long ? i(e2) : o(e2);
            throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(e2));
          };
        }, {}], 12: [function(e, t2) {
          function n2() {
            throw new Error("setTimeout has not been defined");
          }
          function r2() {
            throw new Error("clearTimeout has not been defined");
          }
          function a(t3) {
            if (c === setTimeout) return setTimeout(t3, 0);
            if ((c === n2 || !c) && setTimeout) return c = setTimeout, setTimeout(t3, 0);
            try {
              return c(t3, 0);
            } catch (n3) {
              try {
                return c.call(null, t3, 0);
              } catch (n4) {
                return c.call(this, t3, 0);
              }
            }
          }
          function o(t3) {
            if (u === clearTimeout) return clearTimeout(t3);
            if ((u === r2 || !u) && clearTimeout) return u = clearTimeout, clearTimeout(t3);
            try {
              return u(t3);
            } catch (n3) {
              try {
                return u.call(null, t3);
              } catch (n4) {
                return u.call(this, t3);
              }
            }
          }
          function i() {
            _ && f && (_ = false, f.length ? g = f.concat(g) : h = -1, g.length && d());
          }
          function d() {
            if (!_) {
              var e2 = a(i);
              _ = true;
              for (var t3 = g.length; t3; ) {
                for (f = g, g = []; ++h < t3; ) f && f[h].run();
                h = -1, t3 = g.length;
              }
              f = null, _ = false, o(e2);
            }
          }
          function s(e2, t3) {
            this.fun = e2, this.array = t3;
          }
          function l() {
          }
          var c, u, p = t2.exports = {};
          (function() {
            try {
              c = "function" == typeof setTimeout ? setTimeout : n2;
            } catch (t3) {
              c = n2;
            }
            try {
              u = "function" == typeof clearTimeout ? clearTimeout : r2;
            } catch (t3) {
              u = r2;
            }
          })();
          var f, g = [], _ = false, h = -1;
          p.nextTick = function(e2) {
            var t3 = Array(arguments.length - 1);
            if (1 < arguments.length) for (var n3 = 1; n3 < arguments.length; n3++) t3[n3 - 1] = arguments[n3];
            g.push(new s(e2, t3)), 1 !== g.length || _ || a(d);
          }, s.prototype.run = function() {
            this.fun.apply(null, this.array);
          }, p.title = "browser", p.browser = true, p.env = {}, p.argv = [], p.version = "", p.versions = {}, p.on = l, p.addListener = l, p.once = l, p.off = l, p.removeListener = l, p.removeAllListeners = l, p.emit = l, p.prependListener = l, p.prependOnceListener = l, p.listeners = function() {
            return [];
          }, p.binding = function() {
            throw new Error("process.binding is not supported");
          }, p.cwd = function() {
            return "/";
          }, p.chdir = function() {
            throw new Error("process.chdir is not supported");
          }, p.umask = function() {
            return 0;
          };
        }, {}], 13: [function(e, t2) {
          (function(e2) {
            (function() {
              let n2;
              t2.exports = "function" == typeof queueMicrotask ? queueMicrotask.bind("undefined" == typeof window ? e2 : window) : (e3) => (n2 || (n2 = Promise.resolve())).then(e3).catch((e4) => setTimeout(() => {
                throw e4;
              }, 0));
            }).call(this);
          }).call(this, "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global);
        }, {}], 14: [function(e, t2) {
          (function(n2, r2) {
            (function() {
              "use strict";
              var a = e("safe-buffer").Buffer, o = r2.crypto || r2.msCrypto;
              t2.exports = o && o.getRandomValues ? function(e2, t3) {
                if (e2 > 4294967295) throw new RangeError("requested too many random bytes");
                var r3 = a.allocUnsafe(e2);
                if (0 < e2) if (65536 < e2) for (var i = 0; i < e2; i += 65536) o.getRandomValues(r3.slice(i, i + 65536));
                else o.getRandomValues(r3);
                return "function" == typeof t3 ? n2.nextTick(function() {
                  t3(null, r3);
                }) : r3;
              } : function() {
                throw new Error("Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11");
              };
            }).call(this);
          }).call(this, e("_process"), "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global);
        }, { _process: 12, "safe-buffer": 30 }], 15: [function(e, t2) {
          "use strict";
          function n2(e2, t3) {
            e2.prototype = Object.create(t3.prototype), e2.prototype.constructor = e2, e2.__proto__ = t3;
          }
          function r2(e2, t3, r3) {
            function a2(e3, n3, r4) {
              return "string" == typeof t3 ? t3 : t3(e3, n3, r4);
            }
            r3 || (r3 = Error);
            var o2 = (function(e3) {
              function t4(t5, n3, r4) {
                return e3.call(this, a2(t5, n3, r4)) || this;
              }
              return n2(t4, e3), t4;
            })(r3);
            o2.prototype.name = r3.name, o2.prototype.code = e2, s[e2] = o2;
          }
          function a(e2, t3) {
            if (Array.isArray(e2)) {
              var n3 = e2.length;
              return e2 = e2.map(function(e3) {
                return e3 + "";
              }), 2 < n3 ? "one of ".concat(t3, " ").concat(e2.slice(0, n3 - 1).join(", "), ", or ") + e2[n3 - 1] : 2 === n3 ? "one of ".concat(t3, " ").concat(e2[0], " or ").concat(e2[1]) : "of ".concat(t3, " ").concat(e2[0]);
            }
            return "of ".concat(t3, " ").concat(e2 + "");
          }
          function o(e2, t3, n3) {
            return e2.substr(!n3 || 0 > n3 ? 0 : +n3, t3.length) === t3;
          }
          function i(e2, t3, n3) {
            return (void 0 === n3 || n3 > e2.length) && (n3 = e2.length), e2.substring(n3 - t3.length, n3) === t3;
          }
          function d(e2, t3, n3) {
            return "number" != typeof n3 && (n3 = 0), !(n3 + t3.length > e2.length) && -1 !== e2.indexOf(t3, n3);
          }
          var s = {};
          r2("ERR_INVALID_OPT_VALUE", function(e2, t3) {
            return 'The value "' + t3 + '" is invalid for option "' + e2 + '"';
          }, TypeError), r2("ERR_INVALID_ARG_TYPE", function(e2, t3, n3) {
            var r3;
            "string" == typeof t3 && o(t3, "not ") ? (r3 = "must not be", t3 = t3.replace(/^not /, "")) : r3 = "must be";
            var s2;
            if (i(e2, " argument")) s2 = "The ".concat(e2, " ").concat(r3, " ").concat(a(t3, "type"));
            else {
              var l = d(e2, ".") ? "property" : "argument";
              s2 = 'The "'.concat(e2, '" ').concat(l, " ").concat(r3, " ").concat(a(t3, "type"));
            }
            return s2 += ". Received type ".concat(typeof n3), s2;
          }, TypeError), r2("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF"), r2("ERR_METHOD_NOT_IMPLEMENTED", function(e2) {
            return "The " + e2 + " method is not implemented";
          }), r2("ERR_STREAM_PREMATURE_CLOSE", "Premature close"), r2("ERR_STREAM_DESTROYED", function(e2) {
            return "Cannot call " + e2 + " after a stream was destroyed";
          }), r2("ERR_MULTIPLE_CALLBACK", "Callback called multiple times"), r2("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable"), r2("ERR_STREAM_WRITE_AFTER_END", "write after end"), r2("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError), r2("ERR_UNKNOWN_ENCODING", function(e2) {
            return "Unknown encoding: " + e2;
          }, TypeError), r2("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event"), t2.exports.codes = s;
        }, {}], 16: [function(e, t2) {
          (function(n2) {
            (function() {
              "use strict";
              function r2(e2) {
                return this instanceof r2 ? void (d.call(this, e2), s.call(this, e2), this.allowHalfOpen = true, e2 && (false === e2.readable && (this.readable = false), false === e2.writable && (this.writable = false), false === e2.allowHalfOpen && (this.allowHalfOpen = false, this.once("end", a)))) : new r2(e2);
              }
              function a() {
                this._writableState.ended || n2.nextTick(o, this);
              }
              function o(e2) {
                e2.end();
              }
              var i = Object.keys || function(e2) {
                var t3 = [];
                for (var n3 in e2) t3.push(n3);
                return t3;
              };
              t2.exports = r2;
              var d = e("./_stream_readable"), s = e("./_stream_writable");
              e("inherits")(r2, d);
              for (var l, c = i(s.prototype), u = 0; u < c.length; u++) l = c[u], r2.prototype[l] || (r2.prototype[l] = s.prototype[l]);
              Object.defineProperty(r2.prototype, "writableHighWaterMark", { enumerable: false, get: function() {
                return this._writableState.highWaterMark;
              } }), Object.defineProperty(r2.prototype, "writableBuffer", { enumerable: false, get: function() {
                return this._writableState && this._writableState.getBuffer();
              } }), Object.defineProperty(r2.prototype, "writableLength", { enumerable: false, get: function() {
                return this._writableState.length;
              } }), Object.defineProperty(r2.prototype, "destroyed", { enumerable: false, get: function() {
                return void 0 !== this._readableState && void 0 !== this._writableState && this._readableState.destroyed && this._writableState.destroyed;
              }, set: function(e2) {
                void 0 === this._readableState || void 0 === this._writableState || (this._readableState.destroyed = e2, this._writableState.destroyed = e2);
              } });
            }).call(this);
          }).call(this, e("_process"));
        }, { "./_stream_readable": 18, "./_stream_writable": 20, _process: 12, inherits: 10 }], 17: [function(e, t2) {
          "use strict";
          function n2(e2) {
            return this instanceof n2 ? void r2.call(this, e2) : new n2(e2);
          }
          t2.exports = n2;
          var r2 = e("./_stream_transform");
          e("inherits")(n2, r2), n2.prototype._transform = function(e2, t3, n3) {
            n3(null, e2);
          };
        }, { "./_stream_transform": 19, inherits: 10 }], 18: [function(e, t2) {
          (function(n2, r2) {
            (function() {
              "use strict";
              function a(e2) {
                return P.from(e2);
              }
              function o(e2) {
                return P.isBuffer(e2) || e2 instanceof M;
              }
              function i(e2, t3, n3) {
                return "function" == typeof e2.prependListener ? e2.prependListener(t3, n3) : void (e2._events && e2._events[t3] ? Array.isArray(e2._events[t3]) ? e2._events[t3].unshift(n3) : e2._events[t3] = [n3, e2._events[t3]] : e2.on(t3, n3));
              }
              function d(t3, n3, r3) {
                A = A || e("./_stream_duplex"), t3 = t3 || {}, "boolean" != typeof r3 && (r3 = n3 instanceof A), this.objectMode = !!t3.objectMode, r3 && (this.objectMode = this.objectMode || !!t3.readableObjectMode), this.highWaterMark = H(this, t3, "readableHighWaterMark", r3), this.buffer = new j(), this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = false, this.endEmitted = false, this.reading = false, this.sync = true, this.needReadable = false, this.emittedReadable = false, this.readableListening = false, this.resumeScheduled = false, this.paused = true, this.emitClose = false !== t3.emitClose, this.autoDestroy = !!t3.autoDestroy, this.destroyed = false, this.defaultEncoding = t3.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = false, this.decoder = null, this.encoding = null, t3.encoding && (!F && (F = e("string_decoder/").StringDecoder), this.decoder = new F(t3.encoding), this.encoding = t3.encoding);
              }
              function s(t3) {
                if (A = A || e("./_stream_duplex"), !(this instanceof s)) return new s(t3);
                var n3 = this instanceof A;
                this._readableState = new d(t3, this, n3), this.readable = true, t3 && ("function" == typeof t3.read && (this._read = t3.read), "function" == typeof t3.destroy && (this._destroy = t3.destroy)), I.call(this);
              }
              function l(e2, t3, n3, r3, o2) {
                x("readableAddChunk", t3);
                var i2 = e2._readableState;
                if (null === t3) i2.reading = false, g(e2, i2);
                else {
                  var d2;
                  if (o2 || (d2 = u(i2, t3)), d2) X(e2, d2);
                  else if (!(i2.objectMode || t3 && 0 < t3.length)) r3 || (i2.reading = false, m(e2, i2));
                  else if ("string" == typeof t3 || i2.objectMode || Object.getPrototypeOf(t3) === P.prototype || (t3 = a(t3)), r3) i2.endEmitted ? X(e2, new K()) : c(e2, i2, t3, true);
                  else if (i2.ended) X(e2, new z());
                  else {
                    if (i2.destroyed) return false;
                    i2.reading = false, i2.decoder && !n3 ? (t3 = i2.decoder.write(t3), i2.objectMode || 0 !== t3.length ? c(e2, i2, t3, false) : m(e2, i2)) : c(e2, i2, t3, false);
                  }
                }
                return !i2.ended && (i2.length < i2.highWaterMark || 0 === i2.length);
              }
              function c(e2, t3, n3, r3) {
                t3.flowing && 0 === t3.length && !t3.sync ? (t3.awaitDrain = 0, e2.emit("data", n3)) : (t3.length += t3.objectMode ? 1 : n3.length, r3 ? t3.buffer.unshift(n3) : t3.buffer.push(n3), t3.needReadable && _(e2)), m(e2, t3);
              }
              function u(e2, t3) {
                var n3;
                return o(t3) || "string" == typeof t3 || void 0 === t3 || e2.objectMode || (n3 = new V("chunk", ["string", "Buffer", "Uint8Array"], t3)), n3;
              }
              function p(e2) {
                return 1073741824 <= e2 ? e2 = 1073741824 : (e2--, e2 |= e2 >>> 1, e2 |= e2 >>> 2, e2 |= e2 >>> 4, e2 |= e2 >>> 8, e2 |= e2 >>> 16, e2++), e2;
              }
              function f(e2, t3) {
                return 0 >= e2 || 0 === t3.length && t3.ended ? 0 : t3.objectMode ? 1 : e2 === e2 ? (e2 > t3.highWaterMark && (t3.highWaterMark = p(e2)), e2 <= t3.length ? e2 : t3.ended ? t3.length : (t3.needReadable = true, 0)) : t3.flowing && t3.length ? t3.buffer.head.data.length : t3.length;
              }
              function g(e2, t3) {
                if (x("onEofChunk"), !t3.ended) {
                  if (t3.decoder) {
                    var n3 = t3.decoder.end();
                    n3 && n3.length && (t3.buffer.push(n3), t3.length += t3.objectMode ? 1 : n3.length);
                  }
                  t3.ended = true, t3.sync ? _(e2) : (t3.needReadable = false, !t3.emittedReadable && (t3.emittedReadable = true, h(e2)));
                }
              }
              function _(e2) {
                var t3 = e2._readableState;
                x("emitReadable", t3.needReadable, t3.emittedReadable), t3.needReadable = false, t3.emittedReadable || (x("emitReadable", t3.flowing), t3.emittedReadable = true, n2.nextTick(h, e2));
              }
              function h(e2) {
                var t3 = e2._readableState;
                x("emitReadable_", t3.destroyed, t3.length, t3.ended), !t3.destroyed && (t3.length || t3.ended) && (e2.emit("readable"), t3.emittedReadable = false), t3.needReadable = !t3.flowing && !t3.ended && t3.length <= t3.highWaterMark, S(e2);
              }
              function m(e2, t3) {
                t3.readingMore || (t3.readingMore = true, n2.nextTick(b, e2, t3));
              }
              function b(e2, t3) {
                for (; !t3.reading && !t3.ended && (t3.length < t3.highWaterMark || t3.flowing && 0 === t3.length); ) {
                  var n3 = t3.length;
                  if (x("maybeReadMore read 0"), e2.read(0), n3 === t3.length) break;
                }
                t3.readingMore = false;
              }
              function y(e2) {
                return function() {
                  var t3 = e2._readableState;
                  x("pipeOnDrain", t3.awaitDrain), t3.awaitDrain && t3.awaitDrain--, 0 === t3.awaitDrain && D(e2, "data") && (t3.flowing = true, S(e2));
                };
              }
              function C(e2) {
                var t3 = e2._readableState;
                t3.readableListening = 0 < e2.listenerCount("readable"), t3.resumeScheduled && !t3.paused ? t3.flowing = true : 0 < e2.listenerCount("data") && e2.resume();
              }
              function R(e2) {
                x("readable nexttick read 0"), e2.read(0);
              }
              function E(e2, t3) {
                t3.resumeScheduled || (t3.resumeScheduled = true, n2.nextTick(w, e2, t3));
              }
              function w(e2, t3) {
                x("resume", t3.reading), t3.reading || e2.read(0), t3.resumeScheduled = false, e2.emit("resume"), S(e2), t3.flowing && !t3.reading && e2.read(0);
              }
              function S(e2) {
                var t3 = e2._readableState;
                for (x("flow", t3.flowing); t3.flowing && null !== e2.read(); ) ;
              }
              function T(e2, t3) {
                if (0 === t3.length) return null;
                var n3;
                return t3.objectMode ? n3 = t3.buffer.shift() : !e2 || e2 >= t3.length ? (n3 = t3.decoder ? t3.buffer.join("") : 1 === t3.buffer.length ? t3.buffer.first() : t3.buffer.concat(t3.length), t3.buffer.clear()) : n3 = t3.buffer.consume(e2, t3.decoder), n3;
              }
              function v(e2) {
                var t3 = e2._readableState;
                x("endReadable", t3.endEmitted), t3.endEmitted || (t3.ended = true, n2.nextTick(k, t3, e2));
              }
              function k(e2, t3) {
                if (x("endReadableNT", e2.endEmitted, e2.length), !e2.endEmitted && 0 === e2.length && (e2.endEmitted = true, t3.readable = false, t3.emit("end"), e2.autoDestroy)) {
                  var n3 = t3._writableState;
                  (!n3 || n3.autoDestroy && n3.finished) && t3.destroy();
                }
              }
              function L(e2, t3) {
                for (var n3 = 0, r3 = e2.length; n3 < r3; n3++) if (e2[n3] === t3) return n3;
                return -1;
              }
              t2.exports = s;
              var A;
              s.ReadableState = d;
              var x, N = e("events").EventEmitter, D = function(e2, t3) {
                return e2.listeners(t3).length;
              }, I = e("./internal/streams/stream"), P = e("buffer").Buffer, M = r2.Uint8Array || function() {
              }, O = e("util");
              x = O && O.debuglog ? O.debuglog("stream") : function() {
              };
              var F, B, U, j = e("./internal/streams/buffer_list"), q = e("./internal/streams/destroy"), W = e("./internal/streams/state"), H = W.getHighWaterMark, Y = e("../errors").codes, V = Y.ERR_INVALID_ARG_TYPE, z = Y.ERR_STREAM_PUSH_AFTER_EOF, G = Y.ERR_METHOD_NOT_IMPLEMENTED, K = Y.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
              e("inherits")(s, I);
              var X = q.errorOrDestroy, $2 = ["error", "close", "destroy", "pause", "resume"];
              Object.defineProperty(s.prototype, "destroyed", { enumerable: false, get: function() {
                return void 0 !== this._readableState && this._readableState.destroyed;
              }, set: function(e2) {
                this._readableState && (this._readableState.destroyed = e2);
              } }), s.prototype.destroy = q.destroy, s.prototype._undestroy = q.undestroy, s.prototype._destroy = function(e2, t3) {
                t3(e2);
              }, s.prototype.push = function(e2, t3) {
                var n3, r3 = this._readableState;
                return r3.objectMode ? n3 = true : "string" == typeof e2 && (t3 = t3 || r3.defaultEncoding, t3 !== r3.encoding && (e2 = P.from(e2, t3), t3 = ""), n3 = true), l(this, e2, t3, false, n3);
              }, s.prototype.unshift = function(e2) {
                return l(this, e2, null, true, false);
              }, s.prototype.isPaused = function() {
                return false === this._readableState.flowing;
              }, s.prototype.setEncoding = function(t3) {
                F || (F = e("string_decoder/").StringDecoder);
                var n3 = new F(t3);
                this._readableState.decoder = n3, this._readableState.encoding = this._readableState.decoder.encoding;
                for (var r3 = this._readableState.buffer.head, a2 = ""; null !== r3; ) a2 += n3.write(r3.data), r3 = r3.next;
                return this._readableState.buffer.clear(), "" !== a2 && this._readableState.buffer.push(a2), this._readableState.length = a2.length, this;
              };
              s.prototype.read = function(e2) {
                x("read", e2), e2 = parseInt(e2, 10);
                var t3 = this._readableState, r3 = e2;
                if (0 !== e2 && (t3.emittedReadable = false), 0 === e2 && t3.needReadable && ((0 === t3.highWaterMark ? 0 < t3.length : t3.length >= t3.highWaterMark) || t3.ended)) return x("read: emitReadable", t3.length, t3.ended), 0 === t3.length && t3.ended ? v(this) : _(this), null;
                if (e2 = f(e2, t3), 0 === e2 && t3.ended) return 0 === t3.length && v(this), null;
                var a2 = t3.needReadable;
                x("need readable", a2), (0 === t3.length || t3.length - e2 < t3.highWaterMark) && (a2 = true, x("length less than watermark", a2)), t3.ended || t3.reading ? (a2 = false, x("reading or ended", a2)) : a2 && (x("do read"), t3.reading = true, t3.sync = true, 0 === t3.length && (t3.needReadable = true), this._read(t3.highWaterMark), t3.sync = false, !t3.reading && (e2 = f(r3, t3)));
                var o2;
                return o2 = 0 < e2 ? T(e2, t3) : null, null === o2 ? (t3.needReadable = t3.length <= t3.highWaterMark, e2 = 0) : (t3.length -= e2, t3.awaitDrain = 0), 0 === t3.length && (!t3.ended && (t3.needReadable = true), r3 !== e2 && t3.ended && v(this)), null !== o2 && this.emit("data", o2), o2;
              }, s.prototype._read = function() {
                X(this, new G("_read()"));
              }, s.prototype.pipe = function(e2, t3) {
                function r3(e3, t4) {
                  x("onunpipe"), e3 === p2 && t4 && false === t4.hasUnpiped && (t4.hasUnpiped = true, o2());
                }
                function a2() {
                  x("onend"), e2.end();
                }
                function o2() {
                  x("cleanup"), e2.removeListener("close", l2), e2.removeListener("finish", c2), e2.removeListener("drain", h2), e2.removeListener("error", s2), e2.removeListener("unpipe", r3), p2.removeListener("end", a2), p2.removeListener("end", u2), p2.removeListener("data", d2), m2 = true, f2.awaitDrain && (!e2._writableState || e2._writableState.needDrain) && h2();
                }
                function d2(t4) {
                  x("ondata");
                  var n3 = e2.write(t4);
                  x("dest.write", n3), false === n3 && ((1 === f2.pipesCount && f2.pipes === e2 || 1 < f2.pipesCount && -1 !== L(f2.pipes, e2)) && !m2 && (x("false write response, pause", f2.awaitDrain), f2.awaitDrain++), p2.pause());
                }
                function s2(t4) {
                  x("onerror", t4), u2(), e2.removeListener("error", s2), 0 === D(e2, "error") && X(e2, t4);
                }
                function l2() {
                  e2.removeListener("finish", c2), u2();
                }
                function c2() {
                  x("onfinish"), e2.removeListener("close", l2), u2();
                }
                function u2() {
                  x("unpipe"), p2.unpipe(e2);
                }
                var p2 = this, f2 = this._readableState;
                switch (f2.pipesCount) {
                  case 0:
                    f2.pipes = e2;
                    break;
                  case 1:
                    f2.pipes = [f2.pipes, e2];
                    break;
                  default:
                    f2.pipes.push(e2);
                }
                f2.pipesCount += 1, x("pipe count=%d opts=%j", f2.pipesCount, t3);
                var g2 = (!t3 || false !== t3.end) && e2 !== n2.stdout && e2 !== n2.stderr, _2 = g2 ? a2 : u2;
                f2.endEmitted ? n2.nextTick(_2) : p2.once("end", _2), e2.on("unpipe", r3);
                var h2 = y(p2);
                e2.on("drain", h2);
                var m2 = false;
                return p2.on("data", d2), i(e2, "error", s2), e2.once("close", l2), e2.once("finish", c2), e2.emit("pipe", p2), f2.flowing || (x("pipe resume"), p2.resume()), e2;
              }, s.prototype.unpipe = function(e2) {
                var t3 = this._readableState, n3 = { hasUnpiped: false };
                if (0 === t3.pipesCount) return this;
                if (1 === t3.pipesCount) return e2 && e2 !== t3.pipes ? this : (e2 || (e2 = t3.pipes), t3.pipes = null, t3.pipesCount = 0, t3.flowing = false, e2 && e2.emit("unpipe", this, n3), this);
                if (!e2) {
                  var r3 = t3.pipes, a2 = t3.pipesCount;
                  t3.pipes = null, t3.pipesCount = 0, t3.flowing = false;
                  for (var o2 = 0; o2 < a2; o2++) r3[o2].emit("unpipe", this, { hasUnpiped: false });
                  return this;
                }
                var d2 = L(t3.pipes, e2);
                return -1 === d2 ? this : (t3.pipes.splice(d2, 1), t3.pipesCount -= 1, 1 === t3.pipesCount && (t3.pipes = t3.pipes[0]), e2.emit("unpipe", this, n3), this);
              }, s.prototype.on = function(e2, t3) {
                var r3 = I.prototype.on.call(this, e2, t3), a2 = this._readableState;
                return "data" === e2 ? (a2.readableListening = 0 < this.listenerCount("readable"), false !== a2.flowing && this.resume()) : "readable" == e2 && !a2.endEmitted && !a2.readableListening && (a2.readableListening = a2.needReadable = true, a2.flowing = false, a2.emittedReadable = false, x("on readable", a2.length, a2.reading), a2.length ? _(this) : !a2.reading && n2.nextTick(R, this)), r3;
              }, s.prototype.addListener = s.prototype.on, s.prototype.removeListener = function(e2, t3) {
                var r3 = I.prototype.removeListener.call(this, e2, t3);
                return "readable" === e2 && n2.nextTick(C, this), r3;
              }, s.prototype.removeAllListeners = function(e2) {
                var t3 = I.prototype.removeAllListeners.apply(this, arguments);
                return ("readable" === e2 || void 0 === e2) && n2.nextTick(C, this), t3;
              }, s.prototype.resume = function() {
                var e2 = this._readableState;
                return e2.flowing || (x("resume"), e2.flowing = !e2.readableListening, E(this, e2)), e2.paused = false, this;
              }, s.prototype.pause = function() {
                return x("call pause flowing=%j", this._readableState.flowing), false !== this._readableState.flowing && (x("pause"), this._readableState.flowing = false, this.emit("pause")), this._readableState.paused = true, this;
              }, s.prototype.wrap = function(e2) {
                var t3 = this, r3 = this._readableState, a2 = false;
                for (var o2 in e2.on("end", function() {
                  if (x("wrapped end"), r3.decoder && !r3.ended) {
                    var e3 = r3.decoder.end();
                    e3 && e3.length && t3.push(e3);
                  }
                  t3.push(null);
                }), e2.on("data", function(n3) {
                  if ((x("wrapped data"), r3.decoder && (n3 = r3.decoder.write(n3)), !(r3.objectMode && (null === n3 || void 0 === n3))) && (r3.objectMode || n3 && n3.length)) {
                    var o3 = t3.push(n3);
                    o3 || (a2 = true, e2.pause());
                  }
                }), e2) void 0 === this[o2] && "function" == typeof e2[o2] && (this[o2] = /* @__PURE__ */ (function(t4) {
                  return function() {
                    return e2[t4].apply(e2, arguments);
                  };
                })(o2));
                for (var i2 = 0; i2 < $2.length; i2++) e2.on($2[i2], this.emit.bind(this, $2[i2]));
                return this._read = function(t4) {
                  x("wrapped _read", t4), a2 && (a2 = false, e2.resume());
                }, this;
              }, "function" == typeof Symbol && (s.prototype[Symbol.asyncIterator] = function() {
                return void 0 === B && (B = e("./internal/streams/async_iterator")), B(this);
              }), Object.defineProperty(s.prototype, "readableHighWaterMark", { enumerable: false, get: function() {
                return this._readableState.highWaterMark;
              } }), Object.defineProperty(s.prototype, "readableBuffer", { enumerable: false, get: function() {
                return this._readableState && this._readableState.buffer;
              } }), Object.defineProperty(s.prototype, "readableFlowing", { enumerable: false, get: function() {
                return this._readableState.flowing;
              }, set: function(e2) {
                this._readableState && (this._readableState.flowing = e2);
              } }), s._fromList = T, Object.defineProperty(s.prototype, "readableLength", { enumerable: false, get: function() {
                return this._readableState.length;
              } }), "function" == typeof Symbol && (s.from = function(t3, n3) {
                return void 0 === U && (U = e("./internal/streams/from")), U(s, t3, n3);
              });
            }).call(this);
          }).call(this, e("_process"), "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global);
        }, { "../errors": 15, "./_stream_duplex": 16, "./internal/streams/async_iterator": 21, "./internal/streams/buffer_list": 22, "./internal/streams/destroy": 23, "./internal/streams/from": 25, "./internal/streams/state": 27, "./internal/streams/stream": 28, _process: 12, buffer: 3, events: 7, inherits: 10, "string_decoder/": 31, util: 2 }], 19: [function(e, t2) {
          "use strict";
          function n2(e2, t3) {
            var n3 = this._transformState;
            n3.transforming = false;
            var r3 = n3.writecb;
            if (null === r3) return this.emit("error", new s());
            n3.writechunk = null, n3.writecb = null, null != t3 && this.push(t3), r3(e2);
            var a2 = this._readableState;
            a2.reading = false, (a2.needReadable || a2.length < a2.highWaterMark) && this._read(a2.highWaterMark);
          }
          function r2(e2) {
            return this instanceof r2 ? void (u.call(this, e2), this._transformState = { afterTransform: n2.bind(this), needTransform: false, transforming: false, writecb: null, writechunk: null, writeencoding: null }, this._readableState.needReadable = true, this._readableState.sync = false, e2 && ("function" == typeof e2.transform && (this._transform = e2.transform), "function" == typeof e2.flush && (this._flush = e2.flush)), this.on("prefinish", a)) : new r2(e2);
          }
          function a() {
            var e2 = this;
            "function" != typeof this._flush || this._readableState.destroyed ? o(this, null, null) : this._flush(function(t3, n3) {
              o(e2, t3, n3);
            });
          }
          function o(e2, t3, n3) {
            if (t3) return e2.emit("error", t3);
            if (null != n3 && e2.push(n3), e2._writableState.length) throw new c();
            if (e2._transformState.transforming) throw new l();
            return e2.push(null);
          }
          t2.exports = r2;
          var i = e("../errors").codes, d = i.ERR_METHOD_NOT_IMPLEMENTED, s = i.ERR_MULTIPLE_CALLBACK, l = i.ERR_TRANSFORM_ALREADY_TRANSFORMING, c = i.ERR_TRANSFORM_WITH_LENGTH_0, u = e("./_stream_duplex");
          e("inherits")(r2, u), r2.prototype.push = function(e2, t3) {
            return this._transformState.needTransform = false, u.prototype.push.call(this, e2, t3);
          }, r2.prototype._transform = function(e2, t3, n3) {
            n3(new d("_transform()"));
          }, r2.prototype._write = function(e2, t3, n3) {
            var r3 = this._transformState;
            if (r3.writecb = n3, r3.writechunk = e2, r3.writeencoding = t3, !r3.transforming) {
              var a2 = this._readableState;
              (r3.needTransform || a2.needReadable || a2.length < a2.highWaterMark) && this._read(a2.highWaterMark);
            }
          }, r2.prototype._read = function() {
            var e2 = this._transformState;
            null === e2.writechunk || e2.transforming ? e2.needTransform = true : (e2.transforming = true, this._transform(e2.writechunk, e2.writeencoding, e2.afterTransform));
          }, r2.prototype._destroy = function(e2, t3) {
            u.prototype._destroy.call(this, e2, function(e3) {
              t3(e3);
            });
          };
        }, { "../errors": 15, "./_stream_duplex": 16, inherits: 10 }], 20: [function(e, t2) {
          (function(n2, r2) {
            (function() {
              "use strict";
              function a(e2) {
                var t3 = this;
                this.next = null, this.entry = null, this.finish = function() {
                  v(t3, e2);
                };
              }
              function o(e2) {
                return x.from(e2);
              }
              function i(e2) {
                return x.isBuffer(e2) || e2 instanceof N;
              }
              function d() {
              }
              function s(t3, n3, r3) {
                k = k || e("./_stream_duplex"), t3 = t3 || {}, "boolean" != typeof r3 && (r3 = n3 instanceof k), this.objectMode = !!t3.objectMode, r3 && (this.objectMode = this.objectMode || !!t3.writableObjectMode), this.highWaterMark = P(this, t3, "writableHighWaterMark", r3), this.finalCalled = false, this.needDrain = false, this.ending = false, this.ended = false, this.finished = false, this.destroyed = false;
                var o2 = false === t3.decodeStrings;
                this.decodeStrings = !o2, this.defaultEncoding = t3.defaultEncoding || "utf8", this.length = 0, this.writing = false, this.corked = 0, this.sync = true, this.bufferProcessing = false, this.onwrite = function(e2) {
                  m(n3, e2);
                }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = false, this.errorEmitted = false, this.emitClose = false !== t3.emitClose, this.autoDestroy = !!t3.autoDestroy, this.bufferedRequestCount = 0, this.corkedRequestsFree = new a(this);
              }
              function l(t3) {
                k = k || e("./_stream_duplex");
                var n3 = this instanceof k;
                return n3 || V.call(l, this) ? void (this._writableState = new s(t3, this, n3), this.writable = true, t3 && ("function" == typeof t3.write && (this._write = t3.write), "function" == typeof t3.writev && (this._writev = t3.writev), "function" == typeof t3.destroy && (this._destroy = t3.destroy), "function" == typeof t3.final && (this._final = t3.final)), A.call(this)) : new l(t3);
              }
              function c(e2, t3) {
                var r3 = new W();
                Y(e2, r3), n2.nextTick(t3, r3);
              }
              function u(e2, t3, r3, a2) {
                var o2;
                return null === r3 ? o2 = new q() : "string" != typeof r3 && !t3.objectMode && (o2 = new O("chunk", ["string", "Buffer"], r3)), !o2 || (Y(e2, o2), n2.nextTick(a2, o2), false);
              }
              function p(e2, t3, n3) {
                return e2.objectMode || false === e2.decodeStrings || "string" != typeof t3 || (t3 = x.from(t3, n3)), t3;
              }
              function f(e2, t3, n3, r3, a2, o2) {
                if (!n3) {
                  var i2 = p(t3, r3, a2);
                  r3 !== i2 && (n3 = true, a2 = "buffer", r3 = i2);
                }
                var d2 = t3.objectMode ? 1 : r3.length;
                t3.length += d2;
                var s2 = t3.length < t3.highWaterMark;
                if (s2 || (t3.needDrain = true), t3.writing || t3.corked) {
                  var l2 = t3.lastBufferedRequest;
                  t3.lastBufferedRequest = { chunk: r3, encoding: a2, isBuf: n3, callback: o2, next: null }, l2 ? l2.next = t3.lastBufferedRequest : t3.bufferedRequest = t3.lastBufferedRequest, t3.bufferedRequestCount += 1;
                } else g(e2, t3, false, d2, r3, a2, o2);
                return s2;
              }
              function g(e2, t3, n3, r3, a2, o2, i2) {
                t3.writelen = r3, t3.writecb = i2, t3.writing = true, t3.sync = true, t3.destroyed ? t3.onwrite(new j("write")) : n3 ? e2._writev(a2, t3.onwrite) : e2._write(a2, o2, t3.onwrite), t3.sync = false;
              }
              function _(e2, t3, r3, a2, o2) {
                --t3.pendingcb, r3 ? (n2.nextTick(o2, a2), n2.nextTick(S, e2, t3), e2._writableState.errorEmitted = true, Y(e2, a2)) : (o2(a2), e2._writableState.errorEmitted = true, Y(e2, a2), S(e2, t3));
              }
              function h(e2) {
                e2.writing = false, e2.writecb = null, e2.length -= e2.writelen, e2.writelen = 0;
              }
              function m(e2, t3) {
                var r3 = e2._writableState, a2 = r3.sync, o2 = r3.writecb;
                if ("function" != typeof o2) throw new B();
                if (h(r3), t3) _(e2, r3, a2, t3, o2);
                else {
                  var i2 = R(r3) || e2.destroyed;
                  i2 || r3.corked || r3.bufferProcessing || !r3.bufferedRequest || C(e2, r3), a2 ? n2.nextTick(b, e2, r3, i2, o2) : b(e2, r3, i2, o2);
                }
              }
              function b(e2, t3, n3, r3) {
                n3 || y(e2, t3), t3.pendingcb--, r3(), S(e2, t3);
              }
              function y(e2, t3) {
                0 === t3.length && t3.needDrain && (t3.needDrain = false, e2.emit("drain"));
              }
              function C(e2, t3) {
                t3.bufferProcessing = true;
                var n3 = t3.bufferedRequest;
                if (e2._writev && n3 && n3.next) {
                  var r3 = t3.bufferedRequestCount, o2 = Array(r3), i2 = t3.corkedRequestsFree;
                  i2.entry = n3;
                  for (var d2 = 0, s2 = true; n3; ) o2[d2] = n3, n3.isBuf || (s2 = false), n3 = n3.next, d2 += 1;
                  o2.allBuffers = s2, g(e2, t3, true, t3.length, o2, "", i2.finish), t3.pendingcb++, t3.lastBufferedRequest = null, i2.next ? (t3.corkedRequestsFree = i2.next, i2.next = null) : t3.corkedRequestsFree = new a(t3), t3.bufferedRequestCount = 0;
                } else {
                  for (; n3; ) {
                    var l2 = n3.chunk, c2 = n3.encoding, u2 = n3.callback, p2 = t3.objectMode ? 1 : l2.length;
                    if (g(e2, t3, false, p2, l2, c2, u2), n3 = n3.next, t3.bufferedRequestCount--, t3.writing) break;
                  }
                  null === n3 && (t3.lastBufferedRequest = null);
                }
                t3.bufferedRequest = n3, t3.bufferProcessing = false;
              }
              function R(e2) {
                return e2.ending && 0 === e2.length && null === e2.bufferedRequest && !e2.finished && !e2.writing;
              }
              function E(e2, t3) {
                e2._final(function(n3) {
                  t3.pendingcb--, n3 && Y(e2, n3), t3.prefinished = true, e2.emit("prefinish"), S(e2, t3);
                });
              }
              function w(e2, t3) {
                t3.prefinished || t3.finalCalled || ("function" != typeof e2._final || t3.destroyed ? (t3.prefinished = true, e2.emit("prefinish")) : (t3.pendingcb++, t3.finalCalled = true, n2.nextTick(E, e2, t3)));
              }
              function S(e2, t3) {
                var n3 = R(t3);
                if (n3 && (w(e2, t3), 0 === t3.pendingcb && (t3.finished = true, e2.emit("finish"), t3.autoDestroy))) {
                  var r3 = e2._readableState;
                  (!r3 || r3.autoDestroy && r3.endEmitted) && e2.destroy();
                }
                return n3;
              }
              function T(e2, t3, r3) {
                t3.ending = true, S(e2, t3), r3 && (t3.finished ? n2.nextTick(r3) : e2.once("finish", r3)), t3.ended = true, e2.writable = false;
              }
              function v(e2, t3, n3) {
                var r3 = e2.entry;
                for (e2.entry = null; r3; ) {
                  var a2 = r3.callback;
                  t3.pendingcb--, a2(n3), r3 = r3.next;
                }
                t3.corkedRequestsFree.next = e2;
              }
              t2.exports = l;
              var k;
              l.WritableState = s;
              var L = { deprecate: e("util-deprecate") }, A = e("./internal/streams/stream"), x = e("buffer").Buffer, N = r2.Uint8Array || function() {
              }, D = e("./internal/streams/destroy"), I = e("./internal/streams/state"), P = I.getHighWaterMark, M = e("../errors").codes, O = M.ERR_INVALID_ARG_TYPE, F = M.ERR_METHOD_NOT_IMPLEMENTED, B = M.ERR_MULTIPLE_CALLBACK, U = M.ERR_STREAM_CANNOT_PIPE, j = M.ERR_STREAM_DESTROYED, q = M.ERR_STREAM_NULL_VALUES, W = M.ERR_STREAM_WRITE_AFTER_END, H = M.ERR_UNKNOWN_ENCODING, Y = D.errorOrDestroy;
              e("inherits")(l, A), s.prototype.getBuffer = function() {
                for (var e2 = this.bufferedRequest, t3 = []; e2; ) t3.push(e2), e2 = e2.next;
                return t3;
              }, (function() {
                try {
                  Object.defineProperty(s.prototype, "buffer", { get: L.deprecate(function() {
                    return this.getBuffer();
                  }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003") });
                } catch (e2) {
                }
              })();
              var V;
              "function" == typeof Symbol && Symbol.hasInstance && "function" == typeof Function.prototype[Symbol.hasInstance] ? (V = Function.prototype[Symbol.hasInstance], Object.defineProperty(l, Symbol.hasInstance, { value: function(e2) {
                return !!V.call(this, e2) || !(this !== l) && e2 && e2._writableState instanceof s;
              } })) : V = function(e2) {
                return e2 instanceof this;
              }, l.prototype.pipe = function() {
                Y(this, new U());
              }, l.prototype.write = function(e2, t3, n3) {
                var r3 = this._writableState, a2 = false, s2 = !r3.objectMode && i(e2);
                return s2 && !x.isBuffer(e2) && (e2 = o(e2)), "function" == typeof t3 && (n3 = t3, t3 = null), s2 ? t3 = "buffer" : !t3 && (t3 = r3.defaultEncoding), "function" != typeof n3 && (n3 = d), r3.ending ? c(this, n3) : (s2 || u(this, r3, e2, n3)) && (r3.pendingcb++, a2 = f(this, r3, s2, e2, t3, n3)), a2;
              }, l.prototype.cork = function() {
                this._writableState.corked++;
              }, l.prototype.uncork = function() {
                var e2 = this._writableState;
                e2.corked && (e2.corked--, !e2.writing && !e2.corked && !e2.bufferProcessing && e2.bufferedRequest && C(this, e2));
              }, l.prototype.setDefaultEncoding = function(e2) {
                if ("string" == typeof e2 && (e2 = e2.toLowerCase()), !(-1 < ["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((e2 + "").toLowerCase()))) throw new H(e2);
                return this._writableState.defaultEncoding = e2, this;
              }, Object.defineProperty(l.prototype, "writableBuffer", { enumerable: false, get: function() {
                return this._writableState && this._writableState.getBuffer();
              } }), Object.defineProperty(l.prototype, "writableHighWaterMark", { enumerable: false, get: function() {
                return this._writableState.highWaterMark;
              } }), l.prototype._write = function(e2, t3, n3) {
                n3(new F("_write()"));
              }, l.prototype._writev = null, l.prototype.end = function(e2, t3, n3) {
                var r3 = this._writableState;
                return "function" == typeof e2 ? (n3 = e2, e2 = null, t3 = null) : "function" == typeof t3 && (n3 = t3, t3 = null), null !== e2 && void 0 !== e2 && this.write(e2, t3), r3.corked && (r3.corked = 1, this.uncork()), r3.ending || T(this, r3, n3), this;
              }, Object.defineProperty(l.prototype, "writableLength", { enumerable: false, get: function() {
                return this._writableState.length;
              } }), Object.defineProperty(l.prototype, "destroyed", { enumerable: false, get: function() {
                return void 0 !== this._writableState && this._writableState.destroyed;
              }, set: function(e2) {
                this._writableState && (this._writableState.destroyed = e2);
              } }), l.prototype.destroy = D.destroy, l.prototype._undestroy = D.undestroy, l.prototype._destroy = function(e2, t3) {
                t3(e2);
              };
            }).call(this);
          }).call(this, e("_process"), "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global);
        }, { "../errors": 15, "./_stream_duplex": 16, "./internal/streams/destroy": 23, "./internal/streams/state": 27, "./internal/streams/stream": 28, _process: 12, buffer: 3, inherits: 10, "util-deprecate": 32 }], 21: [function(e, t2) {
          (function(n2) {
            (function() {
              "use strict";
              function r2(e2, t3, n3) {
                return t3 in e2 ? Object.defineProperty(e2, t3, { value: n3, enumerable: true, configurable: true, writable: true }) : e2[t3] = n3, e2;
              }
              function a(e2, t3) {
                return { value: e2, done: t3 };
              }
              function o(e2) {
                var t3 = e2[c];
                if (null !== t3) {
                  var n3 = e2[h].read();
                  null !== n3 && (e2[g] = null, e2[c] = null, e2[u] = null, t3(a(n3, false)));
                }
              }
              function i(e2) {
                n2.nextTick(o, e2);
              }
              function d(e2, t3) {
                return function(n3, r3) {
                  e2.then(function() {
                    return t3[f] ? void n3(a(void 0, true)) : void t3[_](n3, r3);
                  }, r3);
                };
              }
              var s, l = e("./end-of-stream"), c = /* @__PURE__ */ Symbol("lastResolve"), u = /* @__PURE__ */ Symbol("lastReject"), p = /* @__PURE__ */ Symbol("error"), f = /* @__PURE__ */ Symbol("ended"), g = /* @__PURE__ */ Symbol("lastPromise"), _ = /* @__PURE__ */ Symbol("handlePromise"), h = /* @__PURE__ */ Symbol("stream"), m = Object.getPrototypeOf(function() {
              }), b = Object.setPrototypeOf((s = { get stream() {
                return this[h];
              }, next: function() {
                var e2 = this, t3 = this[p];
                if (null !== t3) return Promise.reject(t3);
                if (this[f]) return Promise.resolve(a(void 0, true));
                if (this[h].destroyed) return new Promise(function(t4, r4) {
                  n2.nextTick(function() {
                    e2[p] ? r4(e2[p]) : t4(a(void 0, true));
                  });
                });
                var r3, o2 = this[g];
                if (o2) r3 = new Promise(d(o2, this));
                else {
                  var i2 = this[h].read();
                  if (null !== i2) return Promise.resolve(a(i2, false));
                  r3 = new Promise(this[_]);
                }
                return this[g] = r3, r3;
              } }, r2(s, Symbol.asyncIterator, function() {
                return this;
              }), r2(s, "return", function() {
                var e2 = this;
                return new Promise(function(t3, n3) {
                  e2[h].destroy(null, function(e3) {
                    return e3 ? void n3(e3) : void t3(a(void 0, true));
                  });
                });
              }), s), m);
              t2.exports = function(e2) {
                var t3, n3 = Object.create(b, (t3 = {}, r2(t3, h, { value: e2, writable: true }), r2(t3, c, { value: null, writable: true }), r2(t3, u, { value: null, writable: true }), r2(t3, p, { value: null, writable: true }), r2(t3, f, { value: e2._readableState.endEmitted, writable: true }), r2(t3, _, { value: function(e3, t4) {
                  var r3 = n3[h].read();
                  r3 ? (n3[g] = null, n3[c] = null, n3[u] = null, e3(a(r3, false))) : (n3[c] = e3, n3[u] = t4);
                }, writable: true }), t3));
                return n3[g] = null, l(e2, function(e3) {
                  if (e3 && "ERR_STREAM_PREMATURE_CLOSE" !== e3.code) {
                    var t4 = n3[u];
                    return null !== t4 && (n3[g] = null, n3[c] = null, n3[u] = null, t4(e3)), void (n3[p] = e3);
                  }
                  var r3 = n3[c];
                  null !== r3 && (n3[g] = null, n3[c] = null, n3[u] = null, r3(a(void 0, true))), n3[f] = true;
                }), e2.on("readable", i.bind(null, n3)), n3;
              };
            }).call(this);
          }).call(this, e("_process"));
        }, { "./end-of-stream": 24, _process: 12 }], 22: [function(e, t2) {
          "use strict";
          function n2(e2, t3) {
            var n3 = Object.keys(e2);
            if (Object.getOwnPropertySymbols) {
              var r3 = Object.getOwnPropertySymbols(e2);
              t3 && (r3 = r3.filter(function(t4) {
                return Object.getOwnPropertyDescriptor(e2, t4).enumerable;
              })), n3.push.apply(n3, r3);
            }
            return n3;
          }
          function r2(e2) {
            for (var t3, r3 = 1; r3 < arguments.length; r3++) t3 = null == arguments[r3] ? {} : arguments[r3], r3 % 2 ? n2(Object(t3), true).forEach(function(n3) {
              a(e2, n3, t3[n3]);
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(t3)) : n2(Object(t3)).forEach(function(n3) {
              Object.defineProperty(e2, n3, Object.getOwnPropertyDescriptor(t3, n3));
            });
            return e2;
          }
          function a(e2, t3, n3) {
            return t3 in e2 ? Object.defineProperty(e2, t3, { value: n3, enumerable: true, configurable: true, writable: true }) : e2[t3] = n3, e2;
          }
          function o(e2, t3) {
            if (!(e2 instanceof t3)) throw new TypeError("Cannot call a class as a function");
          }
          function i(e2, t3) {
            for (var n3, r3 = 0; r3 < t3.length; r3++) n3 = t3[r3], n3.enumerable = n3.enumerable || false, n3.configurable = true, "value" in n3 && (n3.writable = true), Object.defineProperty(e2, n3.key, n3);
          }
          function d(e2, t3, n3) {
            return t3 && i(e2.prototype, t3), n3 && i(e2, n3), e2;
          }
          function s(e2, t3, n3) {
            u.prototype.copy.call(e2, t3, n3);
          }
          var l = e("buffer"), u = l.Buffer, p = e("util"), f = p.inspect, g = f && f.custom || "inspect";
          t2.exports = (function() {
            function e2() {
              o(this, e2), this.head = null, this.tail = null, this.length = 0;
            }
            return d(e2, [{ key: "push", value: function(e3) {
              var t3 = { data: e3, next: null };
              0 < this.length ? this.tail.next = t3 : this.head = t3, this.tail = t3, ++this.length;
            } }, { key: "unshift", value: function(e3) {
              var t3 = { data: e3, next: this.head };
              0 === this.length && (this.tail = t3), this.head = t3, ++this.length;
            } }, { key: "shift", value: function() {
              if (0 !== this.length) {
                var e3 = this.head.data;
                return this.head = 1 === this.length ? this.tail = null : this.head.next, --this.length, e3;
              }
            } }, { key: "clear", value: function() {
              this.head = this.tail = null, this.length = 0;
            } }, { key: "join", value: function(e3) {
              if (0 === this.length) return "";
              for (var t3 = this.head, n3 = "" + t3.data; t3 = t3.next; ) n3 += e3 + t3.data;
              return n3;
            } }, { key: "concat", value: function(e3) {
              if (0 === this.length) return u.alloc(0);
              for (var t3 = u.allocUnsafe(e3 >>> 0), n3 = this.head, r3 = 0; n3; ) s(n3.data, t3, r3), r3 += n3.data.length, n3 = n3.next;
              return t3;
            } }, { key: "consume", value: function(e3, t3) {
              var n3;
              return e3 < this.head.data.length ? (n3 = this.head.data.slice(0, e3), this.head.data = this.head.data.slice(e3)) : e3 === this.head.data.length ? n3 = this.shift() : n3 = t3 ? this._getString(e3) : this._getBuffer(e3), n3;
            } }, { key: "first", value: function() {
              return this.head.data;
            } }, { key: "_getString", value: function(e3) {
              var t3 = this.head, r3 = 1, a2 = t3.data;
              for (e3 -= a2.length; t3 = t3.next; ) {
                var o2 = t3.data, i2 = e3 > o2.length ? o2.length : e3;
                if (a2 += i2 === o2.length ? o2 : o2.slice(0, e3), e3 -= i2, 0 === e3) {
                  i2 === o2.length ? (++r3, this.head = t3.next ? t3.next : this.tail = null) : (this.head = t3, t3.data = o2.slice(i2));
                  break;
                }
                ++r3;
              }
              return this.length -= r3, a2;
            } }, { key: "_getBuffer", value: function(e3) {
              var t3 = u.allocUnsafe(e3), r3 = this.head, a2 = 1;
              for (r3.data.copy(t3), e3 -= r3.data.length; r3 = r3.next; ) {
                var o2 = r3.data, i2 = e3 > o2.length ? o2.length : e3;
                if (o2.copy(t3, t3.length - e3, 0, i2), e3 -= i2, 0 === e3) {
                  i2 === o2.length ? (++a2, this.head = r3.next ? r3.next : this.tail = null) : (this.head = r3, r3.data = o2.slice(i2));
                  break;
                }
                ++a2;
              }
              return this.length -= a2, t3;
            } }, { key: g, value: function(e3, t3) {
              return f(this, r2({}, t3, { depth: 0, customInspect: false }));
            } }]), e2;
          })();
        }, { buffer: 3, util: 2 }], 23: [function(e, t2) {
          (function(e2) {
            (function() {
              "use strict";
              function n2(e3, t3) {
                a(e3, t3), r2(e3);
              }
              function r2(e3) {
                e3._writableState && !e3._writableState.emitClose || e3._readableState && !e3._readableState.emitClose || e3.emit("close");
              }
              function a(e3, t3) {
                e3.emit("error", t3);
              }
              t2.exports = { destroy: function(t3, o) {
                var i = this, d = this._readableState && this._readableState.destroyed, s = this._writableState && this._writableState.destroyed;
                return d || s ? (o ? o(t3) : t3 && (this._writableState ? !this._writableState.errorEmitted && (this._writableState.errorEmitted = true, e2.nextTick(a, this, t3)) : e2.nextTick(a, this, t3)), this) : (this._readableState && (this._readableState.destroyed = true), this._writableState && (this._writableState.destroyed = true), this._destroy(t3 || null, function(t4) {
                  !o && t4 ? i._writableState ? i._writableState.errorEmitted ? e2.nextTick(r2, i) : (i._writableState.errorEmitted = true, e2.nextTick(n2, i, t4)) : e2.nextTick(n2, i, t4) : o ? (e2.nextTick(r2, i), o(t4)) : e2.nextTick(r2, i);
                }), this);
              }, undestroy: function() {
                this._readableState && (this._readableState.destroyed = false, this._readableState.reading = false, this._readableState.ended = false, this._readableState.endEmitted = false), this._writableState && (this._writableState.destroyed = false, this._writableState.ended = false, this._writableState.ending = false, this._writableState.finalCalled = false, this._writableState.prefinished = false, this._writableState.finished = false, this._writableState.errorEmitted = false);
              }, errorOrDestroy: function(e3, t3) {
                var n3 = e3._readableState, r3 = e3._writableState;
                n3 && n3.autoDestroy || r3 && r3.autoDestroy ? e3.destroy(t3) : e3.emit("error", t3);
              } };
            }).call(this);
          }).call(this, e("_process"));
        }, { _process: 12 }], 24: [function(e, t2) {
          "use strict";
          function n2(e2) {
            var t3 = false;
            return function() {
              if (!t3) {
                t3 = true;
                for (var n3 = arguments.length, r3 = Array(n3), a2 = 0; a2 < n3; a2++) r3[a2] = arguments[a2];
                e2.apply(this, r3);
              }
            };
          }
          function r2() {
          }
          function a(e2) {
            return e2.setHeader && "function" == typeof e2.abort;
          }
          function o(e2, t3, d) {
            if ("function" == typeof t3) return o(e2, null, t3);
            t3 || (t3 = {}), d = n2(d || r2);
            var s = t3.readable || false !== t3.readable && e2.readable, l = t3.writable || false !== t3.writable && e2.writable, c = function() {
              e2.writable || p();
            }, u = e2._writableState && e2._writableState.finished, p = function() {
              l = false, u = true, s || d.call(e2);
            }, f = e2._readableState && e2._readableState.endEmitted, g = function() {
              s = false, f = true, l || d.call(e2);
            }, _ = function(t4) {
              d.call(e2, t4);
            }, h = function() {
              var t4;
              return s && !f ? (e2._readableState && e2._readableState.ended || (t4 = new i()), d.call(e2, t4)) : l && !u ? (e2._writableState && e2._writableState.ended || (t4 = new i()), d.call(e2, t4)) : void 0;
            }, m = function() {
              e2.req.on("finish", p);
            };
            return a(e2) ? (e2.on("complete", p), e2.on("abort", h), e2.req ? m() : e2.on("request", m)) : l && !e2._writableState && (e2.on("end", c), e2.on("close", c)), e2.on("end", g), e2.on("finish", p), false !== t3.error && e2.on("error", _), e2.on("close", h), function() {
              e2.removeListener("complete", p), e2.removeListener("abort", h), e2.removeListener("request", m), e2.req && e2.req.removeListener("finish", p), e2.removeListener("end", c), e2.removeListener("close", c), e2.removeListener("finish", p), e2.removeListener("end", g), e2.removeListener("error", _), e2.removeListener("close", h);
            };
          }
          var i = e("../../../errors").codes.ERR_STREAM_PREMATURE_CLOSE;
          t2.exports = o;
        }, { "../../../errors": 15 }], 25: [function(e, t2) {
          t2.exports = function() {
            throw new Error("Readable.from is not available in the browser");
          };
        }, {}], 26: [function(e, t2) {
          "use strict";
          function n2(e2) {
            var t3 = false;
            return function() {
              t3 || (t3 = true, e2.apply(void 0, arguments));
            };
          }
          function r2(e2) {
            if (e2) throw e2;
          }
          function a(e2) {
            return e2.setHeader && "function" == typeof e2.abort;
          }
          function o(t3, r3, o2, i2) {
            i2 = n2(i2);
            var d2 = false;
            t3.on("close", function() {
              d2 = true;
            }), l === void 0 && (l = e("./end-of-stream")), l(t3, { readable: r3, writable: o2 }, function(e2) {
              return e2 ? i2(e2) : void (d2 = true, i2());
            });
            var s2 = false;
            return function(e2) {
              if (!d2) return s2 ? void 0 : (s2 = true, a(t3) ? t3.abort() : "function" == typeof t3.destroy ? t3.destroy() : void i2(e2 || new p("pipe")));
            };
          }
          function i(e2) {
            e2();
          }
          function d(e2, t3) {
            return e2.pipe(t3);
          }
          function s(e2) {
            return e2.length ? "function" == typeof e2[e2.length - 1] ? e2.pop() : r2 : r2;
          }
          var l, c = e("../../../errors").codes, u = c.ERR_MISSING_ARGS, p = c.ERR_STREAM_DESTROYED;
          t2.exports = function() {
            for (var e2 = arguments.length, t3 = Array(e2), n3 = 0; n3 < e2; n3++) t3[n3] = arguments[n3];
            var r3 = s(t3);
            if (Array.isArray(t3[0]) && (t3 = t3[0]), 2 > t3.length) throw new u("streams");
            var a2, l2 = t3.map(function(e3, n4) {
              var d2 = n4 < t3.length - 1;
              return o(e3, d2, 0 < n4, function(e4) {
                a2 || (a2 = e4), e4 && l2.forEach(i), d2 || (l2.forEach(i), r3(a2));
              });
            });
            return t3.reduce(d);
          };
        }, { "../../../errors": 15, "./end-of-stream": 24 }], 27: [function(e, n2) {
          "use strict";
          function r2(e2, t2, n3) {
            return null == e2.highWaterMark ? t2 ? e2[n3] : null : e2.highWaterMark;
          }
          var a = e("../../../errors").codes.ERR_INVALID_OPT_VALUE;
          n2.exports = { getHighWaterMark: function(e2, n3, o, i) {
            var d = r2(n3, i, o);
            if (null != d) {
              if (!(isFinite(d) && t(d) === d) || 0 > d) {
                var s = i ? o : "highWaterMark";
                throw new a(s, d);
              }
              return t(d);
            }
            return e2.objectMode ? 16 : 16384;
          } };
        }, { "../../../errors": 15 }], 28: [function(e, t2) {
          t2.exports = e("events").EventEmitter;
        }, { events: 7 }], 29: [function(e, t2, n2) {
          n2 = t2.exports = e("./lib/_stream_readable.js"), n2.Stream = n2, n2.Readable = n2, n2.Writable = e("./lib/_stream_writable.js"), n2.Duplex = e("./lib/_stream_duplex.js"), n2.Transform = e("./lib/_stream_transform.js"), n2.PassThrough = e("./lib/_stream_passthrough.js"), n2.finished = e("./lib/internal/streams/end-of-stream.js"), n2.pipeline = e("./lib/internal/streams/pipeline.js");
        }, { "./lib/_stream_duplex.js": 16, "./lib/_stream_passthrough.js": 17, "./lib/_stream_readable.js": 18, "./lib/_stream_transform.js": 19, "./lib/_stream_writable.js": 20, "./lib/internal/streams/end-of-stream.js": 24, "./lib/internal/streams/pipeline.js": 26 }], 30: [function(e, t2, n2) {
          function r2(e2, t3) {
            for (var n3 in e2) t3[n3] = e2[n3];
          }
          function a(e2, t3, n3) {
            return i(e2, t3, n3);
          }
          var o = e("buffer"), i = o.Buffer;
          i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow ? t2.exports = o : (r2(o, n2), n2.Buffer = a), a.prototype = Object.create(i.prototype), r2(i, a), a.from = function(e2, t3, n3) {
            if ("number" == typeof e2) throw new TypeError("Argument must not be a number");
            return i(e2, t3, n3);
          }, a.alloc = function(e2, t3, n3) {
            if ("number" != typeof e2) throw new TypeError("Argument must be a number");
            var r3 = i(e2);
            return void 0 === t3 ? r3.fill(0) : "string" == typeof n3 ? r3.fill(t3, n3) : r3.fill(t3), r3;
          }, a.allocUnsafe = function(e2) {
            if ("number" != typeof e2) throw new TypeError("Argument must be a number");
            return i(e2);
          }, a.allocUnsafeSlow = function(e2) {
            if ("number" != typeof e2) throw new TypeError("Argument must be a number");
            return o.SlowBuffer(e2);
          };
        }, { buffer: 3 }], 31: [function(e, t2, n2) {
          "use strict";
          function r2(e2) {
            if (!e2) return "utf8";
            for (var t3; ; ) switch (e2) {
              case "utf8":
              case "utf-8":
                return "utf8";
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return "utf16le";
              case "latin1":
              case "binary":
                return "latin1";
              case "base64":
              case "ascii":
              case "hex":
                return e2;
              default:
                if (t3) return;
                e2 = ("" + e2).toLowerCase(), t3 = true;
            }
          }
          function a(e2) {
            var t3 = r2(e2);
            if ("string" != typeof t3 && (m.isEncoding === b || !b(e2))) throw new Error("Unknown encoding: " + e2);
            return t3 || e2;
          }
          function o(e2) {
            this.encoding = a(e2);
            var t3;
            switch (this.encoding) {
              case "utf16le":
                this.text = u, this.end = p, t3 = 4;
                break;
              case "utf8":
                this.fillLast = c, t3 = 4;
                break;
              case "base64":
                this.text = f, this.end = g, t3 = 3;
                break;
              default:
                return this.write = _, void (this.end = h);
            }
            this.lastNeed = 0, this.lastTotal = 0, this.lastChar = m.allocUnsafe(t3);
          }
          function d(e2) {
            if (127 >= e2) return 0;
            return 6 == e2 >> 5 ? 2 : 14 == e2 >> 4 ? 3 : 30 == e2 >> 3 ? 4 : 2 == e2 >> 6 ? -1 : -2;
          }
          function s(e2, t3, n3) {
            var r3 = t3.length - 1;
            if (r3 < n3) return 0;
            var a2 = d(t3[r3]);
            return 0 <= a2 ? (0 < a2 && (e2.lastNeed = a2 - 1), a2) : --r3 < n3 || -2 === a2 ? 0 : (a2 = d(t3[r3]), 0 <= a2) ? (0 < a2 && (e2.lastNeed = a2 - 2), a2) : --r3 < n3 || -2 === a2 ? 0 : (a2 = d(t3[r3]), 0 <= a2 ? (0 < a2 && (2 === a2 ? a2 = 0 : e2.lastNeed = a2 - 3), a2) : 0);
          }
          function l(e2, t3) {
            if (128 != (192 & t3[0])) return e2.lastNeed = 0, "\uFFFD";
            if (1 < e2.lastNeed && 1 < t3.length) {
              if (128 != (192 & t3[1])) return e2.lastNeed = 1, "\uFFFD";
              if (2 < e2.lastNeed && 2 < t3.length && 128 != (192 & t3[2])) return e2.lastNeed = 2, "\uFFFD";
            }
          }
          function c(e2) {
            var t3 = this.lastTotal - this.lastNeed, n3 = l(this, e2, t3);
            return void 0 === n3 ? this.lastNeed <= e2.length ? (e2.copy(this.lastChar, t3, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal)) : void (e2.copy(this.lastChar, t3, 0, e2.length), this.lastNeed -= e2.length) : n3;
          }
          function u(e2, t3) {
            if (0 == (e2.length - t3) % 2) {
              var n3 = e2.toString("utf16le", t3);
              if (n3) {
                var r3 = n3.charCodeAt(n3.length - 1);
                if (55296 <= r3 && 56319 >= r3) return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = e2[e2.length - 2], this.lastChar[1] = e2[e2.length - 1], n3.slice(0, -1);
              }
              return n3;
            }
            return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = e2[e2.length - 1], e2.toString("utf16le", t3, e2.length - 1);
          }
          function p(e2) {
            var t3 = e2 && e2.length ? this.write(e2) : "";
            if (this.lastNeed) {
              var n3 = this.lastTotal - this.lastNeed;
              return t3 + this.lastChar.toString("utf16le", 0, n3);
            }
            return t3;
          }
          function f(e2, t3) {
            var r3 = (e2.length - t3) % 3;
            return 0 == r3 ? e2.toString("base64", t3) : (this.lastNeed = 3 - r3, this.lastTotal = 3, 1 == r3 ? this.lastChar[0] = e2[e2.length - 1] : (this.lastChar[0] = e2[e2.length - 2], this.lastChar[1] = e2[e2.length - 1]), e2.toString("base64", t3, e2.length - r3));
          }
          function g(e2) {
            var t3 = e2 && e2.length ? this.write(e2) : "";
            return this.lastNeed ? t3 + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : t3;
          }
          function _(e2) {
            return e2.toString(this.encoding);
          }
          function h(e2) {
            return e2 && e2.length ? this.write(e2) : "";
          }
          var m = e("safe-buffer").Buffer, b = m.isEncoding || function(e2) {
            switch (e2 = "" + e2, e2 && e2.toLowerCase()) {
              case "hex":
              case "utf8":
              case "utf-8":
              case "ascii":
              case "binary":
              case "base64":
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
              case "raw":
                return true;
              default:
                return false;
            }
          };
          n2.StringDecoder = o, o.prototype.write = function(e2) {
            if (0 === e2.length) return "";
            var t3, n3;
            if (this.lastNeed) {
              if (t3 = this.fillLast(e2), void 0 === t3) return "";
              n3 = this.lastNeed, this.lastNeed = 0;
            } else n3 = 0;
            return n3 < e2.length ? t3 ? t3 + this.text(e2, n3) : this.text(e2, n3) : t3 || "";
          }, o.prototype.end = function(e2) {
            var t3 = e2 && e2.length ? this.write(e2) : "";
            return this.lastNeed ? t3 + "\uFFFD" : t3;
          }, o.prototype.text = function(e2, t3) {
            var n3 = s(this, e2, t3);
            if (!this.lastNeed) return e2.toString("utf8", t3);
            this.lastTotal = n3;
            var r3 = e2.length - (n3 - this.lastNeed);
            return e2.copy(this.lastChar, 0, r3), e2.toString("utf8", t3, r3);
          }, o.prototype.fillLast = function(e2) {
            return this.lastNeed <= e2.length ? (e2.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal)) : void (e2.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, e2.length), this.lastNeed -= e2.length);
          };
        }, { "safe-buffer": 30 }], 32: [function(e, t2) {
          (function(e2) {
            (function() {
              function n2(t3) {
                try {
                  if (!e2.localStorage) return false;
                } catch (e3) {
                  return false;
                }
                var n3 = e2.localStorage[t3];
                return null != n3 && "true" === (n3 + "").toLowerCase();
              }
              t2.exports = function(e3, t3) {
                function r2() {
                  if (!a) {
                    if (n2("throwDeprecation")) throw new Error(t3);
                    else n2("traceDeprecation") ? console.trace(t3) : console.warn(t3);
                    a = true;
                  }
                  return e3.apply(this, arguments);
                }
                if (n2("noDeprecation")) return e3;
                var a = false;
                return r2;
              };
            }).call(this);
          }).call(this, "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global);
        }, {}], "/": [function(e, t2) {
          function n2(e2) {
            return e2.replace(/a=ice-options:trickle\s\n/g, "");
          }
          function r2(e2) {
            console.warn(e2);
          }
          const a = e("debug")("simple-peer"), o = e("get-browser-rtc"), i = e("randombytes"), d = e("readable-stream"), s = e("queue-microtask"), l = e("err-code"), { Buffer: c } = e("buffer"), u = 65536;
          class p extends d.Duplex {
            constructor(e2) {
              if (e2 = Object.assign({ allowHalfOpen: false }, e2), super(e2), this._id = i(4).toString("hex").slice(0, 7), this._debug("new peer %o", e2), this.channelName = e2.initiator ? e2.channelName || i(20).toString("hex") : null, this.initiator = e2.initiator || false, this.channelConfig = e2.channelConfig || p.channelConfig, this.channelNegotiated = this.channelConfig.negotiated, this.config = Object.assign({}, p.config, e2.config), this.offerOptions = e2.offerOptions || {}, this.answerOptions = e2.answerOptions || {}, this.sdpTransform = e2.sdpTransform || ((e3) => e3), this.streams = e2.streams || (e2.stream ? [e2.stream] : []), this.trickle = void 0 === e2.trickle || e2.trickle, this.allowHalfTrickle = void 0 !== e2.allowHalfTrickle && e2.allowHalfTrickle, this.iceCompleteTimeout = e2.iceCompleteTimeout || 5e3, this.destroyed = false, this.destroying = false, this._connected = false, this.remoteAddress = void 0, this.remoteFamily = void 0, this.remotePort = void 0, this.localAddress = void 0, this.localFamily = void 0, this.localPort = void 0, this._wrtc = e2.wrtc && "object" == typeof e2.wrtc ? e2.wrtc : o(), !this._wrtc) if ("undefined" == typeof window) throw l(new Error("No WebRTC support: Specify `opts.wrtc` option in this environment"), "ERR_WEBRTC_SUPPORT");
              else throw l(new Error("No WebRTC support: Not a supported browser"), "ERR_WEBRTC_SUPPORT");
              this._pcReady = false, this._channelReady = false, this._iceComplete = false, this._iceCompleteTimer = null, this._channel = null, this._pendingCandidates = [], this._isNegotiating = false, this._firstNegotiation = true, this._batchedNegotiation = false, this._queuedNegotiation = false, this._sendersAwaitingStable = [], this._senderMap = /* @__PURE__ */ new Map(), this._closingInterval = null, this._remoteTracks = [], this._remoteStreams = [], this._chunk = null, this._cb = null, this._interval = null;
              try {
                this._pc = new this._wrtc.RTCPeerConnection(this.config);
              } catch (e3) {
                return void this.destroy(l(e3, "ERR_PC_CONSTRUCTOR"));
              }
              this._isReactNativeWebrtc = "number" == typeof this._pc._peerConnectionId, this._pc.oniceconnectionstatechange = () => {
                this._onIceStateChange();
              }, this._pc.onicegatheringstatechange = () => {
                this._onIceStateChange();
              }, this._pc.onconnectionstatechange = () => {
                this._onConnectionStateChange();
              }, this._pc.onsignalingstatechange = () => {
                this._onSignalingStateChange();
              }, this._pc.onicecandidate = (e3) => {
                this._onIceCandidate(e3);
              }, "object" == typeof this._pc.peerIdentity && this._pc.peerIdentity.catch((e3) => {
                this.destroy(l(e3, "ERR_PC_PEER_IDENTITY"));
              }), this.initiator || this.channelNegotiated ? this._setupData({ channel: this._pc.createDataChannel(this.channelName, this.channelConfig) }) : this._pc.ondatachannel = (e3) => {
                this._setupData(e3);
              }, this.streams && this.streams.forEach((e3) => {
                this.addStream(e3);
              }), this._pc.ontrack = (e3) => {
                this._onTrack(e3);
              }, this._debug("initial negotiation"), this._needsNegotiation(), this._onFinishBound = () => {
                this._onFinish();
              }, this.once("finish", this._onFinishBound);
            }
            get bufferSize() {
              return this._channel && this._channel.bufferedAmount || 0;
            }
            get connected() {
              return this._connected && "open" === this._channel.readyState;
            }
            address() {
              return { port: this.localPort, family: this.localFamily, address: this.localAddress };
            }
            signal(e2) {
              if (!this.destroying) {
                if (this.destroyed) throw l(new Error("cannot signal after peer is destroyed"), "ERR_DESTROYED");
                if ("string" == typeof e2) try {
                  e2 = JSON.parse(e2);
                } catch (t3) {
                  e2 = {};
                }
                this._debug("signal()"), e2.renegotiate && this.initiator && (this._debug("got request to renegotiate"), this._needsNegotiation()), e2.transceiverRequest && this.initiator && (this._debug("got request for transceiver"), this.addTransceiver(e2.transceiverRequest.kind, e2.transceiverRequest.init)), e2.candidate && (this._pc.remoteDescription && this._pc.remoteDescription.type ? this._addIceCandidate(e2.candidate) : this._pendingCandidates.push(e2.candidate)), e2.sdp && this._pc.setRemoteDescription(new this._wrtc.RTCSessionDescription(e2)).then(() => {
                  this.destroyed || (this._pendingCandidates.forEach((e3) => {
                    this._addIceCandidate(e3);
                  }), this._pendingCandidates = [], "offer" === this._pc.remoteDescription.type && this._createAnswer());
                }).catch((e3) => {
                  this.destroy(l(e3, "ERR_SET_REMOTE_DESCRIPTION"));
                }), e2.sdp || e2.candidate || e2.renegotiate || e2.transceiverRequest || this.destroy(l(new Error("signal() called with invalid signal data"), "ERR_SIGNALING"));
              }
            }
            _addIceCandidate(e2) {
              const t3 = new this._wrtc.RTCIceCandidate(e2);
              this._pc.addIceCandidate(t3).catch((e3) => {
                !t3.address || t3.address.endsWith(".local") ? r2("Ignoring unsupported ICE candidate.") : this.destroy(l(e3, "ERR_ADD_ICE_CANDIDATE"));
              });
            }
            send(e2) {
              if (!this.destroying) {
                if (this.destroyed) throw l(new Error("cannot send after peer is destroyed"), "ERR_DESTROYED");
                this._channel.send(e2);
              }
            }
            addTransceiver(e2, t3) {
              if (!this.destroying) {
                if (this.destroyed) throw l(new Error("cannot addTransceiver after peer is destroyed"), "ERR_DESTROYED");
                if (this._debug("addTransceiver()"), this.initiator) try {
                  this._pc.addTransceiver(e2, t3), this._needsNegotiation();
                } catch (e3) {
                  this.destroy(l(e3, "ERR_ADD_TRANSCEIVER"));
                }
                else this.emit("signal", { type: "transceiverRequest", transceiverRequest: { kind: e2, init: t3 } });
              }
            }
            addStream(e2) {
              if (!this.destroying) {
                if (this.destroyed) throw l(new Error("cannot addStream after peer is destroyed"), "ERR_DESTROYED");
                this._debug("addStream()"), e2.getTracks().forEach((t3) => {
                  this.addTrack(t3, e2);
                });
              }
            }
            addTrack(e2, t3) {
              if (this.destroying) return;
              if (this.destroyed) throw l(new Error("cannot addTrack after peer is destroyed"), "ERR_DESTROYED");
              this._debug("addTrack()");
              const n3 = this._senderMap.get(e2) || /* @__PURE__ */ new Map();
              let r3 = n3.get(t3);
              if (!r3) r3 = this._pc.addTrack(e2, t3), n3.set(t3, r3), this._senderMap.set(e2, n3), this._needsNegotiation();
              else if (r3.removed) throw l(new Error("Track has been removed. You should enable/disable tracks that you want to re-add."), "ERR_SENDER_REMOVED");
              else throw l(new Error("Track has already been added to that stream."), "ERR_SENDER_ALREADY_ADDED");
            }
            replaceTrack(e2, t3, n3) {
              if (this.destroying) return;
              if (this.destroyed) throw l(new Error("cannot replaceTrack after peer is destroyed"), "ERR_DESTROYED");
              this._debug("replaceTrack()");
              const r3 = this._senderMap.get(e2), a2 = r3 ? r3.get(n3) : null;
              if (!a2) throw l(new Error("Cannot replace track that was never added."), "ERR_TRACK_NOT_ADDED");
              t3 && this._senderMap.set(t3, r3), null == a2.replaceTrack ? this.destroy(l(new Error("replaceTrack is not supported in this browser"), "ERR_UNSUPPORTED_REPLACETRACK")) : a2.replaceTrack(t3);
            }
            removeTrack(e2, t3) {
              if (this.destroying) return;
              if (this.destroyed) throw l(new Error("cannot removeTrack after peer is destroyed"), "ERR_DESTROYED");
              this._debug("removeSender()");
              const n3 = this._senderMap.get(e2), r3 = n3 ? n3.get(t3) : null;
              if (!r3) throw l(new Error("Cannot remove track that was never added."), "ERR_TRACK_NOT_ADDED");
              try {
                r3.removed = true, this._pc.removeTrack(r3);
              } catch (e3) {
                "NS_ERROR_UNEXPECTED" === e3.name ? this._sendersAwaitingStable.push(r3) : this.destroy(l(e3, "ERR_REMOVE_TRACK"));
              }
              this._needsNegotiation();
            }
            removeStream(e2) {
              if (!this.destroying) {
                if (this.destroyed) throw l(new Error("cannot removeStream after peer is destroyed"), "ERR_DESTROYED");
                this._debug("removeSenders()"), e2.getTracks().forEach((t3) => {
                  this.removeTrack(t3, e2);
                });
              }
            }
            _needsNegotiation() {
              this._debug("_needsNegotiation"), this._batchedNegotiation || (this._batchedNegotiation = true, s(() => {
                this._batchedNegotiation = false, this.initiator || !this._firstNegotiation ? (this._debug("starting batched negotiation"), this.negotiate()) : this._debug("non-initiator initial negotiation request discarded"), this._firstNegotiation = false;
              }));
            }
            negotiate() {
              if (!this.destroying) {
                if (this.destroyed) throw l(new Error("cannot negotiate after peer is destroyed"), "ERR_DESTROYED");
                this.initiator ? this._isNegotiating ? (this._queuedNegotiation = true, this._debug("already negotiating, queueing")) : (this._debug("start negotiation"), setTimeout(() => {
                  this._createOffer();
                }, 0)) : this._isNegotiating ? (this._queuedNegotiation = true, this._debug("already negotiating, queueing")) : (this._debug("requesting negotiation from initiator"), this.emit("signal", { type: "renegotiate", renegotiate: true })), this._isNegotiating = true;
              }
            }
            destroy(e2) {
              this._destroy(e2, () => {
              });
            }
            _destroy(e2, t3) {
              this.destroyed || this.destroying || (this.destroying = true, this._debug("destroying (error: %s)", e2 && (e2.message || e2)), s(() => {
                if (this.destroyed = true, this.destroying = false, this._debug("destroy (error: %s)", e2 && (e2.message || e2)), this.readable = this.writable = false, this._readableState.ended || this.push(null), this._writableState.finished || this.end(), this._connected = false, this._pcReady = false, this._channelReady = false, this._remoteTracks = null, this._remoteStreams = null, this._senderMap = null, clearInterval(this._closingInterval), this._closingInterval = null, clearInterval(this._interval), this._interval = null, this._chunk = null, this._cb = null, this._onFinishBound && this.removeListener("finish", this._onFinishBound), this._onFinishBound = null, this._channel) {
                  try {
                    this._channel.close();
                  } catch (e3) {
                  }
                  this._channel.onmessage = null, this._channel.onopen = null, this._channel.onclose = null, this._channel.onerror = null;
                }
                if (this._pc) {
                  try {
                    this._pc.close();
                  } catch (e3) {
                  }
                  this._pc.oniceconnectionstatechange = null, this._pc.onicegatheringstatechange = null, this._pc.onsignalingstatechange = null, this._pc.onicecandidate = null, this._pc.ontrack = null, this._pc.ondatachannel = null;
                }
                this._pc = null, this._channel = null, e2 && this.emit("error", e2), this.emit("close"), t3();
              }));
            }
            _setupData(e2) {
              if (!e2.channel) return this.destroy(l(new Error("Data channel event is missing `channel` property"), "ERR_DATA_CHANNEL"));
              this._channel = e2.channel, this._channel.binaryType = "arraybuffer", "number" == typeof this._channel.bufferedAmountLowThreshold && (this._channel.bufferedAmountLowThreshold = u), this.channelName = this._channel.label, this._channel.onmessage = (e3) => {
                this._onChannelMessage(e3);
              }, this._channel.onbufferedamountlow = () => {
                this._onChannelBufferedAmountLow();
              }, this._channel.onopen = () => {
                this._onChannelOpen();
              }, this._channel.onclose = () => {
                this._onChannelClose();
              }, this._channel.onerror = (e3) => {
                const t4 = e3.error instanceof Error ? e3.error : new Error(`Datachannel error: ${e3.message} ${e3.filename}:${e3.lineno}:${e3.colno}`);
                this.destroy(l(t4, "ERR_DATA_CHANNEL"));
              };
              let t3 = false;
              this._closingInterval = setInterval(() => {
                this._channel && "closing" === this._channel.readyState ? (t3 && this._onChannelClose(), t3 = true) : t3 = false;
              }, 5e3);
            }
            _read() {
            }
            _write(e2, t3, n3) {
              if (this.destroyed) return n3(l(new Error("cannot write after peer is destroyed"), "ERR_DATA_CHANNEL"));
              if (this._connected) {
                try {
                  this.send(e2);
                } catch (e3) {
                  return this.destroy(l(e3, "ERR_DATA_CHANNEL"));
                }
                this._channel.bufferedAmount > u ? (this._debug("start backpressure: bufferedAmount %d", this._channel.bufferedAmount), this._cb = n3) : n3(null);
              } else this._debug("write before connect"), this._chunk = e2, this._cb = n3;
            }
            _onFinish() {
              if (!this.destroyed) {
                const e2 = () => {
                  setTimeout(() => this.destroy(), 1e3);
                };
                this._connected ? e2() : this.once("connect", e2);
              }
            }
            _startIceCompleteTimeout() {
              this.destroyed || this._iceCompleteTimer || (this._debug("started iceComplete timeout"), this._iceCompleteTimer = setTimeout(() => {
                this._iceComplete || (this._iceComplete = true, this._debug("iceComplete timeout completed"), this.emit("iceTimeout"), this.emit("_iceComplete"));
              }, this.iceCompleteTimeout));
            }
            _createOffer() {
              this.destroyed || this._pc.createOffer(this.offerOptions).then((e2) => {
                if (this.destroyed) return;
                this.trickle || this.allowHalfTrickle || (e2.sdp = n2(e2.sdp)), e2.sdp = this.sdpTransform(e2.sdp);
                const t3 = () => {
                  if (!this.destroyed) {
                    const t4 = this._pc.localDescription || e2;
                    this._debug("signal"), this.emit("signal", { type: t4.type, sdp: t4.sdp });
                  }
                };
                this._pc.setLocalDescription(e2).then(() => {
                  this._debug("createOffer success"), this.destroyed || (this.trickle || this._iceComplete ? t3() : this.once("_iceComplete", t3));
                }).catch((e3) => {
                  this.destroy(l(e3, "ERR_SET_LOCAL_DESCRIPTION"));
                });
              }).catch((e2) => {
                this.destroy(l(e2, "ERR_CREATE_OFFER"));
              });
            }
            _requestMissingTransceivers() {
              this._pc.getTransceivers && this._pc.getTransceivers().forEach((e2) => {
                e2.mid || !e2.sender.track || e2.requested || (e2.requested = true, this.addTransceiver(e2.sender.track.kind));
              });
            }
            _createAnswer() {
              this.destroyed || this._pc.createAnswer(this.answerOptions).then((e2) => {
                if (this.destroyed) return;
                this.trickle || this.allowHalfTrickle || (e2.sdp = n2(e2.sdp)), e2.sdp = this.sdpTransform(e2.sdp);
                const t3 = () => {
                  if (!this.destroyed) {
                    const t4 = this._pc.localDescription || e2;
                    this._debug("signal"), this.emit("signal", { type: t4.type, sdp: t4.sdp }), this.initiator || this._requestMissingTransceivers();
                  }
                };
                this._pc.setLocalDescription(e2).then(() => {
                  this.destroyed || (this.trickle || this._iceComplete ? t3() : this.once("_iceComplete", t3));
                }).catch((e3) => {
                  this.destroy(l(e3, "ERR_SET_LOCAL_DESCRIPTION"));
                });
              }).catch((e2) => {
                this.destroy(l(e2, "ERR_CREATE_ANSWER"));
              });
            }
            _onConnectionStateChange() {
              this.destroyed || "failed" === this._pc.connectionState && this.destroy(l(new Error("Connection failed."), "ERR_CONNECTION_FAILURE"));
            }
            _onIceStateChange() {
              if (this.destroyed) return;
              const e2 = this._pc.iceConnectionState, t3 = this._pc.iceGatheringState;
              this._debug("iceStateChange (connection: %s) (gathering: %s)", e2, t3), this.emit("iceStateChange", e2, t3), ("connected" === e2 || "completed" === e2) && (this._pcReady = true, this._maybeReady()), "failed" === e2 && this.destroy(l(new Error("Ice connection failed."), "ERR_ICE_CONNECTION_FAILURE")), "closed" === e2 && this.destroy(l(new Error("Ice connection closed."), "ERR_ICE_CONNECTION_CLOSED"));
            }
            getStats(e2) {
              const t3 = (e3) => ("[object Array]" === Object.prototype.toString.call(e3.values) && e3.values.forEach((t4) => {
                Object.assign(e3, t4);
              }), e3);
              0 === this._pc.getStats.length || this._isReactNativeWebrtc ? this._pc.getStats().then((n3) => {
                const r3 = [];
                n3.forEach((e3) => {
                  r3.push(t3(e3));
                }), e2(null, r3);
              }, (t4) => e2(t4)) : 0 < this._pc.getStats.length ? this._pc.getStats((n3) => {
                if (this.destroyed) return;
                const r3 = [];
                n3.result().forEach((e3) => {
                  const n4 = {};
                  e3.names().forEach((t4) => {
                    n4[t4] = e3.stat(t4);
                  }), n4.id = e3.id, n4.type = e3.type, n4.timestamp = e3.timestamp, r3.push(t3(n4));
                }), e2(null, r3);
              }, (t4) => e2(t4)) : e2(null, []);
            }
            _maybeReady() {
              if (this._debug("maybeReady pc %s channel %s", this._pcReady, this._channelReady), this._connected || this._connecting || !this._pcReady || !this._channelReady) return;
              this._connecting = true;
              const e2 = () => {
                this.destroyed || this.getStats((t3, n3) => {
                  if (this.destroyed) return;
                  t3 && (n3 = []);
                  const r3 = {}, a2 = {}, o2 = {};
                  let i2 = false;
                  n3.forEach((e3) => {
                    ("remotecandidate" === e3.type || "remote-candidate" === e3.type) && (r3[e3.id] = e3), ("localcandidate" === e3.type || "local-candidate" === e3.type) && (a2[e3.id] = e3), ("candidatepair" === e3.type || "candidate-pair" === e3.type) && (o2[e3.id] = e3);
                  });
                  const d2 = (e3) => {
                    i2 = true;
                    let t4 = a2[e3.localCandidateId];
                    t4 && (t4.ip || t4.address) ? (this.localAddress = t4.ip || t4.address, this.localPort = +t4.port) : t4 && t4.ipAddress ? (this.localAddress = t4.ipAddress, this.localPort = +t4.portNumber) : "string" == typeof e3.googLocalAddress && (t4 = e3.googLocalAddress.split(":"), this.localAddress = t4[0], this.localPort = +t4[1]), this.localAddress && (this.localFamily = this.localAddress.includes(":") ? "IPv6" : "IPv4");
                    let n4 = r3[e3.remoteCandidateId];
                    n4 && (n4.ip || n4.address) ? (this.remoteAddress = n4.ip || n4.address, this.remotePort = +n4.port) : n4 && n4.ipAddress ? (this.remoteAddress = n4.ipAddress, this.remotePort = +n4.portNumber) : "string" == typeof e3.googRemoteAddress && (n4 = e3.googRemoteAddress.split(":"), this.remoteAddress = n4[0], this.remotePort = +n4[1]), this.remoteAddress && (this.remoteFamily = this.remoteAddress.includes(":") ? "IPv6" : "IPv4"), this._debug("connect local: %s:%s remote: %s:%s", this.localAddress, this.localPort, this.remoteAddress, this.remotePort);
                  };
                  if (n3.forEach((e3) => {
                    "transport" === e3.type && e3.selectedCandidatePairId && d2(o2[e3.selectedCandidatePairId]), ("googCandidatePair" === e3.type && "true" === e3.googActiveConnection || ("candidatepair" === e3.type || "candidate-pair" === e3.type) && e3.selected) && d2(e3);
                  }), !i2 && (!Object.keys(o2).length || Object.keys(a2).length)) return void setTimeout(e2, 100);
                  if (this._connecting = false, this._connected = true, this._chunk) {
                    try {
                      this.send(this._chunk);
                    } catch (e4) {
                      return this.destroy(l(e4, "ERR_DATA_CHANNEL"));
                    }
                    this._chunk = null, this._debug('sent chunk from "write before connect"');
                    const e3 = this._cb;
                    this._cb = null, e3(null);
                  }
                  "number" != typeof this._channel.bufferedAmountLowThreshold && (this._interval = setInterval(() => this._onInterval(), 150), this._interval.unref && this._interval.unref()), this._debug("connect"), this.emit("connect");
                });
              };
              e2();
            }
            _onInterval() {
              this._cb && this._channel && !(this._channel.bufferedAmount > u) && this._onChannelBufferedAmountLow();
            }
            _onSignalingStateChange() {
              this.destroyed || ("stable" === this._pc.signalingState && (this._isNegotiating = false, this._debug("flushing sender queue", this._sendersAwaitingStable), this._sendersAwaitingStable.forEach((e2) => {
                this._pc.removeTrack(e2), this._queuedNegotiation = true;
              }), this._sendersAwaitingStable = [], this._queuedNegotiation ? (this._debug("flushing negotiation queue"), this._queuedNegotiation = false, this._needsNegotiation()) : (this._debug("negotiated"), this.emit("negotiated"))), this._debug("signalingStateChange %s", this._pc.signalingState), this.emit("signalingStateChange", this._pc.signalingState));
            }
            _onIceCandidate(e2) {
              this.destroyed || (e2.candidate && this.trickle ? this.emit("signal", { type: "candidate", candidate: { candidate: e2.candidate.candidate, sdpMLineIndex: e2.candidate.sdpMLineIndex, sdpMid: e2.candidate.sdpMid } }) : !e2.candidate && !this._iceComplete && (this._iceComplete = true, this.emit("_iceComplete")), e2.candidate && this._startIceCompleteTimeout());
            }
            _onChannelMessage(e2) {
              if (this.destroyed) return;
              let t3 = e2.data;
              t3 instanceof ArrayBuffer && (t3 = c.from(t3)), this.push(t3);
            }
            _onChannelBufferedAmountLow() {
              if (!this.destroyed && this._cb) {
                this._debug("ending backpressure: bufferedAmount %d", this._channel.bufferedAmount);
                const e2 = this._cb;
                this._cb = null, e2(null);
              }
            }
            _onChannelOpen() {
              this._connected || this.destroyed || (this._debug("on channel open"), this._channelReady = true, this._maybeReady());
            }
            _onChannelClose() {
              this.destroyed || (this._debug("on channel close"), this.destroy());
            }
            _onTrack(e2) {
              this.destroyed || e2.streams.forEach((t3) => {
                this._debug("on track"), this.emit("track", e2.track, t3), this._remoteTracks.push({ track: e2.track, stream: t3 }), this._remoteStreams.some((e3) => e3.id === t3.id) || (this._remoteStreams.push(t3), s(() => {
                  this._debug("on stream"), this.emit("stream", t3);
                }));
              });
            }
            _debug() {
              const e2 = [].slice.call(arguments);
              e2[0] = "[" + this._id + "] " + e2[0], a.apply(null, e2);
            }
          }
          p.WEBRTC_SUPPORT = !!o(), p.config = { iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] }], sdpSemantics: "unified-plan" }, p.channelConfig = {}, t2.exports = p;
        }, { buffer: 3, debug: 4, "err-code": 6, "get-browser-rtc": 8, "queue-microtask": 13, randombytes: 14, "readable-stream": 29 }] }, {}, [])("/");
      });
    }
  });

  // ../../node_modules/.pnpm/y-webrtc@10.3.0_yjs@13.6.32/node_modules/y-webrtc/src/crypto.js
  var deriveKey, encrypt2, encryptJson, decrypt2, decryptJson;
  var init_crypto = __esm({
    "../../node_modules/.pnpm/y-webrtc@10.3.0_yjs@13.6.32/node_modules/y-webrtc/src/crypto.js"() {
      "use strict";
      init_encoding();
      init_decoding();
      init_promise();
      init_error();
      init_string();
      deriveKey = (secret, roomName) => {
        const secretBuffer = encodeUtf8(secret).buffer;
        const salt = encodeUtf8(roomName).buffer;
        return crypto.subtle.importKey(
          "raw",
          secretBuffer,
          "PBKDF2",
          false,
          ["deriveKey"]
        ).then(
          (keyMaterial) => crypto.subtle.deriveKey(
            {
              name: "PBKDF2",
              salt,
              iterations: 1e5,
              hash: "SHA-256"
            },
            keyMaterial,
            {
              name: "AES-GCM",
              length: 256
            },
            true,
            ["encrypt", "decrypt"]
          )
        );
      };
      encrypt2 = (data, key) => {
        if (!key) {
          return (
            /** @type {PromiseLike<Uint8Array>} */
            resolve(data)
          );
        }
        const iv = crypto.getRandomValues(new Uint8Array(12));
        return crypto.subtle.encrypt(
          {
            name: "AES-GCM",
            iv
          },
          key,
          data
        ).then((cipher) => {
          const encryptedDataEncoder = createEncoder();
          writeVarString(encryptedDataEncoder, "AES-GCM");
          writeVarUint8Array(encryptedDataEncoder, iv);
          writeVarUint8Array(encryptedDataEncoder, new Uint8Array(cipher));
          return toUint8Array(encryptedDataEncoder);
        });
      };
      encryptJson = (data, key) => {
        const dataEncoder = createEncoder();
        writeAny(dataEncoder, data);
        return encrypt2(toUint8Array(dataEncoder), key);
      };
      decrypt2 = (data, key) => {
        if (!key) {
          return (
            /** @type {PromiseLike<Uint8Array>} */
            resolve(data)
          );
        }
        const dataDecoder = createDecoder(data);
        const algorithm = readVarString(dataDecoder);
        if (algorithm !== "AES-GCM") {
          reject(create3("Unknown encryption algorithm"));
        }
        const iv = readVarUint8Array(dataDecoder);
        const cipher = readVarUint8Array(dataDecoder);
        return crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv
          },
          key,
          cipher
        ).then((data2) => new Uint8Array(data2));
      };
      decryptJson = (data, key) => decrypt2(data, key).then(
        (decryptedValue) => readAny(createDecoder(new Uint8Array(decryptedValue)))
      );
    }
  });

  // ../../node_modules/.pnpm/y-webrtc@10.3.0_yjs@13.6.32/node_modules/y-webrtc/src/y-webrtc.js
  var y_webrtc_exports = {};
  __export(y_webrtc_exports, {
    Room: () => Room,
    SignalingConn: () => SignalingConn,
    WebrtcConn: () => WebrtcConn,
    WebrtcProvider: () => WebrtcProvider
  });
  var import_simplepeer_min, log, messageSync2, messageQueryAwareness2, messageAwareness2, messageBcPeerId, signalingConns, rooms, checkIsSynced, readMessage2, readPeerMessage, sendWebrtcConn, broadcastWebrtcConn, WebrtcConn, broadcastBcMessage, broadcastRoomMessage, announceSignalingInfo, broadcastBcPeerId, Room, openRoom, publishSignalingMessage, SignalingConn, emitStatus, WebrtcProvider;
  var init_y_webrtc = __esm({
    "../../node_modules/.pnpm/y-webrtc@10.3.0_yjs@13.6.32/node_modules/y-webrtc/src/y-webrtc.js"() {
      "use strict";
      init_websocket();
      init_map();
      init_error();
      init_random();
      init_encoding();
      init_decoding();
      init_observable();
      init_logging();
      init_promise();
      init_broadcastchannel();
      init_buffer();
      init_math();
      init_mutex();
      import_simplepeer_min = __toESM(require_simplepeer_min(), 1);
      init_sync();
      init_awareness();
      init_crypto();
      log = createModuleLogger2("y-webrtc");
      messageSync2 = 0;
      messageQueryAwareness2 = 3;
      messageAwareness2 = 1;
      messageBcPeerId = 4;
      signalingConns = /* @__PURE__ */ new Map();
      rooms = /* @__PURE__ */ new Map();
      checkIsSynced = (room) => {
        let synced = true;
        room.webrtcConns.forEach((peer) => {
          if (!peer.synced) {
            synced = false;
          }
        });
        if (!synced && room.synced || synced && !room.synced) {
          room.synced = synced;
          room.provider.emit("synced", [{ synced }]);
          log("synced ", BOLD, room.name, UNBOLD, " with all peers");
        }
      };
      readMessage2 = (room, buf, syncedCallback) => {
        const decoder = createDecoder(buf);
        const encoder = createEncoder();
        const messageType = readVarUint(decoder);
        if (room === void 0) {
          return null;
        }
        const awareness = room.awareness;
        const doc2 = room.doc;
        let sendReply = false;
        switch (messageType) {
          case messageSync2: {
            writeVarUint(encoder, messageSync2);
            const syncMessageType = readSyncMessage(decoder, encoder, doc2, room);
            if (syncMessageType === messageYjsSyncStep2 && !room.synced) {
              syncedCallback();
            }
            if (syncMessageType === messageYjsSyncStep1) {
              sendReply = true;
            }
            break;
          }
          case messageQueryAwareness2:
            writeVarUint(encoder, messageAwareness2);
            writeVarUint8Array(encoder, encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys())));
            sendReply = true;
            break;
          case messageAwareness2:
            applyAwarenessUpdate(awareness, readVarUint8Array(decoder), room);
            break;
          case messageBcPeerId: {
            const add = readUint8(decoder) === 1;
            const peerName = readVarString(decoder);
            if (peerName !== room.peerId && (room.bcConns.has(peerName) && !add || !room.bcConns.has(peerName) && add)) {
              const removed = [];
              const added = [];
              if (add) {
                room.bcConns.add(peerName);
                added.push(peerName);
              } else {
                room.bcConns.delete(peerName);
                removed.push(peerName);
              }
              room.provider.emit("peers", [{
                added,
                removed,
                webrtcPeers: Array.from(room.webrtcConns.keys()),
                bcPeers: Array.from(room.bcConns)
              }]);
              broadcastBcPeerId(room);
            }
            break;
          }
          default:
            console.error("Unable to compute message");
            return encoder;
        }
        if (!sendReply) {
          return null;
        }
        return encoder;
      };
      readPeerMessage = (peerConn, buf) => {
        const room = peerConn.room;
        log("received message from ", BOLD, peerConn.remotePeerId, GREY, " (", room.name, ")", UNBOLD, UNCOLOR);
        return readMessage2(room, buf, () => {
          peerConn.synced = true;
          log("synced ", BOLD, room.name, UNBOLD, " with ", BOLD, peerConn.remotePeerId);
          checkIsSynced(room);
        });
      };
      sendWebrtcConn = (webrtcConn, encoder) => {
        log("send message to ", BOLD, webrtcConn.remotePeerId, UNBOLD, GREY, " (", webrtcConn.room.name, ")", UNCOLOR);
        try {
          webrtcConn.peer.send(toUint8Array(encoder));
        } catch (e) {
        }
      };
      broadcastWebrtcConn = (room, m) => {
        log("broadcast message in ", BOLD, room.name, UNBOLD);
        room.webrtcConns.forEach((conn) => {
          try {
            conn.peer.send(m);
          } catch (e) {
          }
        });
      };
      WebrtcConn = class {
        /**
         * @param {SignalingConn} signalingConn
         * @param {boolean} initiator
         * @param {string} remotePeerId
         * @param {Room} room
         */
        constructor(signalingConn, initiator, remotePeerId, room) {
          log("establishing connection to ", BOLD, remotePeerId);
          this.room = room;
          this.remotePeerId = remotePeerId;
          this.glareToken = void 0;
          this.closed = false;
          this.connected = false;
          this.synced = false;
          this.peer = new import_simplepeer_min.default({ initiator, ...room.provider.peerOpts });
          this.peer.on("signal", (signal) => {
            if (this.glareToken === void 0) {
              this.glareToken = Date.now() + Math.random();
            }
            publishSignalingMessage(signalingConn, room, { to: remotePeerId, from: room.peerId, type: "signal", token: this.glareToken, signal });
          });
          this.peer.on("connect", () => {
            log("connected to ", BOLD, remotePeerId);
            this.connected = true;
            const provider = room.provider;
            const doc2 = provider.doc;
            const awareness = room.awareness;
            const encoder = createEncoder();
            writeVarUint(encoder, messageSync2);
            writeSyncStep1(encoder, doc2);
            sendWebrtcConn(this, encoder);
            const awarenessStates = awareness.getStates();
            if (awarenessStates.size > 0) {
              const encoder2 = createEncoder();
              writeVarUint(encoder2, messageAwareness2);
              writeVarUint8Array(encoder2, encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys())));
              sendWebrtcConn(this, encoder2);
            }
          });
          this.peer.on("close", () => {
            this.connected = false;
            this.closed = true;
            if (room.webrtcConns.has(this.remotePeerId)) {
              room.webrtcConns.delete(this.remotePeerId);
              room.provider.emit("peers", [{
                removed: [this.remotePeerId],
                added: [],
                webrtcPeers: Array.from(room.webrtcConns.keys()),
                bcPeers: Array.from(room.bcConns)
              }]);
            }
            checkIsSynced(room);
            this.peer.destroy();
            log("closed connection to ", BOLD, remotePeerId);
            announceSignalingInfo(room);
          });
          this.peer.on("error", (err) => {
            log("Error in connection to ", BOLD, remotePeerId, ": ", err);
            announceSignalingInfo(room);
          });
          this.peer.on("data", (data) => {
            const answer = readPeerMessage(this, data);
            if (answer !== null) {
              sendWebrtcConn(this, answer);
            }
          });
        }
        destroy() {
          this.peer.destroy();
        }
      };
      broadcastBcMessage = (room, m) => encrypt2(m, room.key).then(
        (data) => room.mux(
          () => publish(room.name, data)
        )
      );
      broadcastRoomMessage = (room, m) => {
        if (room.bcconnected) {
          broadcastBcMessage(room, m);
        }
        broadcastWebrtcConn(room, m);
      };
      announceSignalingInfo = (room) => {
        signalingConns.forEach((conn) => {
          if (conn.connected) {
            conn.send({ type: "subscribe", topics: [room.name] });
            if (room.webrtcConns.size < room.provider.maxConns) {
              publishSignalingMessage(conn, room, { type: "announce", from: room.peerId });
            }
          }
        });
      };
      broadcastBcPeerId = (room) => {
        if (room.provider.filterBcConns) {
          const encoderPeerIdBc = createEncoder();
          writeVarUint(encoderPeerIdBc, messageBcPeerId);
          writeUint8(encoderPeerIdBc, 1);
          writeVarString(encoderPeerIdBc, room.peerId);
          broadcastBcMessage(room, toUint8Array(encoderPeerIdBc));
        }
      };
      Room = class {
        /**
         * @param {Y.Doc} doc
         * @param {WebrtcProvider} provider
         * @param {string} name
         * @param {CryptoKey|null} key
         */
        constructor(doc2, provider, name, key) {
          this.peerId = uuidv4();
          this.doc = doc2;
          this.awareness = provider.awareness;
          this.provider = provider;
          this.synced = false;
          this.name = name;
          this.key = key;
          this.webrtcConns = /* @__PURE__ */ new Map();
          this.bcConns = /* @__PURE__ */ new Set();
          this.mux = createMutex();
          this.bcconnected = false;
          this._bcSubscriber = (data) => decrypt2(new Uint8Array(data), key).then(
            (m) => this.mux(() => {
              const reply = readMessage2(this, m, () => {
              });
              if (reply) {
                broadcastBcMessage(this, toUint8Array(reply));
              }
            })
          );
          this._docUpdateHandler = (update, _origin2) => {
            const encoder = createEncoder();
            writeVarUint(encoder, messageSync2);
            writeUpdate(encoder, update);
            broadcastRoomMessage(this, toUint8Array(encoder));
          };
          this._awarenessUpdateHandler = ({ added, updated, removed }, _origin2) => {
            const changedClients = added.concat(updated).concat(removed);
            const encoderAwareness = createEncoder();
            writeVarUint(encoderAwareness, messageAwareness2);
            writeVarUint8Array(encoderAwareness, encodeAwarenessUpdate(this.awareness, changedClients));
            broadcastRoomMessage(this, toUint8Array(encoderAwareness));
          };
          this._beforeUnloadHandler = () => {
            removeAwarenessStates(this.awareness, [doc2.clientID], "window unload");
            rooms.forEach((room) => {
              room.disconnect();
            });
          };
          if (typeof window !== "undefined") {
            window.addEventListener("beforeunload", this._beforeUnloadHandler);
          } else if (typeof process !== "undefined") {
            process.on("exit", this._beforeUnloadHandler);
          }
        }
        connect() {
          this.doc.on("update", this._docUpdateHandler);
          this.awareness.on("update", this._awarenessUpdateHandler);
          announceSignalingInfo(this);
          const roomName = this.name;
          subscribe(roomName, this._bcSubscriber);
          this.bcconnected = true;
          broadcastBcPeerId(this);
          const encoderSync = createEncoder();
          writeVarUint(encoderSync, messageSync2);
          writeSyncStep1(encoderSync, this.doc);
          broadcastBcMessage(this, toUint8Array(encoderSync));
          const encoderState = createEncoder();
          writeVarUint(encoderState, messageSync2);
          writeSyncStep2(encoderState, this.doc);
          broadcastBcMessage(this, toUint8Array(encoderState));
          const encoderAwarenessQuery = createEncoder();
          writeVarUint(encoderAwarenessQuery, messageQueryAwareness2);
          broadcastBcMessage(this, toUint8Array(encoderAwarenessQuery));
          const encoderAwarenessState = createEncoder();
          writeVarUint(encoderAwarenessState, messageAwareness2);
          writeVarUint8Array(encoderAwarenessState, encodeAwarenessUpdate(this.awareness, [this.doc.clientID]));
          broadcastBcMessage(this, toUint8Array(encoderAwarenessState));
        }
        disconnect() {
          signalingConns.forEach((conn) => {
            if (conn.connected) {
              conn.send({ type: "unsubscribe", topics: [this.name] });
            }
          });
          removeAwarenessStates(this.awareness, [this.doc.clientID], "disconnect");
          const encoderPeerIdBc = createEncoder();
          writeVarUint(encoderPeerIdBc, messageBcPeerId);
          writeUint8(encoderPeerIdBc, 0);
          writeVarString(encoderPeerIdBc, this.peerId);
          broadcastBcMessage(this, toUint8Array(encoderPeerIdBc));
          unsubscribe(this.name, this._bcSubscriber);
          this.bcconnected = false;
          this.doc.off("update", this._docUpdateHandler);
          this.awareness.off("update", this._awarenessUpdateHandler);
          this.webrtcConns.forEach((conn) => conn.destroy());
        }
        destroy() {
          this.disconnect();
          if (typeof window !== "undefined") {
            window.removeEventListener("beforeunload", this._beforeUnloadHandler);
          } else if (typeof process !== "undefined") {
            process.off("exit", this._beforeUnloadHandler);
          }
        }
      };
      openRoom = (doc2, provider, name, key) => {
        if (rooms.has(name)) {
          throw create3(`A Yjs Doc connected to room "${name}" already exists!`);
        }
        const room = new Room(doc2, provider, name, key);
        rooms.set(
          name,
          /** @type {Room} */
          room
        );
        return room;
      };
      publishSignalingMessage = (conn, room, data) => {
        if (room.key) {
          encryptJson(data, room.key).then((data2) => {
            conn.send({ type: "publish", topic: room.name, data: toBase64(data2) });
          });
        } else {
          conn.send({ type: "publish", topic: room.name, data });
        }
      };
      SignalingConn = class extends WebsocketClient {
        constructor(url) {
          super(url);
          this.providers = /* @__PURE__ */ new Set();
          this.on("connect", () => {
            log(`connected (${url})`);
            const topics = Array.from(rooms.keys());
            this.send({ type: "subscribe", topics });
            rooms.forEach(
              (room) => publishSignalingMessage(this, room, { type: "announce", from: room.peerId })
            );
          });
          this.on("message", (m) => {
            switch (m.type) {
              case "publish": {
                const roomName = m.topic;
                const room = rooms.get(roomName);
                if (room == null || typeof roomName !== "string") {
                  return;
                }
                const execMessage = (data) => {
                  const webrtcConns = room.webrtcConns;
                  const peerId = room.peerId;
                  if (data == null || data.from === peerId || data.to !== void 0 && data.to !== peerId || room.bcConns.has(data.from)) {
                    return;
                  }
                  const emitPeerChange = webrtcConns.has(data.from) ? () => {
                  } : () => room.provider.emit("peers", [{
                    removed: [],
                    added: [data.from],
                    webrtcPeers: Array.from(room.webrtcConns.keys()),
                    bcPeers: Array.from(room.bcConns)
                  }]);
                  switch (data.type) {
                    case "announce":
                      if (webrtcConns.size < room.provider.maxConns) {
                        setIfUndefined(webrtcConns, data.from, () => new WebrtcConn(this, true, data.from, room));
                        emitPeerChange();
                      }
                      break;
                    case "signal":
                      if (data.signal.type === "offer") {
                        const existingConn = webrtcConns.get(data.from);
                        if (existingConn) {
                          const remoteToken = data.token;
                          const localToken = existingConn.glareToken;
                          if (localToken && localToken > remoteToken) {
                            log("offer rejected: ", data.from);
                            return;
                          }
                          existingConn.glareToken = void 0;
                        }
                      }
                      if (data.signal.type === "answer") {
                        log("offer answered by: ", data.from);
                        const existingConn = webrtcConns.get(data.from);
                        existingConn.glareToken = void 0;
                      }
                      if (data.to === peerId) {
                        setIfUndefined(webrtcConns, data.from, () => new WebrtcConn(this, false, data.from, room)).peer.signal(data.signal);
                        emitPeerChange();
                      }
                      break;
                  }
                };
                if (room.key) {
                  if (typeof m.data === "string") {
                    decryptJson(fromBase64(m.data), room.key).then(execMessage);
                  }
                } else {
                  execMessage(m.data);
                }
              }
            }
          });
          this.on("disconnect", () => log(`disconnect (${url})`));
        }
      };
      emitStatus = (provider) => {
        provider.emit("status", [{
          connected: provider.connected
        }]);
      };
      WebrtcProvider = class extends ObservableV2 {
        /**
         * @param {string} roomName
         * @param {Y.Doc} doc
         * @param {ProviderOptions?} opts
         */
        constructor(roomName, doc2, {
          signaling = ["wss://y-webrtc-eu.fly.dev"],
          password = null,
          awareness = new Awareness(doc2),
          maxConns = 20 + floor(rand() * 15),
          // the random factor reduces the chance that n clients form a cluster
          filterBcConns = true,
          peerOpts = {}
          // simple-peer options. See https://github.com/feross/simple-peer#peer--new-peeropts
        } = {}) {
          super();
          this.roomName = roomName;
          this.doc = doc2;
          this.filterBcConns = filterBcConns;
          this.awareness = awareness;
          this.shouldConnect = false;
          this.signalingUrls = signaling;
          this.signalingConns = [];
          this.maxConns = maxConns;
          this.peerOpts = peerOpts;
          this.key = password ? deriveKey(password, roomName) : (
            /** @type {PromiseLike<null>} */
            resolve(null)
          );
          this.room = null;
          this.key.then((key) => {
            this.room = openRoom(doc2, this, roomName, key);
            if (this.shouldConnect) {
              this.room.connect();
            } else {
              this.room.disconnect();
            }
            emitStatus(this);
          });
          this.connect();
          this.destroy = this.destroy.bind(this);
          doc2.on("destroy", this.destroy);
        }
        /**
         * Indicates whether the provider is looking for other peers.
         *
         * Other peers can be found via signaling servers or via broadcastchannel (cross browser-tab
         * communication). You never know when you are connected to all peers. You also don't know if
         * there are other peers. connected doesn't mean that you are connected to any physical peers
         * working on the same resource as you. It does not change unless you call provider.disconnect()
         *
         * `this.on('status', (event) => { console.log(event.connected) })`
         *
         * @type {boolean}
         */
        get connected() {
          return this.room !== null && this.shouldConnect;
        }
        connect() {
          this.shouldConnect = true;
          this.signalingUrls.forEach((url) => {
            const signalingConn = setIfUndefined(signalingConns, url, () => new SignalingConn(url));
            this.signalingConns.push(signalingConn);
            signalingConn.providers.add(this);
          });
          if (this.room) {
            this.room.connect();
            emitStatus(this);
          }
        }
        disconnect() {
          this.shouldConnect = false;
          this.signalingConns.forEach((conn) => {
            conn.providers.delete(this);
            if (conn.providers.size === 0) {
              conn.destroy();
              signalingConns.delete(conn.url);
            }
          });
          if (this.room) {
            this.room.disconnect();
            emitStatus(this);
          }
        }
        destroy() {
          this.doc.off("destroy", this.destroy);
          this.key.then(() => {
            this.room.destroy();
            rooms.delete(this.roomName);
          });
          super.destroy();
        }
      };
    }
  });

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    DEFAULT_RELAY: () => DEFAULT_RELAY,
    DEPOSIT_MAGIC: () => DEPOSIT_MAGIC,
    EXPORT_FORMAT: () => EXPORT_FORMAT,
    EXPORT_VERSION: () => EXPORT_VERSION,
    EncryptedIndexeddbPersistence: () => EncryptedIndexeddbPersistence,
    Entry: () => Entry,
    POCKET_VERSION: () => POCKET_VERSION,
    ROOM_FULL_CLOSE_CODE: () => ROOM_FULL_CLOSE_CODE,
    Spool: () => Spool,
    SpoolEngine: () => SpoolEngine,
    SpoolExportError: () => SpoolExportError,
    SpoolHistoryError: () => SpoolHistoryError,
    SpoolKeyError: () => SpoolKeyError,
    SpoolLinkError: () => SpoolLinkError,
    SpoolSpliceError: () => SpoolSpliceError,
    TRANSPORT_MAGIC: () => TRANSPORT_MAGIC,
    buildSpoolLink: () => buildSpoolLink,
    createEncryptedWebSocketClass: () => createEncryptedWebSocketClass,
    deriveSignaling: () => deriveSignaling,
    generateCode: () => generateCode,
    importSpool: () => importSpool,
    isValidCode: () => isValidCode,
    keyFingerprint: () => keyFingerprint,
    newSpool: () => newSpool,
    openSpool: () => openSpool,
    parseSpoolLink: () => parseSpoolLink,
    stash: () => stash
  });

  // src/spool.ts
  init_yjs();

  // src/engine.ts
  init_yjs();

  // ../../node_modules/.pnpm/y-websocket@3.1.0_yjs@13.6.32/node_modules/y-websocket/src/y-websocket.js
  init_broadcastchannel();
  init_time();
  init_encoding();
  init_decoding();
  init_sync();

  // ../../node_modules/.pnpm/y-protocols@1.0.7_yjs@13.6.32/node_modules/y-protocols/auth.js
  init_decoding();
  var messagePermissionDenied = 0;
  var readAuthMessage = (decoder, y, permissionDeniedHandler2) => {
    switch (readVarUint(decoder)) {
      case messagePermissionDenied:
        permissionDeniedHandler2(y, readVarString(decoder));
    }
  };

  // ../../node_modules/.pnpm/y-websocket@3.1.0_yjs@13.6.32/node_modules/y-websocket/src/y-websocket.js
  init_awareness();
  init_observable();
  init_math();

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/url.js
  init_object();
  var encodeQueryParams = (params2) => map2(params2, (val, key) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join("&");

  // ../../node_modules/.pnpm/y-websocket@3.1.0_yjs@13.6.32/node_modules/y-websocket/src/y-websocket.js
  init_environment();
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
    constructor(serverUrl, roomname, doc2, {
      connect: connect2 = true,
      awareness = new Awareness(doc2),
      params: params2 = {},
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
      this.params = params2;
      this.protocols = protocols;
      this.roomname = roomname;
      this.doc = doc2;
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
      this.shouldConnect = connect2;
      this._resyncInterval = 0;
      if (resyncInterval > 0) {
        this._resyncInterval = /** @type {any} */
        setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const encoder = createEncoder();
            writeVarUint(encoder, messageSync);
            writeSyncStep1(encoder, doc2);
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
      this._awarenessUpdateHandler = ({ added, updated, removed }, _origin2) => {
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
          [doc2.clientID],
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
      if (connect2) {
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

  // ../../node_modules/.pnpm/y-indexeddb@9.0.12_yjs@13.6.32/node_modules/y-indexeddb/src/y-indexeddb.js
  init_yjs();

  // ../../node_modules/.pnpm/lib0@0.2.117/node_modules/lib0/indexeddb.js
  init_promise();
  init_error();
  var rtop = (request) => create4((resolve2, reject2) => {
    request.onerror = (event) => reject2(new Error(event.target.error));
    request.onsuccess = (event) => resolve2(event.target.result);
  });
  var openDB = (name, initDB) => create4((resolve2, reject2) => {
    const request = indexedDB.open(name);
    request.onupgradeneeded = (event) => initDB(event.target.result);
    request.onerror = (event) => reject2(create3(event.target.error));
    request.onsuccess = (event) => {
      const db = event.target.result;
      db.onversionchange = () => {
        db.close();
      };
      resolve2(db);
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
  var iterateOnRequest = (request, f) => create4((resolve2, reject2) => {
    request.onerror = reject2;
    request.onsuccess = async (event) => {
      const cursor = event.target.result;
      if (cursor === null || await f(cursor) === false) {
        return resolve2();
      }
      cursor.continue();
    };
  });
  var iterateKeys = (store, keyrange, f, direction = "next") => iterateOnRequest(store.openKeyCursor(keyrange, direction), (cursor) => f(cursor.key));
  var getStore = (t, store) => t.objectStore(store);
  var createIDBKeyRangeUpperBound = (upper, upperOpen) => IDBKeyRange.upperBound(upper, upperOpen);
  var createIDBKeyRangeLowerBound = (lower, lowerOpen) => IDBKeyRange.lowerBound(lower, lowerOpen);

  // ../../node_modules/.pnpm/y-indexeddb@9.0.12_yjs@13.6.32/node_modules/y-indexeddb/src/y-indexeddb.js
  init_promise();
  init_observable();
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
    constructor(name, doc2) {
      super();
      this.doc = doc2;
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
      this.whenSynced = create4((resolve2) => this.on("synced", () => resolve2(this)));
      this._db.then((db) => {
        this.db = db;
        const beforeApplyUpdatesCallback = (updatesStore) => addAutoKey(updatesStore, encodeStateAsUpdate(doc2));
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
      doc2.on("update", this._storeUpdate);
      this.destroy = this.destroy.bind(this);
      doc2.on("destroy", this.destroy);
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

  // src/encrypted-idb.ts
  init_yjs();

  // src/crypto.ts
  var import_tweetnacl = __toESM(require_nacl_fast(), 1);

  // src/link.ts
  var CODE_PATTERN = /^[a-z]+-[a-z]+-\d{3}$/;
  var ADJECTIVES = [
    "amber",
    "analog",
    "brave",
    "calico",
    "candid",
    "cedar",
    "chrome",
    "cobalt",
    "copper",
    "crooked",
    "dusty",
    "faded",
    "foggy",
    "gentle",
    "gilded",
    "groovy",
    "hazel",
    "hidden",
    "hollow",
    "humble",
    "indigo",
    "ivory",
    "jade",
    "lucid",
    "lunar",
    "mellow",
    "midnight",
    "minor",
    "misty",
    "mossy",
    "muted",
    "neon",
    "nimble",
    "ochre",
    "olive",
    "opal",
    "paper",
    "pearl",
    "quiet",
    "rusty",
    "sable",
    "sepia",
    "silver",
    "slate",
    "sleepy",
    "tidal",
    "umber",
    "velvet",
    "violet",
    "wistful"
  ];
  var NOUNS = [
    "anchor",
    "arrow",
    "atlas",
    "attic",
    "bell",
    "bloom",
    "booth",
    "bridge",
    "cabin",
    "canyon",
    "cassette",
    "cellar",
    "cinder",
    "circuit",
    "comet",
    "creek",
    "crow",
    "deck",
    "drift",
    "dune",
    "echo",
    "ember",
    "fern",
    "flare",
    "fox",
    "garden",
    "groove",
    "harbor",
    "heron",
    "island",
    "kite",
    "lantern",
    "ledger",
    "marble",
    "meadow",
    "moth",
    "needle",
    "nova",
    "orchard",
    "otter",
    "parlor",
    "pine",
    "prism",
    "quill",
    "raven",
    "ribbon",
    "river",
    "signal",
    "sparrow",
    "willow"
  ];
  var SpoolLinkError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "SpoolLinkError";
    }
  };
  var generateCode = () => {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const number = Math.floor(Math.random() * 1e3).toString().padStart(3, "0");
    return `${adjective}-${noun}-${number}`;
  };
  var isValidCode = (code) => CODE_PATTERN.test(code);
  var encodeKey = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  var decodeKey = (str) => {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice(0, (4 - base64.length % 4) % 4);
    let raw;
    try {
      raw = atob(padded);
    } catch {
      throw new SpoolLinkError(`the k= key is not valid base64: ${str.slice(0, 12)}\u2026`);
    }
    const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
    if (bytes.length !== 32) {
      throw new SpoolLinkError(`the k= key must decode to 32 bytes, got ${bytes.length}`);
    }
    return bytes;
  };
  var generateKey = () => crypto.getRandomValues(new Uint8Array(32));
  var parseSpoolLink = (input) => {
    const trimmed = input.trim();
    if (trimmed === "") throw new SpoolLinkError("empty link");
    if (isValidCode(trimmed)) return { code: trimmed };
    const hashAt = trimmed.indexOf("#");
    const fragment = hashAt >= 0 ? trimmed.slice(hashAt + 1) : trimmed;
    if (!fragment.includes("spool=")) {
      throw new SpoolLinkError(
        `not a spool link (no spool= in the fragment, and not a bare code): ${trimmed.slice(0, 40)}`
      );
    }
    const params2 = new URLSearchParams(fragment);
    const code = params2.get("spool");
    if (!code || !isValidCode(code)) {
      throw new SpoolLinkError(`bad spool code in link: ${code ?? "(missing)"}`);
    }
    const parsed = { code };
    const relay = params2.get("relay");
    if (relay) {
      if (!/^wss?:\/\//.test(relay)) {
        throw new SpoolLinkError(`relay must be a ws:// or wss:// URL, got: ${relay.slice(0, 40)}`);
      }
      parsed.relay = relay;
    }
    const k = params2.get("k");
    if (k) parsed.key = decodeKey(k);
    return parsed;
  };
  var buildSpoolLink = ({ code, relay, key, base }) => {
    if (!isValidCode(code)) throw new SpoolLinkError(`bad spool code: ${code}`);
    const params2 = new URLSearchParams({ spool: code });
    if (relay) params2.set("relay", relay);
    if (key) params2.set("k", encodeKey(key));
    const prefix = base ?? (typeof location !== "undefined" ? location.origin + location.pathname : "");
    return `${prefix}#${params2.toString()}`;
  };

  // src/crypto.ts
  var NONCE_LENGTH = 24;
  var SpoolKeyError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "SpoolKeyError";
    }
  };
  var encrypt = (data, key) => {
    const nonce = import_tweetnacl.default.randomBytes(NONCE_LENGTH);
    const ciphertext = import_tweetnacl.default.secretbox(data, nonce, key);
    const combined = new Uint8Array(NONCE_LENGTH + ciphertext.length);
    combined.set(nonce, 0);
    combined.set(ciphertext, NONCE_LENGTH);
    return combined;
  };
  var decrypt = (data, key) => {
    if (data.length < NONCE_LENGTH + import_tweetnacl.default.secretbox.overheadLength) return null;
    return import_tweetnacl.default.secretbox.open(data.slice(NONCE_LENGTH), data.slice(0, NONCE_LENGTH), key);
  };
  var keyFingerprint = (key) => encodeKey(key).slice(0, 8);

  // src/encrypted-idb.ts
  var UPDATES_STORE = "updates";
  var PREFERRED_TRIM_SIZE2 = 500;
  var MAGIC = [226, 226];
  var seal = (update, key) => {
    const ciphertext = encrypt(update, key);
    const row = new Uint8Array(2 + ciphertext.length);
    row.set(MAGIC, 0);
    row.set(ciphertext, 2);
    return row;
  };
  var unseal = (row, key) => {
    if (row.length < 2 || row[0] !== MAGIC[0] || row[1] !== MAGIC[1]) return null;
    return decrypt(row.slice(2), key);
  };
  var _key, _db, _dbsize, _destroyed, _compactTimeout, _EncryptedIndexeddbPersistence_instances, open_fn, getAllRows_fn, storeRow_fn, _onUpdate, compact_fn;
  var EncryptedIndexeddbPersistence = class {
    constructor(name, doc2, key) {
      __privateAdd(this, _EncryptedIndexeddbPersistence_instances);
      __publicField(this, "name");
      __publicField(this, "doc");
      __publicField(this, "synced", false);
      __publicField(this, "whenSynced");
      __privateAdd(this, _key);
      __privateAdd(this, _db, null);
      __privateAdd(this, _dbsize, 0);
      __privateAdd(this, _destroyed, false);
      __privateAdd(this, _compactTimeout, null);
      __privateAdd(this, _onUpdate, (update, origin) => {
        if (!__privateGet(this, _db) || origin === this) return;
        void __privateMethod(this, _EncryptedIndexeddbPersistence_instances, storeRow_fn).call(this, seal(update, __privateGet(this, _key)));
        if (++__privateWrapper(this, _dbsize)._ >= PREFERRED_TRIM_SIZE2 && __privateGet(this, _compactTimeout) === null) {
          __privateSet(this, _compactTimeout, setTimeout(() => {
            __privateSet(this, _compactTimeout, null);
            void __privateMethod(this, _EncryptedIndexeddbPersistence_instances, compact_fn).call(this);
          }, 1e3));
        }
      });
      __publicField(this, "destroy", async () => {
        if (__privateGet(this, _destroyed)) return;
        __privateSet(this, _destroyed, true);
        if (__privateGet(this, _compactTimeout) !== null) clearTimeout(__privateGet(this, _compactTimeout));
        this.doc.off("update", __privateGet(this, _onUpdate));
        this.doc.off("destroy", this.destroy);
        __privateGet(this, _db)?.close();
        __privateSet(this, _db, null);
      });
      this.name = name;
      this.doc = doc2;
      __privateSet(this, _key, key);
      this.whenSynced = __privateMethod(this, _EncryptedIndexeddbPersistence_instances, open_fn).call(this);
      this.doc.on("destroy", this.destroy);
    }
    /** destroy and delete the local database — the spool stops being a keepsake */
    async clearData() {
      await this.destroy();
      indexedDB.deleteDatabase(this.name);
    }
  };
  _key = new WeakMap();
  _db = new WeakMap();
  _dbsize = new WeakMap();
  _destroyed = new WeakMap();
  _compactTimeout = new WeakMap();
  _EncryptedIndexeddbPersistence_instances = new WeakSet();
  open_fn = async function() {
    const db = await new Promise((resolve2, reject2) => {
      const request = indexedDB.open(this.name, 1);
      request.onerror = () => reject2(request.error);
      request.onsuccess = () => resolve2(request.result);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(UPDATES_STORE)) {
          request.result.createObjectStore(UPDATES_STORE, { autoIncrement: true });
        }
      };
    });
    if (__privateGet(this, _destroyed)) {
      db.close();
      return;
    }
    __privateSet(this, _db, db);
    const rows = await __privateMethod(this, _EncryptedIndexeddbPersistence_instances, getAllRows_fn).call(this);
    const updates = [];
    let failed = 0;
    for (const row of rows) {
      const update = unseal(row, __privateGet(this, _key));
      if (update) updates.push(update);
      else failed++;
    }
    if (rows.length > 0 && updates.length === 0) {
      await this.destroy();
      throw new SpoolKeyError(
        `the k= in this link cannot decrypt the local data for "${this.name}" \u2014 wrong or changed key`
      );
    }
    await __privateMethod(this, _EncryptedIndexeddbPersistence_instances, storeRow_fn).call(this, seal(encodeStateAsUpdate(this.doc), __privateGet(this, _key)));
    transact(
      this.doc,
      () => {
        for (const update of updates) applyUpdate(this.doc, update);
      },
      this,
      false
    );
    __privateSet(this, _dbsize, rows.length - failed + 1);
    this.doc.on("update", __privateGet(this, _onUpdate));
    this.synced = true;
  };
  getAllRows_fn = function() {
    return new Promise((resolve2, reject2) => {
      if (!__privateGet(this, _db)) return resolve2([]);
      const request = __privateGet(this, _db).transaction(UPDATES_STORE, "readonly").objectStore(UPDATES_STORE).getAll();
      request.onsuccess = () => resolve2(request.result ?? []);
      request.onerror = () => reject2(request.error);
    });
  };
  storeRow_fn = function(row) {
    return new Promise((resolve2, reject2) => {
      if (!__privateGet(this, _db)) return resolve2();
      const request = __privateGet(this, _db).transaction(UPDATES_STORE, "readwrite").objectStore(UPDATES_STORE).add(row);
      request.onsuccess = () => resolve2();
      request.onerror = () => reject2(request.error);
    });
  };
  _onUpdate = new WeakMap();
  compact_fn = async function() {
    if (__privateGet(this, _destroyed) || !__privateGet(this, _db)) return;
    const store = __privateGet(this, _db).transaction(UPDATES_STORE, "readwrite").objectStore(UPDATES_STORE);
    await new Promise((resolve2, reject2) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve2();
      clearRequest.onerror = () => reject2(clearRequest.error);
    });
    await __privateMethod(this, _EncryptedIndexeddbPersistence_instances, storeRow_fn).call(this, seal(encodeStateAsUpdate(this.doc), __privateGet(this, _key)));
    __privateSet(this, _dbsize, 1);
  };

  // src/encrypted-ws.ts
  var TRANSPORT_MAGIC = [226, 225];
  var hasMagic = (bytes) => bytes.length >= 2 && bytes[0] === TRANSPORT_MAGIC[0] && bytes[1] === TRANSPORT_MAGIC[1];
  var seal2 = (plain, key) => {
    const ciphertext = encrypt(plain, key);
    const framed = new Uint8Array(2 + ciphertext.length);
    framed[0] = TRANSPORT_MAGIC[0];
    framed[1] = TRANSPORT_MAGIC[1];
    framed.set(ciphertext, 2);
    return framed;
  };
  var toArrayBuffer = (bytes) => {
    if (bytes.buffer instanceof ArrayBuffer && bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength) {
      return bytes.buffer;
    }
    const copy2 = new Uint8Array(bytes.byteLength);
    copy2.set(bytes);
    return copy2.buffer;
  };
  var createEncryptedWebSocketClass = (key, Base, onUndecryptable) => {
    var _userOnMessage, _a;
    return _a = class extends Base {
      constructor(url, protocols) {
        super(url, protocols);
        __privateAdd(this, _userOnMessage, null);
        this.binaryType = "arraybuffer";
        super.addEventListener("message", (event) => {
          if (!__privateGet(this, _userOnMessage)) return;
          const data = event.data;
          const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : null;
          const plain = bytes && hasMagic(bytes) ? decrypt(bytes.subarray(2), key) : null;
          if (!plain) {
            onUndecryptable?.();
            return;
          }
          __privateGet(this, _userOnMessage).call(this, { data: toArrayBuffer(plain) });
        });
      }
      send(data) {
        const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : null;
        if (!bytes) throw new Error("encrypted spool transport sends only binary frames");
        super.send(toArrayBuffer(seal2(bytes, key)));
      }
      // y-websocket assigns onmessage directly; capture it so decryption sits
      // between the wire and the provider
      set onmessage(handler) {
        __privateSet(this, _userOnMessage, handler);
      }
      get onmessage() {
        return __privateGet(this, _userOnMessage);
      }
    }, _userOnMessage = new WeakMap(), _a;
  };

  // src/engine.ts
  var ROOM_FULL_CLOSE_CODE = 1013;
  var inBrowser = typeof indexedDB !== "undefined";
  var hasWebRTC = typeof RTCPeerConnection !== "undefined";
  var _idb, _websocket, _webrtc, _webrtcPending, _wsStatus, _rtcConnected, _status, _statusListeners, _undecryptable, _undecryptableListeners, _roomFull, _fullListeners, _fullTimer, _roomFullBackoffMs, _heartbeat, _left, _SpoolEngine_instances, countUndecryptable_fn, deriveStatus_fn;
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
      __privateAdd(this, _undecryptable, 0);
      __privateAdd(this, _undecryptableListeners, /* @__PURE__ */ new Set());
      __privateAdd(this, _roomFull, false);
      __privateAdd(this, _fullListeners, /* @__PURE__ */ new Set());
      __privateAdd(this, _fullTimer, null);
      __privateAdd(this, _roomFullBackoffMs);
      __privateAdd(this, _heartbeat, null);
      __privateAdd(this, _left, false);
      this.code = opts.code;
      __privateSet(this, _roomFullBackoffMs, opts.roomFullBackoffMs ?? 3e4);
      this.doc = new Doc({ gc: false });
      const persist = opts.persist ?? inBrowser;
      if (persist) {
        if (!inBrowser) throw new Error("persist requires IndexedDB; pass persist: false outside browsers");
        __privateSet(this, _idb, opts.key ? new EncryptedIndexeddbPersistence(opts.code, this.doc, opts.key) : new IndexeddbPersistence(opts.code, this.doc));
        this.whenReady = __privateGet(this, _idb).whenSynced.then(() => void 0);
      } else {
        this.whenReady = Promise.resolve();
      }
      if (opts.relay) {
        const Base = opts.WebSocketPolyfill ?? (typeof WebSocket !== "undefined" ? WebSocket : void 0);
        const Transport = opts.key && Base ? createEncryptedWebSocketClass(opts.key, Base, () => __privateMethod(this, _SpoolEngine_instances, countUndecryptable_fn).call(this)) : Base;
        __privateSet(this, _websocket, new WebsocketProvider(opts.relay, opts.code, this.doc, {
          resyncInterval: opts.resyncIntervalMs ?? 2e4,
          disableBc: opts.disableBc ?? false,
          // 1013 is the relay saying "room full". y-websocket's default would
          // reconnect at once and forever — the endless spinner of T-169 — so
          // treat it as terminal for one backoff, then resume below. The
          // 4400–4499 rule is the provider's own default, kept as is.
          shouldReconnect: (event) => event.code !== ROOM_FULL_CLOSE_CODE && !(event.code >= 4400 && event.code < 4500),
          ...Transport ? { WebSocketPolyfill: Transport } : {}
        }));
        __privateGet(this, _websocket).on("status", ({ status }) => {
          __privateSet(this, _wsStatus, status === "connected" ? "connected" : status === "connecting" ? "connecting" : "disconnected");
          if (status === "connected") __privateSet(this, _roomFull, false);
          __privateMethod(this, _SpoolEngine_instances, deriveStatus_fn).call(this);
        });
        __privateGet(this, _websocket).on("closed", ({ code, reason }) => {
          if (code !== ROOM_FULL_CLOSE_CODE || __privateGet(this, _left)) return;
          __privateSet(this, _roomFull, true);
          for (const cb of __privateGet(this, _fullListeners)) cb(reason);
          __privateSet(this, _fullTimer, setTimeout(() => {
            __privateSet(this, _fullTimer, null);
            if (!__privateGet(this, _left)) __privateGet(this, _websocket)?.connect();
          }, __privateGet(this, _roomFullBackoffMs)));
        });
        const heartbeat = opts.socketHeartbeatMs ?? 1e4;
        if (heartbeat > 0) {
          const provider = __privateGet(this, _websocket);
          __privateSet(this, _heartbeat, setInterval(() => {
            if (provider.wsconnected) provider.wsLastMessageReceived = Date.now();
          }, heartbeat));
          __privateGet(this, _heartbeat).unref?.();
        }
      }
      const webrtc = opts.webrtc ?? hasWebRTC;
      if (webrtc && opts.signaling?.length) {
        __privateSet(this, _webrtcPending, Promise.resolve().then(() => (init_y_webrtc(), y_webrtc_exports)).then(({ WebrtcProvider: WebrtcProvider2 }) => {
          if (__privateGet(this, _left)) return;
          __privateSet(this, _webrtc, new WebrtcProvider2(opts.code, this.doc, {
            signaling: opts.signaling,
            // rtc crypto is y-webrtc's own scheme, keyed on the same k= string
            // as the link carries (§5 two-transport decision, T-051)
            ...opts.key ? { password: encodeKey(opts.key) } : {},
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
    /** ws frames dropped because they weren't sealed with this spool's key — a wrong-key or keyless peer is in the room */
    get undecryptableFrames() {
      return __privateGet(this, _undecryptable);
    }
    onUndecryptable(cb) {
      __privateGet(this, _undecryptableListeners).add(cb);
      return () => __privateGet(this, _undecryptableListeners).delete(cb);
    }
    /**
     * The relay refused the last connection with 1013 "room full" (T-169).
     * The SDK stands back (~30 s) between attempts instead of spinning;
     * status reads 'offline' meanwhile. Clears when a connection is accepted.
     */
    get roomFull() {
      return __privateGet(this, _roomFull);
    }
    /** fires with the close reason on every refused attempt */
    onFull(cb) {
      __privateGet(this, _fullListeners).add(cb);
      return () => __privateGet(this, _fullListeners).delete(cb);
    }
    /**
     * Disconnect and release resources. Local IndexedDB data is retained — a
     * spool is a keepsake. Teardown order per fosho disconnectFromNote:
     * webrtc → websocket → idb → doc.
     */
    async leave() {
      if (__privateGet(this, _left)) return;
      __privateSet(this, _left, true);
      if (__privateGet(this, _fullTimer)) clearTimeout(__privateGet(this, _fullTimer));
      __privateSet(this, _fullTimer, null);
      if (__privateGet(this, _heartbeat)) clearInterval(__privateGet(this, _heartbeat));
      __privateSet(this, _heartbeat, null);
      await __privateGet(this, _webrtcPending);
      __privateGet(this, _webrtc)?.destroy();
      __privateGet(this, _websocket)?.destroy();
      await __privateGet(this, _idb)?.destroy();
      this.doc.destroy();
      __privateGet(this, _statusListeners).clear();
      __privateGet(this, _undecryptableListeners).clear();
      __privateGet(this, _fullListeners).clear();
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
  _undecryptable = new WeakMap();
  _undecryptableListeners = new WeakMap();
  _roomFull = new WeakMap();
  _fullListeners = new WeakMap();
  _fullTimer = new WeakMap();
  _roomFullBackoffMs = new WeakMap();
  _heartbeat = new WeakMap();
  _left = new WeakMap();
  _SpoolEngine_instances = new WeakSet();
  countUndecryptable_fn = function() {
    __privateWrapper(this, _undecryptable)._++;
    for (const cb of __privateGet(this, _undecryptableListeners)) cb(__privateGet(this, _undecryptable));
  };
  deriveStatus_fn = function() {
    const next = __privateGet(this, _wsStatus) === "connected" || __privateGet(this, _rtcConnected) ? "connected" : __privateGet(this, _wsStatus) === "connecting" ? "connecting" : "offline";
    if (next !== __privateGet(this, _status)) {
      __privateSet(this, _status, next);
      for (const cb of __privateGet(this, _statusListeners)) cb(next);
    }
  };

  // src/entry.ts
  init_yjs();
  var ENTRIES = "entries";
  var bodyKey = (id2) => `entry:${id2}`;
  var SpoolSpliceError = class extends Error {
    constructor(id2, rule, message) {
      super(message);
      __publicField(this, "id");
      __publicField(this, "rule");
      this.name = "SpoolSpliceError";
      this.id = id2;
      this.rule = rule;
    }
  };
  var uuid = () => {
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = b[6] & 15 | 64;
    b[8] = b[8] & 63 | 128;
    const hex = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };
  var byCreation = (a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1);
  var _store, _Entry_instances, meta_fn;
  var Entry = class {
    /** @internal handles come from the store */
    constructor(store, id2) {
      __privateAdd(this, _Entry_instances);
      __publicField(this, "id");
      __privateAdd(this, _store);
      __privateSet(this, _store, store);
      this.id = id2;
    }
    get author() {
      return __privateMethod(this, _Entry_instances, meta_fn).call(this).get("author");
    }
    get kind() {
      return __privateMethod(this, _Entry_instances, meta_fn).call(this).get("kind");
    }
    get parent() {
      return __privateMethod(this, _Entry_instances, meta_fn).call(this).get("parent");
    }
    get createdAt() {
      return __privateMethod(this, _Entry_instances, meta_fn).call(this).get("createdAt");
    }
    get deletedAt() {
      return __privateMethod(this, _Entry_instances, meta_fn).call(this).get("deletedAt");
    }
    /** plain-JSON machine fields set at wind time; read-only by convention (mutations don't sync) */
    get data() {
      return __privateMethod(this, _Entry_instances, meta_fn).call(this).get("data");
    }
    /**
     * The entry as a plain frozen record — the same shape rewind() hands out
     * and splice() takes in. `keep.map((e) => e.snapshot())` is the whole
     * selection step of a cut (T-186).
     */
    snapshot() {
      const parent = this.parent;
      const deletedAt = this.deletedAt;
      const data = this.data;
      return Object.freeze({
        id: this.id,
        author: this.author,
        kind: this.kind,
        ...parent !== void 0 ? { parent } : {},
        createdAt: this.createdAt,
        ...deletedAt != null ? { deletedAt } : {},
        ...data !== void 0 ? { data } : {},
        body: this.body
      });
    }
    /**
     * Raw Y.Text for editor bindings; null until a body exists. Existence =
     * the root type is materialized in this doc (a body created empty on
     * another peer stays invisible here until its first character arrives —
     * no update, no existence).
     */
    get text() {
      const doc2 = __privateGet(this, _store).doc;
      return doc2.share.has(bodyKey(this.id)) ? doc2.getText(bodyKey(this.id)) : null;
    }
    /** '' if no body exists. Setting replaces content wholesale — bind entry.text for concurrent-edit-safe flows. */
    get body() {
      return this.text?.toString() ?? "";
    }
    set body(value) {
      const doc2 = __privateGet(this, _store).doc;
      doc2.transact(() => {
        const text2 = doc2.getText(bodyKey(this.id));
        if (text2.length > 0) text2.delete(0, text2.length);
        if (value) text2.insert(0, value);
      });
    }
    /** live entries whose parent === this.id (soft-deleted children excluded, like spool.entries) */
    get children() {
      return __privateGet(this, _store).list().filter((e) => e.parent === this.id);
    }
    /** soft: sets deletedAt; hidden from spool.entries, restorable */
    delete() {
      __privateMethod(this, _Entry_instances, meta_fn).call(this).set("deletedAt", Date.now());
    }
    /** clears deletedAt — archiving falls out free */
    restore() {
      __privateMethod(this, _Entry_instances, meta_fn).call(this).delete("deletedAt");
    }
  };
  _store = new WeakMap();
  _Entry_instances = new WeakSet();
  meta_fn = function() {
    const meta = __privateGet(this, _store).entriesMap.get(this.id);
    if (!meta) throw new Error(`entry ${this.id} has no metadata (never hard-deleted; this is a bug)`);
    return meta;
  };
  var _author, _handles, _listeners, _shadow, _armed, _EntryStore_instances, visible_fn, candidates_fn, _onTransaction;
  var EntryStore = class {
    constructor(doc2, author, whenReady) {
      __privateAdd(this, _EntryStore_instances);
      __publicField(this, "doc");
      __publicField(this, "entriesMap");
      __privateAdd(this, _author);
      __privateAdd(this, _handles, /* @__PURE__ */ new Map());
      __privateAdd(this, _listeners, /* @__PURE__ */ new Set());
      /** id → visible (exists and not soft-deleted), as of the last settled transaction */
      __privateAdd(this, _shadow, /* @__PURE__ */ new Map());
      __privateAdd(this, _armed, false);
      __privateAdd(this, _onTransaction, (tr) => {
        if (!__privateGet(this, _armed)) return;
        const ids = __privateMethod(this, _EntryStore_instances, candidates_fn).call(this, tr);
        if (ids.size === 0) return;
        const change = { added: [], updated: [], deleted: [] };
        for (const id2 of ids) {
          if (!this.entriesMap.has(id2)) continue;
          const was = __privateGet(this, _shadow).get(id2) ?? false;
          const is = __privateMethod(this, _EntryStore_instances, visible_fn).call(this, id2);
          __privateGet(this, _shadow).set(id2, is);
          if (!was && is) change.added.push(this.handle(id2));
          else if (was && !is) change.deleted.push(this.handle(id2));
          else if (was && is) change.updated.push(this.handle(id2));
        }
        if (change.added.length + change.updated.length + change.deleted.length === 0) return;
        for (const cb of __privateGet(this, _listeners)) cb(change);
      });
      this.doc = doc2;
      this.entriesMap = doc2.getMap(ENTRIES);
      __privateSet(this, _author, author);
      doc2.on("afterTransaction", __privateGet(this, _onTransaction));
      whenReady.then(() => {
        for (const id2 of this.entriesMap.keys()) __privateGet(this, _shadow).set(id2, __privateMethod(this, _EntryStore_instances, visible_fn).call(this, id2));
        __privateSet(this, _armed, true);
      });
    }
    handle(id2) {
      let entry = __privateGet(this, _handles).get(id2);
      if (!entry) {
        entry = new Entry(this, id2);
        __privateGet(this, _handles).set(id2, entry);
      }
      return entry;
    }
    /** sorted by createdAt, id as tie-break (deterministic across peers), soft-deleted excluded */
    list() {
      const out = [];
      for (const id2 of this.entriesMap.keys()) {
        if (__privateMethod(this, _EntryStore_instances, visible_fn).call(this, id2)) out.push(this.handle(id2));
      }
      return out.sort(byCreation);
    }
    /** the complement of list(): only the soft-deleted, same handles, same sort */
    listDeleted() {
      const out = [];
      for (const id2 of this.entriesMap.keys()) {
        if (this.entriesMap.get(id2)?.get("deletedAt") != null) out.push(this.handle(id2));
      }
      return out.sort(byCreation);
    }
    wind(input) {
      if (typeof input.kind !== "string" || input.kind === "") {
        throw new Error("wind() needs a non-empty kind");
      }
      const id2 = uuid();
      this.doc.transact(() => {
        const meta = new YMap();
        meta.set("id", id2);
        meta.set("author", __privateGet(this, _author));
        meta.set("kind", input.kind);
        meta.set("createdAt", Date.now());
        if (input.parent !== void 0) meta.set("parent", input.parent);
        if (input.data !== void 0) meta.set("data", structuredClone(input.data));
        this.entriesMap.set(id2, meta);
        if (input.body !== void 0) this.doc.getText(bodyKey(id2)).insert(0, input.body);
      });
      return this.handle(id2);
    }
    /**
     * Write complete records with their identity intact (T-186). Validates the
     * whole batch first and throws SpoolSpliceError before any write; ids
     * already present are skipped entirely (idempotent — a re-run changes no
     * byte); everything else lands in one transaction, so a peer never sees a
     * half-built reel. Returns live handles in input order.
     */
    splice(records) {
      const fail = (id2, rule, why) => {
        throw new SpoolSpliceError(id2, rule, `splice() refused record ${JSON.stringify(id2)}: ${why}`);
      };
      const incoming = /* @__PURE__ */ new Set();
      for (const rec of records) {
        const id2 = rec?.id;
        if (typeof id2 !== "string" || id2 === "") fail(String(id2), "id", "id must be a non-empty string");
        if (incoming.has(id2)) fail(id2, "duplicate", "the same id twice in one batch");
        incoming.add(id2);
        if (typeof rec.kind !== "string" || rec.kind === "") fail(id2, "kind", "kind must be a non-empty string");
        if (typeof rec.author !== "string") fail(id2, "author", "author must be a string");
        if (typeof rec.createdAt !== "number" || !Number.isFinite(rec.createdAt)) {
          fail(id2, "createdAt", "createdAt must be a finite number");
        }
        if (rec.deletedAt !== void 0 && (typeof rec.deletedAt !== "number" || !Number.isFinite(rec.deletedAt))) {
          fail(id2, "deletedAt", "deletedAt must be a finite number when present");
        }
        if (rec.body !== void 0 && typeof rec.body !== "string") fail(id2, "body", "body must be a string");
      }
      for (const rec of records) {
        if (rec.parent !== void 0 && !incoming.has(rec.parent) && !this.entriesMap.has(rec.parent)) {
          fail(rec.id, "parent", `parent ${JSON.stringify(rec.parent)} is neither in this batch nor in the spool`);
        }
      }
      this.doc.transact(() => {
        for (const rec of records) {
          if (this.entriesMap.has(rec.id)) continue;
          const meta = new YMap();
          meta.set("id", rec.id);
          meta.set("author", rec.author);
          meta.set("kind", rec.kind);
          meta.set("createdAt", rec.createdAt);
          if (rec.parent !== void 0) meta.set("parent", rec.parent);
          if (rec.deletedAt !== void 0) meta.set("deletedAt", rec.deletedAt);
          if (rec.data !== void 0) meta.set("data", structuredClone(rec.data));
          this.entriesMap.set(rec.id, meta);
          if (rec.body) this.doc.getText(bodyKey(rec.id)).insert(0, rec.body);
        }
      });
      return records.map((rec) => this.handle(rec.id));
    }
    onEntry(cb) {
      __privateGet(this, _listeners).add(cb);
      return () => __privateGet(this, _listeners).delete(cb);
    }
    destroy() {
      this.doc.off("afterTransaction", __privateGet(this, _onTransaction));
      __privateGet(this, _listeners).clear();
    }
  };
  _author = new WeakMap();
  _handles = new WeakMap();
  _listeners = new WeakMap();
  _shadow = new WeakMap();
  _armed = new WeakMap();
  _EntryStore_instances = new WeakSet();
  visible_fn = function(id2) {
    const meta = this.entriesMap.get(id2);
    return meta !== void 0 && meta.get("deletedAt") == null;
  };
  /** ids an arbitrary transaction may have affected: the entries map itself, nested meta maps, root body texts */
  candidates_fn = function(tr) {
    const ids = /* @__PURE__ */ new Set();
    for (const [type, keys2] of tr.changed) {
      if (type === this.entriesMap) {
        for (const key of keys2) if (key !== null) ids.add(key);
      } else if (type.parent === this.entriesMap && type._item?.parentSub) {
        ids.add(type._item.parentSub);
      } else if (type._item === null) {
        for (const [name, shared] of this.doc.share) {
          if (shared === type && name.startsWith("entry:")) ids.add(name.slice("entry:".length));
        }
      }
    }
    return ids;
  };
  _onTransaction = new WeakMap();

  // src/history.ts
  init_yjs();

  // src/bytes.ts
  var b64encode = (bytes) => {
    let s = "";
    for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s);
  };
  var b64decode = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  // src/history.ts
  var HISTORY = "history";
  var SpoolHistoryError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "SpoolHistoryError";
    }
  };
  var byCreation2 = (a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1);
  var readEntries = (doc2) => {
    const out = [];
    const entries = doc2.getMap("entries");
    for (const id2 of entries.keys()) {
      const meta = entries.get(id2);
      if (!meta) continue;
      const parent = meta.get("parent");
      const deletedAt = meta.get("deletedAt");
      const data = meta.get("data");
      out.push(
        Object.freeze({
          id: id2,
          author: meta.get("author"),
          kind: meta.get("kind"),
          ...parent !== void 0 ? { parent } : {},
          createdAt: meta.get("createdAt"),
          ...deletedAt != null ? { deletedAt } : {},
          ...data !== void 0 ? { data: Object.freeze(data) } : {},
          body: doc2.share.has(`entry:${id2}`) ? doc2.getText(`entry:${id2}`).toString() : ""
        })
      );
    }
    return Object.freeze(out.sort(byCreation2));
  };
  var _doc, _arr, _debounceMs, _minGapMs, _timer, _armed2, _lastAppendAt, _destroyed2, _HistoryLog_instances, satisfiable_fn, _onTransaction2, schedule_fn, append_fn;
  var HistoryLog = class {
    constructor(doc2, whenReady, tuning) {
      __privateAdd(this, _HistoryLog_instances);
      __privateAdd(this, _doc);
      __privateAdd(this, _arr);
      __privateAdd(this, _debounceMs);
      __privateAdd(this, _minGapMs);
      __privateAdd(this, _timer, null);
      __privateAdd(this, _armed2, false);
      __privateAdd(this, _lastAppendAt, 0);
      __privateAdd(this, _destroyed2, false);
      __privateAdd(this, _onTransaction2, (tr) => {
        if (!__privateGet(this, _armed2) || __privateGet(this, _destroyed2) || !tr.local) return;
        for (const type of tr.changed.keys()) {
          if (type !== __privateGet(this, _arr)) {
            __privateMethod(this, _HistoryLog_instances, schedule_fn).call(this);
            return;
          }
        }
      });
      __privateSet(this, _doc, doc2);
      __privateSet(this, _arr, doc2.getArray(HISTORY));
      __privateSet(this, _debounceMs, tuning?.debounceMs ?? 2e3);
      __privateSet(this, _minGapMs, tuning?.minGapMs ?? 1e4);
      doc2.on("afterTransaction", __privateGet(this, _onTransaction2));
      whenReady.then(() => {
        __privateSet(this, _armed2, true);
      });
    }
    /** recorded moment timestamps, ascending — the scrubber's tick marks */
    get moments() {
      const ts = /* @__PURE__ */ new Set();
      for (const m of __privateGet(this, _arr).toArray()) {
        if (m && typeof m.ts === "number") ts.add(m.ts);
      }
      return [...ts].sort((a, b) => a - b);
    }
    rewind(ts) {
      const candidates = __privateGet(this, _arr).toArray().filter((m) => m != null && typeof m.ts === "number" && m.ts <= ts).sort((a, b) => b.ts - a.ts);
      if (candidates.length === 0) {
        throw new SpoolHistoryError(
          __privateGet(this, _arr).length === 0 ? "this spool has no recorded history yet" : `no moment recorded at or before ${ts} \u2014 history starts at ${this.moments[0]}`
        );
      }
      const localSv = decodeStateVector(encodeStateVector(__privateGet(this, _doc)));
      for (const moment of candidates) {
        let snap;
        try {
          snap = decodeSnapshot(b64decode(moment.snap));
        } catch {
          continue;
        }
        if (!__privateMethod(this, _HistoryLog_instances, satisfiable_fn).call(this, snap, localSv)) continue;
        const past = createDocFromSnapshot(__privateGet(this, _doc), snap);
        try {
          return readEntries(past);
        } finally {
          past.destroy();
        }
      }
      throw new SpoolHistoryError(
        "recorded moments reference peer changes this device has not synced yet \u2014 try again after syncing"
      );
    }
    /** capture a pending moment right now instead of waiting out the debounce */
    flush() {
      if (__privateGet(this, _timer)) {
        clearTimeout(__privateGet(this, _timer));
        __privateSet(this, _timer, null);
        __privateMethod(this, _HistoryLog_instances, append_fn).call(this);
      }
    }
    destroy() {
      __privateSet(this, _destroyed2, true);
      if (__privateGet(this, _timer)) clearTimeout(__privateGet(this, _timer));
      __privateSet(this, _timer, null);
      __privateGet(this, _doc).off("afterTransaction", __privateGet(this, _onTransaction2));
    }
  };
  _doc = new WeakMap();
  _arr = new WeakMap();
  _debounceMs = new WeakMap();
  _minGapMs = new WeakMap();
  _timer = new WeakMap();
  _armed2 = new WeakMap();
  _lastAppendAt = new WeakMap();
  _destroyed2 = new WeakMap();
  _HistoryLog_instances = new WeakSet();
  /** every sv clock the snapshot needs must exist locally, or reconstruction dies mid-yjs */
  satisfiable_fn = function(snap, localSv) {
    for (const [client, clock] of snap.sv) {
      if ((localSv.get(client) ?? 0) < clock) return false;
    }
    return true;
  };
  _onTransaction2 = new WeakMap();
  schedule_fn = function() {
    if (__privateGet(this, _timer)) clearTimeout(__privateGet(this, _timer));
    const wait = Math.max(__privateGet(this, _debounceMs), __privateGet(this, _lastAppendAt) + __privateGet(this, _minGapMs) - Date.now());
    __privateSet(this, _timer, setTimeout(() => {
      __privateSet(this, _timer, null);
      __privateMethod(this, _HistoryLog_instances, append_fn).call(this);
    }, wait));
  };
  append_fn = function() {
    if (__privateGet(this, _destroyed2)) return;
    const snap = snapshot(__privateGet(this, _doc));
    const newest = __privateGet(this, _arr).toArray().reduce((best, m) => {
      return m && typeof m.ts === "number" && (!best || m.ts > best.ts) ? m : best;
    }, null);
    if (newest) {
      try {
        if (equalSnapshots(decodeSnapshot(b64decode(newest.snap)), snap)) return;
      } catch {
      }
    }
    __privateSet(this, _lastAppendAt, Date.now());
    __privateGet(this, _arr).push([{ ts: __privateGet(this, _lastAppendAt), snap: b64encode(encodeSnapshot(snap)) }]);
  };

  // src/export.ts
  init_yjs();
  var EXPORT_FORMAT = "spool-export";
  var EXPORT_VERSION = 1;
  var SpoolExportError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "SpoolExportError";
    }
  };
  var buildExport = (code, entries, doc2) => JSON.stringify(
    {
      format: EXPORT_FORMAT,
      version: EXPORT_VERSION,
      code,
      exportedAt: Date.now(),
      entries,
      doc: b64encode(encodeStateAsUpdate(doc2))
    },
    null,
    2
  );
  var parseExport = (input) => {
    let raw = input;
    if (typeof input === "string") {
      try {
        raw = JSON.parse(input);
      } catch {
        throw new SpoolExportError("not JSON \u2014 is this really a spool export file?");
      }
    }
    const file = raw;
    if (!file || typeof file !== "object" || file.format !== EXPORT_FORMAT) {
      throw new SpoolExportError(`missing "format": "${EXPORT_FORMAT}" \u2014 not a spool export`);
    }
    if (typeof file.version !== "number" || file.version > EXPORT_VERSION) {
      throw new SpoolExportError(
        `export version ${String(file.version)} is newer than this SDK understands (${EXPORT_VERSION})`
      );
    }
    if (typeof file.code !== "string" || !isValidCode(file.code)) {
      throw new SpoolExportError(`bad spool code in export: ${String(file.code)}`);
    }
    if (typeof file.doc !== "string") {
      throw new SpoolExportError("export has no doc field \u2014 the machine half is missing");
    }
    let update;
    try {
      update = b64decode(file.doc);
    } catch {
      throw new SpoolExportError("the doc field is not valid base64");
    }
    return { code: file.code, update };
  };

  // src/stash.ts
  var REGISTRY_KEY = "spools:stash";
  var hasLocalStorage = () => typeof localStorage !== "undefined";
  var hasIndexedDB = () => typeof indexedDB !== "undefined";
  var readRegistry = () => {
    if (!hasLocalStorage()) return {};
    try {
      const raw = localStorage.getItem(REGISTRY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };
  var writeRegistry = (registry) => {
    if (!hasLocalStorage()) return;
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  };
  var patch = (code, fields) => {
    const registry = readRegistry();
    registry[code] = { ...registry[code], ...fields };
    writeRegistry(registry);
  };
  var touch = (code, link) => {
    if (!hasLocalStorage()) return;
    patch(code, { lastOpened: Date.now(), ...link ? { link } : {} });
  };
  var storedCodes = async () => {
    if (!hasIndexedDB() || typeof indexedDB.databases !== "function") return /* @__PURE__ */ new Set();
    try {
      const dbs = await indexedDB.databases();
      return new Set(dbs.map((db) => db.name ?? "").filter(isValidCode));
    } catch {
      return /* @__PURE__ */ new Set();
    }
  };
  var stash = {
    /** every spool this device knows: union of kept databases and registry rows, most recent first */
    async list() {
      const registry = readRegistry();
      const stored = await storedCodes();
      const codes = /* @__PURE__ */ new Set([...stored, ...Object.keys(registry).filter(isValidCode)]);
      return [...codes].map((code) => ({ code, stored: stored.has(code), ...registry[code] })).sort((a, b) => (b.lastOpened ?? 0) - (a.lastOpened ?? 0));
    },
    /** name a keepsake */
    label(code, label) {
      patch(code, { label });
    },
    /** archived = kept but set aside; purely a shelf flag, nothing disconnects */
    archive(code, archived) {
      patch(code, { archived });
    },
    /**
     * The one hard delete: removes the spool's local database and registry row.
     * Gone from this device forever (peers' copies are their own). Rejects if
     * the database is still open — leave() the spool first.
     */
    async forget(code) {
      if (hasIndexedDB()) {
        await new Promise((resolve2, reject2) => {
          const request = indexedDB.deleteDatabase(code);
          request.onsuccess = () => resolve2();
          request.onerror = () => reject2(request.error ?? new Error(`could not delete ${code}`));
          request.onblocked = () => reject2(new Error(`${code} is still open \u2014 leave() it before forgetting`));
        });
      }
      const registry = readRegistry();
      delete registry[code];
      writeRegistry(registry);
    }
  };

  // src/pocket.ts
  init_yjs();
  var import_tweetnacl2 = __toESM(require_nacl_fast(), 1);
  var POCKET_VERSION = 1;
  var DEPOSIT_MAGIC = [226, 227];
  var HEADER_LEN = 7;
  var TOKEN_DOMAIN = "spool-pocket-v1";
  var POCKET_TX_ORIGIN = "spool-pocket";
  var KEEPALIVE_MAX_BYTES = 64 * 1024;
  var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  var bounded = (ms) => new Promise((r) => {
    const t = setTimeout(r, ms);
    t.unref?.();
  });
  var pageTarget = () => {
    const g = globalThis;
    return typeof g.addEventListener === "function" ? globalThis : null;
  };
  var withoutError = ({ depositError: _cleared, ...rest }) => rest;
  var deriveToken = (key) => {
    const domain = new TextEncoder().encode(TOKEN_DOMAIN);
    const input = new Uint8Array(domain.length + key.length);
    input.set(domain, 0);
    input.set(key, domain.length);
    return encodeKey(import_tweetnacl2.default.hash(input).subarray(0, 12));
  };
  var sealDeposit = (update, key, tag) => {
    const sealed = encrypt(update, key);
    const blob = new Uint8Array(HEADER_LEN + sealed.length);
    blob[0] = DEPOSIT_MAGIC[0];
    blob[1] = DEPOSIT_MAGIC[1];
    blob[2] = POCKET_VERSION;
    blob.set(tag.subarray(0, 4), 3);
    blob.set(sealed, HEADER_LEN);
    return blob;
  };
  var openDeposit = (blob, key) => {
    if (blob.length < HEADER_LEN || blob[0] !== DEPOSIT_MAGIC[0] || blob[1] !== DEPOSIT_MAGIC[1] || blob[2] !== POCKET_VERSION) {
      return null;
    }
    return decrypt(blob.subarray(HEADER_LEN), key);
  };
  var pocketOrigin = (relay) => {
    try {
      const url = new URL(relay);
      const scheme = url.protocol === "wss:" ? "https:" : url.protocol === "ws:" ? "http:" : null;
      return scheme ? `${scheme}//${url.host}` : null;
    } catch {
      return null;
    }
  };
  var isPocketEnvelope = (json) => typeof json === "object" && json !== null && json.format === "spool-pocket" && typeof json.version === "number";
  var unavailableOrigins = /* @__PURE__ */ new Set();
  var _origin, _code, _key2, _doc2, _whenReady, _state, _listeners2, _abort, _destroyed3, _fetched, _tag, _debounceMs2, _minGapMs2, _flushRetries, _flushBackoffMs, _settleWaitMs, _started, _armed3, _dirty, _rateLimited, _timer2, _lastDepositAt, _inflight, _flushing, _onVisibility, _onPageHide, _PocketClient_instances, set_fn, start_fn, isAheadOf_fn, docHasState_fn, _onTransaction3, schedule_fn2, stopped_fn, deposit_fn, put_fn, flushNow_fn;
  var PocketClient = class {
    constructor(opts) {
      __privateAdd(this, _PocketClient_instances);
      __publicField(this, "token");
      __privateAdd(this, _origin);
      __privateAdd(this, _code);
      __privateAdd(this, _key2);
      __privateAdd(this, _doc2);
      __privateAdd(this, _whenReady);
      __privateAdd(this, _state, { phase: "checking" });
      __privateAdd(this, _listeners2, /* @__PURE__ */ new Set());
      __privateAdd(this, _abort, new AbortController());
      __privateAdd(this, _destroyed3, false);
      __privateAdd(this, _fetched, null);
      // deposit side (T-103): a scheduler shaped exactly like HistoryLog's —
      // armed only once the open-time fetch has settled, gated on tr.local so
      // pocket-applied (remote-origin) state can never schedule a re-deposit
      __privateAdd(this, _tag, crypto.getRandomValues(new Uint8Array(4)));
      __privateAdd(this, _debounceMs2);
      __privateAdd(this, _minGapMs2);
      __privateAdd(this, _flushRetries);
      __privateAdd(this, _flushBackoffMs);
      __privateAdd(this, _settleWaitMs);
      __privateAdd(this, _started, null);
      __privateAdd(this, _armed3, false);
      __privateAdd(this, _dirty, false);
      /** the last PUT was answered 429 — what flush()'s bounded retry reads */
      __privateAdd(this, _rateLimited, false);
      __privateAdd(this, _timer2, null);
      __privateAdd(this, _lastDepositAt, 0);
      __privateAdd(this, _inflight, null);
      __privateAdd(this, _flushing, null);
      __privateAdd(this, _onVisibility, null);
      __privateAdd(this, _onPageHide, null);
      __privateAdd(this, _onTransaction3, (tr) => {
        if (__privateGet(this, _destroyed3) || !tr.local) return;
        __privateSet(this, _dirty, true);
        if (__privateGet(this, _armed3)) __privateMethod(this, _PocketClient_instances, schedule_fn2).call(this);
      });
      __privateSet(this, _origin, pocketOrigin(opts.relay));
      __privateSet(this, _code, opts.code);
      __privateSet(this, _key2, opts.key);
      __privateSet(this, _doc2, opts.doc);
      __privateSet(this, _whenReady, opts.whenReady);
      this.token = deriveToken(opts.key);
      __privateSet(this, _debounceMs2, opts.tuning?.debounceMs ?? 1e4);
      __privateSet(this, _minGapMs2, opts.tuning?.minGapMs ?? 6e4);
      __privateSet(this, _flushRetries, opts.tuning?.flushRetries ?? 2);
      __privateSet(this, _flushBackoffMs, opts.tuning?.flushBackoffMs ?? 1e3);
      __privateSet(this, _settleWaitMs, opts.tuning?.settleWaitMs ?? 3e3);
      __privateGet(this, _doc2).on("afterTransaction", __privateGet(this, _onTransaction3));
      if (typeof document !== "undefined") {
        __privateSet(this, _onVisibility, () => {
          if (document.visibilityState === "hidden" && __privateGet(this, _dirty)) void this.flush();
        });
        document.addEventListener("visibilitychange", __privateGet(this, _onVisibility));
        __privateSet(this, _onPageHide, () => {
          if (__privateGet(this, _dirty)) void this.flush();
        });
        pageTarget()?.addEventListener("pagehide", __privateGet(this, _onPageHide));
      }
    }
    get state() {
      return __privateGet(this, _state);
    }
    /** @internal what the open-time fetch learned; T-103's deposit-if-ahead / refresh-if-stale read this */
    get fetched() {
      return __privateGet(this, _fetched);
    }
    onState(cb) {
      __privateGet(this, _listeners2).add(cb);
      return () => __privateGet(this, _listeners2).delete(cb);
    }
    /** fetch → verify envelope → decrypt → merge after local persistence loads; once */
    start() {
      return __privateGet(this, _started) ?? __privateSet(this, _started, __privateMethod(this, _PocketClient_instances, start_fn).call(this));
    }
    /**
     * Capture pending changes right now instead of waiting out the debounce —
     * leave()'s last act before teardown, and the visibilitychange fallback.
     * Resolves once the PUT settles (or fails; failure is not a reason to
     * block leaving — the doc stays safe locally either way). A 429 on the
     * way out is retried inside a bounded wait and then NAMED — never
     * swallowed: that was the syrup/manyhands loss (T-178).
     */
    flush() {
      if (!__privateGet(this, _flushing)) {
        __privateSet(this, _flushing, __privateMethod(this, _PocketClient_instances, flushNow_fn).call(this).finally(() => {
          __privateSet(this, _flushing, null);
        }));
      }
      return __privateGet(this, _flushing);
    }
    destroy() {
      __privateSet(this, _destroyed3, true);
      if (__privateGet(this, _timer2)) clearTimeout(__privateGet(this, _timer2));
      __privateSet(this, _timer2, null);
      __privateGet(this, _doc2).off("afterTransaction", __privateGet(this, _onTransaction3));
      if (__privateGet(this, _onVisibility)) document.removeEventListener("visibilitychange", __privateGet(this, _onVisibility));
      if (__privateGet(this, _onPageHide)) pageTarget()?.removeEventListener("pagehide", __privateGet(this, _onPageHide));
      __privateGet(this, _abort).abort();
      __privateGet(this, _listeners2).clear();
    }
  };
  _origin = new WeakMap();
  _code = new WeakMap();
  _key2 = new WeakMap();
  _doc2 = new WeakMap();
  _whenReady = new WeakMap();
  _state = new WeakMap();
  _listeners2 = new WeakMap();
  _abort = new WeakMap();
  _destroyed3 = new WeakMap();
  _fetched = new WeakMap();
  _tag = new WeakMap();
  _debounceMs2 = new WeakMap();
  _minGapMs2 = new WeakMap();
  _flushRetries = new WeakMap();
  _flushBackoffMs = new WeakMap();
  _settleWaitMs = new WeakMap();
  _started = new WeakMap();
  _armed3 = new WeakMap();
  _dirty = new WeakMap();
  _rateLimited = new WeakMap();
  _timer2 = new WeakMap();
  _lastDepositAt = new WeakMap();
  _inflight = new WeakMap();
  _flushing = new WeakMap();
  _onVisibility = new WeakMap();
  _onPageHide = new WeakMap();
  _PocketClient_instances = new WeakSet();
  set_fn = function(state) {
    __privateSet(this, _state, state);
    for (const cb of __privateGet(this, _listeners2)) cb(state);
  };
  start_fn = async function() {
    if (!__privateGet(this, _origin) || unavailableOrigins.has(__privateGet(this, _origin))) {
      __privateMethod(this, _PocketClient_instances, set_fn).call(this, { phase: "unavailable" });
      return;
    }
    __privateMethod(this, _PocketClient_instances, set_fn).call(this, { phase: "checking" });
    let json;
    try {
      const res = await fetch(`${__privateGet(this, _origin)}/pocket/${__privateGet(this, _code)}/${this.token}`, {
        signal: __privateGet(this, _abort).signal
      });
      json = await res.json();
    } catch {
      if (__privateGet(this, _destroyed3)) return;
      __privateMethod(this, _PocketClient_instances, set_fn).call(this, { phase: "unavailable" });
      return;
    }
    if (!isPocketEnvelope(json)) {
      unavailableOrigins.add(__privateGet(this, _origin));
      __privateMethod(this, _PocketClient_instances, set_fn).call(this, { phase: "unavailable" });
      return;
    }
    if (json.version > POCKET_VERSION) {
      __privateMethod(this, _PocketClient_instances, set_fn).call(this, { phase: "unavailable" });
      return;
    }
    const raw = Array.isArray(json.deposits) ? json.deposits : [];
    await __privateGet(this, _whenReady);
    if (__privateGet(this, _destroyed3)) return;
    let applied = 0;
    let dropped = 0;
    const appliedUpdates = [];
    for (const d of raw) {
      let update = null;
      if (typeof d.blob === "string") {
        try {
          update = openDeposit(b64decode(d.blob), __privateGet(this, _key2));
        } catch {
          update = null;
        }
      }
      if (!update) {
        dropped++;
        continue;
      }
      applyUpdate(__privateGet(this, _doc2), update, POCKET_TX_ORIGIN);
      appliedUpdates.push(update);
      applied++;
    }
    __privateSet(this, _fetched, {
      newestAt: typeof raw[0]?.at === "number" ? raw[0].at : 0,
      ttlDays: typeof json.ttlDays === "number" ? json.ttlDays : 60,
      count: raw.length
    });
    __privateMethod(this, _PocketClient_instances, set_fn).call(this, applied > 0 ? { phase: "applied", applied, dropped } : { phase: "empty", applied, dropped });
    __privateSet(this, _armed3, true);
    const ahead = __privateMethod(this, _PocketClient_instances, isAheadOf_fn).call(this, appliedUpdates);
    const halfTtl = __privateGet(this, _fetched).ttlDays * 864e5 / 2;
    const stale = __privateGet(this, _fetched).newestAt > 0 && Date.now() - __privateGet(this, _fetched).newestAt > halfTtl;
    __privateSet(this, _dirty, ahead || stale && __privateMethod(this, _PocketClient_instances, docHasState_fn).call(this));
    if (__privateGet(this, _dirty)) void __privateMethod(this, _PocketClient_instances, deposit_fn).call(this);
  };
  /** does the local doc hold anything beyond what the given updates carry? */
  isAheadOf_fn = function(updates) {
    if (!__privateMethod(this, _PocketClient_instances, docHasState_fn).call(this)) return false;
    if (updates.length === 0) return true;
    const probe = new Doc({ gc: false });
    for (const u of updates) applyUpdate(probe, u);
    const probeSv = decodeStateVector(encodeStateVector(probe));
    probe.destroy();
    const localSv = decodeStateVector(encodeStateVector(__privateGet(this, _doc2)));
    for (const [client, clock] of localSv) {
      if ((probeSv.get(client) ?? 0) < clock) return true;
    }
    return false;
  };
  docHasState_fn = function() {
    return decodeStateVector(encodeStateVector(__privateGet(this, _doc2))).size > 0;
  };
  _onTransaction3 = new WeakMap();
  schedule_fn2 = function() {
    if (__privateGet(this, _timer2)) clearTimeout(__privateGet(this, _timer2));
    const wait = Math.max(__privateGet(this, _debounceMs2), __privateGet(this, _lastDepositAt) + __privateGet(this, _minGapMs2) - Date.now());
    __privateSet(this, _timer2, setTimeout(() => {
      __privateSet(this, _timer2, null);
      void __privateMethod(this, _PocketClient_instances, deposit_fn).call(this);
    }, wait));
  };
  /** the hard limits stop depositing for good; 'rate-limited' is transient and does not */
  stopped_fn = function() {
    const e = __privateGet(this, _state).depositError;
    return e === "too-big" || e === "budget";
  };
  deposit_fn = async function() {
    if (__privateGet(this, _inflight)) return __privateGet(this, _inflight);
    if (__privateGet(this, _destroyed3) || !__privateGet(this, _dirty) || !__privateGet(this, _origin) || __privateMethod(this, _PocketClient_instances, stopped_fn).call(this)) return;
    __privateSet(this, _inflight, __privateMethod(this, _PocketClient_instances, put_fn).call(this));
    try {
      await __privateGet(this, _inflight);
    } finally {
      __privateSet(this, _inflight, null);
    }
  };
  put_fn = async function() {
    const blob = sealDeposit(encodeStateAsUpdate(__privateGet(this, _doc2)), __privateGet(this, _key2), __privateGet(this, _tag));
    __privateSet(this, _dirty, false);
    __privateSet(this, _rateLimited, false);
    try {
      const res = await fetch(`${__privateGet(this, _origin)}/pocket/${__privateGet(this, _code)}/${this.token}`, {
        method: "PUT",
        body: blob,
        // a small deposit outlives its tab — the visibilitychange flush's
        // whole point; a big one can't carry the option at all (T-178)
        ...blob.length <= KEEPALIVE_MAX_BYTES ? { keepalive: true } : {}
      });
      __privateSet(this, _lastDepositAt, Date.now());
      if (res.status === 413) __privateMethod(this, _PocketClient_instances, set_fn).call(this, { ...__privateGet(this, _state), depositError: "too-big" });
      else if (res.status === 507) __privateMethod(this, _PocketClient_instances, set_fn).call(this, { ...__privateGet(this, _state), depositError: "budget" });
      else if (res.status === 429) {
        __privateSet(this, _dirty, true);
        __privateSet(this, _rateLimited, true);
        if (!__privateGet(this, _destroyed3)) __privateMethod(this, _PocketClient_instances, schedule_fn2).call(this);
      } else if (!res.ok) __privateSet(this, _dirty, true);
      else if (__privateGet(this, _state).depositError === "rate-limited") __privateMethod(this, _PocketClient_instances, set_fn).call(this, withoutError(__privateGet(this, _state)));
    } catch {
      __privateSet(this, _dirty, true);
      __privateSet(this, _lastDepositAt, Date.now());
    }
  };
  flushNow_fn = async function() {
    if (__privateGet(this, _timer2)) {
      clearTimeout(__privateGet(this, _timer2));
      __privateSet(this, _timer2, null);
    }
    if (!__privateGet(this, _armed3) && __privateGet(this, _dirty) && __privateGet(this, _started)) {
      await Promise.race([__privateGet(this, _started), bounded(__privateGet(this, _settleWaitMs))]);
      if (__privateGet(this, _state).phase === "unavailable") return;
    }
    if (__privateGet(this, _inflight)) await __privateGet(this, _inflight);
    if (!__privateGet(this, _dirty)) return;
    await __privateMethod(this, _PocketClient_instances, deposit_fn).call(this);
    for (let i = 0; i < __privateGet(this, _flushRetries) && __privateGet(this, _rateLimited) && !__privateGet(this, _destroyed3); i++) {
      await sleep(__privateGet(this, _flushBackoffMs) * 2 ** i);
      if (__privateGet(this, _destroyed3)) return;
      await __privateMethod(this, _PocketClient_instances, deposit_fn).call(this);
    }
    if (__privateGet(this, _rateLimited) && !__privateGet(this, _destroyed3)) __privateMethod(this, _PocketClient_instances, set_fn).call(this, { ...__privateGet(this, _state), depositError: "rate-limited" });
  };

  // src/spool.ts
  var DEFAULT_RELAY = "wss://relay.spools.lol/yjs";
  var deriveSignaling = (relay) => {
    try {
      const url = new URL(relay);
      if (url.pathname === "/yjs" || url.pathname === "/yjs/") {
        return [`${url.protocol}//${url.host}/`];
      }
    } catch {
    }
    return void 0;
  };
  var _engine, _store2, _history, _pocket, _relay, _key3;
  var Spool = class {
    /** @internal use newSpool/openSpool; historyTuning/pocketTuning are for tests only */
    constructor(engine, relay, key, author, historyTuning, pocketTuning) {
      __publicField(this, "code");
      __publicField(this, "whenReady");
      /** escape hatch for power users binding editors */
      __publicField(this, "doc");
      /** self-declared author for entries wound here (T-012) */
      __publicField(this, "author");
      __privateAdd(this, _engine);
      __privateAdd(this, _store2);
      __privateAdd(this, _history);
      __privateAdd(this, _pocket);
      __privateAdd(this, _relay);
      /** carried from the link / generated fresh; seals storage (T-050) and both transports (T-051) */
      __privateAdd(this, _key3);
      __privateSet(this, _engine, engine);
      __privateSet(this, _relay, relay);
      __privateSet(this, _key3, key);
      this.author = author;
      this.code = engine.code;
      this.doc = engine.doc;
      this.whenReady = engine.whenReady;
      __privateSet(this, _store2, new EntryStore(engine.doc, author, engine.whenReady));
      __privateSet(this, _history, new HistoryLog(engine.doc, engine.whenReady, historyTuning));
      __privateSet(this, _pocket, key && relay ? new PocketClient({
        relay,
        code: engine.code,
        key,
        doc: engine.doc,
        whenReady: engine.whenReady,
        tuning: pocketTuning
      }) : null);
      void __privateGet(this, _pocket)?.start();
    }
    get status() {
      return __privateGet(this, _engine).status;
    }
    /**
     * The engine's awareness instance, shared across both transports (M11,
     * T-112) — the one SDK change of the milestone. App-defined payload,
     * best-effort, ephemeral by design: state expires ~30 s after its writer
     * goes quiet and must never be persisted (ghost presence is a named
     * refusal). Sealed on keyed spools by construction — awareness frames ride
     * the same encrypted transport as sync frames. null when relayless.
     */
    get awareness() {
      return __privateGet(this, _engine).awareness;
    }
    /** short key fingerprint for "are we on the same key?" UX; null for keyless spools */
    get keyFingerprint() {
      return __privateGet(this, _key3) ? keyFingerprint(__privateGet(this, _key3)) : null;
    }
    /**
     * Relay frames dropped because they weren't sealed with this spool's key —
     * nonzero means someone in the room is on the wrong key or no key (T-051).
     * Always 0 for keyless spools.
     */
    get undecryptableFrames() {
      return __privateGet(this, _engine).undecryptableFrames;
    }
    /**
     * The relay refused the last connection with 1013 "room full" (T-169):
     * the room is at the relay's per-room cap. The SDK stands back (~30 s)
     * between attempts instead of spinning, and `status` reads 'offline'
     * meanwhile; clears the moment a connection is accepted. Watch refusals
     * via on('full'). The status union stays closed — this is beside it.
     */
    get roomFull() {
      return __privateGet(this, _engine).roomFull;
    }
    /**
     * What the pocket did on open: `checking` → `applied` / `empty` /
     * `unavailable` (old relay, no relay, dead relay — all degrade to v1
     * behavior). null for keyless or relayless spools, which have no pocket
     * by construction. Watch transitions via on('pocket').
     */
    get pocket() {
      return __privateGet(this, _pocket)?.state ?? null;
    }
    /** live truth: sorted by createdAt (id tie-break), soft-deleted excluded */
    get entries() {
      return __privateGet(this, _store2).list();
    }
    /** soft-deleted entries — same live handles and sort as entries; entry.restore() brings one back */
    get deleted() {
      return __privateGet(this, _store2).listDeleted();
    }
    /** add an entry; synchronous — local-first means there's nothing to await */
    wind(input) {
      return __privateGet(this, _store2).wind(input);
    }
    /**
     * Write complete entry records — identity, time, author, parent, data,
     * body — into this spool exactly as given, in one transaction (T-186).
     * Idempotent: an id already here is skipped. Refuses the batch, before
     * any write, if a record's parent is neither in the batch nor in this
     * spool (SpoolSpliceError). The primitive under the cut; policy-free —
     * what crosses, what's flattened, and the new key are the caller's.
     */
    splice(records) {
      return __privateGet(this, _store2).splice(records);
    }
    on(event, cb) {
      if (event === "entry") return __privateGet(this, _store2).onEntry(cb);
      if (event === "status") return __privateGet(this, _engine).onStatus(cb);
      if (event === "undecryptable") return __privateGet(this, _engine).onUndecryptable(cb);
      if (event === "pocket") return __privateGet(this, _pocket)?.onState(cb) ?? (() => {
      });
      if (event === "full") return __privateGet(this, _engine).onFull(cb);
      throw new Error(`unknown event: ${String(event)}`);
    }
    /**
     * Recorded moment timestamps (ms), ascending — what rewind() can target;
     * the history scrubber's tick marks. Moments are logged debounced-on-idle
     * by whichever peer wrote, and merge like everything else.
     */
    get history() {
      return __privateGet(this, _history).moments;
    }
    /**
     * The spool as it was at the latest recorded moment ≤ ts: plain frozen
     * EntrySnapshots (soft-deleted-then entries included, with deletedAt set).
     * Read-only time travel — the present is never touched. Throws
     * SpoolHistoryError before the first recorded moment.
     */
    rewind(ts) {
      return __privateGet(this, _history).rewind(ts);
    }
    /**
     * The portable file, yours forever (M8): pretty-printed JSON with a
     * readable `entries` half and the full doc as a base64 `doc` half —
     * re-importable via importSpool(), still syncable, rewind moments
     * included. Encrypted spools export decrypted; the key is never in the
     * file. Synchronous — it's all local.
     */
    export() {
      const all2 = [...this.entries, ...this.deleted].sort((a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1)).map((e) => e.snapshot());
      return buildExport(this.code, all2, this.doc);
    }
    /** the shareable link — hand it to someone */
    share(base) {
      return buildSpoolLink({ code: this.code, relay: __privateGet(this, _relay), key: __privateGet(this, _key3), base });
    }
    /**
     * Disconnect and release resources; local data is retained (a spool is a
     * keepsake). The final pocket deposit goes out first — a 429 is retried
     * inside a few seconds and then named on `pocket` as
     * `depositError: 'rate-limited'` (T-178) — so `leave()` may take ~3 s
     * under a rate limit; it never blocks on a refused deposit for longer.
     */
    async leave() {
      __privateGet(this, _history).flush();
      await __privateGet(this, _pocket)?.flush().catch(() => {
      });
      __privateGet(this, _pocket)?.destroy();
      __privateGet(this, _history).destroy();
      __privateGet(this, _store2).destroy();
      return __privateGet(this, _engine).leave();
    }
  };
  _engine = new WeakMap();
  _store2 = new WeakMap();
  _history = new WeakMap();
  _pocket = new WeakMap();
  _relay = new WeakMap();
  _key3 = new WeakMap();
  var connect = (code, relay, key, opts) => {
    const engine = new SpoolEngine({
      code,
      relay,
      signaling: deriveSignaling(relay),
      persist: opts.persist,
      key
    });
    const spool = new Spool(engine, relay, key, opts.author ?? "anonymous");
    if (opts.persist !== false) touch(code, relay || key ? spool.share("") : void 0);
    return spool;
  };
  var newSpool = async (opts = {}) => {
    const key = opts.encrypted === false ? void 0 : generateKey();
    const spool = connect(generateCode(), opts.relay ?? DEFAULT_RELAY, key, opts);
    await spool.whenReady;
    return spool;
  };
  var openSpool = async (link, opts = {}) => {
    const parsed = parseSpoolLink(link);
    const spool = connect(parsed.code, parsed.relay ?? DEFAULT_RELAY, parsed.key, opts);
    await spool.whenReady;
    return spool;
  };
  var importSpool = async (file, opts = {}) => {
    const { code, update } = parseExport(file);
    const spool = connect(code, opts.relay ?? "", opts.key, opts);
    await spool.whenReady;
    applyUpdate(spool.doc, update);
    return spool;
  };
  return __toCommonJS(src_exports);
})();
/*! Bundled license information:

simple-peer/simplepeer.min.js:
  (*!
  * The buffer module from node.js, for the browser.
  *
  * @author   Feross Aboukhadijeh <https://feross.org>
  * @license  MIT
  *)
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  (*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  (*! simple-peer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
