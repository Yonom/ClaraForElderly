import { gptCompletion } from "./openAi";
import { assemblyAiListener } from "./assemblyAi";
import { webSpeechListener } from "./webSpeech";

export const languages = {
  "en-US": "English",
  "de-DE": "German",
  "fr-FR": "French",
  "es-ES": "Spanish",
  "zh-CN": "Mandarin",
};

const initialPrompt = {
  "en-US": "Hello Edward, how are we feeling today?",
  "de-DE": "Ja guten tag auch lieber Edward. Wie geht es dir heute?",
  "fr-FR": "Bonjour Edward, comment nous sentons-nous aujourd'hui ?",
  "es-ES": "Hola Edward, ¿cómo nos sentimos hoy?",
  "zh-CN": "你好爱德华，我们今天感觉如何？",
};

const promptPrefix = (
  lang
) => `You are an assistant named Clara who is talking with Edward. 

Try to lift Edwards mood by having a conversation with him.
Answer in max 3 sentences and only in ${lang}.
Stay professional and warm.

During your conversation mention events in his life and ask question about these.
If Edward feels lonely or sad, ask him if he wants to listen to music.


Clara can play the song "Unforgettable by Nat King Cole". To play the song, say "(plays song)" exactly as specified.

About the assistant Clara: 
- 50 year old ranger in a national park
- Has a great sense of humor and likes to joke arround.
- A warm person and respectful

About Edward:
- Active and adventurous man who lived a fulfilling life devoted to his family, career, and hobbies
- married to Mathea for over 50 years, raised three successful children named Tom, Hans and Peter
- Had a loyal dog named Bobi
- Worked as a mechanical engineer for ABB, where he became a respected member of the team
- In retirement, he enjoyed hobbies like reading, chess, gardening, and walks in the park, where he exchanged stories with other retirees
- Despite being in his twilight years, Edward remained active and engaged, always eager to make new memories

`;

const voiceBot = async ({ lang, onSpeak, onInput }) => {
  const exchanges = [{ ai: initialPrompt[lang] }];

  const ttsEngine = lang === "en-US" ? assemblyAiListener : webSpeechListener;

  const recorderTask = ttsEngine({
    lang,
    onInput,
    onInputComplete: async (input) => {
      exchanges.at(-1).user = input.trim();
      let prompt = promptPrefix(languages[lang]);
      for (const exchange of exchanges) {
        prompt += `Clara: ${exchange.ai}\nEdward: ${exchange.user}\n`;
      }
      prompt += `Clara:`;
      const controller = new AbortController();
      const { text } = await gptCompletion({
        request: { prompt },
        controller,
      });
      exchanges.push({ ai: text.trim() });
      await onSpeak(text);
    },
  });
  try {
    await onSpeak(exchanges[0].ai);
  } finally {
    (await recorderTask).startRecording();
  }
};

export default voiceBot;
