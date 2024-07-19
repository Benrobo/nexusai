const MessageEventHandlers = {
  "redirect-on-logout": (event?: MessageEvent) => {
    const payload = event?.data.payload;
    window.location.href = `/${payload?.chatbotId}`;
  },
};

export default MessageEventHandlers;
