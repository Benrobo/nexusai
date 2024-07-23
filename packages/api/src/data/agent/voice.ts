type VoiceType =
  | "error-occurred"
  | "datasource-notfound"
  | "number-notfound"
  | "unable-to-assist";

interface AgentVoice {
  type: VoiceType;
  path: string;
}

const defaultAgentVoices = [
  {
    type: "error-occurred",
    path: "/voice/error-occurred.mp3",
  },
  {
    type: "datasource-notfound",
    path: "/voice/datasource-notfound.mp3",
  },
  {
    type: "number-notfound",
    path: "/voice/number-notfound.mp3",
  },
  {
    type: "unable-to-assist",
    path: "/voice/unable-to-assist.mp3",
  },
] satisfies AgentVoice[];

export default defaultAgentVoices;
