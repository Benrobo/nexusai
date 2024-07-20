export type ValidIntegrations = "google_calendar" | "telegram";

const supportedIntegrations = [
  {
    name: "google_calendar",
    displayName: "Calendar Booking Page",
    description: "Allow customers to book appointments with you.",
    logo: "/assets/logo/google-calendar-icon.png",
    howto_video: "/assets/videos/google-calendar.mp4",
  },
  {
    name: "telegram",
    displayName: "Telegram Bot",
    description: "Provide customer support via telegram bot.",
    logo: "/assets/logo/telegram.svg",
    howto_video: "/assets/videos/google-calendar.mp4",
  },
] satisfies {
  name: ValidIntegrations;
  displayName: string;
  description: string;
  logo: string;
  howto_video: string;
}[];

export default supportedIntegrations;
