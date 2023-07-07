import { PlayAudioWebView } from "./PlayAudioWebView";
import { useAudioRecordingPermissions } from "./useAudioRecordingPermissions";
import { getDeviceLanguage } from "./getDeviceLanguage";

export default function App() {
  const hasPermissions = useAudioRecordingPermissions();
  if (!hasPermissions) return null;

  const lang = getDeviceLanguage();
  return (
    <PlayAudioWebView
      style={{ flex: 1 }}
      source={{ uri: "https://clara-for-elderly.vercel.app/?lang=" + lang }}
    />
  );
}
