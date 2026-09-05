import {
  Awareness,
  Doc,
  Observable,
  ObservableV2,
  YMap,
  __commonJS,
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet,
  __privateWrapper,
  __publicField,
  __require,
  __toESM,
  applyAwarenessUpdate,
  applyUpdate,
  create,
  create2,
  createDecoder,
  createDocFromSnapshot,
  createEncoder,
  decodeSnapshot,
  decodeStateVector,
  encodeAwarenessUpdate,
  encodeSnapshot,
  encodeStateAsUpdate,
  encodeStateVector,
  equalSnapshots,
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
  snapshot,
  subscribe,
  toUint8Array,
  transact,
  unsubscribe,
  writeSyncStep1,
  writeSyncStep2,
  writeUpdate,
  writeVarUint,
  writeVarUint8Array,
  yjs_exports
} from "./chunk-IL42FQKJ.js";

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
    connect: connect2 = true,
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
    this.shouldConnect = connect2;
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
  const params = new URLSearchParams(fragment);
  const code = params.get("spool");
  if (!code || !isValidCode(code)) {
    throw new SpoolLinkError(`bad spool code in link: ${code ?? "(missing)"}`);
  }
  const parsed = { code };
  const relay = params.get("relay");
  if (relay) {
    if (!/^wss?:\/\//.test(relay)) {
      throw new SpoolLinkError(`relay must be a ws:// or wss:// URL, got: ${relay.slice(0, 40)}`);
    }
    parsed.relay = relay;
  }
  const k = params.get("k");
  if (k) parsed.key = decodeKey(k);
  return parsed;
};
var buildSpoolLink = ({ code, relay, key, base }) => {
  if (!isValidCode(code)) throw new SpoolLinkError(`bad spool code: ${code}`);
  const params = new URLSearchParams({ spool: code });
  if (relay) params.set("relay", relay);
  if (key) params.set("k", encodeKey(key));
  const prefix = base ?? (typeof location !== "undefined" ? location.origin + location.pathname : "");
  return `${prefix}#${params.toString()}`;
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
  constructor(name, doc, key) {
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
    this.doc = doc;
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
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(this.name, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
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
  return new Promise((resolve, reject) => {
    if (!__privateGet(this, _db)) return resolve([]);
    const request = __privateGet(this, _db).transaction(UPDATES_STORE, "readonly").objectStore(UPDATES_STORE).getAll();
    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
};
storeRow_fn = function(row) {
  return new Promise((resolve, reject) => {
    if (!__privateGet(this, _db)) return resolve();
    const request = __privateGet(this, _db).transaction(UPDATES_STORE, "readwrite").objectStore(UPDATES_STORE).add(row);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
_onUpdate = new WeakMap();
compact_fn = async function() {
  if (__privateGet(this, _destroyed) || !__privateGet(this, _db)) return;
  const store = __privateGet(this, _db).transaction(UPDATES_STORE, "readwrite").objectStore(UPDATES_STORE);
  await new Promise((resolve, reject) => {
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => resolve();
    clearRequest.onerror = () => reject(clearRequest.error);
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
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
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
var _idb, _websocket, _webrtc, _webrtcPending, _wsStatus, _rtcConnected, _status, _statusListeners, _undecryptable, _undecryptableListeners, _roomFull, _fullListeners, _fullTimer, _roomFullBackoffMs, _left, _SpoolEngine_instances, countUndecryptable_fn, deriveStatus_fn;
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
    }
    const webrtc = opts.webrtc ?? hasWebRTC;
    if (webrtc && opts.signaling?.length) {
      __privateSet(this, _webrtcPending, import("./y-webrtc-HZXDA72Z.js").then(({ WebrtcProvider }) => {
        if (__privateGet(this, _left)) return;
        __privateSet(this, _webrtc, new WebrtcProvider(opts.code, this.doc, {
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
var ENTRIES = "entries";
var bodyKey = (id) => `entry:${id}`;
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
  constructor(store, id) {
    __privateAdd(this, _Entry_instances);
    __publicField(this, "id");
    __privateAdd(this, _store);
    __privateSet(this, _store, store);
    this.id = id;
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
   * Raw Y.Text for editor bindings; null until a body exists. Existence =
   * the root type is materialized in this doc (a body created empty on
   * another peer stays invisible here until its first character arrives —
   * no update, no existence).
   */
  get text() {
    const doc = __privateGet(this, _store).doc;
    return doc.share.has(bodyKey(this.id)) ? doc.getText(bodyKey(this.id)) : null;
  }
  /** '' if no body exists. Setting replaces content wholesale — bind entry.text for concurrent-edit-safe flows. */
  get body() {
    return this.text?.toString() ?? "";
  }
  set body(value) {
    const doc = __privateGet(this, _store).doc;
    doc.transact(() => {
      const text = doc.getText(bodyKey(this.id));
      if (text.length > 0) text.delete(0, text.length);
      if (value) text.insert(0, value);
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
  constructor(doc, author, whenReady) {
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
      for (const id of ids) {
        if (!this.entriesMap.has(id)) continue;
        const was = __privateGet(this, _shadow).get(id) ?? false;
        const is = __privateMethod(this, _EntryStore_instances, visible_fn).call(this, id);
        __privateGet(this, _shadow).set(id, is);
        if (!was && is) change.added.push(this.handle(id));
        else if (was && !is) change.deleted.push(this.handle(id));
        else if (was && is) change.updated.push(this.handle(id));
      }
      if (change.added.length + change.updated.length + change.deleted.length === 0) return;
      for (const cb of __privateGet(this, _listeners)) cb(change);
    });
    this.doc = doc;
    this.entriesMap = doc.getMap(ENTRIES);
    __privateSet(this, _author, author);
    doc.on("afterTransaction", __privateGet(this, _onTransaction));
    whenReady.then(() => {
      for (const id of this.entriesMap.keys()) __privateGet(this, _shadow).set(id, __privateMethod(this, _EntryStore_instances, visible_fn).call(this, id));
      __privateSet(this, _armed, true);
    });
  }
  handle(id) {
    let entry = __privateGet(this, _handles).get(id);
    if (!entry) {
      entry = new Entry(this, id);
      __privateGet(this, _handles).set(id, entry);
    }
    return entry;
  }
  /** sorted by createdAt, id as tie-break (deterministic across peers), soft-deleted excluded */
  list() {
    const out = [];
    for (const id of this.entriesMap.keys()) {
      if (__privateMethod(this, _EntryStore_instances, visible_fn).call(this, id)) out.push(this.handle(id));
    }
    return out.sort(byCreation);
  }
  /** the complement of list(): only the soft-deleted, same handles, same sort */
  listDeleted() {
    const out = [];
    for (const id of this.entriesMap.keys()) {
      if (this.entriesMap.get(id)?.get("deletedAt") != null) out.push(this.handle(id));
    }
    return out.sort(byCreation);
  }
  wind(input) {
    if (typeof input.kind !== "string" || input.kind === "") {
      throw new Error("wind() needs a non-empty kind");
    }
    const id = uuid();
    this.doc.transact(() => {
      const meta = new YMap();
      meta.set("id", id);
      meta.set("author", __privateGet(this, _author));
      meta.set("kind", input.kind);
      meta.set("createdAt", Date.now());
      if (input.parent !== void 0) meta.set("parent", input.parent);
      if (input.data !== void 0) meta.set("data", structuredClone(input.data));
      this.entriesMap.set(id, meta);
      if (input.body !== void 0) this.doc.getText(bodyKey(id)).insert(0, input.body);
    });
    return this.handle(id);
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
visible_fn = function(id) {
  const meta = this.entriesMap.get(id);
  return meta !== void 0 && meta.get("deletedAt") == null;
};
/** ids an arbitrary transaction may have affected: the entries map itself, nested meta maps, root body texts */
candidates_fn = function(tr) {
  const ids = /* @__PURE__ */ new Set();
  for (const [type, keys] of tr.changed) {
    if (type === this.entriesMap) {
      for (const key of keys) if (key !== null) ids.add(key);
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
var readEntries = (doc) => {
  const out = [];
  const entries = doc.getMap("entries");
  for (const id of entries.keys()) {
    const meta = entries.get(id);
    if (!meta) continue;
    const parent = meta.get("parent");
    const deletedAt = meta.get("deletedAt");
    const data = meta.get("data");
    out.push(
      Object.freeze({
        id,
        author: meta.get("author"),
        kind: meta.get("kind"),
        ...parent !== void 0 ? { parent } : {},
        createdAt: meta.get("createdAt"),
        ...deletedAt != null ? { deletedAt } : {},
        ...data !== void 0 ? { data: Object.freeze(data) } : {},
        body: doc.share.has(`entry:${id}`) ? doc.getText(`entry:${id}`).toString() : ""
      })
    );
  }
  return Object.freeze(out.sort(byCreation2));
};
var _doc, _arr, _debounceMs, _minGapMs, _timer, _armed2, _lastAppendAt, _destroyed2, _HistoryLog_instances, satisfiable_fn, _onTransaction2, schedule_fn, append_fn;
var HistoryLog = class {
  constructor(doc, whenReady, tuning) {
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
    __privateSet(this, _doc, doc);
    __privateSet(this, _arr, doc.getArray(HISTORY));
    __privateSet(this, _debounceMs, tuning?.debounceMs ?? 2e3);
    __privateSet(this, _minGapMs, tuning?.minGapMs ?? 1e4);
    doc.on("afterTransaction", __privateGet(this, _onTransaction2));
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
var EXPORT_FORMAT = "spool-export";
var EXPORT_VERSION = 1;
var SpoolExportError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "SpoolExportError";
  }
};
var buildExport = (code, entries, doc) => JSON.stringify(
  {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    code,
    exportedAt: Date.now(),
    entries,
    doc: b64encode(encodeStateAsUpdate(doc))
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
      await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(code);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error ?? new Error(`could not delete ${code}`));
        request.onblocked = () => reject(new Error(`${code} is still open \u2014 leave() it before forgetting`));
      });
    }
    const registry = readRegistry();
    delete registry[code];
    writeRegistry(registry);
  }
};

// src/pocket.ts
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
    const snapshot2 = (e) => Object.freeze({
      id: e.id,
      author: e.author,
      kind: e.kind,
      ...e.parent !== void 0 ? { parent: e.parent } : {},
      createdAt: e.createdAt,
      ...e.deletedAt != null ? { deletedAt: e.deletedAt } : {},
      ...e.data !== void 0 ? { data: e.data } : {},
      body: e.body
    });
    const all2 = [...this.entries, ...this.deleted].sort((a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1)).map(snapshot2);
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
export {
  DEFAULT_RELAY,
  DEPOSIT_MAGIC,
  EXPORT_FORMAT,
  EXPORT_VERSION,
  EncryptedIndexeddbPersistence,
  Entry,
  POCKET_VERSION,
  ROOM_FULL_CLOSE_CODE,
  Spool,
  SpoolEngine,
  SpoolExportError,
  SpoolHistoryError,
  SpoolKeyError,
  SpoolLinkError,
  TRANSPORT_MAGIC,
  yjs_exports as Y,
  buildSpoolLink,
  createEncryptedWebSocketClass,
  deriveSignaling,
  generateCode,
  importSpool,
  isValidCode,
  keyFingerprint,
  newSpool,
  openSpool,
  parseSpoolLink,
  stash
};
