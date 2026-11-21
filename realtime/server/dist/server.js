"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
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

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module2.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { websocketMask, websocketUnmask } = require("http");
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (websocketMask) {
      module2.exports.mask = function(source, mask, output, offset, length) {
        if (length < 24) _mask(source, mask, output, offset, length);
        else websocketMask(source, mask, output, offset, length);
      };
      module2.exports.unmask = function(buffer, mask) {
        if (buffer.length < 24) _unmask(buffer, mask);
        else websocketUnmask(buffer, mask);
      };
    } else if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && (typeof params.client_max_window_bits === "number" ? opts.clientMaxWindowBits > params.client_max_window_bits : !params.client_max_window_bits)) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module2.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._numFragments = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n2) {
        this._bufferedBytes -= n2;
        if (n2 === this._buffers[0].length) return this._buffers.shift();
        if (n2 < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n2,
            buf.length - n2
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n2);
        }
        const dst = Buffer.allocUnsafe(n2);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n2;
          if (n2 >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n2), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n2,
              buf.length - n2
            );
          }
          n2 -= buf.length;
        } while (n2 > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        this._mask = void 0;
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
          const error = this.createError(
            RangeError,
            "Too many message fragments",
            false,
            1008,
            "WS_ERR_TOO_MANY_BUFFERED_PARTS"
          );
          cb(error);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._numFragments = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module2.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync } = require("crypto");
    var {
      types: { isUint8Array }
    } = require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) {
          return dataLength ? [target, data] : [target];
        }
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (!dataLength) return [target];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var https = require("https");
    var http2 = require("http");
    var net = require("net");
    var querystring = require("querystring");
    var tls = require("tls");
    var { randomBytes, createHash } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL: URL2 } = require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            if (!options || options.protocols === void 0) {
              protocols = [];
            } else if (Array.isArray(options.protocols)) {
              protocols = options.protocols;
            } else {
              protocols = [options.protocols];
            }
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              if (options.protocols === void 0) {
                protocols = [];
              } else if (Array.isArray(options.protocols)) {
                protocols = options.protocols;
              } else {
                protocols = [options.protocols];
              }
            } else {
              protocols = [protocols];
            }
          }
          options = initAsClient(this, address, protocols, options);
        } else {
          this._isServer = true;
        }
        if (options.autoPong) {
          this._autoPong = true;
          this._autoPongComplete = () => autoPongComplete(this);
          this._pendingAutoPongs = 0;
          this._maxPendingAutoPongs = options.maxPendingAutoPongs | 0;
        }
        this._closeTimeout = options.closeTimeout;
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        this._readyState = _WebSocket.CLOSING;
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 256 * 1024,
        maxFragments: 16 * 1024,
        maxPayload: 100 * 1024 * 1024,
        maxPendingAutoPongs: 60,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        protocols: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
        parsedUrl = new URL2(parsedUrl);
        parsedUrl.protocol = parsedUrl.protocol === "http:" ? "ws:" : "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http2.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        const username = querystring.unescape(parsedUrl.username);
        const password = querystring.unescape(parsedUrl.password);
        opts.auth = `${username}:${password}`;
      }
      if (isIpcUrl) {
        const i = opts.path.indexOf(":");
        if (i === -1) {
          opts.socketPath = opts.path;
          opts.path = "";
        } else {
          opts.socketPath = opts.path.slice(0, i);
          opts.path = opts.path.slice(i + 1);
        }
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
      return opts;
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeCode = code;
      if (reason.length === 0) {
        websocket._closeMessage = EMPTY_BUFFER;
      } else {
        websocket._closeMessage = Buffer.allocUnsafeSlow(reason.length);
        websocket._closeMessage.set(reason);
      }
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong && websocket.readyState === WebSocket2.OPEN) {
        if (websocket._maxPendingAutoPongs > 0 && websocket._pendingAutoPongs >= websocket._maxPendingAutoPongs) {
          websocket.terminate();
        } else {
          websocket._pendingAutoPongs++;
          websocket.pong(data, !this._isServer, websocket._autoPongComplete);
        }
      }
      websocket.emit("ping", data);
    }
    function autoPongComplete(websocket) {
      websocket._pendingAutoPongs--;
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http2 = require("http");
    var { Duplex } = require("stream");
    var { createHash } = require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=16384] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Number} [options.maxPendingAutoPongs=60] The maximum number of
       *     pending automatic pongs
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 256 * 1024,
          maxFragments: 16 * 1024,
          maxPayload: 100 * 1024 * 1024,
          maxPendingAutoPongs: 60,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http2.createServer((req, res) => {
            const body = http2.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http2.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http2.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// server/src/index.ts
var import_node_http = require("node:http");

// node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// shared/config.ts
var TICK = 20;
var DT = 1 / TICK;
var ZUSTAND_JE = 1;
var PROTOKOLL = 2;
var K = {
  /* Trefferwurf */
  TREFFERWURF: true,
  // false: jeder Angriff trifft
  /* Fähigkeiten: Der Wert in der Tabelle ist der Höchstschaden. Räumlich treffende Fähigkeiten (Flächen, Sprünge) brauchen keinen Trefferwurf. */
  FAEHIG_MIN: 0.7,
  // Mindestschaden einer Fähigkeit als Anteil am Höchstschaden
  /* Fernkampf: Wer schießt oder zaubert, steht dafür kurz still. Nahkämpfer schlagen auch im Laufen zu. */
  AUSHOLEN_FERN: 0.3,
  /* Erholung: Wer eine Weile keinen Schaden nimmt, heilt von selbst */
  ERHOLUNG: { nach: 5, jeSek: 0.015 },
  // nach 5 s ohne Schaden: 1,5 % des Höchstlebens je Sekunde
  /* Torvalds Schild (zweiter Waffenmodus): von vorn wird er um diesen Anteil seltener getroffen (sein Verteidigungswurf steigt entsprechend).
     Gegen Flächen ohne Trefferwurf mindert der Schild stattdessen den Schaden um „flaeche“. */
  BLOCK: { nah: 0.6, fern: 0.4, magie: 0.2, flaeche: 0.05, winkel: 70, tempo: 0.85 },
  // winkel: so viele Grad links und rechts der Blickrichtung
  BOLLWERK: { dauer: 3, plus: 0.25, hinter: 0.35 },
  // zusätzliche Minderung für Torvald; Verbündete direkt hinter ihm bekommen „hinter“
  MINDERUNG_MAX: 0.8,
  // mehr als 80 % bringen Schild und Bollwerk zusammen nie
  WUCHT: 0.5,
  // Wuchtangriffe gegen Gegner mit dieser Schwäche: +50 %
  WECHSEL: 0.4,
  // so lange dauert der Waffenwechsel (Sperre)
  R_HELD: 0.36,
  SICHT: 7,
  AGGRO: 5.5,
  LEINE: 10,
  // Monster: ab wann sie angreifen, wie weit sie ihrem Lager folgen
  WIEDER_HELD: 5,
  HEIM_HEILUNG: 0.15,
  HEIM_HEILUNG_BOSS: 0.02,
  // Monster, die niemanden mehr verfolgen, heilen an ihrem Platz so viel ihres Lebens je Sekunde
  SPLITTER: [1, 20],
  EINGABEN_JE_SEK: 30,
  /* Einzelne Fähigkeiten */
  FESTNAGELN: { langsam: 0.15, dauer: 1.5, sperre: 3 },
  STOSS: { weite: 2.5, schaden: 30, zurueck: 1.6 },
  SCHILD_GRAUWACHT: { radius: 6, schutz: 80, schutzDauer: 6, spott: 4 },
  FROST: { reich: 8, radius: 2, schaden: 24, langsam: 0.3, dauer: 2 },
  DONNER: { reich: 7, radius: 2, schaden: 42, zurueck: 1.5 },
  GLUT: { reich: 8, radius: 3, schaden: 85, brand: 8, dauer: 3, flug: 9 },
  WORT: { reich: 7, heilung: 55 },
  SCHUTZKREIS: { radius: 3, schutz: 35, magie: 15, dauer: 4 },
  // magie: Punkte auf die Magieverteidigung
  GOETTLICH: { radius: 6, anteil: 0.3, heilig: 50 },
  BEISTAND: { radius: 3, magie: 5 },
  STICH: { weite: 3.5, schaden: 38, hinten: 0.25 },
  GIFT: { hiebe: 3, jeSek: 6, dauer: 3 },
  HINRICHTUNG: { reich: 2.2, schaden: 110, unter: 0.25, plus: 0.75 },
  NACHBLUTEN: { jeSek: 3, dauer: 3 },
  MAL: { reich: 10, dauer: 7, plus: 0.12 },
  BOLZEN: { schaden: 28, langsam: 0.4, dauer: 2.5 },
  ERLEGEN: { schaden: 100, mal: 0.25, unter: 0.35, plus: 0.4 },
  DURCHBRECHEN: { abwehr: 10, dauer: 3, sperre: 5 }
  // senkt Nah- und Fernkampfverteidigung des Ziels
};
var HELDEN = {
  schildwaechter: {
    name: "Torvald",
    titel: "Der Schildw\xE4chter",
    klasse: "Krieger",
    rolle: "Verteidiger an der Front",
    bild: "img/figuren/schildwaechter.jpg",
    figur: "img/echtzeit/torvald.webp",
    gross: 1.065,
    lauf: "img/echtzeit/torvald-lauf.webp",
    laufMass: [0.5, 0.946, 0.855],
    hieb: "img/echtzeit/torvald-hieb.webp",
    hiebMass: [0.5, 0.955, 0.855],
    schild: "img/echtzeit/torvald-schild.webp",
    schildStand: "img/echtzeit/torvald-schild-stand.webp",
    schildFuss: [0.46, 0.95, 1.15],
    lp: 320,
    tempo: 3.3,
    angriff: { nah: 100, fern: 55, magie: 25 },
    abwehr: { nah: 90, fern: 80, magie: 45 },
    modi: [
      { name: "Langschwert", art: "nah", schaden: [18, 30], takt: 0.9, reich: 1.6, text: "Nahkampf. Treffer verlangsamen den Gegner kurz (Festnageln)." },
      { name: "Schild", art: "nah", schaden: [0, 0], takt: 1, reich: 0, schild: true, text: "Kein Angriff. Torvald h\xE4lt den Schild dem Gegner entgegen: Von vorn treffen ihn Nahkampfangriffe 60 % seltener, Fernkampf 40 %, Magie 20 %. Er l\xE4uft 15 % langsamer. F\xE4higkeiten gehen weiter." }
    ],
    q: { name: "Schildsto\xDF", zeit: 8, text: "St\xFCrmt bis zu 2,5 Felder vor, 30 Schaden, st\xF6\xDFt den Gegner zur\xFCck." },
    e: { name: "Bollwerk", zeit: 14, text: "3 Sekunden deutlich st\xE4rkerer Block. Verb\xFCndete direkt hinter Torvald sind mitgesch\xFCtzt." },
    r: { name: "Schild von Grauwacht", zeit: 80, text: "Gegner im Umkreis von 6 Feldern greifen Torvald an. Verb\xFCndete in der N\xE4he bekommen 80 Schutzpunkte." },
    passiv: "Festnageln: Schwerttreffer verlangsamen um 15 % f\xFCr 1,5 Sekunden (je Gegner h\xF6chstens alle 3 Sekunden)."
  },
  elementarist: {
    name: "Vaelin",
    titel: "Der Elementarist",
    klasse: "Magier",
    rolle: "Fl\xE4chenschaden aus der Ferne",
    bild: "img/figuren/elementarist.jpg",
    figur: "img/echtzeit/vaelin.webp",
    fuss: [0.55, 0.96],
    gross: 1.075,
    lauf: "img/echtzeit/vaelin-lauf.webp",
    laufMass: [0.516, 0.91, 0.81],
    hieb: "img/echtzeit/vaelin-zauber.webp",
    hiebMass: [0.47, 0.982, 0.8],
    hieb2: "img/echtzeit/vaelin-schlag.webp",
    hieb2Mass: [0.45, 0.926, 0.824],
    lp: 210,
    tempo: 3.4,
    angriff: { nah: 25, fern: 25, magie: 115 },
    abwehr: { nah: 25, fern: 35, magie: 70 },
    modi: [
      { name: "Elementarstab", art: "magie", schaden: [16, 30], takt: 1.2, reich: 8, flug: 13, text: "Magisches Geschoss aus der Ferne." },
      { name: "Stabschlag", art: "nah", schaden: [5, 13], takt: 0.9, reich: 1.5, text: "Schwacher Nahkampfschlag zur Selbstverteidigung, st\xF6\xDFt leicht zur\xFCck." }
    ],
    q: { name: "Frosthauch", zeit: 9, text: "Eiswolke (Radius 2): 24 Magieschaden, verlangsamt um 30 % f\xFCr 2 Sekunden." },
    e: { name: "Donnerwelle", zeit: 14, text: "Blitz (Radius 2): 42 Magieschaden, st\xF6\xDFt Gegner zur\xFCck." },
    r: { name: "Glutsph\xE4re", zeit: 75, text: "Feuerexplosion (Radius 3): 85 Magieschaden, danach 8 Schaden je Sekunde f\xFCr 3 Sekunden." },
    passiv: "Zauberformung: Vaelins Fl\xE4chenzauber treffen keine Verb\xFCndeten."
  },
  lichtbringer: {
    name: "Elara",
    titel: "Die Lichtbringerin",
    klasse: "Kleriker",
    rolle: "Heilerin, stark gegen Untote",
    bild: "img/figuren/lichtbringer.jpg",
    figur: "img/echtzeit/elara.webp",
    fuss: [0.42, 0.965],
    gross: 1.07,
    lauf: "img/echtzeit/elara-lauf.webp",
    laufMass: [0.44, 0.957, 0.875],
    hieb: "img/echtzeit/elara-heil.webp",
    hiebMass: [0.42, 0.955, 0.867],
    hieb2: "img/echtzeit/elara-hieb.webp",
    hieb2Mass: [0.42, 0.94, 0.77],
    lp: 270,
    tempo: 3.5,
    angriff: { nah: 65, fern: 25, magie: 100 },
    abwehr: { nah: 65, fern: 55, magie: 65 },
    modi: [
      { name: "Heilstab", art: "heil", schaden: [10, 18], takt: 2.2, reich: 6, text: "Heilt einen Verb\xFCndeten (oder Elara selbst) um 10 bis 18. Ohne gew\xE4hltes Ziel: wer am schwersten verletzt ist. Heilung braucht keinen Trefferwurf." },
      { name: "Streitkolben", art: "nah", schaden: [15, 27], takt: 1, reich: 1.5, untot: 0.15, text: "Nahkampf, 15 % mehr Schaden gegen Untote." }
    ],
    q: { name: "Heilendes Wort", zeit: 8, text: "Heilt einen Verb\xFCndeten in bis zu 7 Feldern um 55." },
    e: { name: "Schutzkreis", zeit: 16, text: "Kreis (Radius 3) um Elara: Verb\xFCndete bekommen 35 Schutzpunkte und 15 Magieverteidigung f\xFCr 4 Sekunden." },
    r: { name: "G\xF6ttliches Licht", zeit: 90, text: "Heilt Verb\xFCndete im Umkreis von 6 Feldern um 30 % ihres H\xF6chstlebens. Untote dort erleiden 50 heiligen Schaden." },
    passiv: "Beistand: Verb\xFCndete im Umkreis von 3 Feldern haben 5 Magieverteidigung mehr."
  },
  assassine: {
    name: "Vex",
    titel: "Der Assassine",
    klasse: "Schurke",
    rolle: "Schneller Einzelschaden",
    bild: "img/figuren/assassine.jpg",
    figur: "img/echtzeit/vex.webp",
    fuss: [0.5, 0.95],
    gross: 1.07,
    lauf: "img/echtzeit/vex-lauf.webp",
    laufMass: [0.47, 0.93, 0.885],
    hieb: "img/echtzeit/vex-dolch.webp",
    hiebMass: [0.45, 0.975, 0.895],
    hieb2: "img/echtzeit/vex-schuss.webp",
    hieb2Mass: [0.46, 0.985, 0.925],
    lp: 220,
    tempo: 4.4,
    angriff: { nah: 110, fern: 90, magie: 15 },
    abwehr: { nah: 45, fern: 70, magie: 30 },
    modi: [
      { name: "Dolch", art: "nah", schaden: [7, 18], takt: 0.55, reich: 1.5, text: "Sehr schneller Nahkampf. Jeder Treffer l\xE4sst den Gegner nachbluten." },
      { name: "Armbrust", art: "fern", schaden: [19, 32], takt: 1.2, reich: 7.5, flug: 16, text: "Fernkampf aus sicherem Abstand." }
    ],
    q: { name: "Schattenstich", zeit: 7, text: "Springt bis zu 3,5 Felder auf ein Ziel: 38 Schaden, von hinten 25 % mehr." },
    e: { name: "Giftklinge", zeit: 14, text: "Die n\xE4chsten 3 Dolchtreffer vergiften: 6 Schaden je Sekunde f\xFCr 3 Sekunden." },
    r: { name: "Hinrichtung", zeit: 75, text: "110 Schaden an einem Ziel in Nahkampfreichweite; unter 25 % Leben 75 % mehr (nicht bei Bossen)." },
    passiv: "Nachbluten: Dolchtreffer verursachen 3 Schaden je Sekunde f\xFCr 3 Sekunden (wird erneuert, nicht gestapelt)."
  },
  kopfgeldjaeger: {
    name: "Orin",
    titel: "Der Kopfgeldj\xE4ger",
    klasse: "Waldl\xE4ufer",
    rolle: "Gezielter Fernkampf",
    bild: "img/figuren/kopfgeldjaeger.jpg",
    figur: "img/echtzeit/orin.webp",
    fuss: [0.46, 0.95],
    gross: 1.07,
    lauf: "img/echtzeit/orin-lauf.webp",
    laufMass: [0.46, 0.941, 0.854],
    hieb: "img/echtzeit/orin-schuss.webp",
    hiebMass: [0.48, 0.98, 0.925],
    hieb2: "img/echtzeit/orin-messer.webp",
    hieb2Mass: [0.47, 0.959, 0.9],
    lp: 245,
    tempo: 3.9,
    angriff: { nah: 45, fern: 115, magie: 20 },
    abwehr: { nah: 55, fern: 75, magie: 40 },
    modi: [
      { name: "Schwere Armbrust", art: "fern", schaden: [25, 45], takt: 1.45, reich: 9, flug: 18, text: "Hoher Einzelschaden. Treffer senken die Verteidigung des Ziels (Durchbrechen)." },
      { name: "Jagdmesser", art: "nah", schaden: [8, 16], takt: 0.85, reich: 1.5, text: "Schneller Nahkampf zur Selbstverteidigung." }
    ],
    q: { name: "J\xE4germal", zeit: 10, text: "Markiert einen Gegner f\xFCr 7 Sekunden: Orins Angriffe machen dort 12 % mehr Schaden." },
    e: { name: "L\xE4hmender Bolzen", zeit: 14, text: "28 Schaden, verlangsamt das Ziel um 40 % f\xFCr 2,5 Sekunden." },
    r: { name: "Erlegen", zeit: 80, text: "Schuss mit 100 Schaden; gegen ein markiertes Ziel 25 % mehr, unter 35 % Leben weitere 40 % mehr." },
    passiv: "Durchbrechen: Treffer der schweren Armbrust senken Nah- und Fernkampfverteidigung um 10 f\xFCr 3 Sekunden (je Gegner h\xF6chstens alle 5 Sekunden)."
  }
};
var STAERKE = { lp: 1, schaden: 1, beute: null, bossMal: 6, ep: 0 };
var STUFE_MAX = 10;
var EP_BIS = [0, 0, 100, 250, 450, 700, 1e3, 1400, 1900, 2500, 3200];
var stufeAusEp = (ep) => {
  let s = 1;
  while (s < STUFE_MAX && ep >= EP_BIS[s + 1]) s++;
  return s;
};
var STUFENBONUS = (s) => ({ lp: 0.05 * (s - 1), angriff: 3 * (s - 1), abwehr: 3 * (s - 1), schaden: 0.03 * (s - 1), abklingen: s >= 10 ? 0.2 : s >= 5 ? 0.1 : 0 });
var HELDENSTUFE = {};
var HELDENEP = {};
function setzeStaerke(stufe, helden) {
  const g = 0.45 + 0.15 * stufe, n2 = Math.max(1, Math.min(3, helden));
  STAERKE.lp = g * (0.5 + 0.5 * n2);
  STAERKE.schaden = g * (1 + 0.1 * (n2 - 1));
  STAERKE.beute = [1 + stufe, 3 + 2 * stufe];
  STAERKE.ep = g;
}
var MONSTER = {
  knochenwaechter: {
    name: "Knochenw\xE4chter",
    bild: "img/gegner/knochenwaechter.jpg",
    figur: "img/echtzeit/kw.webp",
    fuss: [0.62, 0.95],
    gross: 1.065,
    lauf: "img/echtzeit/kw-lauf.webp",
    laufMass: [0.52, 0.93, 0.65],
    hieb: "img/echtzeit/kw-hieb.webp",
    hiebMass: [0.55, 0.935, 0.75],
    links: true,
    lp: 150,
    tempo: 3.3,
    angriffswert: { nah: 70, fern: 0, magie: 0 },
    abwehr: { nah: 70, fern: 55, magie: 35 },
    r: 0.38,
    untot: true,
    anfaellig: "wucht",
    angriff: { name: "Kurzschwert", art: "nah", schaden: [10, 20], takt: 1.2, reich: 1.5, aushol: 0.45 }
  },
  // aushol: so lange holt er sichtbar aus – wer dann außer Reichweite ist, wird nicht getroffen
  /* Weidenhain. Werte aus dem Würfelspiel umgerechnet wie beim Knochenwächter (TP 13 → 150 LP, RK 13 → Verteidigung 70, Angriffsbonus +4 → 70, Schaden 1W6+2 → 10–20):
     Schlammkröte TP 18, RK 11, +4, 1W8+2, Reichweite 2 · Irrlicht TP 6, RK 14, +4, 1W6+1, Reichweite 4, flink · alte Unke TP 34, RK 12, +5, 1W8+3, holt vor dem Schlag Luft.
     Das Irrlicht ist im Nahkampf schwer zu treffen; Fernkampf und Zauber holen es herunter. */
  schlammkroete: {
    name: "Riesenkr\xF6te",
    bild: "img/gegner/schlammkroete.jpg",
    figur: "img/echtzeit/kroete.webp",
    fuss: [0.5, 0.9],
    lauf: "img/echtzeit/kroete-lauf.webp",
    laufMass: [0.507, 0.88, 0.604],
    hieb: "img/echtzeit/kroete-hieb.webp",
    hiebMass: [0.5, 0.87, 0.581],
    hoehe: 90,
    lp: 210,
    tempo: 2.4,
    angriffswert: { nah: 70, fern: 0, magie: 0 },
    abwehr: { nah: 60, fern: 50, magie: 40 },
    r: 0.36,
    angriff: { name: "Zunge", art: "nah", schaden: [12, 24], takt: 1.6, reich: 2.5, aushol: 0.55 }
  },
  // langsam, aber die Zunge reicht weit
  kroetchen: {
    name: "Junge Kr\xF6te",
    bild: "img/gegner/schlammkroete.jpg",
    figur: "img/echtzeit/kroete.webp",
    fuss: [0.5, 0.9],
    lauf: "img/echtzeit/kroete-lauf.webp",
    laufMass: [0.507, 0.88, 0.604],
    hieb: "img/echtzeit/kroete-hieb.webp",
    hiebMass: [0.5, 0.87, 0.581],
    hoehe: 58,
    lp: 80,
    tempo: 2.9,
    angriffswert: { nah: 55, fern: 0, magie: 0 },
    abwehr: { nah: 45, fern: 40, magie: 35 },
    r: 0.28,
    angriff: { name: "Zunge", art: "nah", schaden: [6, 12], takt: 1.3, reich: 1.8, aushol: 0.45 }
  },
  // frisch geschlüpft: klein, flink, harmloser
  laich: {
    name: "Kr\xF6tenlaich",
    bild: "img/gegner/schlammkroete.jpg",
    fest: true,
    unsichtbar: true,
    lp: 170,
    tempo: 0,
    angriffswert: { nah: 0, fern: 0, magie: 0 },
    abwehr: { nah: 20, fern: 35, magie: 30 },
    r: 0.6,
    angriff: { name: "\u2013", art: "nah", schaden: [0, 0], takt: 99, reich: 0, aushol: 0 },
    brut: { art: "kroetchen", takt: 9, max: 2, gesamt: 3 }
  },
  // liegt im Tümpel; solange er heil ist, schlüpfen Junge
  moorleiche: {
    name: "Moorleiche",
    bild: "img/gegner/moorleiche.jpg",
    figur: "img/echtzeit/moorleiche.webp",
    fuss: [0.433, 0.957],
    lauf: "img/echtzeit/moorleiche-lauf.webp",
    laufMass: [0.433, 0.957, 0.936],
    hieb: "img/echtzeit/moorleiche-hieb.webp",
    hiebMass: [0.438, 0.945, 0.912],
    ruhe: "img/echtzeit/moorleiche-ruhe.webp",
    ruheMass: [0.482, 0.979, 0.958],
    hoehe: 88,
    lp: 190,
    tempo: 1.9,
    angriffswert: { nah: 72, fern: 0, magie: 0 },
    abwehr: { nah: 50, fern: 60, magie: 35 },
    r: 0.38,
    untot: true,
    aufstehen: 0.5,
    angriff: { name: "Nasser Griff", art: "nah", schaden: [16, 28], takt: 1.9, reich: 1.6, aushol: 0.6 }
  },
  // langsam und zäh; steht einmal wieder auf
  alwine: {
    name: "Alwine, die Stumme",
    bild: "img/gegner/alwine.jpg",
    figur: "img/echtzeit/alwine.webp",
    fuss: [0.456, 1.192],
    lauf: "img/echtzeit/alwine-lauf.webp",
    laufMass: [0.456, 1.192, 0.92],
    hieb: "img/echtzeit/alwine-hieb.webp",
    hiebMass: [0.436, 1.167, 0.906],
    hoehe: 120,
    lp: 1e3,
    tempo: 2.4,
    angriffswert: { nah: 0, fern: 0, magie: 78 },
    abwehr: { nah: 60, fern: 60, magie: 70 },
    r: 0.5,
    boss: true,
    untot: true,
    angriff: { name: "Kalte Hand", art: "magie", schaden: [14, 24], takt: 1.8, reich: 5, aushol: 0.6 },
    brut: { art: "irrlicht", takt: 13, max: 2, gesamt: 5 },
    /* ruft Irrlichter herbei */
    spezial: { name: "Wehklage", laden: 3, alle: 12, radius: 3, reich: 9, schaden: [70, 100], art: "magie", bild: "img/echtzeit/alwine-spezial.webp", mass: [0.439, 1.163, 0.902] }
  },
  kornsack: {
    name: "Kornsack",
    bild: "img/gegner/schlammkroete.jpg",
    figur: "img/echtzeit/kornsack.webp",
    fuss: [0.5, 0.975],
    hoehe: 78,
    fest: true,
    lp: 150,
    tempo: 0,
    angriffswert: { nah: 0, fern: 0, magie: 0 },
    abwehr: { nah: 20, fern: 20, magie: 20 },
    r: 0.4,
    angriff: { name: "\u2013", art: "nah", schaden: [0, 0], takt: 99, reich: 0, aushol: 0 }
  },
  // Schützling im Kornspeicher
  irrlicht: {
    name: "Irrlicht",
    bild: "img/gegner/irrlicht.jpg",
    figur: "img/echtzeit/irrlicht.webp",
    fuss: [0.5, 1.09],
    ruhe: "img/echtzeit/irrlicht-ruhe.webp",
    ruheMass: [0.482, 0.99, 0.816],
    hieb: "img/echtzeit/irrlicht-hieb.webp",
    hiebMass: [0.436, 0.983, 0.809],
    hoehe: 82,
    /* schwebt: die Bodenlinie liegt unter der Figur */
    lp: 70,
    tempo: 4.2,
    angriffswert: { nah: 0, fern: 0, magie: 70 },
    abwehr: { nah: 85, fern: 55, magie: 50 },
    r: 0.28,
    angriff: { name: "Kalter Funke", art: "magie", schaden: [8, 16], takt: 2, reich: 5.5, aushol: 0.6 }
  },
  // bleibt auf Abstand und wirft Funken
  alte_unke: {
    name: "Die alte Unke",
    bild: "img/gegner/schlammkroete.jpg",
    figur: "img/echtzeit/unke.webp",
    fuss: [0.5, 0.9],
    lauf: "img/echtzeit/unke-lauf.webp",
    laufMass: [0.504, 0.851, 0.712],
    hieb: "img/echtzeit/unke-hieb.webp",
    hiebMass: [0.489, 0.889, 0.758],
    hoehe: 160,
    lp: 900,
    tempo: 2.1,
    angriffswert: { nah: 85, fern: 0, magie: 0 },
    abwehr: { nah: 65, fern: 55, magie: 45 },
    r: 0.62,
    boss: true,
    angriff: { name: "Zungenschlag", art: "nah", schaden: [8, 14], takt: 2, reich: 2.8, aushol: 0.5 },
    /* viel Leben, leichter Standardangriff – gefährlich ist der Giftschwall */
    spezial: { name: "Giftschwall", laden: 4, alle: 11, radius: 2.4, reich: 5, schaden: [110, 150], art: "magie", bild: "img/echtzeit/unke-spezial.webp", mass: [0.49, 0.867, 0.803] }
  },
  // holt lange Luft: wer dann aus der Reichweite geht, wird nicht getroffen
  /* Der Boss in der Siegelkammer. Werte frei gesetzt, nicht abgestimmt. */
  knochenfuerst: {
    name: "Knochenf\xFCrst",
    bild: "img/gegner/grabritter.jpg",
    figur: "img/echtzeit/boss.webp",
    fuss: [0.55, 0.96],
    hoehe: 118,
    lauf: "img/echtzeit/boss-lauf.webp",
    laufMass: [0.5, 0.94, 0.66],
    hieb: "img/echtzeit/boss-hieb.webp",
    hiebMass: [0.5, 0.905, 0.6],
    ruhe: "img/echtzeit/boss-ruhe.webp",
    ruheMass: [0.48, 0.945, 0.91],
    lp: 520,
    tempo: 3,
    angriffswert: { nah: 100, fern: 0, magie: 0 },
    abwehr: { nah: 85, fern: 70, magie: 50 },
    r: 0.55,
    untot: true,
    boss: true,
    angriff: { name: "Knochenklinge", art: "nah", schaden: [20, 36], takt: 1.7, reich: 1.9, aushol: 0.6 }
  }
};

// shared/karte.ts
var KB = 33;
var KH = 20;
var OFFEN = [
  [1, 1, 7, 6],
  // Eingang
  [8, 3, 3, 2],
  [11, 1, 8, 7],
  // Koboldhöhle
  [14, 8, 2, 3],
  [10, 11, 10, 7],
  // Käfernest
  [20, 13, 3, 2],
  [23, 10, 9, 8],
  // Gruft
  [26, 7, 2, 3],
  [21, 1, 11, 6]
  // Siegelkammer
];
var SAEULEN = [[14, 4], [15, 4], [14, 14], [27, 14], [27, 15], [24, 3]];
var FELS = new Uint8Array(KB * KH).fill(1);
var WASSER = new Uint8Array(KB * KH);
for (const [x, y, w, h] of OFFEN) for (let i = x; i < x + w; i++) for (let j = y; j < y + h; j++) FELS[j * KB + i] = 0;
for (const [x, y] of SAEULEN) FELS[y * KB + x] = 1;
var START = [{ x: 3.5, y: 4.5 }, { x: 4.5, y: 5.5 }, { x: 2.5, y: 5.5 }];
var LAGER = [
  { art: "knochenwaechter", x: 15.5, y: 2.5, gruppe: 1 },
  { art: "knochenwaechter", x: 17.5, y: 4.5, gruppe: 1 },
  { art: "knochenwaechter", x: 12.5, y: 14.5, gruppe: 2 },
  { art: "knochenwaechter", x: 13.5, y: 16.5, gruppe: 2 },
  { art: "knochenwaechter", x: 17.5, y: 15.5, gruppe: 2 },
  { art: "knochenwaechter", x: 29.5, y: 12.5, gruppe: 3 },
  { art: "knochenwaechter", x: 29.5, y: 15.5, gruppe: 3 },
  { art: "knochenwaechter", x: 26.5, y: 16.5, gruppe: 3 },
  { art: "knochenwaechter", x: 22.5, y: 1.5, gruppe: 4 },
  { art: "knochenwaechter", x: 22.5, y: 3.5, gruppe: 4 },
  { art: "knochenwaechter", x: 30.5, y: 1.5, gruppe: 5 },
  { art: "knochenwaechter", x: 31.5, y: 5.5, gruppe: 5 },
  { art: "knochenfuerst", x: 27.5, y: 4.5, gruppe: 6 }
];
var SCHLEUSE = null;
var PROBE = null;
var SCHUETZ = [];
var AGGRO = null;
var LEINE = null;
var karteJetzt = () => ({ KB, KH, FELS, WASSER, START, LAGER, SCHLEUSE, PROBE, SCHUETZ, AGGRO, LEINE });
function karteNehmen(k) {
  KB = k.KB;
  KH = k.KH;
  FELS = k.FELS;
  WASSER = k.WASSER;
  START = k.START;
  LAGER = k.LAGER;
  SCHLEUSE = k.SCHLEUSE;
  PROBE = k.PROBE;
  SCHUETZ = k.SCHUETZ;
  AGGRO = k.AGGRO ?? null;
  LEINE = k.LEINE ?? null;
}
var GRUNDKARTE = karteJetzt();
var fels = (i, j) => i < 0 || j < 0 || i >= KB || j >= KH || FELS[j * KB + i] === 1 || WASSER[j * KB + i] === 1;
var dicht = (x, y) => {
  const i = Math.floor(x), j = Math.floor(y);
  return i < 0 || j < 0 || i >= KB || j >= KH || FELS[j * KB + i] === 1;
};
function setzeKarte(k0, mal = 1) {
  const zm = k0.feinZeilen ? 1 : mal;
  const k = { zeilen: k0.zeilen.flatMap((z) => {
    const breit = [...z].map((c) => c.repeat(zm)).join("");
    return Array.from({ length: zm }, () => breit);
  }), start: k0.start, lager: k0.lager.map((l) => ({ ...l, x: l.x * mal, y: l.y * mal })) };
  KH = k.zeilen.length;
  KB = k.zeilen[0].length;
  FELS = new Uint8Array(KB * KH);
  WASSER = new Uint8Array(KB * KH);
  k.zeilen.forEach((z, j) => [...z].forEach((c, i) => {
    if (c === "~") WASSER[j * KB + i] = 1;
    else if (c !== ".") FELS[j * KB + i] = 1;
  }));
  START = k.start.map(([x, y]) => ({ x: (x + 0.5) * mal, y: (y + 0.5) * mal }));
  LAGER = k.lager;
  AGGRO = k0.aggro ?? null;
  LEINE = k0.leine ?? null;
  PROBE = k0.probe || null;
  SCHUETZ = (k0.schuetz || []).map((l) => ({ ...l, x: l.x * mal, y: l.y * mal }));
  const s = k0.schleuse;
  SCHLEUSE = s ? { ...s, x: s.x * mal, y: s.y * mal, quellen: s.quellen.map(([x, y]) => ({ x: x * mal, y: y * mal })) } : null;
}
var begehbar = (x, y) => !fels(Math.floor(x), Math.floor(y));
var abstand = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function frei(a, b, rand = 0) {
  const d = abstand(a, b), n2 = Math.max(1, Math.ceil(d / 0.2)), nx = d > 0 ? -(b.y - a.y) / d : 0, ny = d > 0 ? (b.x - a.x) / d : 0;
  for (let k = 0; k <= n2; k++) {
    const x = a.x + (b.x - a.x) * k / n2, y = a.y + (b.y - a.y) * k / n2;
    if (rand > 0 ? !begehbar(x, y) : dicht(x, y)) return false;
    if (rand > 0 && (!begehbar(x + nx * rand, y + ny * rand) || !begehbar(x - nx * rand, y - ny * rand))) return false;
  }
  return true;
}
function schieben(e) {
  const i0 = Math.floor(e.x), j0 = Math.floor(e.y);
  for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) {
    if (!fels(i, j)) continue;
    const nx = Math.max(i, Math.min(i + 1, e.x)), ny = Math.max(j, Math.min(j + 1, e.y)), dx = e.x - nx, dy = e.y - ny, d = Math.hypot(dx, dy);
    if (d >= e.r) continue;
    if (d > 1e-4) {
      e.x = nx + dx / d * e.r;
      e.y = ny + dy / d * e.r;
    } else {
      e.x = i0 + 0.5;
      e.y = j0 + 0.5;
    }
  }
}
function naechstFrei(p) {
  if (begehbar(p.x, p.y)) return { x: p.x, y: p.y };
  let best = null, bd = Infinity;
  for (let i = 0; i < KB; i++) for (let j = 0; j < KH; j++) {
    if (fels(i, j)) continue;
    const d = Math.hypot(i + 0.5 - p.x, j + 0.5 - p.y);
    if (d < bd) {
      bd = d;
      best = { x: i + 0.5, y: j + 0.5 };
    }
  }
  return best || { x: START[0].x, y: START[0].y };
}
function weg(von, nach, rand = 0.3) {
  const ziel = naechstFrei(nach), start = naechstFrei(von);
  if (frei(start, ziel, rand)) return [ziel];
  const si = Math.floor(start.x), sj = Math.floor(start.y), zi = Math.floor(ziel.x), zj = Math.floor(ziel.y), N = KB * KH;
  const g = new Float32Array(N).fill(Infinity), her = new Int32Array(N).fill(-1), zu = new Uint8Array(N), offen = [];
  const h = (i, j) => {
    const dx = Math.abs(i - zi), dy = Math.abs(j - zj);
    return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
  };
  const f = new Float32Array(N).fill(Infinity), s0 = sj * KB + si;
  g[s0] = 0;
  f[s0] = h(si, sj);
  offen.push(s0);
  while (offen.length) {
    let bi = 0;
    for (let k2 = 1; k2 < offen.length; k2++) if (f[offen[k2]] < f[offen[bi]]) bi = k2;
    const c = offen[bi];
    offen[bi] = offen[offen.length - 1];
    offen.pop();
    if (zu[c]) continue;
    zu[c] = 1;
    const ci = c % KB, cj = (c - ci) / KB;
    if (ci === zi && cj === zj) break;
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
      if (!di && !dj) continue;
      const i = ci + di, j = cj + dj;
      if (fels(i, j)) continue;
      if (di && dj && (fels(ci + di, cj) || fels(ci, cj + dj))) continue;
      const n2 = j * KB + i, kosten = g[c] + (di && dj ? 1.414 : 1);
      if (kosten < g[n2]) {
        g[n2] = kosten;
        her[n2] = c;
        f[n2] = kosten + h(i, j);
        offen.push(n2);
      }
    }
  }
  const z0 = zj * KB + zi;
  if (her[z0] < 0 && z0 !== s0) return [];
  const roh = [ziel];
  for (let c = her[z0]; c >= 0 && c !== s0; c = her[c]) roh.push({ x: c % KB + 0.5, y: Math.floor(c / KB) + 0.5 });
  roh.reverse();
  const aus = [];
  let hier = start, k = 0;
  while (k < roh.length) {
    let m = k;
    for (let n2 = roh.length - 1; n2 > k; n2--) if (frei(hier, roh[n2], rand)) {
      m = n2;
      break;
    }
    aus.push(roh[m]);
    hier = roh[m];
    k = m + 1;
  }
  return aus;
}

