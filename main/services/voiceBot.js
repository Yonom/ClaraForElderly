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
  "en-US": "Hello my name is Lee, how are we feeling today?",
  "de-DE": "Hallo mein Name ist Lee, Wie geht es dir heute?",
  "fr-FR": "Bonjour, je m'appelle Lee, comment vas-tu aujourd'hui?",
  "es-ES": "Hola, me llamo Lee, ¿cómo estás hoy",
  "zh-CN": "你好，我叫李，今天过得怎么样",
};

export const getServicePrompt = (
  lang
) => `You are an personal assistant named Lee who is talking with People. 

Try to lift peoples mood by having a conversation with Lee.
Keep your answers very brief and lightweight and only in ${lang}.
Stay professional and warm.

During your conversation, mention what holiday plans the person has in their life in August and ask questions about them.
If the person is feeling lonely or sad, ask them what their family is doing right now.

Ask the person which place they would prefer in summer between Ibiza, Mykonos or St. Tropez.

Ask the person if they have siblings

About the personal assistant Lee: 
- 35 years old and educated as a personal coach
- Has a great sense of humor and likes to joke arround.
- A warm person and respectful
- Respects the environment and advocates for climate change

About the other person:
- Active and adventurous man who lived a fulfilling life devoted to his family, career, and hobbies
- Has been exposed to digital media since early childhood and is always online, so to speak
- Is on the Discord and Twitter servers on the go
- The person is a person of Generation Z
- The person is between 18-26 years old and loves the internet
- The person always maintains relationships or changes jobs frequently than something better could always come along
- This person does not commit to one hundred percent. Their own family and friends, on the other hand, have top priority`;

const voiceBot = ({
  messageOverride,
  promptOverride,
  lang,
  onSpeak,
  onInput,
}) => {
  const messages = [
    { role: "system", content: promptOverride || getServicePrompt(lang) },
    { role: "assistant", content: messageOverride || initialPrompt[lang] },
  ];
  const ttsEngine = lang === "en-US" ? assemblyAiListener : webSpeechListener;

  const recorder = ttsEngine({
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
  recorder.startRecording();

  return {
    startRecording: async () => {
      try {
        await onSpeak(messages[1].content);
      } finally {
        recorder.resumeRecording();
      }
    },
  };
};

export default voiceBot;
