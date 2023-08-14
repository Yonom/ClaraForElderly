const SpeechRecognition =
  globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;

const webSpeech = ({ lang, onMessage }) => {
  return {
    startRecording: () => {
      // dummy
      const recognition = new SpeechRecognition();
      recognition.start();
      recognition.stop();
    },
    resumeRecording: () => {
      const recognition = new SpeechRecognition();

      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const result = event.results[0];
        const hasUnfinalizedChanges = !result.isFinal;
        const transcript = result[0].transcript;
        onMessage(transcript, hasUnfinalizedChanges);
      };
      recognition.onspeechend = () => {
        recognition.stop();
      };

      recognition.start();
    },
  };
};

export const webSpeechListener = ({ lang, onInput, onInputComplete }) => {
  const recorder = webSpeech({
    lang,
    onMessage: async (message, hasUnfinalizedChanges) => {
      onInput(message);

      if (!hasUnfinalizedChanges) {
        try {
          await onInputComplete(message);
        } finally {
          recorder.resumeRecording();
        }
      }
    },
  });
  return recorder;
};

const isSafariStandalone = typeof window !== "undefined" && ("standalone" in window.navigator) && window.navigator.standalone;
export const canUseWebSpeech = !!SpeechRecognition && !isSafariStandalone;

export default webSpeech;
