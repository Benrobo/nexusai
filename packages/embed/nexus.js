// LOCAL
const API_URL = "http://localhost:4001/api";
const CLIENT_URL = "http://localhost:3010";

// PROD
// const API_URL = "https://nexusai-ecow3.ondigitalocean.app/api";
// const CLIENT_URL = "https://nexusai-chatbot.vercel.app";

const API_VERSION = "1.0.0";
const IFRAME_ID = "nexus-embed-iframe";
const NEXUS_WRAPPER_ID = "nexus-embed-wrapper";
const NEXUS_CHATBUBBLE_ID = "nexus-chatbubble-button";

const visible = `${NEXUS_WRAPPER_ID}-visible`;
const hidden = `${NEXUS_WRAPPER_ID}-hidden`;
const mobileViewport = `${NEXUS_WRAPPER_ID}-mobile`;

const ChevronDown = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
`;

const MessagesSquare = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-messages-square"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
`;

class NexusWidget {
  constructor() {
    this.iframeOpen = false;
    this.widgetConfig = {
      brand_color: "#000",
      text_color: "#fff",
    };

    self = this;
  }

  // init
  init(agentId) {
    this.agentId = agentId;
    this.injectCss();
    this.initializeIframe();
    this.mountIframe();
    this.handleBootstrap();
    this.injectBubbleButton();

    window.addEventListener("resize", this.handleResponsiveness, false);
    window.addEventListener(
      "DOMContentLoaded",
      this.handleResponsiveness.bind(self),
      false
    );
  }

  mountIframe() {
    if (!document.getElementById(IFRAME_ID)) {
      window.addEventListener("message", this.receiveMessage.bind(self), false);

      const wrapper = document.createElement("div");
      wrapper.id = NEXUS_WRAPPER_ID;
      wrapper.setAttribute(
        "class",
        `${NEXUS_WRAPPER_ID} ${NEXUS_WRAPPER_ID}-hidden`
      );
      wrapper.appendChild(this.iframe);
      document.body.appendChild(wrapper);
    }
  }

  initializeIframe() {
    if (!this.agentId) {
      throw new Error("Agent ID is required");
    }
    this.iframe = document.createElement("iframe");
    this.iframe.id = IFRAME_ID;
    this.iframe.src = `${CLIENT_URL}/${this.agentId}`;
    this.iframe.style = `border: none; width: 100%; height: 100%; z-index: ${Number.MAX_SAFE_INTEGER};`;
  }

  receiveMessage(event) {
    console.log({ event });
    if (event && event.data) {
      switch (event.data.type) {
        case "logout":
          this.logout();
          break;

        case "close-frame":
          this.toggleIframe();
          break;
        default:
          break;
      }
    }
  }
  handleResponsiveness() {
    const wrapper = document.getElementById(NEXUS_WRAPPER_ID);
    const innerWidth = window.innerWidth;

    if (wrapper.classList.contains(`${NEXUS_WRAPPER_ID}-visible`)) {
      if (innerWidth <= 700) {
        wrapper.classList.add(mobileViewport);
      } else {
        wrapper.classList.remove(mobileViewport);
      }
    } else {
      if (
        innerWidth <= 700 &&
        !wrapper.classList.contains(`${NEXUS_WRAPPER_ID}-visible`)
      ) {
        wrapper.classList.remove(mobileViewport);
      } else {
        wrapper.classList.remove(mobileViewport);
        wrapper.classList.remove(hidden);
      }
    }
  }

  injectBubbleButton() {
    const button = document.createElement("button");
    button.setAttribute("id", NEXUS_CHATBUBBLE_ID);
    button.innerHTML = MessagesSquare;
    button.style = `position: fixed; bottom: 20px; right: 20px; z-index: 1000; width:60px; height:60px; background-color: ${this.widgetConfig?.brand_color ?? "#000"}; color: ${this.widgetConfig?.text_color ?? "#fff"}; border-radius: 50%; border: none; cursor: pointer;`;
    button.onclick = this.toggleIframe.bind(this);
    document.body.appendChild(button);
  }

  toggleIframe() {
    const wrapper = document.getElementById(NEXUS_WRAPPER_ID);
    const chatBubble = document.getElementById(NEXUS_CHATBUBBLE_ID);

    if (this.iframeOpen || wrapper.classList.contains(visible)) {
      wrapper.classList.remove(visible);
      wrapper.classList.remove(mobileViewport);
      wrapper.classList.add(hidden);
      chatBubble.innerHTML = MessagesSquare;
      this.iframeOpen = false;
      this.handleResponsiveness();
    } else {
      wrapper.classList.remove(hidden);
      wrapper.classList.add(visible);
      chatBubble.innerHTML = ChevronDown;
      this.iframeOpen = true;
      this.handleResponsiveness();
    }
  }

  async logout() {
    try {
      const response = await fetch(
        `${API_URL}/user/chat-widget-account/logout`,
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to logout");
      }

      // post a message to redirect back to iframe
      this.iframe.contentWindow.postMessage(
        {
          type: "redirect-on-logout",
          payload: {
            chatbotId: this.agentId,
          },
        },
        "*"
      );
    } catch (error) {
      console.error(error);
    }
  }

  handleBootstrap() {
    const nexusApi = {};
    nexusApi["logout"] = this.logout;

    window.nexusai = nexusApi;
  }

  injectCss() {
    const style = document.createElement("style");
    style.innerHTML = `
        .${NEXUS_WRAPPER_ID}{
            width: 0px;
            height: 0px;
            position: fixed;
            bottom: 6rem;
            right: 2rem;
            border-radius: 10px;
            overflow:hidden;
            border: .5px solid #ccc;
            transition: all 0.1s;
            z-index: ${Number.MAX_SAFE_INTEGER};
        }
        .${NEXUS_WRAPPER_ID}-hidden {
            width: 0px;
            height: 0px;
        }

        .${NEXUS_WRAPPER_ID}-visible {
            width: 450px;
            height: 700px;
        }

        .${NEXUS_WRAPPER_ID}-mobile {
            width: 100%;
            height: 100%;
            bottom: 0;
            right: 0;
        }

        #nexus-chatbubble-button {
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
            transition: all 0.2s;
        }

        #nexus-chatbubble-button:active {
            transform: scale(0.85);
            transition: transform 0.1s;
        }

        #nexus-chatbubble-button:target {
            transform: scale(0.60);
            transition: transform 0.1s;
        }
    `;
    document.head.appendChild(style);
  }
}

const nexusai = new NexusWidget();
