import { gptCompletion } from "./openAi";
import { assemblyAiListener } from "./assemblyAi";
import { canUseWebSpeech, webSpeechListener } from "./webSpeech";

export const languages = canUseWebSpeech
  ? {
      "en-US": "English",
      "de-DE": "German",
      "fr-FR": "French",
      "es-ES": "Spanish",
      "zh-CN": "Mandarin",
    }
  : { "en-US": "English" };

const initialPrompt = {
  "en-US": "Hello Edward, how are we feeling today?",
  "de-DE": "Ja guten tag auch lieber Edward. Wie geht es dir heute?",
  "fr-FR": "Bonjour Edward, comment nous sentons-nous aujourd'hui ?",
  "es-ES": "Hola Edward, ¿cómo nos sentimos hoy?",
  "zh-CN": "你好爱德华，我们今天感觉如何？",
};

const voiceBot = async ({ lang, onSpeak, onInput }) => {
  const messages = [{ role: "assistant", content: initialPrompt[lang] }];
  const ttsEngine = lang === "en-US" ? assemblyAiListener : webSpeechListener;

  const recorder = await ttsEngine({
    lang,
    onInput,
    onInputComplete: async (input) => {
      messages.push({ role: "user", content: input.trim() });
      const text = await gptCompletion({
        language: languages[lang],
        messages,
      });
      messages.push({ role: "assistant", content: text.trim() });
      await onSpeak(text);
    },
  });
  try {
    await onSpeak(messages[0].content);
  } finally {
    recorder.startRecording();
  }
};

export default voiceBot;
