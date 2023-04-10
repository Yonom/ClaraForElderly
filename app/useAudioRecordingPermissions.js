import { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { Alert } from "react-native";

export const useAudioRecordingPermissions = () => {
  const loadingRef = useRef(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const load = async () => {
      const res = await Audio.requestPermissionsAsync();
      if (res.granted) {
        setHasPermissions(true);
      } else {
        Alert.alert(
          "Clara needs microphone access. Please grant this via the settings app."
        );
      }
    };
    load();
  }, []);
  return hasPermissions;
};
