const _0x387b0d = _0x3c6b;
(function (_0x5cce37, _0x123a4c) {
  const _0x2cc6af = _0x3c6b,
    _0x1b2b18 = _0x5cce37();
  while (!![]) {
    try {
      const _0x194c67 =
        -parseInt(_0x2cc6af(0x15e)) / 0x1 +
        parseInt(_0x2cc6af(0x192)) / 0x2 +
        (parseInt(_0x2cc6af(0x176)) / 0x3) *
          (parseInt(_0x2cc6af(0x174)) / 0x4) +
        -parseInt(_0x2cc6af(0x175)) / 0x5 +
        parseInt(_0x2cc6af(0x14f)) / 0x6 +
        (-parseInt(_0x2cc6af(0x16e)) / 0x7) *
          (parseInt(_0x2cc6af(0x152)) / 0x8) +
        parseInt(_0x2cc6af(0x164)) / 0x9;
      if (_0x194c67 === _0x123a4c) break;
      else _0x1b2b18["push"](_0x1b2b18["shift"]());
    } catch (_0x551100) {
      _0x1b2b18["push"](_0x1b2b18["shift"]());
    }
  }
})(_0x149f, 0x5ec58);
const API_URL = "http://localhost:4001/api",
  CLIENT_URL = _0x387b0d(0x162),
  API_VERSION = "",
  IFRAME_ID = _0x387b0d(0x16b),
  NEXUS_WRAPPER_ID = "nexus-embed-wrapper",
  NEXUS_CHATBUBBLE_ID = "nexus-chatbubble-button",
  visible = NEXUS_WRAPPER_ID + _0x387b0d(0x170),
  hidden = NEXUS_WRAPPER_ID + "-hidden",
  mobileViewport = NEXUS_WRAPPER_ID + _0x387b0d(0x17a),
  ChevronDown = _0x387b0d(0x187),
  MessagesSquare = _0x387b0d(0x188);