// shared/sim.ts
var SB = (w) => STUFENBONUS(w.held ? HELDENSTUFE[w.typ] || 1 : 1);
var BIT = { bollwerk: 1, betaeubt: 2, langsam: 4, dauer: 8, mal: 16, schild: 32, aushol: 64, schutz: 128 };
var Sim = class {
  constructor(heldTyp = "schildwaechter", seed = 1, begleiter = []) {
    this.heldTyp = heldTyp;
    this.tick = 0;
    this.zeit = 0;
    this.phase = "lauf";
    this.splitter = 0;
    this.besiegt = 0;
    this.monsterZahl = 0;
    this.wesen = [];
    this.geschosse = [];
    this.ev = [];
    this.beute = [];
    this.lauf = 1;
    /** heldTyp: der Held des Spielers. begleiter: bis zu zwei weitere Helden, die der Rechner spielt. */
    /* eigene Karte, Gegnerstärke und Heldenstufen dieser Partie (beim Anlegen übernommen, vor jedem Schritt wieder eingesetzt) */
    /* Schleuse dieses Kampfes (oder keine): offen, Fortschritt beim Schließen, Zeit bis zur nächsten Welle */
    this.sl = null;
    /* Brut (Laich): je Mutter die Zeit bis zum nächsten Jungen, wie viele schon geschlüpft sind, und die Kennungen der Jungen */
    /** Herausforderung dieses Kampfes: 0 läuft, 1 geschafft, 2 verfehlt */
    this.probe = 0;
    this.brut = /* @__PURE__ */ new Map();
    /* wer noch einmal davonhuschen kann (Irrlichter am Teich) */
    this.blinzler = /* @__PURE__ */ new Set();
    /* wer schon einmal wieder aufgestanden ist (Moorleichen) */
    this.erhoben = /* @__PURE__ */ new Set();
    this.karte = karteJetzt();
    this.staerke = { ...STAERKE };
    this.stufen = { ...HELDENSTUFE };
    this.epStand = { ...HELDENEP };
    this.zs = seed >>> 0 || 1;
    if (!HELDEN[this.heldTyp]) this.heldTyp = "schildwaechter";
    this.begleiter = (Array.isArray(begleiter) ? begleiter : []).filter((b, i, l) => HELDEN[b] && b !== this.heldTyp && l.indexOf(b) === i).slice(0, 2);
    this.aufbau();
  }
  bereit() {
    karteNehmen(this.karte);
    Object.assign(STAERKE, this.staerke);
    for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k];
    Object.assign(HELDENSTUFE, this.stufen);
  }
  zf() {
    this.zs = this.zs + 1831565813 >>> 0;
    let t = this.zs;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  neu(held, typ, team, p, bot, gruppe = 0) {
    const lp = held ? Math.round(HELDEN[typ].lp * (1 + STUFENBONUS(HELDENSTUFE[typ] || 1).lp)) : Math.round(MONSTER[typ].lp * STAERKE.lp);
    const w = {
      id: this.lauf++,
      held,
      typ,
      team,
      bot,
      x: p.x,
      y: p.y,
      r: held ? K.R_HELD : MONSTER[typ].r,
      blick: 0,
      lp,
      max: lp,
      pfad: [],
      zielId: 0,
      cdA: 0,
      cdQ: 0,
      cdE: 0,
      cdR: 0,
      cdM: 0,
      cdS: 5,
      ladeT: 0,
      ladeX: 0,
      ladeY: 0,
      modus: 0,
      tot: false,
      wieder: 0,
      heim: { x: p.x, y: p.y },
      gruppe,
      neuWeg: 0,
      rx: 0,
      ry: 0,
      fuehrer: 0,
      aushol: 0,
      ausholZiel: 0,
      bollwerk: 0,
      betaeubt: 0,
      langsamT: 0,
      langsamF: 0,
      dauer: [],
      dauerRest: 0,
      malT: 0,
      bruchT: 0,
      bruchSperre: 0,
      festSperre: 0,
      schutz: 0,
      schutzT: 0,
      mrPlusT: 0,
      spottT: 0,
      spottId: 0,
      giftHiebe: 0,
      ruhe: 99,
      wach: false
    };
    this.wesen.push(w);
    return w;
  }
  aufbau() {
    this.wesen = [];
    this.geschosse = [];
    this.beute = [];
    this.tick = 0;
    this.zeit = 0;
    this.phase = "lauf";
    this.splitter = 0;
    this.besiegt = 0;
    this.lauf = 1;
    const ich = this.neu(true, this.heldTyp, 0, START[0], false);
    this.begleiter.forEach((b, i) => {
      this.neu(true, b, 0, START[i + 1], true).fuehrer = ich.id;
    });
    this.blinzler.clear();
    this.erhoben.clear();
    for (const l of LAGER) {
      const m = this.neu(false, l.art, 1, l, true, l.gruppe);
      if (l.blinzeln) this.blinzler.add(m.id);
    }
    this.monsterZahl = LAGER.length;
    this.brut.clear();
    this.probe = 0;
    for (const l of SCHUETZ) this.neu(false, l.art, 0, l, true, 0);
    const S0 = this.karte.SCHLEUSE;
    this.sl = S0 ? { ...S0, offen: true, fort: 0, warte: S0.erst, raus: 0 } : null;
  }
  get ich() {
    return this.wesen[0];
  }
  /** Erfahrung für jeden Helden im Team; wer dabei eine Stufe erreicht, wird sofort stärker und bekommt sein Leben ganz zurück */
  erfahrung(n2) {
    for (const w of this.wesen) {
      if (!w.held || w.team !== 0) continue;
      const vor = this.stufen[w.typ] || 1;
      this.epStand[w.typ] = (this.epStand[w.typ] || 0) + n2;
      const nach = Math.max(vor, stufeAusEp(this.epStand[w.typ]));
      if (nach <= vor) continue;
      this.stufen[w.typ] = nach;
      HELDENSTUFE[w.typ] = nach;
      w.max = Math.round(HELDEN[w.typ].lp * (1 + STUFENBONUS(nach).lp));
      if (!w.tot) w.lp = w.max;
      this.ev.push({ a: "stufe", id: w.id, s: nach });
    }
  }
  nach(id) {
    return this.wesen.find((w) => w.id === id);
  }
  wert(w) {
    return w.held ? HELDEN[w.typ] : MONSTER[w.typ];
  }
  /** Der Angriff, der gerade gilt: beim Helden der gewählte Waffenmodus */
  waffe(w) {
    return w.held ? HELDEN[w.typ].modi[w.modus] : MONSTER[w.typ].angriff;
  }
  tempo(w) {
    return this.wert(w).tempo * (w.langsamT > 0 ? 1 - w.langsamF : 1) * (w.held && HELDEN[w.typ].modi[w.modus].schild ? K.BLOCK.tempo : 1);
  }
  feinde(w) {
    return this.wesen.filter((o) => !o.tot && o.team !== w.team);
  }
  freunde(w) {
    return this.wesen.filter((o) => !o.tot && o.team === w.team);
  }
  untot(w) {
    return !w.held && Boolean(MONSTER[w.typ].untot);
  }
  /** Eine Eingabe des Spielers. Alles wird geprüft und begrenzt – der Client bestimmt nie ein Ergebnis. */
  eingabe(e, wer = 0) {
    this.bereit();
    const h0 = wer ? this.nach(wer) : this.ich;
    if (!h0 || !h0.held || h0.bot) return;
    const h = h0;
    if (!e || typeof e !== "object") return;
    if (e.t === "neu") {
      if (this.phase === "sieg") this.aufbau();
      return;
    }
    if (h.tot || this.phase !== "lauf" && !STAERKE.beute) return;
    const zahl = (v) => typeof v === "number" && Number.isFinite(v);
    if (e.t === "richtung") {
      if (!zahl(e.x) || !zahl(e.y)) return;
      const l = Math.hypot(e.x, e.y);
      if (l < 0.05) {
        h.rx = 0;
        h.ry = 0;
      } else {
        const k = Math.min(1, l) / l;
        h.rx = e.x * k;
        h.ry = e.y * k;
        h.pfad = [];
      }
    } else if (e.t === "lauf") {
      if (!zahl(e.x) || !zahl(e.y)) return;
      h.zielId = 0;
      h.rx = 0;
      h.ry = 0;
      h.pfad = weg(h, { x: e.x, y: e.y });
    } else if (e.t === "ziel") {
      if (e.id === 0) {
        h.zielId = 0;
        return;
      }
      const z = this.nach(e.id);
      if (!z || z.tot) return;
      const heilt = this.waffe(h).art === "heil";
      if (z.team !== h.team ? !heilt : heilt) h.zielId = z.id;
    } else if (e.t === "modus") this.wechsel(h);
    else if (e.t === "halt") {
      h.pfad = [];
      h.zielId = 0;
      h.rx = 0;
      h.ry = 0;
    } else if (e.t === "faehig") {
      if (e.taste !== "q" && e.taste !== "e" && e.taste !== "r" || !zahl(e.x) || !zahl(e.y)) return;
      this.faehigkeit(h, e.taste, { x: e.x, y: e.y });
    }
  }
  wechsel(w) {
    if (w.cdM > 0 || w.aushol > 0 || w.betaeubt > 0) return;
    w.modus = w.modus ? 0 : 1;
    w.cdM = K.WECHSEL;
    w.zielId = 0;
    w.cdA = Math.max(w.cdA, 0.25);
  }
  /* ---------- Treffen und Schaden ---------- */
  heilen(z, menge) {
    if (z.tot) return;
    const v = z.lp;
    z.lp = Math.min(z.max, z.lp + Math.round(menge));
    if (z.lp > v) this.ev.push({ a: "heil", id: z.id, n: z.lp - v });
  }
  schutzGeben(z, punkte, dauer) {
    z.schutz = Math.max(z.schutz, punkte);
    z.schutzT = dauer;
  }
  /** Direkter Schaden ohne Würfe (Gift, Blutung, Brand, heiliges Licht): nur Schutzpunkte fangen ihn ab */
  abziehen(z, menge, von, art) {
    if (z.tot || menge <= 0) return;
    let m = Math.max(1, Math.round(menge));
    if (z.schutz > 0) {
      const a2 = Math.min(z.schutz, m);
      z.schutz -= a2;
      m -= a2;
      if (m <= 0) {
        this.ev.push({ a: "block", id: z.id });
        return;
      }
    }
    z.lp -= m;
    z.ruhe = 0;
    this.ev.push(art ? { a: "schaden", id: z.id, n: m, art } : { a: "schaden", id: z.id, n: m });
    if (!z.held) {
      z.wach = true;
      if (von && von.held && !z.zielId) z.zielId = von.id;
      this.wecken(z);
    }
    if (z.lp > 0 && z.lp < z.max * 0.4 && this.blinzler.delete(z.id)) {
      const v = von || this.ich, dx = z.x - v.x, dy = z.y - v.y, l = Math.hypot(dx, dy) || 1, a2 = Math.atan2(dy / l, dx / l) + (this.zf() - 0.5) * 1.2;
      const p = naechstFrei({ x: z.x + Math.cos(a2) * 5, y: z.y + Math.sin(a2) * 5 });
      z.x = p.x;
      z.y = p.y;
      z.pfad = [];
      z.aushol = 0;
      this.ev.push({ a: "blinzeln", id: z.id, x: p.x, y: p.y });
    }
    if (z.lp > 0) return;
    if (!z.held && z.team === 0) {
      z.lp = 0;
      z.tot = true;
      this.ev.push({ a: "tot", id: z.id });
      const P = this.karte.PROBE;
      if (P && P.art === "schuetzlinge" && this.probe === 0 && this.wesen.filter((w) => !w.held && w.team === 0 && !w.tot).length < (P.wert || 0)) this.probe = 2;
      return;
    }
    {
      const A = !z.held && MONSTER[z.typ].aufstehen;
      if (A && !this.erhoben.has(z.id)) {
        this.erhoben.add(z.id);
        z.lp = Math.round(z.max * A);
        z.betaeubt = 2.5;
        z.aushol = 0;
        z.dauer = [];
        this.ev.push({ a: "aufstehen", id: z.id, x: z.x, y: z.y });
        return;
      }
    }
    z.lp = 0;
    z.tot = true;
    z.pfad = [];
    z.zielId = 0;
    z.dauer = [];
    z.aushol = 0;
    this.ev.push({ a: "tot", id: z.id });
    if (z.held) {
      z.wieder = K.WIEDER_HELD;
      return;
    }
    this.besiegt++;
    const B = STAERKE.beute, [a, b] = B || K.SPLITTER;
    let n2 = a + Math.floor(this.zf() * (b - a + 1));
    if (B && MONSTER[z.typ].boss) n2 *= STAERKE.bossMal;
    if (STAERKE.ep > 0) {
      const e = Math.max(1, Math.round(MONSTER[z.typ].lp * STAERKE.ep / 10));
      this.ev.push({ a: "ep", x: z.x, y: z.y, n: e });
      this.erfahrung(e);
    }
    if (B) this.beute.push({ id: this.lauf++, x: z.x, y: z.y, n: n2 });
    else {
      this.splitter += n2;
      this.ev.push({ a: "splitter", x: z.x, y: z.y, n: n2 });
    }
    if (this.besiegt >= this.monsterZahl && !(this.sl && this.sl.offen)) this.sieg();
  }
  /** Ein Angriff trifft auf ein Ziel. Zurück: Schaden (0 = abgewehrt oder verfehlt). */
  treffen(von, z, s) {
    if (z.tot) return 0;
    let minder = 0;
    const winkel = (a, b) => {
      let d = Math.abs(a - b) % (2 * Math.PI);
      if (d > Math.PI) d = 2 * Math.PI - d;
      return d;
    };
    if (z.held && HELDEN[z.typ].modi[z.modus].schild) {
      if (winkel(Math.atan2(von.y - z.y, von.x - z.x), z.blick) <= K.BLOCK.winkel * Math.PI / 180) minder = K.BLOCK[s.art] + (z.bollwerk > 0 ? K.BOLLWERK.plus : 0);
    } else if (z.held) {
      const t = this.freunde(z).find((o) => o.bollwerk > 0 && o !== z && abstand(o, z) <= 1.8);
      if (t && winkel(Math.atan2(von.y - t.y, von.x - t.x), Math.atan2(z.y - t.y, z.x - t.x)) > Math.PI / 2) minder = K.BOLLWERK.hinter;
    }
    minder = Math.min(K.MINDERUNG_MAX, minder);
    const wurf = !s.sicher && K.TREFFERWURF;
    if (wurf) {
      const a = (von.held ? HELDEN[von.typ].angriff : MONSTER[von.typ].angriffswert)[s.art] + SB(von).angriff;
      let d = this.wert(z).abwehr[s.art] + SB(z).abwehr;
      if (s.art === "magie") d += (z.mrPlusT > 0 ? K.SCHUTZKREIS.magie : 0) + (z.held && this.freunde(z).some((o) => o.typ === "lichtbringer" && abstand(o, z) <= K.BEISTAND.radius) ? K.BEISTAND.magie : 0);
      else if (z.bruchT > 0) d -= K.DURCHBRECHEN.abwehr;
      d = Math.max(0, d) / (1 - minder);
      if (!(this.zf() * (a + 1) > this.zf() * (d + 1))) {
        this.ev.push(minder >= 0.4 ? { a: "block", id: z.id } : { a: "null", id: z.id });
        if (!z.held) {
          z.wach = true;
          if (!z.zielId && von.held) z.zielId = von.id;
          this.wecken(z);
        }
        return 0;
      }
    }
    const min = s.min != null ? s.min : s.grund * K.FAEHIG_MIN;
    let m = (min + this.zf() * (s.grund - min)) * (1 + SB(von).schaden);
    if (s.mal && z.malT > 0) m *= 1 + s.mal;
    if (s.wucht && !z.held && MONSTER[z.typ].anfaellig === "wucht") m *= 1 + K.WUCHT;
    if (s.untot && this.untot(z)) m *= 1 + s.untot;
    if (!wurf && minder > 0) {
      m *= 1 - (s.flaeche ? Math.min(minder, K.BLOCK.flaeche + (z.bollwerk > 0 ? K.BOLLWERK.plus : 0)) : minder);
    }
    const vor = z.lp + z.schutz;
    this.abziehen(z, m, von);
    return Math.max(0, vor - (z.lp + z.schutz));
  }
  /** Wer ein Monster weckt, weckt seine Gruppe */
  wecken(m) {
    if (!m.gruppe || !m.zielId) return;
    for (const o of this.wesen) if (!o.tot && !o.held && o.gruppe === m.gruppe && !o.zielId) {
      o.zielId = m.zielId;
      o.wach = true;
    }
  }
  langsam(z, f, t) {
    if (f >= z.langsamF || z.langsamT <= 0) {
      z.langsamF = f;
      z.langsamT = Math.max(z.langsamT, t);
    }
  }
  dauerSchaden(z, art, jeSek, t, von) {
    const d = z.dauer.find((x) => x.art === art);
    if (d) {
      d.t = t;
      d.jeSek = Math.max(d.jeSek, jeSek);
      d.von = von.id;
    } else z.dauer.push({ t, jeSek, von: von.id, art });
  }
  stossen(z, dx, dy, weite) {
    const l = Math.hypot(dx, dy) || 1;
    for (let s = 0; s < weite; s += 0.15) {
      const nx = z.x + dx / l * 0.15, ny = z.y + dy / l * 0.15;
      if (!begehbar(nx + dx / l * z.r, ny + dy / l * z.r)) break;
      z.x = nx;
      z.y = ny;
    }
    schieben(z);
    z.pfad = [];
    z.aushol = 0;
  }
  sprung(w, richtung, weite, beiGegner) {
    const dx = Math.cos(richtung), dy = Math.sin(richtung);
    for (let s = 0; s < weite; s += 0.15) {
      const nx = w.x + dx * 0.15, ny = w.y + dy * 0.15;
      if (!begehbar(nx + dx * w.r, ny + dy * w.r)) break;
      w.x = nx;
      w.y = ny;
      if (beiGegner) {
        const o = this.feinde(w).find((o2) => abstand(w, o2) < w.r + o2.r + 0.15);
        if (o) {
          beiGegner(o);
          break;
        }
      }
    }
    schieben(w);
    w.pfad = [];
  }
  flaeche(von, ort, radius, s, je) {
    for (const o of this.feinde(von)) if (Math.hypot(o.x - ort.x, o.y - ort.y) <= radius + o.r) {
      this.treffen(von, o, Object.assign({ flaeche: true, sicher: true }, s));
      if (je && !o.tot) je(o);
    }
  }
  /** Das Ziel einer gezielten Fähigkeit: das gewählte Ziel, sonst der Gegner am nächsten zum angegebenen Punkt, sonst der nächste überhaupt – immer in Reichweite und mit Sicht */
  zielBei(w, punkt, reich) {
    const ok = (o) => Boolean(o && !o.tot && o.team !== w.team && abstand(w, o) - o.r <= reich && frei(w, o));
    const g = this.nach(w.zielId);
    if (ok(g)) return g;
    let best = null, bd = 2.5;
    for (const o of this.feinde(w)) {
      const d = Math.hypot(o.x - punkt.x, o.y - punkt.y);
      if (d < bd && ok(o)) {
        bd = d;
        best = o;
      }
    }
    if (best) return best;
    bd = reich + 1;
    for (const o of this.feinde(w)) {
      const d = abstand(w, o);
      if (d < bd && ok(o)) {
        bd = d;
        best = o;
      }
    }
    return best;
  }
  schwaechster(w, reich, unter = 1) {
    let best = null, bq = unter;
    for (const o of this.freunde(w)) {
      const q = o.lp / o.max;
      if (q < bq && abstand(w, o) <= reich && (o === w || frei(w, o))) {
        bq = q;
        best = o;
      }
    }
    return best;
  }
  schuss(von, z, ort, tempo, spec, art, knall = 0) {
    this.geschosse.push({ id: this.lauf++, x: von.x, y: von.y, zielId: z ? z.id : 0, zx: ort.x, zy: ort.y, tempo, von: von.id, spec, knall, art });
  }
  /* ---------- Fähigkeiten ---------- */
  faehigkeit(w, taste, ziel) {
    if (w.tot || w.betaeubt > 0 || !w.held || w.aushol > 0) return false;
    const D = HELDEN[w.typ], cd = taste === "q" ? "cdQ" : taste === "e" ? "cdE" : "cdR";
    if (w[cd] > 0) return false;
    const richtung = Math.atan2(ziel.y - w.y, ziel.x - w.x), nahBei = (reich) => {
      const d = Math.min(reich, abstand(w, ziel));
      return { x: w.x + Math.cos(richtung) * d, y: w.y + Math.sin(richtung) * d };
    };
    let ok = true;
    if (w.typ === "schildwaechter") {
      if (taste === "q") {
        w.blick = richtung;
        this.ev.push({ a: "stoss", id: w.id });
        this.sprung(w, richtung, K.STOSS.weite, (o) => {
          this.treffen(w, o, { grund: K.STOSS.schaden, art: "nah", wucht: true, sicher: true });
          if (!o.tot) this.stossen(o, Math.cos(richtung), Math.sin(richtung), K.STOSS.zurueck);
          w.zielId = o.id;
        });
      } else if (taste === "e") w.bollwerk = K.BOLLWERK.dauer;
      else {
        const S = K.SCHILD_GRAUWACHT;
        for (const o of this.feinde(w)) if (abstand(w, o) <= S.radius) {
          o.spottT = S.spott;
          o.spottId = w.id;
          o.zielId = w.id;
          o.wach = true;
        }
        for (const o of this.freunde(w)) if (abstand(w, o) <= S.radius) this.schutzGeben(o, S.schutz, S.schutzDauer);
        this.ev.push({ a: "knall", x: w.x, y: w.y, r: S.radius, farbe: "licht" });
      }
    } else if (w.typ === "elementarist") {
      if (taste === "q") {
        const o = nahBei(K.FROST.reich);
        this.ev.push({ a: "knall", x: o.x, y: o.y, r: K.FROST.radius, farbe: "eis" });
        this.flaeche(w, o, K.FROST.radius, { grund: K.FROST.schaden, art: "magie" }, (g) => this.langsam(g, K.FROST.langsam, K.FROST.dauer));
      } else if (taste === "e") {
        const o = nahBei(K.DONNER.reich);
        this.ev.push({ a: "knall", x: o.x, y: o.y, r: K.DONNER.radius, farbe: "blitz" });
        this.flaeche(w, o, K.DONNER.radius, { grund: K.DONNER.schaden, art: "magie" }, (g) => this.stossen(g, g.x - o.x || 0.01, g.y - o.y, K.DONNER.zurueck));
      } else this.schuss(w, null, nahBei(K.GLUT.reich), K.GLUT.flug, { grund: K.GLUT.schaden, art: "magie", nach: "brand" }, "feuer", K.GLUT.radius);
    } else if (w.typ === "lichtbringer") {
      if (taste === "q") {
        const g = this.nach(w.zielId), z = g && !g.tot && g.team === w.team && abstand(w, g) <= K.WORT.reich ? g : this.schwaechster(w, K.WORT.reich);
        if (!z) ok = false;
        else this.heilen(z, K.WORT.heilung);
      } else if (taste === "e") {
        const S = K.SCHUTZKREIS;
        for (const o of this.freunde(w)) if (abstand(w, o) <= S.radius) {
          this.schutzGeben(o, S.schutz, S.dauer);
          o.mrPlusT = S.dauer;
        }
        this.ev.push({ a: "knall", x: w.x, y: w.y, r: S.radius, farbe: "licht" });
      } else {
        const S = K.GOETTLICH;
        for (const o of this.freunde(w)) if (abstand(w, o) <= S.radius) this.heilen(o, o.max * S.anteil);
        for (const o of this.feinde(w)) if (abstand(w, o) <= S.radius && this.untot(o)) this.abziehen(o, S.heilig, w, "licht");
        this.ev.push({ a: "knall", x: w.x, y: w.y, r: S.radius, farbe: "licht" });
      }
    } else if (w.typ === "assassine") {
      if (taste === "q") {
        const z = this.zielBei(w, ziel, K.STICH.weite);
        if (!z) ok = false;
        else {
          const hin = Math.atan2(z.y - w.y, z.x - w.x);
          let d = Math.abs(Math.atan2(w.y - z.y, w.x - z.x) - z.blick) % (2 * Math.PI);
          if (d > Math.PI) d = 2 * Math.PI - d;
          const hinten = d > Math.PI * 2 / 3;
          this.sprung(w, hin, Math.max(0, abstand(w, z) - w.r - z.r - 0.1));
          w.blick = hin;
          this.ev.push({ a: "stoss", id: w.id });
          this.treffen(w, z, { grund: K.STICH.schaden * (hinten ? 1 + K.STICH.hinten : 1), art: "nah", sicher: true });
          if (hinten) this.ev.push({ a: "text", id: z.id, t: "von hinten" });
          w.zielId = z.id;
        }
      } else if (taste === "e") {
        w.giftHiebe = K.GIFT.hiebe;
        this.ev.push({ a: "text", id: w.id, t: "Giftklinge" });
      } else {
        const z = this.zielBei(w, ziel, K.HINRICHTUNG.reich);
        if (!z) ok = false;
        else {
          const H = K.HINRICHTUNG, mehr = z.lp / z.max < H.unter && !(MONSTER[z.typ] && MONSTER[z.typ].boss);
          w.blick = Math.atan2(z.y - w.y, z.x - w.x);
          this.ev.push({ a: "hieb", id: w.id });
          this.treffen(w, z, { grund: H.schaden * (mehr ? 1 + H.plus : 1), art: "nah", sicher: true });
        }
      }
    } else if (w.typ === "kopfgeldjaeger") {
      const z = this.zielBei(w, ziel, taste === "q" ? K.MAL.reich : HELDEN[w.typ].modi[0].reich);
      if (!z) ok = false;
      else if (taste === "q") {
        for (const o of this.wesen) o.malT = 0;
        z.malT = K.MAL.dauer;
        w.zielId = z.id;
        this.ev.push({ a: "text", id: z.id, t: "J\xE4germal" });
      } else if (taste === "e") {
        w.blick = Math.atan2(z.y - w.y, z.x - w.x);
        this.schuss(w, z, z, 20, { grund: K.BOLZEN.schaden, art: "fern", mal: K.MAL.plus, nach: "laehmen" }, "bolzen");
      } else {
        const E = K.ERLEGEN;
        w.blick = Math.atan2(z.y - w.y, z.x - w.x);
        this.schuss(w, z, z, 24, { grund: E.schaden * (z.lp / z.max < E.unter ? 1 + E.plus : 1), art: "fern", mal: E.mal, sicher: true }, "erlegen");
      }
    }
    if (ok) w[cd] = D[taste].zeit * (1 - SB(w).abklingen);
    return ok;
  }
  /* ---------- Grundangriff ---------- */
  /** Angriff beginnen: Nahkämpfer treffen sofort, Fernkämpfer und Monster holen erst aus */
  angriff(w, z) {
    const A = this.waffe(w);
    if (w.held && A.schild) return;
    w.cdA = A.takt;
    w.blick = Math.atan2(z.y - w.y, z.x - w.x);
    const aus = w.held ? A.art === "nah" ? 0 : K.AUSHOLEN_FERN : A.aushol;
    if (aus > 0) {
      w.aushol = aus;
      w.ausholZiel = z.id;
      w.pfad = [];
      this.ev.push({ a: w.held ? "anlegen" : "aushol", id: w.id, t: aus });
    } else this.ausloesen(w, z);
  }
  ausloesen(w, z) {
    const A = this.waffe(w);
    this.ev.push({ a: "hieb", id: w.id });
    if (A.art === "heil") {
      if (z.team === w.team && abstand(w, z) <= A.reich + 1) this.heilen(z, A.schaden[0] + this.zf() * (A.schaden[1] - A.schaden[0]));
      return;
    }
    if (z.tot || abstand(w, z) - z.r > A.reich + (w.held ? 0.6 : 0.35) || !frei(w, z)) return;
    const M = w.held ? A : null, spec = { grund: A.schaden[1] * (w.held ? 1 : STAERKE.schaden), min: A.schaden[0] * (w.held ? 1 : STAERKE.schaden), art: A.art, wucht: Boolean(M && M.wucht), untot: M ? M.untot : 0, mal: w.typ === "kopfgeldjaeger" ? K.MAL.plus : 0 };
    if (w.held && A.art !== "nah") {
      spec.nach = w.typ === "kopfgeldjaeger" && w.modus === 0 ? "durchbrechen" : "";
      this.schuss(w, z, z, A.flug || 14, spec, A.art === "magie" ? "blitz" : "bolzen");
      return;
    }
    const n2 = this.treffen(w, z, spec);
    if (n2 > 0 && !z.tot) this.nachTreffer(w, z, w.typ === "schildwaechter" ? w.modus === 0 ? "festnageln" : "schildhieb" : w.typ === "assassine" && w.modus === 0 ? "dolch" : w.typ === "elementarist" ? "rueckstoss" : "");
  }
  /** Was ein Treffer zusätzlich auslöst */
  nachTreffer(von, z, was) {
    if (was === "festnageln") {
      if (z.festSperre <= 0) {
        this.langsam(z, K.FESTNAGELN.langsam, K.FESTNAGELN.dauer);
        z.festSperre = K.FESTNAGELN.sperre;
      }
    } else if (was === "schildhieb") {
      z.aushol = 0;
      z.cdA = Math.max(z.cdA, 0.5);
    } else if (was === "dolch") {
      this.dauerSchaden(z, "blut", K.NACHBLUTEN.jeSek, K.NACHBLUTEN.dauer, von);
      if (von.giftHiebe > 0) {
        von.giftHiebe--;
        this.dauerSchaden(z, "gift", K.GIFT.jeSek, K.GIFT.dauer, von);
      }
    } else if (was === "rueckstoss") this.stossen(z, z.x - von.x, z.y - von.y, 0.6);
    else if (was === "durchbrechen") {
      if (z.bruchSperre <= 0) {
        z.bruchT = K.DURCHBRECHEN.dauer;
        z.bruchSperre = K.DURCHBRECHEN.sperre;
      }
    } else if (was === "laehmen") this.langsam(z, K.BOLZEN.langsam, K.BOLZEN.dauer);
  }
  /** Auf ein Ziel zugehen und angreifen, sobald es in Reichweite ist (Monster und Begleiter) */
  jagen(w, z, reich) {
    const d = abstand(w, z) - z.r;
    if (d <= reich && frei(w, z)) {
      w.pfad = [];
      w.blick = Math.atan2(z.y - w.y, z.x - w.x);
      if (w.cdA <= 0) this.angriff(w, z);
      return;
    }
    w.neuWeg -= DT;
    if (w.neuWeg <= 0 || !w.pfad.length) {
      w.pfad = weg(w, z);
      w.neuWeg = 0.3;
    }
  }
  naechsterGegner(w, weit) {
    let best = null, bd = weit;
    for (const o of this.feinde(w)) {
      const d = abstand(w, o);
      if (d < bd && frei(w, o)) {
        bd = d;
        best = o;
      }
    }
    return best;
  }
  /* ---------- Begleiter (vom Rechner gespielte Helden) ---------- */
  begleiterZug(w) {
    const f = this.nach(w.fuehrer), D = HELDEN[w.typ];
    let ziel;
    const folgen = () => {
      if (f && !f.tot && abstand(w, f) > 2.4) {
        w.neuWeg -= DT;
        if (w.neuWeg <= 0) {
          w.pfad = weg(w, { x: f.x - Math.cos(f.blick) * 1.2, y: f.y - Math.sin(f.blick) * 1.2 });
          w.neuWeg = 0.4;
        }
      }
    };
    for (const g of this.wesen) {
      if (g.held || g.tot || g.ladeT <= 0) continue;
      const S = MONSTER[g.typ].spezial, d2 = Math.hypot(w.x - g.ladeX, w.y - g.ladeY), rand = S.radius + w.r + 0.5;
      if (d2 >= rand) continue;
      let wx = w.x - g.ladeX, wy = w.y - g.ladeY;
      if (f && !f.tot && Math.hypot(f.x - g.ladeX, f.y - g.ladeY) > rand) {
        wx = f.x - g.ladeX;
        wy = f.y - g.ladeY;
      }
      const l = Math.hypot(wx, wy) || 1;
      w.neuWeg -= DT;
      if (w.neuWeg <= 0 || !w.pfad.length) {
        w.pfad = weg(w, naechstFrei({ x: g.ladeX + wx / l * (rand + 0.8), y: g.ladeY + wy / l * (rand + 0.8) }));
        w.neuWeg = 0.5;
      }
      w.zielId = 0;
      return;
    }
    if (f && !f.tot && abstand(w, f) > 8) {
      w.zielId = 0;
      folgen();
      return;
    }
    if (w.typ === "lichtbringer") {
      const v = this.schwaechster(w, 12, 0.92), feind = this.naechsterGegner(w, 2.6);
      if (v && v.lp / v.max < 0.6 && w.cdQ <= 0 && abstand(w, v) <= K.WORT.reich) {
        w.zielId = v.id;
        this.faehigkeit(w, "q", v);
      }
      if (w.cdR <= 0 && this.freunde(w).filter((o) => o.lp / o.max < 0.45 && abstand(w, o) <= K.GOETTLICH.radius).length >= (this.freunde(w).length > 1 ? 2 : 1)) this.faehigkeit(w, "r", w);
      if (feind && w.cdE <= 0 && w.lp / w.max < 0.8) this.faehigkeit(w, "e", w);
      if (v) {
        if (w.modus !== 0) this.wechsel(w);
        if (w.modus === 0) {
          if (abstand(w, v) > D.modi[0].reich - 0.5) {
            w.neuWeg -= DT;
            if (w.neuWeg <= 0) {
              w.pfad = weg(w, v);
              w.neuWeg = 0.3;
            }
          } else {
            w.pfad = [];
            if (w.cdA <= 0 && w.aushol <= 0) this.angriff(w, v);
          }
        }
        return;
      }
      if (feind) {
        if (w.modus !== 1) this.wechsel(w);
        if (w.modus === 1) this.jagen(w, feind, D.modi[1].reich);
        return;
      }
      folgen();
      return;
    }
    const fz = f && f.zielId ? this.nach(f.zielId) : void 0;
    ziel = w.zielId ? this.nach(w.zielId) : void 0;
    if (ziel && (ziel.tot || ziel.team === w.team)) ziel = void 0;
    if (!ziel) ziel = (fz && !fz.tot && fz.team !== w.team ? fz : this.naechsterGegner(w, K.SICHT)) || void 0;
    w.zielId = ziel ? ziel.id : 0;
    if (!ziel) {
      folgen();
      return;
    }
    const d = abstand(w, ziel);
    if (w.typ === "schildwaechter") {
      const soll = w.lp / w.max < 0.35 ? 1 : w.lp / w.max > 0.6 ? 0 : w.modus;
      if (w.modus !== soll) this.wechsel(w);
      if (w.modus === 1) w.blick = Math.atan2(ziel.y - w.y, ziel.x - w.x);
      if (w.cdQ <= 0 && d < K.STOSS.weite && d > 1.2) this.faehigkeit(w, "q", ziel);
      if (w.cdE <= 0 && w.modus === 1) this.faehigkeit(w, "e", ziel);
      if (w.cdR <= 0 && this.feinde(w).filter((o) => abstand(w, o) < 5 && o.zielId && o.zielId !== w.id).length >= 2) this.faehigkeit(w, "r", w);
    } else if (w.typ === "elementarist") {
      if (d < 8 && frei(w, ziel)) {
        const viele = this.feinde(w).filter((o) => abstand(o, ziel) < 2.5).length;
        if (w.cdR <= 0 && viele >= 2) this.faehigkeit(w, "r", ziel);
        if (w.cdQ <= 0) this.faehigkeit(w, "q", ziel);
        if (w.cdE <= 0 && d < 7) this.faehigkeit(w, "e", ziel);
      }
    } else if (w.typ === "assassine") {
      if (w.cdE <= 0 && d < 3) this.faehigkeit(w, "e", ziel);
      if (w.cdQ <= 0 && d < K.STICH.weite && d > 1.4) this.faehigkeit(w, "q", ziel);
      if (w.cdR <= 0 && d < K.HINRICHTUNG.reich && ziel.lp / ziel.max < 0.6) this.faehigkeit(w, "r", ziel);
    } else if (w.typ === "kopfgeldjaeger") {
      if (d < 9 && frei(w, ziel)) {
        if (w.cdQ <= 0) this.faehigkeit(w, "q", ziel);
        if (w.cdE <= 0) this.faehigkeit(w, "e", ziel);
        if (w.cdR <= 0 && ziel.lp > 60) this.faehigkeit(w, "r", ziel);
      }
    }
    const A = D.modi[w.modus];
    if (A.art !== "nah" && d < 2.4 && w.aushol <= 0) {
      const fort = Math.atan2(w.y - ziel.y, w.x - ziel.x);
      w.pfad = [naechstFrei({ x: w.x + Math.cos(fort) * 2.5, y: w.y + Math.sin(fort) * 2.5 })];
      return;
    }
    this.jagen(w, ziel, A.reich - (A.art === "nah" ? 0 : 0.5));
  }
  /* ---------- ein Rechenschritt (DT Sekunden) ---------- */
  schritt() {
    this.bereit();
    this.tick++;
    if (this.phase !== "lauf" && !STAERKE.beute) return;
    if (this.phase === "lauf") this.zeit += DT;
    {
      const P = this.karte.PROBE;
      if (P && P.art === "schleuse" && this.probe === 0 && this.sl && this.sl.offen && this.zeit > (P.wert || 0)) this.probe = 2;
    }
    if (this.beute.length) this.beute = this.beute.filter((b) => {
      const h = this.wesen.find((w) => w.held && !w.tot && Math.hypot(w.x - b.x, w.y - b.y) < 0.9);
      if (!h) return true;
      this.splitter += b.n;
      this.ev.push({ a: "splitter", x: b.x, y: b.y, n: b.n });
      return false;
    });
    for (const w of this.wesen) {
      if (w.tot) {
        if (w.held) {
          w.wieder -= DT;
          if (w.wieder <= 0) {
            w.tot = false;
            w.lp = w.max;
            const p = START[Math.max(0, this.wesen.filter((o) => o.held).indexOf(w))] || START[0];
            w.x = p.x;
            w.y = p.y;
            w.pfad = [];
            w.zielId = 0;
            w.ruhe = 99;
          }
        }
        continue;
      }
      for (const k of ["cdA", "cdQ", "cdE", "cdR", "cdM", "cdS", "bollwerk", "langsamT", "malT", "bruchT", "bruchSperre", "festSperre", "mrPlusT", "spottT"]) if (w[k] > 0) w[k] = Math.max(0, w[k] - DT);
      if (w.schutzT > 0) {
        w.schutzT -= DT;
        if (w.schutzT <= 0) w.schutz = 0;
      }
      if (w.dauer.length) {
        for (const d of w.dauer) {
          w.dauerRest += d.jeSek * DT;
          d.t -= DT;
        }
        const art = w.dauer[0].art, von = this.nach(w.dauer[0].von);
        w.dauer = w.dauer.filter((d) => d.t > 0);
        if (w.dauerRest >= 3 || !w.dauer.length) {
          const n2 = w.dauerRest;
          w.dauerRest = 0;
          this.abziehen(w, n2, von, art);
          if (w.tot) continue;
        }
      }
      w.ruhe += DT;
      if (w.held && w.ruhe >= K.ERHOLUNG.nach && w.lp < w.max) w.lp = Math.min(w.max, w.lp + w.max * K.ERHOLUNG.jeSek * DT);
      if (w.betaeubt > 0) {
        w.betaeubt = Math.max(0, w.betaeubt - DT);
        continue;
      }
      if (w.ladeT > 0) {
        w.ladeT -= DT;
        if (w.ladeT <= 0) {
          {
            const P = this.karte.PROBE, Sz = MONSTER[w.typ].spezial;
            if (P && P.art === "ausweichen" && this.probe === 0 && this.wesen.some((o) => o.held && !o.tot && Math.hypot(o.x - w.ladeX, o.y - w.ladeY) <= Sz.radius + o.r)) this.probe = 2;
          }
          const S = MONSTER[w.typ].spezial;
          this.ev.push({ a: "speien", id: w.id, x: w.ladeX, y: w.ladeY, r: S.radius });
          this.flaeche(w, { x: w.ladeX, y: w.ladeY }, S.radius, { grund: S.schaden[1] * STAERKE.schaden, min: S.schaden[0] * STAERKE.schaden, art: S.art });
          w.cdS = S.alle;
        }
        continue;
      }
      if (w.aushol > 0) {
        w.aushol -= DT;
        if (w.aushol <= 0) {
          const z = this.nach(w.ausholZiel);
          if (z) this.ausloesen(w, z);
        }
        continue;
      }
      let ziel = w.zielId ? this.nach(w.zielId) : void 0;
      if (ziel && ziel.tot) {
        ziel = void 0;
        w.zielId = 0;
      }
      if (!w.held && MONSTER[w.typ].fest) {
        const B = MONSTER[w.typ].brut;
        if (B) this.brueten(w, B);
        continue;
      }
      if (!w.held && MONSTER[w.typ].brut && w.wach) this.brueten(w, MONSTER[w.typ].brut);
      if (!w.held) {
        const D = MONSTER[w.typ];
        if (w.spottT > 0) {
          const s = this.nach(w.spottId);
          if (s && !s.tot) {
            ziel = s;
            w.zielId = s.id;
          }
        }
        if (ziel && abstand(ziel, w.heim) > (this.karte.LEINE ?? K.LEINE) && w.spottT <= 0) {
          ziel = void 0;
          w.zielId = 0;
          w.wach = false;
        }
        if (!ziel) {
          const o = this.naechsterGegner(w, this.karte.AGGRO ?? K.AGGRO);
          if (o && abstand(o, w.heim) <= (this.karte.LEINE ?? K.LEINE)) {
            ziel = o;
            w.zielId = o.id;
            w.wach = true;
            this.wecken(w);
          }
        }
        if (ziel && D.spezial && w.cdS <= 0 && abstand(w, ziel) <= D.spezial.reich) {
          w.ladeT = D.spezial.laden;
          w.ladeX = ziel.x;
          w.ladeY = ziel.y;
          w.pfad = [];
          w.blick = Math.atan2(ziel.y - w.y, ziel.x - w.x);
          this.ev.push({ a: "laden", id: w.id, x: ziel.x, y: ziel.y, r: D.spezial.radius, t: D.spezial.laden });
        } else if (ziel) this.jagen(w, ziel, D.angriff.reich);
        else if (abstand(w, w.heim) > 0.3) {
          w.neuWeg -= DT;
          if (w.neuWeg <= 0 || !w.pfad.length) {
            w.pfad = weg(w, w.heim);
            w.neuWeg = 1;
          }
        } else if (w.lp < w.max) w.lp = Math.min(w.max, w.lp + w.max * (D.boss ? K.HEIM_HEILUNG_BOSS : K.HEIM_HEILUNG) * DT);
      } else if (w.bot) this.begleiterZug(w);
      else {
        const A = this.waffe(w), faehrt = w.rx !== 0 || w.ry !== 0, v = this.tempo(w);
        if (faehrt) {
          w.x += w.rx * v * DT;
          w.y += w.ry * v * DT;
          w.blick = Math.atan2(w.ry, w.rx);
        }
        if (w.held && A.schild) {
          const g = ziel && ziel.team !== w.team && abstand(w, ziel) < 10 ? ziel : this.naechsterGegner(w, 5);
          if (g) w.blick = Math.atan2(g.y - w.y, g.x - w.x);
        } else if (A.art === "heil") {
          const z = ziel && ziel.team === w.team && ziel.lp < ziel.max ? ziel : this.schwaechster(w, A.reich);
          if (z && !faehrt && w.cdA <= 0 && abstand(w, z) <= A.reich && (z === w || frei(w, z))) this.angriff(w, z);
        } else {
          if (ziel && ziel.team === w.team) {
            ziel = void 0;
            w.zielId = 0;
          }
          const nah = A.art === "nah", darf = nah || !faehrt;
          if (!ziel && !faehrt && !w.pfad.length) ziel = this.naechsterGegner(w, nah ? 2.2 : A.reich) || void 0;
          if (ziel && darf && abstand(w, ziel) - ziel.r <= A.reich && frei(w, ziel)) {
            if (!faehrt || nah) w.blick = Math.atan2(ziel.y - w.y, ziel.x - w.x);
            if (w.cdA <= 0) this.angriff(w, ziel);
          }
        }
      }
      if (w.pfad.length && w.aushol <= 0) {
        let rest = this.tempo(w) * DT;
        while (rest > 0 && w.pfad.length) {
          const p = w.pfad[0], d = abstand(w, p);
          if (d <= rest) {
            w.x = p.x;
            w.y = p.y;
            rest -= d;
            w.pfad.shift();
          } else {
            w.blick = Math.atan2(p.y - w.y, p.x - w.x);
            w.x += (p.x - w.x) / d * rest;
            w.y += (p.y - w.y) / d * rest;
            rest = 0;
          }
        }
      }
    }
    if (this.sl && this.sl.offen && this.phase === "lauf") this.schleuse(this.sl);
    for (let i = 0; i < this.wesen.length; i++) for (let j = i + 1; j < this.wesen.length; j++) {
      const a = this.wesen[i], b = this.wesen[j];
      if (a.tot || b.tot) continue;
      const d = abstand(a, b), soll = a.r + b.r;
      if (d < soll && d > 1e-4) {
        const s = (soll - d) / 2, dx = (b.x - a.x) / d, dy = (b.y - a.y) / d;
        a.x -= dx * s;
        a.y -= dy * s;
        b.x += dx * s;
        b.y += dy * s;
      }
    }
    for (const w of this.wesen) if (!w.tot) schieben(w);
    for (const w of this.wesen) if (!w.held && !w.tot && MONSTER[w.typ].fest) {
      w.x = w.heim.x;
      w.y = w.heim.y;
    }
    for (const g of this.geschosse) {
      const z = g.zielId ? this.nach(g.zielId) : void 0;
      if (z && !z.tot) {
        g.zx = z.x;
        g.zy = z.y;
      }
      const d = Math.hypot(g.zx - g.x, g.zy - g.y), s = g.tempo * DT;
      if (d > s) {
        g.x += (g.zx - g.x) / d * s;
        g.y += (g.zy - g.y) / d * s;
        if (g.knall && !begehbar(g.x, g.y)) {
          g.zx = g.x;
          g.zy = g.y;
        } else continue;
      }
      g.tempo = 0;
      const von = this.nach(g.von);
      if (!von) continue;
      if (g.knall) {
        this.ev.push({ a: "knall", x: g.zx, y: g.zy, r: g.knall, farbe: "feuer" });
        this.flaeche(von, { x: g.zx, y: g.zy }, g.knall, g.spec, (o) => {
          if (g.spec.nach === "brand") this.dauerSchaden(o, "brand", K.GLUT.brand, K.GLUT.dauer, von);
        });
      } else if (z && !z.tot) {
        const n2 = this.treffen(von, z, g.spec);
        if (n2 > 0 && !z.tot && g.spec.nach) this.nachTreffer(von, z, g.spec.nach);
      }
    }
    this.geschosse = this.geschosse.filter((g) => g.tempo > 0);
  }
  /** Offene Schleuse: Gegner kriechen in Wellen aus dem Wasser und sammeln sich am Hebel. Wer drei Sekunden ungestört am Hebel steht, schließt sie; ein Treffer fängt von vorn an. */
  schleuse(sl) {
    const nah = this.wesen.some((h) => h.held && !h.bot && !h.tot && h.ruhe > 0.05 && Math.hypot(h.x - sl.x, h.y - sl.y) < 1.4);
    if (nah) {
      sl.fort = Math.min(1, sl.fort + DT / 3);
      if (sl.fort >= 1) {
        sl.offen = false;
        {
          const P = this.karte.PROBE;
          if (P && P.art === "schleuse" && this.probe === 0) this.probe = this.zeit <= (P.wert || 0) ? 1 : 2;
        }
        this.ev.push({ a: "schleuse", x: sl.x, y: sl.y });
        if (this.besiegt >= this.monsterZahl) this.sieg();
        return;
      }
    } else sl.fort = 0;
    sl.warte -= DT;
    if (sl.warte > 0 || sl.raus >= sl.gesamt) return;
    sl.warte = sl.takt;
    if (this.wesen.filter((w) => !w.held && !w.tot && w.gruppe >= 100).length >= sl.max) return;
    const p = sl.quellen[Math.floor(this.zf() * sl.quellen.length)], m = this.neu(false, sl.art, 1, { x: p.x, y: p.y }, true, 100 + this.lauf);
    m.wach = true;
    m.heim = { x: sl.x, y: sl.y };
    this.monsterZahl++;
    sl.raus++;
    this.ev.push({ a: "auftauchen", id: m.id, x: p.x, y: p.y });
  }
  /** Laich: Sobald ein Held in der Nähe ist, schlüpft alle takt Sekunden ein Junges – höchstens max zugleich, gesamt insgesamt. */
  brueten(w, B) {
    let b = this.brut.get(w.id);
    if (!b) {
      b = { t: B.takt * 0.4, n: 0, junge: [] };
      this.brut.set(w.id, b);
    }
    if (b.n >= B.gesamt || !this.wesen.some((h) => h.held && !h.tot && abstand(h, w) < 9)) return;
    b.t -= DT;
    if (b.t > 0) return;
    b.t = B.takt;
    b.junge = b.junge.filter((id) => {
      const j2 = this.nach(id);
      return j2 && !j2.tot;
    });
    if (b.junge.length >= B.max) return;
    const a = this.zf() * Math.PI * 2, p = naechstFrei({ x: w.x + Math.cos(a) * 1.1, y: w.y + Math.sin(a) * 1.1 }), j = this.neu(false, B.art, 1, p, true, 200 + this.lauf);
    j.wach = true;
    j.heim = { x: w.x, y: w.y };
    b.n++;
    b.junge.push(j.id);
    this.monsterZahl++;
    this.ev.push({ a: "auftauchen", id: j.id, x: p.x, y: p.y });
  }
  /** Sieg: die Herausforderung ist geschafft, wenn sie bis hierher nicht verfehlt wurde */
  sieg() {
    this.phase = "sieg";
    if (this.karte.PROBE && this.probe === 0) this.probe = 1;
  }
  /** Die Angaben zum eigenen Helden (für jeden Spieler einer Koop-Gruppe seine eigenen) */
  ichVon(id) {
    const r = (v) => Math.round(v * 100) / 100, h = this.nach(id) || this.ich;
    return { id: h.id, cdQ: r(h.cdQ), cdE: r(h.cdE), cdR: r(h.cdR), zielId: h.zielId, wieder: r(Math.max(0, h.wieder)), modus: h.modus, stufe: this.stufen[h.typ] || 1, ep: this.epStand[h.typ] || 0 };
  }
  /** Stufe eines Helden aus seiner Erfahrung setzen (Koop: jeder bringt seine eigene mit) – Leben passt sich an */
  setzeErfahrung(typ, ep) {
    this.bereit();
    this.epStand[typ] = ep;
    this.stufen[typ] = stufeAusEp(ep);
    HELDENSTUFE[typ] = this.stufen[typ];
    for (const w of this.wesen) if (w.held && w.typ === typ) {
      const q = w.lp / w.max;
      w.max = Math.round(HELDEN[typ].lp * (1 + STUFENBONUS(this.stufen[typ]).lp));
      w.lp = Math.max(1, Math.round(w.max * q));
    }
  }
  /** Koop: Ein Mitspieler übernimmt einen Helden. Erst einen Begleiter desselben Helden, sonst einen neuen (bis drei), sonst irgendeinen Begleiter. Zurück: Kennung oder 0. */
  uebernehmen(typ) {
    this.bereit();
    const helden = this.wesen.filter((w2) => w2.held && w2.team === 0);
    let w = helden.find((o) => o.bot && o.typ === typ);
    if (!w && HELDEN[typ] && helden.length < 3 && !helden.some((o) => o.typ === typ)) {
      const p = START[helden.length] || START[0];
      w = this.neu(true, typ, 0, p, false);
      this.begleiter.push(typ);
    }
    if (!w) w = helden.find((o) => o.bot);
    if (!w) return 0;
    w.bot = false;
    w.pfad = [];
    w.zielId = 0;
    w.rx = 0;
    w.ry = 0;
    return w.id;
  }
  /** Koop: Ein Mitspieler geht – sein Held läuft als Begleiter weiter */
  freigeben(id) {
    const w = this.nach(id);
    if (!w || !w.held || w === this.ich) return;
    w.bot = true;
    w.fuehrer = this.ich.id;
    w.rx = 0;
    w.ry = 0;
  }
  /** Der Zustand für den Client (kompakt). Die Ereignisse seit dem letzten Abruf sind enthalten und werden danach geleert. */
  zustand() {
    this.bereit();
    const r = (v) => Math.round(v * 100) / 100, h = this.ich, ev = this.ev;
    this.ev = [];
    const bits = (w) => (w.bollwerk > 0 ? BIT.bollwerk : 0) | (w.betaeubt > 0 ? BIT.betaeubt : 0) | (w.langsamT > 0 ? BIT.langsam : 0) | (w.dauer.length ? BIT.dauer : 0) | (w.malT > 0 ? BIT.mal : 0) | (w.held && HELDEN[w.typ].modi[w.modus].schild ? BIT.schild : 0) | (w.aushol > 0 ? BIT.aushol : 0) | (w.schutz > 0 ? BIT.schutz : 0);
    return {
      tick: this.tick,
      phase: this.phase,
      zeit: Math.round(this.zeit * 10) / 10,
      splitter: this.splitter,
      besiegt: this.besiegt,
      monster: this.monsterZahl,
      b: this.beute.map((q) => [q.id, q.x, q.y, q.n]),
      w: this.wesen.filter((w) => w.held || !w.tot).map((w) => [w.id, w.held ? 1 : 0, w.typ, w.team, r(w.x), r(w.y), r(w.blick), Math.round(w.lp), w.max, bits(w), w.tot ? 1 : 0, Math.round(w.schutz), w.modus]),
      g: this.geschosse.map((g) => [g.id, r(g.x), r(g.y), g.art]),
      ev,
      ich: this.ichVon(h.id),
      pr: this.karte.PROBE ? this.probe : void 0,
      sl: this.sl ? [r(this.sl.x), r(this.sl.y), this.sl.offen ? 1 : 0, r(this.sl.fort)] : void 0,
      st: Object.fromEntries(this.wesen.filter((w) => w.held && w.team === 0).map((w) => [w.typ, [this.stufen[w.typ] || 1, this.epStand[w.typ] || 0]]))
    };
  }
};

