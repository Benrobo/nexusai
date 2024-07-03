export type ValidIntegrations = "google_calendar";

const supportedIntegrations = [
  {
    name: "google_calendar",
    displayName: "Calendar Booking Page",
    description: "Allow customers to book appointments with you.",
    logo: "/assets/logo/google-calendar-icon.png",
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
