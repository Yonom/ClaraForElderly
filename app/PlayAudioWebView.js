import WebView from "react-native-webview";
import { useRef } from "react";
import { Audio } from "expo-av";

export const PlayAudioWebView = (props) => {
  const injectedJavaScript = `(() => {
    globalThis.playAudioData = (audioData, onEnded) => {
      globalThis.playAudioDataOnEnded = onEnded;
      globalThis.ReactNativeWebView.postMessage(JSON.stringify({
        type: "PLAY_AUDIO",
        audioData,
      }));
    };
  })();
  true;`;

  const webviewRef = useRef();
  return (
    <WebView
      {...props}
      ref={webviewRef}
      injectedJavaScript={injectedJavaScript}
      onMessage={async (event) => {
        const message = JSON.parse(event.nativeEvent.data);
        if (message.type === "PLAY_AUDIO") {
          const { sound } = await Audio.Sound.createAsync(
            { uri: message.audioData },
            { shouldPlay: true },
            (status) => {
              if (status.didJustFinish) {
                webviewRef.current.injectJavaScript(
                  "globalThis.playAudioDataOnEnded?.();true;"
                );
                sound.unloadAsync();
              }
            }
          );
        }
      }}
    />
  );
};
