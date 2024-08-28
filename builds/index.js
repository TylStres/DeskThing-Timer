var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// timer.js
var require_timer = __commonJS({
  "timer.js"(exports2, module2) {
    var path2 = require("path");
    var fs = require("fs");
    var timerHandler2 = class {
      constructor(sendDataToMainFn) {
        this.sendDataToMainFn = sendDataToMainFn;
        this.audio_url = void 0;
        this.settings = {
          "auto_switch_view": {
            "value": "true",
            "label": "Auto Focus",
            "options": [
              {
                "value": "false",
                "label": "Disabled"
              },
              {
                "value": "true",
                "label": "Enabled"
              }
            ]
          },
          "notifications": {
            "value": "true",
            "label": "Notifications",
            "options": [
              {
                "value": "false",
                "label": "Disabled"
              },
              {
                "value": "true",
                "label": "Enabled"
              }
            ]
          }
          // "screen_flash": {
          //   "value": 'false',
          //   "label": "Screen Flash",
          //   "options": [
          //     {
          //       "value": 'true',
          //       "label": "ON"
          //     },
          //     {
          //       "value": 'false',
          //       "label": "off"
          //     },
          //   ]        
          // },
          // "alert_sound": {
          //   "value": 'true',
          //   "label": "Alert Sound",
          //   "options": [
          //     {
          //       "value": 'true',
          //       "label": "ON"
          //     },
          //     {
          //       "value": 'false',
          //       "label": "off"
          //     },
          //   ]        
          // }
        };
        const manifestPath = path2.join(__dirname, "manifest.json");
        this.manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        this.sendLog("Manifest loaded:" + this.manifest);
      }
      // utility function to send data to and from the server (logs or errors - errors prompt the user. You can also have 'message' which will have a gray message on the desktop UI)
      async sendLog(message) {
        this.sendDataToMainFn("log", message);
      }
      async sendError(message) {
        this.sendDataToMainFn("error", message);
      }
      async sendMessage(message) {
        this.sendDataToMainFn("message", message);
      }
    };
    module2.exports = timerHandler2;
  }
});

// node_modules/sound-play/build/main.js
var require_main = __commonJS({
  "node_modules/sound-play/build/main.js"(exports2, module2) {
    module2.exports = function(e) {
      var r = {};
      function t(n) {
        if (r[n]) return r[n].exports;
        var o = r[n] = { i: n, l: false, exports: {} };
        return e[n].call(o.exports, o, o.exports, t), o.l = true, o.exports;
      }
      return t.m = e, t.c = r, t.d = function(e2, r2, n) {
        t.o(e2, r2) || Object.defineProperty(e2, r2, { enumerable: true, get: n });
      }, t.r = function(e2) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
      }, t.t = function(e2, r2) {
        if (1 & r2 && (e2 = t(e2)), 8 & r2) return e2;
        if (4 & r2 && "object" == typeof e2 && e2 && e2.__esModule) return e2;
        var n = /* @__PURE__ */ Object.create(null);
        if (t.r(n), Object.defineProperty(n, "default", { enumerable: true, value: e2 }), 2 & r2 && "string" != typeof e2) for (var o in e2) t.d(n, o, function(r3) {
          return e2[r3];
        }.bind(null, o));
        return n;
      }, t.n = function(e2) {
        var r2 = e2 && e2.__esModule ? function() {
          return e2.default;
        } : function() {
          return e2;
        };
        return t.d(r2, "a", r2), r2;
      }, t.o = function(e2, r2) {
        return Object.prototype.hasOwnProperty.call(e2, r2);
      }, t.p = "", t(t.s = 0);
    }([function(e, r, t) {
      const { exec: n } = t(1), o = t(2).promisify(n);
      e.exports = { play: async (e2, r2 = 0.5) => {
        const t2 = "darwin" === process.platform ? Math.min(2, 2 * r2) : r2, n2 = "darwin" === process.platform ? ((e3, r3) => `afplay "${e3}" -v ${r3}`)(e2, t2) : ((e3, r3) => `powershell -c Add-Type -AssemblyName presentationCore; $player = New-Object system.windows.media.mediaplayer; ${((e4) => `$player.open('${e4}');`)(e3)} $player.Volume = ${r3}; $player.Play(); Start-Sleep 1; Start-Sleep -s $player.NaturalDuration.TimeSpan.TotalSeconds;Exit;`)(e2, t2);
        try {
          await o(n2);
        } catch (e3) {
          throw e3;
        }
      } };
    }, function(e, r) {
      e.exports = require("child_process");
    }, function(e, r) {
      e.exports = require("util");
    }]);
  }
});

// index.js
var path = require("path");
var timerHandler = require_timer();
var sound = require_main();
var filePath = path.resolve(__dirname, "alert.mp3");
var timer;
async function start({ sendDataToMain }) {
  timer = new timerHandler(sendDataToMain);
  sendDataToMain("get", "data");
  timer.sendLog("App started successfully!");
  timer.sendDataToMainFn("data", { type: "message", data: "Hello from the timer app!" });
}
async function stop() {
  timer.sendLog("App stopping...");
  timer = null;
}
async function onMessageFromMain(event, ...args) {
  timer.sendLog(`Received event ${event} with args `, ...args);
  try {
    switch (event) {
      case "message":
        if (args[0] === "play-sound") {
          try {
            sound.play(`"${filePath}"`, 1);
          } catch (error) {
            console.error("Error playing sound:", error);
          }
        }
        if (args[0] === "start") {
          try {
            sound.play(`"${filePath}"`, 1);
          } catch (error) {
            console.error("Error playing sound:", error);
          }
        }
        break;
      case "data":
        break;
      case "callback-data":
        break;
      case "get":
        handleGet(...args);
        break;
      case "set":
        handleSet(...args);
        break;
      default:
        timer.sendError("Unknown message:" + event);
        break;
    }
  } catch (error) {
    timer.sendError("Error in onMessageFromMain:" + error);
  }
}
var handleGet = async (...args) => {
  if (args[0] == null) {
    timer.sendError("No args provided");
    return;
  }
  let response;
  switch (args[0].toString()) {
    case "manifest":
      response = timer.manifest;
      timer.sendDataToMainFn("manifest", response);
      break;
    default:
      response = timer.handleCommand("get", ...args);
      break;
  }
  timer.sendDataToMainFn("data", response);
};
var handleSet = async (...args) => {
  if (args[0] == null) {
    timer.sendError("No args provided");
    return;
  }
  let response;
  switch (args[0].toString()) {
    case "update_setting":
      break;
    default:
      response = timer.handleCommand("set", ...args);
      break;
  }
  if (response != null) {
    timer.sendDataToMainFn("data", response);
  }
};
module.exports = { start, onMessageFromMain, stop };