// shared/waldweg.ts
var WALDWEG_ZEILEN = ["TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT........TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT...............TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT....................TTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.TTT...................TTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTT..TTT....................TTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTT..........................TTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTT...........................TTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTT...........................TTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTT.........................TTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT....................TTT.TTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT...................TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT...................TTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.............TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.................TTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT...........................TTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTT....................................TTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTT.............................................TTTTTTTTTTTTT", "......TTTTTTTTT..........................................................TTTTTTT", "....................................TTTTTTTTTTTTTTTTT...........................", "...............................TTTTTTTTTTTTTTTTTTTTTTTTTTT......................", "...........................TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.................", "......................TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.............", "TTTTTT.........TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.......", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT"];
var WALDWEG_START = [[0.5, 9.76], [0.1, 9.2], [0.1, 10.2]];
var WALDWEG_LAGER = [{ "art": "schlammkroete", "x": 18.4, "y": 2.5, "gruppe": 1 }, { "art": "schlammkroete", "x": 19.5, "y": 3.3, "gruppe": 1 }, { "art": "kroetchen", "x": 17.6, "y": 3.5, "gruppe": 1 }, { "art": "irrlicht", "x": 23.4, "y": 2.2, "gruppe": 2 }, { "art": "schlammkroete", "x": 24.1, "y": 3.1, "gruppe": 2 }, { "art": "kroetchen", "x": 22.6, "y": 3.5, "gruppe": 2 }];
var WALDWEG_BAEUME = { "baum1": { "fuss": [0.5549, 0.9335], "w": 356, "h": 345 }, "baum2": { "fuss": [0.4475, 0.9428], "w": 371, "h": 297 }, "baum3": { "fuss": [0.438, 0.9596], "w": 368, "h": 321 }, "baum4": { "fuss": [0.6439, 0.949], "w": 604, "h": 564 }, "baum5": { "fuss": [0.5949, 0.9907], "w": 231, "h": 317 }, "baum6": { "fuss": [0.5536, 0.9875], "w": 237, "h": 367 } };
var WALDWEG_DEKO = [{ "b": "baum3", "x": 23.57, "y": 0.3, "s": 1.072 }, { "b": "baum1", "x": 12.32, "y": 0.33, "s": 1.043 }, { "b": "baum5", "x": 33.03, "y": 0.35, "s": 0.944 }, { "b": "baum5", "x": 6.44, "y": 0.36, "s": 0.945 }, { "b": "baum5", "x": 17.46, "y": 0.37, "s": 0.939 }, { "b": "baum3", "x": 38.23, "y": 0.46, "s": 1.018 }, { "b": "baum1", "x": 4.87, "y": 0.57, "s": 0.873 }, { "b": "baum2", "x": 25.46, "y": 0.59, "s": 0.967 }, { "b": "baum3", "x": 9.77, "y": 0.6, "s": 1.11 }, { "b": "baum6", "x": 3.06, "y": 0.66, "s": 0.884 }, { "b": "baum4", "x": 29.11, "y": 0.68, "s": 0.882 }, { "b": "baum1", "x": 35.29, "y": 0.72, "s": 0.877 }, { "b": "baum5", "x": 1.21, "y": 0.73, "s": 1.041 }, { "b": "baum3", "x": 8, "y": 0.75, "s": 1.006 }, { "b": "baum3", "x": 15.42, "y": 0.95, "s": 0.878 }, { "b": "baum3", "x": 30.93, "y": 1.08, "s": 1.095 }, { "b": "baum1", "x": -0.35, "y": 1.12, "s": 1.042 }, { "b": "baum1", "x": 39.53, "y": 1.2, "s": 0.994 }, { "b": "baum1", "x": 11.23, "y": 1.25, "s": 0.87 }, { "b": "baum1", "x": 36.75, "y": 1.26, "s": 0.965 }, { "b": "baum6", "x": 13.44, "y": 1.31, "s": 0.889 }, { "b": "baum2", "x": 27.22, "y": 1.34, "s": 0.933 }, { "b": "baum2", "x": 4.1, "y": 1.66, "s": 0.909 }, { "b": "baum2", "x": 33.01, "y": 1.84, "s": 1.115 }, { "b": "baum1", "x": 29.42, "y": 1.93, "s": 1.074 }, { "b": "baum5", "x": 2.36, "y": 2.05, "s": 0.974 }, { "b": "baum3", "x": 7.39, "y": 2.05, "s": 0.999 }, { "b": "baum6", "x": 34.85, "y": 2.05, "s": 0.864 }, { "b": "baum4", "x": 8.98, "y": 2.1, "s": 1.072 }, { "b": "baum3", "x": 0.73, "y": 2.16, "s": 1.112 }, { "b": "baum1", "x": 37.82, "y": 2.35, "s": 1.015 }, { "b": "baum4", "x": 5.41, "y": 2.57, "s": 0.87 }, { "b": "baum3", "x": 39.69, "y": 2.58, "s": 1.071 }, { "b": "baum3", "x": 10.59, "y": 2.8, "s": 0.953 }, { "b": "baum5", "x": 12.78, "y": 3.21, "s": 1.097 }, { "b": "baum1", "x": -0.49, "y": 3.22, "s": 0.917 }, { "b": "baum5", "x": 31.78, "y": 3.31, "s": 1.054 }, { "b": "baum2", "x": 33.48, "y": 3.42, "s": 1.118 }, { "b": "baum6", "x": 3.99, "y": 3.42, "s": 1.011 }, { "b": "baum2", "x": 8.06, "y": 3.43, "s": 0.874 }, { "b": "baum1", "x": 29.22, "y": 3.58, "s": 0.956 }, { "b": "baum2", "x": 6.32, "y": 3.62, "s": 0.873 }, { "b": "baum1", "x": 9.99, "y": 4.04, "s": 1.084 }, { "b": "baum4", "x": 36.14, "y": 4.15, "s": 0.947 }, { "b": "baum1", "x": 1.94, "y": 4.28, "s": 1.102 }, { "b": "baum5", "x": 39.04, "y": 4.3, "s": 1.056 }, { "b": "baum3", "x": 12.42, "y": 4.39, "s": 1.035 }, { "b": "baum2", "x": 31.72, "y": 4.59, "s": 1.001 }, { "b": "baum1", "x": 4.58, "y": 4.61, "s": 0.937 }, { "b": "baum1", "x": 8.54, "y": 4.68, "s": 0.88 }, { "b": "baum4", "x": -0.34, "y": 4.74, "s": 0.969 }, { "b": "baum2", "x": 6.72, "y": 4.78, "s": 1.061 }, { "b": "baum3", "x": 11.06, "y": 4.97, "s": 1.032 }, { "b": "baum5", "x": 28.17, "y": 5.09, "s": 0.9 }, { "b": "baum2", "x": 33.08, "y": 5.29, "s": 0.869 }, { "b": "baum4", "x": 38.13, "y": 5.31, "s": 1.053 }, { "b": "baum1", "x": 13.55, "y": 5.41, "s": 0.942 }, { "b": "baum1", "x": 2.55, "y": 5.43, "s": 1.071 }, { "b": "baum3", "x": 9.69, "y": 5.64, "s": 0.917 }, { "b": "baum4", "x": 0.65, "y": 5.69, "s": 1.102 }, { "b": "baum5", "x": 29.41, "y": 5.86, "s": 0.954 }, { "b": "baum1", "x": 4.19, "y": 5.88, "s": 0.95 }, { "b": "baum2", "x": 34.7, "y": 5.89, "s": 1.041 }, { "b": "baum2", "x": 36.46, "y": 5.89, "s": 1.079 }, { "b": "baum2", "x": 27.25, "y": 6.07, "s": 1.091 }, { "b": "baum6", "x": 12.29, "y": 6.19, "s": 0.996 }, { "b": "baum1", "x": 40.15, "y": 6.2, "s": 1.063 }, { "b": "baum5", "x": 7.53, "y": 6.45, "s": 0.886 }, { "b": "baum4", "x": 14.59, "y": 6.49, "s": 0.875 }, { "b": "baum2", "x": 2.03, "y": 6.63, "s": 0.928 }, { "b": "baum1", "x": 31.35, "y": 6.83, "s": 1.023 }, { "b": "baum6", "x": 5.27, "y": 6.94, "s": 0.986 }, { "b": "baum6", "x": 9.84, "y": 7, "s": 0.922 }, { "b": "baum1", "x": 16.09, "y": 7.01, "s": 0.926 }, { "b": "baum5", "x": 33.68, "y": 7.15, "s": 0.938 }, { "b": "baum2", "x": 29.65, "y": 7.24, "s": 1.085 }, { "b": "baum3", "x": 3.66, "y": 7.32, "s": 0.957 }, { "b": "baum5", "x": 38.66, "y": 7.34, "s": 0.888 }, { "b": "baum1", "x": 35.83, "y": 7.4, "s": 1.017 }, { "b": "baum3", "x": 12.31, "y": 7.41, "s": 1.035 }, { "b": "baum5", "x": 40.38, "y": 7.52, "s": 1.035 }, { "b": "baum1", "x": -0.46, "y": 7.67, "s": 1.045 }, { "b": "baum2", "x": 7.26, "y": 7.76, "s": 0.876 }, { "b": "baum2", "x": 1.97, "y": 7.89, "s": 0.954 }, { "b": "baum3", "x": 10.75, "y": 8.01, "s": 0.882 }, { "b": "baum3", "x": 34.6, "y": 8.28, "s": 0.953 }, { "b": "baum6", "x": 8.66, "y": 8.35, "s": 0.98 }, { "b": "baum5", "x": 3.43, "y": 8.57, "s": 1.068 }, { "b": "baum3", "x": 36.73, "y": 8.6, "s": 1.029 }, { "b": "baum1", "x": 6.12, "y": 8.63, "s": 1.095 }, { "b": "baum6", "x": 39.7, "y": 8.73, "s": 1.099 }, { "b": "baum1", "x": 21.74, "y": 12.93, "s": 0.908 }, { "b": "baum2", "x": 18.94, "y": 13.12, "s": 0.897 }, { "b": "baum2", "x": 25.18, "y": 13.44, "s": 0.876 }, { "b": "baum3", "x": 17.33, "y": 13.51, "s": 1.086 }, { "b": "baum2", "x": 20.5, "y": 13.67, "s": 1.076 }, { "b": "baum5", "x": 27.5, "y": 13.68, "s": 1.005 }, { "b": "baum5", "x": 22.89, "y": 13.82, "s": 0.918 }, { "b": "baum3", "x": 14.54, "y": 14.05, "s": 1.024 }, { "b": "baum1", "x": 11.71, "y": 14.56, "s": 1.116 }, { "b": "baum2", "x": 29.79, "y": 14.65, "s": 0.99 }, { "b": "baum5", "x": 32.21, "y": 14.74, "s": 0.979 }, { "b": "baum1", "x": 13.26, "y": 14.77, "s": 1.117 }, { "b": "baum5", "x": 19.75, "y": 14.91, "s": 0.983 }, { "b": "baum2", "x": 16.64, "y": 14.91, "s": 0.851 }, { "b": "baum2", "x": 1.92, "y": 15.13, "s": 1.115 }, { "b": "baum4", "x": 10.16, "y": 15.31, "s": 0.89 }, { "b": "baum3", "x": 21.34, "y": 15.34, "s": 0.873 }, { "b": "baum3", "x": 36.38, "y": 15.35, "s": 1.107 }, { "b": "baum1", "x": 24.44, "y": 15.38, "s": 0.985 }, { "b": "baum6", "x": 38.24, "y": 15.44, "s": 0.877 }, { "b": "baum2", "x": 28.08, "y": 15.49, "s": 1.066 }, { "b": "baum5", "x": 6.82, "y": 15.53, "s": 0.995 }, { "b": "baum3", "x": 4.06, "y": 15.57, "s": 0.996 }, { "b": "baum3", "x": 18.31, "y": 15.64, "s": 1.114 }, { "b": "baum3", "x": -0.34, "y": 15.72, "s": 0.911 }, { "b": "baum2", "x": 26.27, "y": 15.73, "s": 0.982 }, { "b": "baum3", "x": 8.48, "y": 15.77, "s": 1.064 }, { "b": "baum2", "x": 34.46, "y": 15.86, "s": 0.901 }, { "b": "baum1", "x": 29.59, "y": 15.98, "s": 1.055 }, { "b": "baum1", "x": 12.15, "y": 16.05, "s": 0.853 }, { "b": "baum2", "x": 14.12, "y": 16.16, "s": 1.068 }, { "b": "baum6", "x": 31.81, "y": 16.2, "s": 0.922 }, { "b": "baum2", "x": 23.08, "y": 16.24, "s": 0.879 }, { "b": "baum1", "x": 5.49, "y": 16.25, "s": 0.903 }, { "b": "baum5", "x": 16.91, "y": 16.26, "s": 1.042 }, { "b": "baum4", "x": 40.08, "y": 16.37, "s": 1.059 }, { "b": "baum1", "x": 19.8, "y": 16.41, "s": 1.112 }, { "b": "baum3", "x": 9.83, "y": 16.48, "s": 0.922 }, { "b": "baum5", "x": 24.77, "y": 16.7, "s": 0.917 }, { "b": "baum1", "x": 2.93, "y": 16.83, "s": 1.055 }, { "b": "baum1", "x": 38.18, "y": 16.89, "s": 1.118 }, { "b": "baum5", "x": 26.63, "y": 16.9, "s": 0.94 }, { "b": "baum6", "x": 18.2, "y": 16.97, "s": 1.01 }, { "b": "baum3", "x": 33.09, "y": 16.97, "s": 0.927 }, { "b": "baum5", "x": 15.53, "y": 17.12, "s": 1.016 }, { "b": "baum2", "x": 0.55, "y": 17.17, "s": 0.934 }, { "b": "baum2", "x": 21.03, "y": 17.19, "s": 0.939 }, { "b": "baum6", "x": 30.05, "y": 17.21, "s": 1.006 }, { "b": "baum3", "x": 28.17, "y": 17.22, "s": 1.051 }, { "b": "baum1", "x": 34.76, "y": 17.26, "s": 1.013 }, { "b": "baum5", "x": 8.1, "y": 17.35, "s": 0.872 }, { "b": "baum6", "x": 36.32, "y": 17.35, "s": 0.983 }, { "b": "baum1", "x": 6.38, "y": 17.5, "s": 1.113 }, { "b": "baum2", "x": 31.64, "y": 17.61, "s": 1.073 }, { "b": "baum6", "x": 12.54, "y": 17.73, "s": 0.859 }, { "b": "baum2", "x": 9.69, "y": 17.74, "s": 0.983 }, { "b": "baum2", "x": 23.42, "y": 17.75, "s": 1.042 }, { "b": "baum2", "x": 4.87, "y": 17.86, "s": 0.979 }, { "b": "baum2", "x": 14.37, "y": 18.01, "s": 1.06 }, { "b": "baum3", "x": 38, "y": 18.1, "s": 0.954 }, { "b": "baum5", "x": 3.17, "y": 18.15, "s": 0.969 }, { "b": "baum6", "x": 26.86, "y": 18.16, "s": 0.885 }, { "b": "baum1", "x": 39.6, "y": 18.37, "s": 1.038 }, { "b": "baum5", "x": 19.1, "y": 18.47, "s": 0.864 }, { "b": "baum2", "x": 33.94, "y": 18.53, "s": 1.047 }, { "b": "baum4", "x": 15.96, "y": 18.57, "s": 1 }, { "b": "baum3", "x": 25.22, "y": 18.59, "s": 1.085 }, { "b": "baum3", "x": 0.45, "y": 18.65, "s": 0.952 }, { "b": "baum1", "x": 8.5, "y": 18.68, "s": 0.94 }, { "b": "baum5", "x": 10.29, "y": 18.86, "s": 1.082 }, { "b": "baum2", "x": 6.71, "y": 18.94, "s": 0.913 }, { "b": "baum6", "x": 35.7, "y": 18.97, "s": 0.865 }, { "b": "baum2", "x": 31.82, "y": 19.05, "s": 0.96 }, { "b": "baum4", "x": 29.83, "y": 19.13, "s": 0.861 }, { "b": "baum3", "x": 21.15, "y": 19.19, "s": 0.86 }, { "b": "baum1", "x": 12.86, "y": 19.22, "s": 0.969 }, { "b": "baum4", "x": 17.36, "y": 19.24, "s": 0.902 }, { "b": "baum3", "x": 27.7, "y": 19.26, "s": 0.856 }, { "b": "baum1", "x": 2.14, "y": 19.31, "s": 0.933 }, { "b": "baum1", "x": 23.3, "y": 19.36, "s": 1.068 }, { "b": "baum3", "x": 37.92, "y": 19.37, "s": 1.074 }, { "b": "baum3", "x": 14.44, "y": 19.43, "s": 1 }, { "b": "baum1", "x": 3.79, "y": 19.46, "s": 1.102 }, { "b": "baum2", "x": 40.08, "y": 19.58, "s": 1.023 }];

// shared/karten.ts
var L = (art, x, y, gruppe) => ({ art, x: x + 0.5, y: y + 0.5, gruppe });
var ORTREIHE = ["weidenhain", "rabenmoor", "graufurt", "grauwacht", "hochwacht", "krone"];
var KAMPFFOLGE = { weidenhain: ["speicher", "muehle", "wehr"], rabenmoor: ["bohlenweg", "ried", "totenpfad", "schrein"] };
var ORTSTUFE = { weidenhain: 1, rabenmoor: 2 };
var NEBENKAEMPFE = { weidenhain: ["nest", "ufer"] };
var STRECKEN = /* @__PURE__ */ new Set(["waldweg"]);
var geschafft = (siege, ort) => {
  const f = KAMPFFOLGE[ort];
  return Boolean(f && f.length && siege.has(ort + "/" + f[f.length - 1]));
};
function darfKaempfen(siege, ort, kampf) {
  if (STRECKEN.has(kampf)) return ORTREIHE.includes(ort);
  const f = KAMPFFOLGE[ort], o = ORTREIHE.indexOf(ort);
  if (o >= 0 && (NEBENKAEMPFE[ort] || []).includes(kampf)) return o === 0 || geschafft(siege, ORTREIHE[o - 1]);
  const i = f ? f.indexOf(kampf) : -1;
  if (i < 0 || o < 0) return false;
  if (i > 0) return siege.has(ort + "/" + f[i - 1]);
  return o === 0 || geschafft(siege, ORTREIHE[o - 1]);
}
var FEIN = 2;
var KARTEN = {
  /* Der Waldweg von der Waldmark nach Weidenhain (werkzeug/waldweg.py): links die Waldmark, rechts Weidenhain. An der Kreuzung führt ein Pfad nach oben auf eine Lichtung,
     auf der zwei Krötengruppen hausen. Sie greifen an, sobald ein Held auf 7 Rechenfelder herankommt, und verfolgen ihn ein gutes Stück. */
  waldweg: {
    name: "Der Waldweg",
    bild: "img/welt/waldweg.webp",
    zeilen: WALDWEG_ZEILEN,
    feinZeilen: true,
    start: WALDWEG_START,
    aggro: 7,
    leine: 16,
    weg: true,
    lager: WALDWEG_LAGER.map((l) => ({ ...l })),
    deko: WALDWEG_DEKO,
    dekoBilder: WALDWEG_BAEUME,
    ausgaenge: [{ x0: 0, x1: 0.8, y0: 0, y1: 18, nach: "waldmark", text: "Zur\xFCck in die Waldmark" }, { x0: 39.2, x1: 40, y0: 0, y1: 18, nach: "weidenhain", text: "Weiter nach Weidenhain" }]
  },
  /* Der Kornspeicher: links das Tor, rechts das Loch zum Graben, dazwischen Säcke und Fässer */
  speicher: {
    name: "Der Kornspeicher",
    bild: "img/weidenhain/speicher.webp",
    zeilen: ["MMMMMMMMMMMM", "MMKK.....KMM", "M..KK..KK.MM", "M..KK..KK.MM", "............", "M..KK..KK.MM", "M.........MM", "MMKK.....KMM", "MMMMMMMMMMMM"],
    start: [[1, 4], [1, 3], [1, 5]],
    lager: [L("schlammkroete", 6, 4, 1), L("schlammkroete", 6, 6, 1), L("schlammkroete", 9, 3, 2), L("schlammkroete", 10, 4, 2)],
    /* sechs Kornsäcke vor den Stapeln: Die Kröten fressen sich hinein */
    schuetz: [L("kornsack", 2, 2, 0), L("kornsack", 5, 3, 0), L("kornsack", 6, 3, 0), L("kornsack", 2, 5, 0), L("kornsack", 5, 5, 0), L("kornsack", 9, 5, 0)],
    probe: { text: "Mindestens 4 Korns\xE4cke retten", art: "schuetzlinge", wert: 4 }
  },
  /* Am Mühlgraben: der Graben teilt die Wiese, in der Mitte ein Steg, oben rechts das Mühlhaus */
  muehle: {
    name: "Am M\xFChlgraben",
    bild: "img/weidenhain/muehle.webp",
    zeilen: ["TTT...~~.MMM", "TTTKK.~~KMMM", "TT....~~..MM", "..K...~~..K.", "............", "..K...~~....", "TT....~~.KKT", "TT....~~..TT", "TTT...~~..TT"],
    start: [[0, 4], [1, 3], [1, 5]],
    lager: [L("schlammkroete", 4, 2, 1), L("schlammkroete", 5, 4, 1), L("irrlicht", 8, 4, 2), L("schlammkroete", 9, 5, 2), L("irrlicht", 9, 7, 3), L("schlammkroete", 11, 5, 3)],
    /* der Hebel am Ufer vor dem Mühlhaus; die Kröten kriechen an beiden Ufern aus dem Graben */
    schleuse: { x: 8.5, y: 3.2, quellen: [[5.5, 7.5], [8.5, 7.5], [5.5, 1.5], [8.5, 6.5]], art: "schlammkroete", takt: 10, erst: 7, max: 3, gesamt: 8 },
    probe: { text: "Die Schleuse in unter 60 s schlie\xDFen", art: "schleuse", wert: 60 }
  },
  /* Hinter der Scheune (Nebenkampf): ein Tümpel unter dem alten Baum voller Krötenlaich. 16 × 9 Felder, der Tümpel ist flach und begehbar. */
  nest: {
    name: "Hinter der Scheune",
    bild: "img/weidenhain/nest.webp",
    zeilen: ["MMMMMMMMMMTTTTTT", "MMMMMMMMMMTTTTTT", "MMMMMMMMMMTTTTTT", "MMMMMMT.....TTTT", ".KKKKKK......KTT", ".KK...K......K.T", "....KK.....KKKTT", "T.....K...TTTTTT", "TTTT......TTTTTT"],
    start: [[1, 6], [2, 7], [0, 5]],
    lager: [
      { art: "laich", x: 9.6, y: 4.55, gruppe: 9 },
      { art: "laich", x: 10.4, y: 3.4, gruppe: 9 },
      { art: "laich", x: 11.6, y: 3.9, gruppe: 9 },
      L("schlammkroete", 8, 5, 1),
      L("kroetchen", 7, 4, 1),
      L("kroetchen", 11, 5, 2),
      L("kroetchen", 12, 4, 2)
    ]
  },
  /* Am Mühlteich (Nebenkampf): Mettes Kräuterufer, rechts das Wasser. Die Irrlichter huschen einmal davon, wenn sie fast besiegt sind. */
  ufer: {
    name: "Am M\xFChlteich",
    bild: "img/weidenhain/ufer.webp",
    zeilen: ["TTTTTTTTTT....TT", "TTTT.TT....TTTTT", "TTT.........TT~~", "T........T...~~~", ".......KTTK~~~~~", "...........T~~~~", ".KT..........~~T", "TT...........TTT", "TTTT...........T"],
    start: [[1, 4], [1, 5], [2, 3]],
    lager: [
      { ...L("irrlicht", 9, 2, 1), blinzeln: true },
      { ...L("irrlicht", 11, 3, 1), blinzeln: true },
      { ...L("irrlicht", 8, 6, 2), blinzeln: true },
      { ...L("irrlicht", 11, 6, 2), blinzeln: true },
      L("schlammkroete", 10, 6, 2),
      { ...L("irrlicht", 12, 7, 3), blinzeln: true },
      { ...L("irrlicht", 13, 0, 3), blinzeln: true },
      L("schlammkroete", 11, 7, 3)
    ]
  },
  /* ---------- Rabenmoor (gemalte Karten aus dem Würfelspiel, 12 × 9) ---------- */
  /* Der Bohlenweg: ein Steg, nur eine Feldreihe breit; links und rechts eine Insel. Hinter dir im Schilf warten Kröten – wer losläuft, ist eingekesselt. */
  bohlenweg: {
    name: "Der Bohlenweg",
    bild: "img/rabenmoor/bohlenweg.webp",
    zeilen: ["~~~~~~~~~~~~", "~..~~~~~~~~~", "T..~~~~~~~.T", "...~~~~~~~..", "............", "K..~~~~~~~.K", "K..~~~~~~~K.", ".~~~~~~~~~~~", "~~~~~~~~~~~~"],
    start: [[1, 3], [2, 3], [1, 5]],
    lager: [L("schlammkroete", 6, 4, 1), L("irrlicht", 5, 4, 1), L("schlammkroete", 10, 4, 2), L("irrlicht", 10, 3, 2), L("irrlicht", 10, 5, 2), L("schlammkroete", 10, 2, 2), L("schlammkroete", 11, 3, 2)]
  },
  /* Das Ried: Schlamminseln zwischen gewundenen Wasserläufen; Kröten in drei Gruppen, Irrlichter, die davonhuschen */
  ried: {
    name: "Das Ried",
    bild: "img/rabenmoor/ried.webp",
    zeilen: ["TTTTT~~..TTT", "TT..~~~...TT", "........K~~.", "...~T....~~.", "~~~...~~~...", "...~........", "...~~....K~T", "TT..~.~~~.TT", "TTT...~~.TTT"],
    start: [[1, 3], [1, 2], [2, 3]],
    lager: [
      L("schlammkroete", 6, 2, 1),
      L("schlammkroete", 7, 3, 1),
      { ...L("irrlicht", 8, 1, 1), blinzeln: true },
      L("schlammkroete", 10, 4, 2),
      L("schlammkroete", 11, 5, 2),
      { ...L("irrlicht", 10, 5, 2), blinzeln: true },
      L("schlammkroete", 6, 6, 3),
      L("kroetchen", 7, 5, 3),
      L("kroetchen", 8, 6, 3)
    ]
  },
  /* Der Totenpfad: ein Damm aus Wurzeln zwischen schwarzen Tümpeln. Die Ertrunkenen stehen einmal wieder auf. */
  totenpfad: {
    name: "Der Totenpfad",
    bild: "img/rabenmoor/totenpfad.webp",
    zeilen: ["~~~~~~~~~~~~", "~T~~~~TT~~T~", ".T..~T....M.", "...T~..K.~..", "............", "...~T..~~..T", "TK.....~~.KT", "T~~~~~~T.~~T", "~~~~~~~~~~~~"],
    start: [[1, 4], [0, 4], [1, 3]],
    lager: [L("moorleiche", 5, 4, 1), L("moorleiche", 6, 3, 1), L("irrlicht", 8, 2, 2), L("moorleiche", 9, 4, 2), L("moorleiche", 10, 3, 2), L("irrlicht", 11, 4, 2)]
  },
  /* Der versunkene Schrein: Alwine, die Stumme, zwischen sechs Spiralsteinen. Ihre Wehklage trifft alles in der Nähe; sie ruft Irrlichter. */
  schrein: {
    name: "Der versunkene Schrein",
    bild: "img/rabenmoor/schrein.webp",
    zeilen: ["~~~~~~~~~~~~", "~~~~.....T~~", "~~T.M...M.~~", "~~...MM....~", "~~M..KK..M.~", "~T........K~", "~~..M..M.T~~", "~~~T....T~~~", "~~~~~~~~~~~~"],
    start: [[5, 7], [6, 7], [4, 7]],
    lager: [L("alwine", 6, 2, 1), L("moorleiche", 3, 3, 1), L("moorleiche", 8, 3, 1), L("irrlicht", 5, 1, 1)]
  },
  /* Das alte Wehr: ein Streifen Ufer zwischen Mühlteich oben und dem Abfluss unten */
  wehr: {
    name: "Das alte Wehr",
    bild: "img/weidenhain/wehr.webp",
    zeilen: ["TT~~~~~~~~~T", "TTT~~~~~~MMT", ".TT......MM.", "............", ".T..........", "TTT.......K.", "............", "MMMMMMMMMMMM", "T~~~~~~~~~~~"],
    start: [[0, 3], [1, 3], [0, 4]],
    lager: [L("alte_unke", 9, 4, 1), L("irrlicht", 8, 2, 1), L("irrlicht", 10, 6, 1), L("schlammkroete", 7, 5, 1)],
    probe: { text: "Kein Held vom Giftschwall getroffen", art: "ausweichen" }
  }
};

// server/src/index.ts
var PORT = Number(process.env.PORT) || 8787;
var MAX = Number(process.env.MAX_SPIELER) || 40;
var RUHE_MS = 5 * 60 * 1e3;
var HERKUNFT = (process.env.ERLAUBTE_HERKUNFT || "https://mythara-dungeon.de,http://localhost:8765").split(",").map((s) => s.trim()).filter(Boolean);
var SB_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
var SB_KEY = process.env.SUPABASE_SERVICE_KEY || "";
var neuerKampf = (karte, ort, team) => ({ karte, ort, team, nutzer: "", ep: 0, fertig: false, gesiegt: false, gebuchtEp: 0, gebuchtS: 0, bucht: false, nochmal: false, ende: false, seit: Date.now(), geaendert: 0, letzterEp: 0, letzterS: 0, stand: null, wartende: [] });
var BUCHUNG_RUHE = Number(process.env.BUCHUNG_RUHE_MS) || 5e3;
var BUCHUNG_SPAETESTENS = Number(process.env.BUCHUNG_SPAETESTENS_MS) || 3e4;
var plaetze = /* @__PURE__ */ new Set();
var raeume = /* @__PURE__ */ new Map();
var CODE = /^[A-Z]{6}$/;
function gruppeMelden(R) {
  const m = JSON.stringify({ t: "gruppe", code: R.code, fuehrer: R.fuehrerName, mitglieder: [...R.warten].map((w) => ({ name: w.name, held: w.held, fuehrer: w.nutzer === R.fuehrer, bereit: Boolean(w.bereit) })), lager: R.lager, kampf: R.kampf && R.kampf.kampf ? { ort: R.kampf.kampf.ort, karte: R.kampf.kampf.karte } : null });
  for (const w of R.warten) if (w.ws.readyState === import_websocket.default.OPEN) w.ws.send(m);
}
function losMelden(R, ort, karte) {
  for (const w of R.warten) if (w.nutzer !== R.fuehrer && w.ws.readyState === import_websocket.default.OPEN) w.ws.send(JSON.stringify({ t: "los", ort, kampf: karte }));
  gruppeMelden(R);
}
setInterval(() => {
  const jetzt = Date.now();
  for (const [c, R] of raeume) if (!R.warten.size && !R.kampf && jetzt - R.zuletzt > 30 * 60 * 1e3) raeume.delete(c);
}, 6e4);
async function sb(pfad, init = {}) {
  const r = await fetch(SB_URL + pfad, { ...init, headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "content-type": "application/json", ...init.headers || {} }, signal: AbortSignal.timeout(8e3) });
  if (!r.ok) throw new Error("Supabase " + r.status + " " + (await r.text()).slice(0, 200));
  return r.status === 204 ? null : r.json();
}
async function nutzerAus(token) {
  if (!/^[A-Za-z0-9._-]{20,4000}$/.test(token)) return null;
  const r = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_KEY, Authorization: "Bearer " + token }, signal: AbortSignal.timeout(8e3) });
  if (!r.ok) return null;
  const u = await r.json();
  return u.id && !u.is_anonymous ? u.id : null;
}
async function epLesen(nutzer) {
  const z = await sb(`/rest/v1/rpg_echtzeit_werte?user_id=eq.${nutzer}&select=ep`);
  return z[0] && z[0].ep || {};
}
async function siegeLesen(nutzer) {
  const z = await sb(`/rest/v1/rpg_echtzeit_siege?user_id=eq.${nutzer}&select=ort,kampf`);
  return new Set(z.map((q) => q.ort + "/" + q.kampf));
}
async function siegEintragen(p) {
  const k = p.kampf;
  if (!k || k.gesiegt) return;
  k.gesiegt = true;
  try {
    await sb("/rest/v1/rpc/rpg_echtzeit_sieg", { method: "POST", body: JSON.stringify({ p_user: k.nutzer, p_ort: k.ort, p_kampf: k.karte }) });
    if (p.ws.readyState === import_websocket.default.OPEN) p.ws.send(JSON.stringify({ t: "sieg", ort: k.ort, kampf: k.karte }));
  } catch (e) {
    console.error("Sieg nicht eingetragen:", e.message);
    k.gesiegt = false;
  }
}
async function buchen(p, schluss = false) {
  const sim = p.sim || p.haupt && p.haupt.sim, k = p.kampf;
  if (!k || !sim || !k.nutzer) return;
  if (schluss) {
    if (k.ende) return;
    k.ende = true;
    k.fertig = true;
  }
  if (k.bucht) {
    if (!schluss) return;
    k.nochmal = true;
    return new Promise((ok2) => k.wartende.push(ok2));
  }
  const ep = k.ep - k.gebuchtEp, seelen = sim.splitter - k.gebuchtS, sende = (o) => {
    if (p.ws.readyState === import_websocket.default.OPEN) p.ws.send(JSON.stringify(o));
  };
  const fertig = (o) => {
    if (k.ende) {
      sende({ t: "gutschrift", ...o });
      for (const w of k.wartende.splice(0)) w();
    }
  };
  if (ep <= 0 && seelen <= 0) {
    fertig(k.stand || { leer: true });
    return;
  }
  k.bucht = true;
  k.seit = Date.now();
  const epHeld = {};
  for (const h of k.team) epHeld[h] = ep;
  let ok = false;
  for (let versuch = 0; versuch < (k.ende ? 3 : 1) && !ok; versuch++) {
    if (versuch) await new Promise((r) => setTimeout(r, 1500 * versuch));
    try {
      const r = await sb("/rest/v1/rpc/rpg_echtzeit_gutschrift", { method: "POST", body: JSON.stringify({ p_user: k.nutzer, p_ep: epHeld, p_seelen: seelen, p_kampf: k.ort + "/" + k.karte }) });
      k.gebuchtEp += ep;
      k.gebuchtS += seelen;
      k.stand = r;
      ok = true;
      if (!k.ende) sende({ t: "gebucht", ...r });
    } catch (e) {
      console.error("Gutschrift fehlgeschlagen (bleibt offen):", e.message, ep, "EP", seelen, "Splitter");
    }
  }
  k.bucht = false;
  if (k.nochmal || k.ende && ok && (k.ep > k.gebuchtEp || sim.splitter > k.gebuchtS)) {
    k.nochmal = false;
    return buchen(p);
  }
  if (k.ende) {
    if (ok) fertig(k.stand);
    else {
      console.error("Gutschrift endg\xFCltig fehlgeschlagen:", k.nutzer, k.ort + "/" + k.karte, k.ep - k.gebuchtEp, "EP", sim.splitter - k.gebuchtS, "Splitter");
      fertig({ fehler: true });
    }
  }
}
function zwischenbuchen(q, sim, jetzt) {
  const k = q.kampf;
  if (!k || k.ende || k.bucht || !k.nutzer) return;
  if (k.ep !== k.letzterEp || sim.splitter !== k.letzterS) {
    k.letzterEp = k.ep;
    k.letzterS = sim.splitter;
    k.geaendert = jetzt;
  }
  if ((k.ep > k.gebuchtEp || sim.splitter > k.gebuchtS) && (jetzt - k.geaendert >= BUCHUNG_RUHE || jetzt - k.seit >= BUCHUNG_SPAETESTENS)) void buchen(q);
}
var http = (0, import_node_http.createServer)((req, res) => {
  res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" });
  res.end(JSON.stringify({ ok: true, dienst: "mythara-echtzeit", protokoll: PROTOKOLL, spieler: plaetze.size, kampagnen: Boolean(SB_URL && SB_KEY) }));
});
var wss = new import_websocket_server.default({ server: http, maxPayload: 65536, verifyClient: (info) => {
  const ok = !HERKUNFT.length || HERKUNFT.includes(info.origin);
  if (!ok) console.log("Verbindung abgelehnt: Herkunft", info.origin);
  return ok;
} });
process.on("uncaughtException", (e) => console.error("Unerwarteter Fehler:", e && e.stack || e));
process.on("unhandledRejection", (e) => console.error("Unerwarteter Fehler (Zusage):", e && e.stack || e));
wss.on("connection", (ws, req) => {
  if (plaetze.size >= MAX) {
    ws.close(1013, "voll");
    return;
  }
  const url = new URL(req.url || "/", "http://x"), held0 = url.searchParams.get("held") || "schildwaechter", held = HELDEN[held0] ? held0 : "schildwaechter", mit = (url.searchParams.get("mit") || "").split(",").filter((x) => HELDEN[x] && x !== held).slice(0, 2);
  const karte = url.searchParams.get("kampf") || "", ort = url.searchParams.get("ort") || "", raum = (url.searchParams.get("raum") || "").toUpperCase(), mitglied = url.searchParams.get("mitglied") === "1";
  if (url.searchParams.get("warte") === "1") {
    warten(ws, raum, url.searchParams.get("fuehrer") === "1");
    return;
  }
  const p = { ws, sim: null, zuletzt: Date.now(), fenster: Date.now(), zahl: 0 };
  plaetze.add(p);
  console.log("Verbindung:", karte ? `Kampf ${ort}/${karte}` : "Riss", "\xB7 Held", held, "\xB7 Begleiter", mit.length);
  const los = () => ws.send(JSON.stringify({ t: "hallo", protokoll: PROTOKOLL, tick: TICK }));
  if (!karte) {
    karteNehmen(GRUNDKARTE);
    Object.assign(STAERKE, { lp: 1, schaden: 1, beute: null, ep: 0 });
    for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k];
    for (const k of Object.keys(HELDENEP)) delete HELDENEP[k];
    p.sim = new Sim(held, (Date.now() ^ Math.random() * 1e9) >>> 0, mit);
    los();
  } else if (!KARTEN[karte] || !ORTSTUFE[ort] || !SB_URL || !SB_KEY) {
    console.log("Kampf abgelehnt: unbekannt oder Supabase nicht eingerichtet");
    ws.close(4400, "kampf unbekannt");
    plaetze.delete(p);
    return;
  }
  const frist = karte ? setTimeout(() => {
    if (!p.sim) {
      console.log("Kampf abgelehnt: keine Anmeldung binnen 10 s");
      ws.close(4401, "keine anmeldung");
    }
  }, 1e4) : null;
  ws.on("message", async (roh) => {
    const jetzt = Date.now();
    if (jetzt - p.fenster > 1e3) {
      p.fenster = jetzt;
      p.zahl = 0;
    }
    if (++p.zahl > K.EINGABEN_JE_SEK) return;
    let e;
    try {
      e = JSON.parse(String(roh));
    } catch {
      return;
    }
    p.zuletzt = jetzt;
    if (karte && !p.sim && !p.haupt) {
      if (e.t !== "anmeldung" || p.kampf) return;
      p.kampf = neuerKampf(karte, ort, [held, ...mit]);
      try {
        const nutzer = await nutzerAus(String(e.token || ""));
        if (!nutzer) {
          console.log("Kampf abgelehnt: Anmeldung von Supabase nicht best\xE4tigt");
          ws.close(4401, "anmeldung ungueltig");
          return;
        }
        p.kampf.nutzer = nutzer;
        const [ep, siege] = await Promise.all([epLesen(nutzer), siegeLesen(nutzer)]);
        if (mitglied) {
          const R2 = raeume.get(raum), H = R2 && R2.kampf;
          if (!R2 || !H || !H.sim || !H.kampf || H.kampf.karte !== karte || H.kampf.ort !== ort || H.kampf.fertig) {
            console.log("Koop abgelehnt: kein laufender Kampf in", raum);
            ws.close(4404, "kein gemeinsamer kampf");
            return;
          }
          if ((H.mit || /* @__PURE__ */ new Set()).size >= 2) {
            ws.close(4409, "gruppe voll");
            return;
          }
          const id = H.sim.uebernehmen(held);
          if (!id) {
            ws.close(4409, "kein platz");
            return;
          }
          const typ = H.sim.nach(id).typ;
          H.sim.setzeErfahrung(typ, Number(ep[typ]) || 0);
          p.haupt = H;
          p.heldId = id;
          p.kampf.team = [typ];
          (H.mit = H.mit || /* @__PURE__ */ new Set()).add(p);
          if (frist) clearTimeout(frist);
          console.log("Koop: Mitspieler kommt dazu", ort + "/" + karte, typ);
          if (ws.readyState === import_websocket.default.OPEN) los();
          return;
        }
        if (!darfKaempfen(siege, ort, karte)) {
          console.log("Kampf abgelehnt: noch nicht freigeschaltet", ort, karte, [...siege].join(","));
          ws.close(4403, "noch nicht freigeschaltet");
          return;
        }
        const R = raum && CODE.test(raum) ? raeume.get(raum) : void 0, gruppe = R && R.fuehrer === nutzer ? R : void 0, menschen = gruppe ? Math.min(3, [...gruppe.warten].filter((w) => w.nutzer !== nutzer).length + 1) : 1;
        setzeKarte(KARTEN[karte], FEIN);
        setzeStaerke(ORTSTUFE[ort], Math.max(1 + mit.length, menschen));
        for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k];
        for (const k of Object.keys(HELDENEP)) delete HELDENEP[k];
        for (const [h, v] of Object.entries(ep)) {
          HELDENEP[h] = Number(v) || 0;
          HELDENSTUFE[h] = stufeAusEp(HELDENEP[h]);
        }
        p.sim = new Sim(held, (Date.now() ^ Math.random() * 1e9) >>> 0, mit);
        if (frist) clearTimeout(frist);
        console.log("Kampf beginnt:", ort + "/" + karte, gruppe ? "(Koop " + gruppe.code + ")" : "");
        if (ws.readyState === import_websocket.default.OPEN) los();
        if (gruppe) {
          gruppe.kampf = p;
          p.raum = gruppe.code;
          gruppe.zuletzt = Date.now();
          const erwartet = [...gruppe.warten].filter((w) => w.nutzer !== nutzer).length;
          if (erwartet) p.start = { bis: Date.now() + 2e4, erwartet, los: 0, zuletzt: "" };
          losMelden(gruppe, ort, karte);
        }
      } catch (err) {
        console.error("Anmeldung fehlgeschlagen [Schl\xFCssel in Render: " + SCHLUESSELART + "]:", err.message);
        ws.close(4503, "anmeldung nicht moeglich");
      }
      return;
    }
    if (e.t === "verlassen") {
      void buchen(p, true);
      return;
    }
    try {
      if (p.sim) p.sim.eingabe(e);
      else if (p.haupt && p.haupt.sim && p.heldId) p.haupt.sim.eingabe(e, p.heldId);
    } catch (err) {
      console.error("Eingabe:", err.message);
    }
  });
  const weg2 = () => {
    if (!plaetze.has(p)) return;
    plaetze.delete(p);
    if (frist) clearTimeout(frist);
    void buchen(p, true);
    if (p.haupt) {
      p.haupt.mit?.delete(p);
      if (p.haupt.sim && p.heldId) p.haupt.sim.freigeben(p.heldId);
    }
    if (p.mit) for (const m of p.mit) {
      void buchen(m, true).finally(() => {
        if (m.ws.readyState === import_websocket.default.OPEN) {
          m.ws.send(JSON.stringify({ t: "koopende" }));
          m.ws.close(4410, "anfuehrer weg");
        }
      });
    }
    if (p.raum) {
      const R = raeume.get(p.raum);
      if (R && R.kampf === p) {
        R.kampf = null;
        R.zuletzt = Date.now();
        gruppeMelden(R);
      }
    }
  };
  ws.on("close", weg2);
  ws.on("error", weg2);
});
function warten(ws, code, fuehrer) {
  if (!CODE.test(code) || !SB_URL || !SB_KEY) {
    ws.close(4400, "code ungueltig");
    return;
  }
  let w = null, R;
  const frist = setTimeout(() => {
    if (!w) ws.close(4401, "keine anmeldung");
  }, 1e4);
  let fenster = Date.now(), zahl = 0;
  ws.on("message", async (roh) => {
    const jetzt = Date.now();
    if (jetzt - fenster > 1e3) {
      fenster = jetzt;
      zahl = 0;
    }
    if (++zahl > 40) return;
    let e;
    try {
      e = JSON.parse(String(roh));
    } catch {
      return;
    }
    if (w && R) {
      dorf(R, w, e);
      return;
    }
    if (w) return;
    if (e.t !== "anmeldung") return;
    const nutzer = await nutzerAus(String(e.token || "")).catch(() => null);
    if (!nutzer) {
      ws.close(4401, "anmeldung ungueltig");
      return;
    }
    clearTimeout(frist);
    const name = String(e.name || "Held").replace(/[<>&"]/g, "").slice(0, 24) || "Held", held = HELDEN[String(e.held)] ? String(e.held) : "schildwaechter";
    R = raeume.get(code);
    if (fuehrer) {
      if (R && R.fuehrer !== nutzer) {
        ws.close(4409, "code vergeben");
        return;
      }
      if (!R) {
        R = { code, fuehrer: nutzer, fuehrerName: name, warten: /* @__PURE__ */ new Set(), kampf: null, zuletzt: Date.now(), ort: null, merker: {}, lager: null };
        raeume.set(code, R);
      }
    } else if (!R) {
      ws.close(4404, "gruppe unbekannt");
      return;
    }
    for (const o of [...R.warten]) if (o.nutzer === nutzer) {
      R.warten.delete(o);
      try {
        o.ws.close(1e3, "neu verbunden");
      } catch {
      }
    }
    if (new Set([...R.warten].map((o) => o.nutzer).concat(nutzer)).size > 3) {
      ws.close(4409, "gruppe voll");
      return;
    }
    const vergeben = new Set([...R.warten].map((o) => o.held));
    let held2 = held;
    if (vergeben.has(held2)) held2 = Object.keys(HELDEN).find((k) => !vergeben.has(k)) || held2;
    w = { ws, nutzer, name, held: held2 };
    R.warten.add(w);
    R.zuletzt = Date.now();
    console.log("Koop: Gruppe", code, fuehrer ? "gegr\xFCndet" : "beigetreten", "\xB7", R.warten.size, "da");
    gruppeMelden(R);
    if (!fuehrer && R.kampf && R.kampf.kampf && !R.kampf.kampf.fertig) ws.send(JSON.stringify({ t: "los", ort: R.kampf.kampf.ort, kampf: R.kampf.kampf.karte }));
    else if (!fuehrer && R.ort) ws.send(JSON.stringify({ t: "ort", ort: R.ort, merker: R.merker }));
  });
  const weg2 = () => {
    clearTimeout(frist);
    if (R && w) {
      R.warten.delete(w);
      R.zuletzt = Date.now();
      gruppeMelden(R);
      const m = JSON.stringify({ t: "weg", n: w.name });
      for (const o of R.warten) if (o.ws.readyState === import_websocket.default.OPEN) o.ws.send(m);
    }
  };
  ws.on("close", weg2);
  ws.on("error", weg2);
  const lebt = setInterval(() => {
    if (ws.readyState !== import_websocket.default.OPEN) {
      clearInterval(lebt);
      return;
    }
    try {
      ws.ping();
    } catch {
    }
  }, 25e3);
}
function startHalt(p, jetzt) {
  const s = p.start;
  const da = p.mit ? p.mit.size : 0;
  if (!s.los) {
    if (da < s.erwartet && jetzt < s.bis) {
      const t = `Warte auf deine Mitspieler \u2026 ${da} / ${s.erwartet} da (noch ${Math.ceil((s.bis - jetzt) / 1e3)} s)`;
      startMelden(p, t);
      return true;
    }
    s.los = jetzt + 3e3;
  }
  if (jetzt < s.los) {
    startMelden(p, `Alle bereit \u2013 los in ${Math.ceil((s.los - jetzt) / 1e3)} \u2026`);
    return true;
  }
  startMelden(p, "");
  p.start = void 0;
  return false;
}
function startMelden(p, text) {
  const s = p.start;
  if (!s || s.zuletzt === text) return;
  s.zuletzt = text;
  const m = JSON.stringify({ t: "koopstart", text });
  for (const q of [p, ...p.mit || []]) if (q.ws.readyState === import_websocket.default.OPEN) q.ws.send(m);
}
var MERK = /^[a-z][a-z0-9_]{0,39}$/;
var ORTNAME = /^[a-z]{2,20}$/;
function dorf(R, w, e) {
  const an = (m, auch = false) => {
    const s = JSON.stringify(m);
    for (const o of R.warten) if ((auch || o !== w) && o.ws.readyState === import_websocket.default.OPEN) o.ws.send(s);
  };
  const fuehrer = w.nutzer === R.fuehrer;
  R.zuletzt = Date.now();
  if (e.t === "lager" && fuehrer) {
    R.lager = typeof e.ort === "string" && ORTNAME.test(e.ort) ? e.ort : null;
    for (const o of R.warten) o.bereit = false;
    gruppeMelden(R);
    return;
  }
  if (e.t === "held" && typeof e.held === "string" && HELDEN[e.held]) {
    const h = e.held;
    if ([...R.warten].some((o) => o !== w && o.held === h)) return;
    w.held = h;
    w.bereit = false;
    gruppeMelden(R);
    return;
  }
  if (e.t === "bereit") {
    w.bereit = Boolean(e.ja);
    gruppeMelden(R);
    return;
  }
  if (e.t === "ort" && fuehrer) {
    R.lager = null;
    const ort = typeof e.ort === "string" && ORTNAME.test(e.ort) ? e.ort : null;
    const neu = ort !== R.ort;
    R.ort = ort;
    if (ort && e.merker && typeof e.merker === "object") {
      const m = neu ? {} : R.merker;
      for (const k of Object.keys(e.merker).slice(0, 200)) if (MERK.test(k) && e.merker[k] === true) m[k] = true;
      R.merker = m;
    }
    if (!ort) R.merker = {};
    an({ t: "ort", ort: R.ort, merker: R.merker });
  } else if (e.t === "merker" && R.ort && typeof e.setzt === "string" && MERK.test(e.setzt)) {
    R.merker[e.setzt] = true;
    an({ t: "merker", merker: R.merker }, true);
  } else if (e.t === "pos" && R.ort) {
    const z = (v) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) < 2e4;
    if (!z(e.x) || !z(e.y)) return;
    an({ t: "pos", n: w.name, held: w.held, x: Math.round(e.x), y: Math.round(e.y), f: e.f ? 1 : 0, l: e.l ? 1 : 0 });
  } else if (e.t === "sage" && R.ort && typeof e.id === "string" && MERK.test(e.id) && typeof e.setzt === "string" && MERK.test(e.setzt)) an({ t: "sage", von: w.name, id: e.id, setzt: e.setzt });
  else if (e.t === "tuer" && R.ort && typeof e.kampf === "string" && MERK.test(e.kampf)) {
    const s = JSON.stringify({ t: "tuer", kampf: e.kampf, von: w.name });
    for (const o of R.warten) if (o.nutzer === R.fuehrer && o.ws.readyState === import_websocket.default.OPEN) o.ws.send(s);
  }
}
var n = 0;
setInterval(() => {
  n++;
  const jetzt = Date.now();
  for (const p of plaetze) {
    if (jetzt - p.zuletzt > RUHE_MS) {
      p.ws.close(1e3, "ruhe");
      continue;
    }
    if (!p.sim) continue;
    if (p.start && startHalt(p, jetzt)) {
      if (n % ZUSTAND_JE === 0 && p.ws.readyState === import_websocket.default.OPEN) {
        const z = p.sim.zustand();
        p.ws.send(JSON.stringify({ t: "z", z }));
        if (p.mit) {
          for (const m of p.mit) if (m.ws.readyState === import_websocket.default.OPEN) m.ws.send(JSON.stringify({ t: "z", z: { ...z, ich: p.sim.ichVon(m.heldId || 0) } }));
        }
      }
      continue;
    }
    try {
      p.sim.schritt();
    } catch (err) {
      console.error("Schritt:", err.stack);
      p.ws.close(1011, "fehler");
      plaetze.delete(p);
      continue;
    }
    if (n % ZUSTAND_JE === 0 && p.ws.readyState === import_websocket.default.OPEN && p.ws.bufferedAmount < 65536) {
      const z = p.sim.zustand();
      if (p.kampf && !p.kampf.fertig) {
        for (const ev of z.ev) if (ev.a === "ep") p.kampf.ep += ev.n;
      }
      if (p.kampf && !p.kampf.gesiegt && z.phase === "sieg") void siegEintragen(p);
      p.ws.send(JSON.stringify({ t: "z", z }));
      if (p.mit) for (const m of p.mit) {
        if (m.kampf && !m.kampf.fertig) {
          for (const ev of z.ev) if (ev.a === "ep") m.kampf.ep += ev.n;
        }
        if (m.kampf && !m.kampf.gesiegt && z.phase === "sieg") void siegEintragen(m);
        if (m.ws.readyState === import_websocket.default.OPEN && m.ws.bufferedAmount < 65536) m.ws.send(JSON.stringify({ t: "z", z: { ...z, ich: p.sim.ichVon(m.heldId || 0) } }));
        m.zuletzt = jetzt;
      }
    }
    zwischenbuchen(p, p.sim, jetzt);
    if (p.mit) for (const m of p.mit) zwischenbuchen(m, p.sim, jetzt);
  }
}, 1e3 / TICK);
var SCHLUESSELART = SB_KEY.startsWith("sb_secret_") ? "Geheimschl\xFCssel (sb_secret_\u2026)" : SB_KEY.startsWith("eyJ") ? "service_role-Schl\xFCssel (JWT)" : SB_KEY.startsWith("sb_publishable_") ? "FALSCH: das ist der \xF6ffentliche Schl\xFCssel (sb_publishable_\u2026) \u2013 gebraucht wird der geheime (sb_secret_\u2026)" : SB_KEY ? "unbekannte Form" : "fehlt";
http.listen(PORT, () => {
  console.log("SUPABASE_SERVICE_KEY:", SCHLUESSELART);
  console.log(`Mythara Echtzeit l\xE4uft auf Port ${PORT} (${TICK} Schritte je Sekunde, Kampagnen ${SB_URL && SB_KEY ? "an" : "aus \u2013 SUPABASE_URL/SUPABASE_SERVICE_KEY fehlen"})`);
});
