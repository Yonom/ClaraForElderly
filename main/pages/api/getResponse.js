export const config = {
  runtime: "edge",
};

const handler = async (req) => {
  const { prompt } = await req.json();

  return fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: "text-curie-001",
      prompt,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
      stop: "\n",
    }),
  });
};

export default handler;