function _0x149f() {
  const _0x3ed8ee = [
    "Failed\x20to\x20logout",
    "error",
    "12kyFUTk",
    "320155WiwaYD",
    "442317uZIUFh",
    "handleResponsiveness",
    "-visible\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20width:\x20450px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20height:\x20700px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x0a\x20\x20\x20\x20\x20\x20\x20\x20.",
    "\x0a\x20\x20\x20\x20\x20\x20\x20\x20.",
    "-mobile",
    "iframe",
    "contains",
    "postMessage",
    "agentId",
    "bind",
    "classList",
    "include",
    "MAX_SAFE_INTEGER",
    "DOMContentLoaded",
    "receiveMessage",
    "{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20width:\x200px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20height:\x200px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20position:\x20fixed;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20bottom:\x206rem;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20right:\x202rem;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20border-radius:\x2010px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20overflow:hidden;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20border:\x20.5px\x20solid\x20#ccc;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20transition:\x20all\x200.1s;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20z-index:\x20",
    "contentWindow",
    "\x0a<svg\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20width=\x2224\x22\x20height=\x2224\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20stroke=\x22currentColor\x22\x20stroke-width=\x222\x22\x20stroke-linecap=\x22round\x22\x20stroke-linejoin=\x22round\x22\x20class=\x22lucide\x20lucide-chevron-down\x22><path\x20d=\x22m6\x209\x206\x206\x206-6\x22/></svg>\x0a",
    "\x0a<svg\x20xmlns=\x22http://www.w3.org/2000/svg\x22\x20width=\x2224\x22\x20height=\x2224\x22\x20viewBox=\x220\x200\x2024\x2024\x22\x20fill=\x22none\x22\x20stroke=\x22currentColor\x22\x20stroke-width=\x222\x22\x20stroke-linecap=\x22round\x22\x20stroke-linejoin=\x22round\x22\x20class=\x22lucide\x20lucide-messages-square\x22><path\x20d=\x22M14\x209a2\x202\x200\x200\x201-2\x202H6l-4\x204V4c0-1.1.9-2\x202-2h8a2\x202\x200\x200\x201\x202\x202z\x22/><path\x20d=\x22M18\x209h2a2\x202\x200\x200\x201\x202\x202v11l-4-4h-6a2\x202\x200\x200\x201-2-2v-1\x22/></svg>\x0a",
    "-hidden\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20width:\x200px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20height:\x200px;\x0a\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x0a\x20\x20\x20\x20\x20\x20\x20\x20.",
    "resize",
    "remove",
    "innerHTML",
    "logout",
    ";\x20border-radius:\x2050%;\x20border:\x20none;\x20cursor:\x20pointer;",
    "setAttribute",
    "iframeOpen",
    "brand_color",
    "530064WdiJyH",
    "injectCss",
    "addEventListener",
    "onclick",
    "Agent\x20ID\x20is\x20required",
    "position:\x20fixed;\x20bottom:\x2020px;\x20right:\x2020px;\x20z-index:\x201000;\x20width:60px;\x20height:60px;\x20background-color:\x20",
    "add",
    "type",
    "#fff",
    "223872jmUuaP",
    "/user/chat-widget-account/logout",
    "initializeIframe",
    "44904yQLNuJ",
    "#000",
    "toggleIframe",
    "application/json",
    "appendChild",
    "getElementById",
    "src",
    "style",
    "handleBootstrap",
    "text_color",
    "body",
    "class",
    "509512nTUooC",
    "log",
    "data",
    "POST",
    "http://localhost:3010",
    "injectBubbleButton",
    "7207362IFlIAr",
    "widgetConfig",
    "border:\x20none;\x20width:\x20100%;\x20height:\x20100%;\x20z-index:\x20",
    "nexusai",
    "innerWidth",
    ";\x0a\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20\x20\x20\x20\x20.",
    "-hidden",
    "nexus-embed-iframe",
    "button",
    "createElement",
    "728fQyLZI",
    "message",
    "-visible",
    "init",
  ];
  _0x149f = function () {
    return _0x3ed8ee;
  };
  return _0x149f();
}
class NexusWidget {
  constructor() {
    const _0x1d865c = _0x387b0d;
    (this["iframeOpen"] = ![]),
      (this[_0x1d865c(0x165)] = {
        brand_color: _0x1d865c(0x153),
        text_color: _0x1d865c(0x14e),
      }),
      (self = this);
  }
  [_0x387b0d(0x171)](_0x3eb269) {
    const _0x5d1289 = _0x387b0d;
    (this[_0x5d1289(0x17e)] = _0x3eb269),
      this[_0x5d1289(0x193)](),
      this[_0x5d1289(0x151)](),
      this["mountIframe"](),
      this["handleBootstrap"](),
      this[_0x5d1289(0x163)](),
      window[_0x5d1289(0x194)](_0x5d1289(0x18a), this[_0x5d1289(0x177)], ![]),
      window[_0x5d1289(0x194)](
        _0x5d1289(0x183),
        this[_0x5d1289(0x177)][_0x5d1289(0x17f)](self),
        ![]
      );
  }
  ["mountIframe"]() {
    const _0x2dc35d = _0x387b0d;
    if (!document[_0x2dc35d(0x157)](IFRAME_ID)) {
      window["addEventListener"](
        _0x2dc35d(0x16f),
        this[_0x2dc35d(0x184)][_0x2dc35d(0x17f)](self),
        ![]
      );
      const _0x32b88b = document[_0x2dc35d(0x16d)]("div");
      (_0x32b88b["id"] = NEXUS_WRAPPER_ID),
        _0x32b88b[_0x2dc35d(0x18f)](
          _0x2dc35d(0x15d),
          NEXUS_WRAPPER_ID + "\x20" + NEXUS_WRAPPER_ID + _0x2dc35d(0x16a)
        ),
        _0x32b88b[_0x2dc35d(0x156)](this[_0x2dc35d(0x17b)]),
        document[_0x2dc35d(0x15c)][_0x2dc35d(0x156)](_0x32b88b);
    }
  }
  [_0x387b0d(0x151)]() {
    const _0x35a329 = _0x387b0d;
    if (!this[_0x35a329(0x17e)]) throw new Error(_0x35a329(0x196));
    (this["iframe"] = document["createElement"]("iframe")),
      (this["iframe"]["id"] = IFRAME_ID),
      (this["iframe"][_0x35a329(0x158)] = CLIENT_URL + "/" + this["agentId"]),
      (this[_0x35a329(0x17b)]["style"] =
        _0x35a329(0x166) + Number["MAX_SAFE_INTEGER"] + ";");
  }
  [_0x387b0d(0x184)](_0x5e5d8d) {
    const _0x28f87a = _0x387b0d;
    console[_0x28f87a(0x15f)]({ event: _0x5e5d8d });
    if (_0x5e5d8d && _0x5e5d8d[_0x28f87a(0x160)])
      switch (_0x5e5d8d[_0x28f87a(0x160)][_0x28f87a(0x14d)]) {
        case _0x28f87a(0x18d):
          this[_0x28f87a(0x18d)]();
          break;
        case "close-frame":
          this[_0x28f87a(0x154)]();
          break;
        default:
          break;
      }
  }
  [_0x387b0d(0x177)]() {
    const _0x3d7e56 = _0x387b0d,
      _0x46484d = document["getElementById"](NEXUS_WRAPPER_ID),
      _0x5403c1 = window[_0x3d7e56(0x168)];
    _0x46484d[_0x3d7e56(0x180)]["contains"](NEXUS_WRAPPER_ID + _0x3d7e56(0x170))
      ? _0x5403c1 <= 0x2bc
        ? _0x46484d[_0x3d7e56(0x180)][_0x3d7e56(0x198)](mobileViewport)
        : _0x46484d[_0x3d7e56(0x180)][_0x3d7e56(0x18b)](mobileViewport)
      : _0x5403c1 <= 0x2bc &&
          !_0x46484d["classList"]["contains"](
            NEXUS_WRAPPER_ID + _0x3d7e56(0x170)
          )
        ? _0x46484d["classList"][_0x3d7e56(0x18b)](mobileViewport)
        : (_0x46484d[_0x3d7e56(0x180)]["remove"](mobileViewport),
          _0x46484d[_0x3d7e56(0x180)][_0x3d7e56(0x18b)](hidden));
  }
  [_0x387b0d(0x163)]() {
    const _0x4c4139 = _0x387b0d,
      _0x391c15 = document[_0x4c4139(0x16d)](_0x4c4139(0x16c));
    _0x391c15["setAttribute"]("id", NEXUS_CHATBUBBLE_ID),
      (_0x391c15["innerHTML"] = MessagesSquare),
      (_0x391c15[_0x4c4139(0x159)] =
        _0x4c4139(0x197) +
        (this[_0x4c4139(0x165)]?.[_0x4c4139(0x191)] ?? _0x4c4139(0x153)) +
        ";\x20color:\x20" +
        (this[_0x4c4139(0x165)]?.[_0x4c4139(0x15b)] ?? _0x4c4139(0x14e)) +
        _0x4c4139(0x18e)),
      (_0x391c15[_0x4c4139(0x195)] =
        this[_0x4c4139(0x154)][_0x4c4139(0x17f)](this)),
      document["body"]["appendChild"](_0x391c15);
  }
  [_0x387b0d(0x154)]() {
    const _0x21721b = _0x387b0d,
      _0x275d6f = document[_0x21721b(0x157)](NEXUS_WRAPPER_ID),
      _0x1cfda8 = document[_0x21721b(0x157)](NEXUS_CHATBUBBLE_ID);
    this[_0x21721b(0x190)] || _0x275d6f["classList"][_0x21721b(0x17c)](visible)
      ? (_0x275d6f[_0x21721b(0x180)]["remove"](visible),
        _0x275d6f[_0x21721b(0x180)][_0x21721b(0x18b)](mobileViewport),
        _0x275d6f["classList"][_0x21721b(0x198)](hidden),
        (_0x1cfda8[_0x21721b(0x18c)] = MessagesSquare),
        (this[_0x21721b(0x190)] = ![]),
        this["handleResponsiveness"]())
      : (_0x275d6f[_0x21721b(0x180)][_0x21721b(0x18b)](hidden),
        _0x275d6f[_0x21721b(0x180)][_0x21721b(0x198)](visible),
        (_0x1cfda8[_0x21721b(0x18c)] = ChevronDown),
        (this[_0x21721b(0x190)] = !![]),
        this[_0x21721b(0x177)]());
  }
  async [_0x387b0d(0x18d)]() {
    const _0x4401e7 = _0x387b0d;
    try {
      const _0x649776 = await fetch(API_URL + _0x4401e7(0x150), {
        credentials: _0x4401e7(0x181),
        method: _0x4401e7(0x161),
        headers: { "Content-Type": _0x4401e7(0x155) },
      });
      if (_0x649776["status"] !== 0xc8) throw new Error(_0x4401e7(0x172));
      this[_0x4401e7(0x17b)][_0x4401e7(0x186)][_0x4401e7(0x17d)](
        { type: "redirect-on-logout", payload: { chatbotId: this["agentId"] } },
        "*"
      );
    } catch (_0x534cbf) {
      console[_0x4401e7(0x173)](_0x534cbf);
    }
  }
  [_0x387b0d(0x15a)]() {
    const _0x55c0ac = _0x387b0d,
      _0x205f17 = {};
    (_0x205f17["logout"] = this[_0x55c0ac(0x18d)]),
      (window[_0x55c0ac(0x167)] = _0x205f17);
  }
  ["injectCss"]() {
    const _0x29a32f = _0x387b0d,
      _0x2a47d5 = document[_0x29a32f(0x16d)]("style");
    (_0x2a47d5[_0x29a32f(0x18c)] =
      _0x29a32f(0x179) +
      NEXUS_WRAPPER_ID +
      _0x29a32f(0x185) +
      Number[_0x29a32f(0x182)] +
      _0x29a32f(0x169) +
      NEXUS_WRAPPER_ID +
      _0x29a32f(0x189) +
      NEXUS_WRAPPER_ID +
      _0x29a32f(0x178) +
      NEXUS_WRAPPER_ID +
      "-mobile\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20width:\x20100%;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20height:\x20100%;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20bottom:\x200;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20right:\x200;\x0a\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x0a\x20\x20\x20\x20\x20\x20\x20\x20#nexus-chatbubble-button\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20display:\x20flex;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20justify-content:\x20center;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20align-items:\x20center;\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20box-shadow:\x200px\x200px\x2010px\x20rgba(0,0,0,0.1);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20transition:\x20all\x200.2s;\x0a\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x0a\x20\x20\x20\x20\x20\x20\x20\x20#nexus-chatbubble-button:active\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20transform:\x20scale(0.85);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20transition:\x20transform\x200.1s;\x0a\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x0a\x20\x20\x20\x20\x20\x20\x20\x20#nexus-chatbubble-button:target\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20transform:\x20scale(0.60);\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20transition:\x20transform\x200.1s;\x0a\x20\x20\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20"),
      document["head"][_0x29a32f(0x156)](_0x2a47d5);
  }
}
function _0x3c6b(_0x316abe, _0x189381) {
  const _0x149f98 = _0x149f();
  return (
    (_0x3c6b = function (_0x3c6bc6, _0x3b3cc6) {
      _0x3c6bc6 = _0x3c6bc6 - 0x14d;
      let _0x1de588 = _0x149f98[_0x3c6bc6];
      return _0x1de588;
    }),
    _0x3c6b(_0x316abe, _0x189381)
  );
}
const nexusai = new NexusWidget();
