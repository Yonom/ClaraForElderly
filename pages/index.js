import voiceBot, { languages } from "@/services/voiceBot";
import Head from "next/head";
import { useRef, useState } from "react";
import { useProgress } from "@react-three/drei";

import Scene from "../components/Scene";

export default function Home() {
  const [lang, setLang] = useState("en-US");
  const [subtitle, setSubtitle] = useState();
  const [userInput, setUserInput] = useState();

  const doneRef = useRef();
  const handleEnded = () => {
    doneRef.current?.();
    doneRef.current = undefined;
  };

  const [started, setStarted] = useState(false);
  const start = async (lng) => {
    // Safari requires audio api to be immediately accessed during an interaction
    // calling play unlocks audio api for the current session
    // await new Audio("/audio/silence.mp3").play();

    setStarted(true);
    setLang(lng);

    const userAgent = window.navigator.userAgent;
    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
      // this interaction is required to enable audio on mobile safari
      alert("Note: Support on Mobile Safari is experimental.");
    }

    voiceBot({
      lang: lng,
      onInput: (msg) => {
        setUserInput(msg);
      },
      onSpeak: async (msg) => {
        if (msg === subtitle) return;

        setUserInput("");
        setSubtitle(msg);

        // wait until doneRef is called
        if (msg) {
          await new Promise((r) => {
            doneRef.current = r;
          });
        }
      },
    });
  };

  const { progress } = useProgress();

  return (
    <>
      <Head>
        <title>New Bets</title>
      </Head>
      <main>
        <Scene lang={lang} text={subtitle} onEnded={handleEnded} />

        {!!subtitle && (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              textAlign: "center",
              fontSize: 40,
              color: userInput ? "blue" : "black",
              backgroundColor: "#fffa",
              padding: 10,
            }}
          >
            {userInput || subtitle}
          </div>
        )}
        {!started && progress === 100 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#000d",
              color: "white",
              fontSize: 24,
            }}
          >
            <p>Please select a language</p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {Object.entries(languages).map(([lang, name]) => (
                <div
                  key={lang}
                  style={{
                    padding: 10,
                    cursor: "pointer",
                    backgroundColor: "#fff3",
                    marginLeft: 5,
                    marginRight: 5,
                    marginBottom: 10,
                  }}
                  onClick={() => start(lang)}
                >
                  {name}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 16, marginTop: 5 }}>
              Avatar animations are only supported for English and Mandarin.{" "}
              <br />
              To get the full experience, please use one of these languages.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
