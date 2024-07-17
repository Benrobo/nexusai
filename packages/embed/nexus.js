// Nexus Embed SDK

const CONFIG = {
  API_URL: "http://localhost:4001/api",
  CLIENT_URL: "http://localhost:3010",
  API_VERSION: "",
  IFRAME_ID: "nexus-embed-iframe",
  NEXUS_WRAPPER_ID: "nexus-embed-wrapper",
};

class NexusWidget {
  constructor() {}

  // init
  init(agentId) {
    this.agentId = agentId;
    this.initializeIframe();
    this.mountIframe();
    this.handle_bootstrap();
  }

  mountIframe() {
    if (!document.getElementById(CONFIG.IFRAME_ID)) {
      window.addEventListener("message", this.receiveMessage, false);
      const wrapper = document.createElement("div");
      wrapper.id = CONFIG.NEXUS_WRAPPER_ID;
      wrapper.style = `z-index: ${Number.MAX_SAFE_INTEGER}; width: 0; height: 0; position: relative;`;
      wrapper.appendChild(this.iframe);
      document.body.appendChild(wrapper);
    }
  }

  initializeIframe() {
    if (!this.agentId) {
      throw new Error("Agent ID is required");
    }
    this.iframe = document.createElement("iframe");
    this.iframe.id = CONFIG.IFRAME_ID;
    this.iframe.src = `${CONFIG.CLIENT_URL}?agent_id=${this.agentId}`;
    this.iframe.style = `border: none; width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: ${Number.MAX_SAFE_INTEGER};`;
  }

  receieveMessage(event) {
    if (event && event.data) {
      switch (event.data.type) {
        case "logout":
          this.logout();
          break;
        default:
          break;
      }
    }
    // window.addEventListener("message", async (event) => {
    //   const data = event.data;
    //   const payload = data.payload;
    //   if (data.event === "logout") {
    //     await window.nexusai.logout();
    //   }
    // });
  }

  async logout() {
    try {
      const response = await fetch(
        `${CONFIG.API_URL}/user/chat-widget-account/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to logout");
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  }

  handle_bootstrap() {
    const nexusApi = {};
    nexusApi["logout"] = this.logout;

    window.nexusai = nexusApi;
  }
}

const nexusai = new NexusWidget();
