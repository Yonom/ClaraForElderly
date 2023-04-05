import {
  getBytes,
  getLines,
  getMessages,
} from "@microsoft/fetch-event-source/lib/cjs/parse";

const gptCompletionApi = (signal, request) => {
  return fetch("/api/getResponse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal,
  });
};

const createStreamHandle = () => {
  return {
    text: "",
    finish_reason: null,
  };
};

const streamToHandle = async (res, handle, controller) => {
  try {
    await getBytes(
      res.body,
      getLines(
        getMessages(
          () => {},
          () => {},
          ({ data }) => {
            if (data === "[DONE]") {
              controller.abort("stream_done");
            } else {
              const {
                choices: [{ text, finish_reason }],
              } = JSON.parse(data);
              handle.text += text;
              handle.finish_reason = finish_reason;
            }
          }
        )
      )
    );
  } catch (ex) {
    // silence aborted signals
    if (!controller.signal.aborted) {
      throw ex;
    }
  } finally {
    handle.finish_reason =
      handle.finish_reason || controller.signal.reason || "unknown_error";
  }
};
export const gptCompletion = async ({
  request,
  controller = new AbortController(),
  onBegin,
  onText,
}) => {
  const response = await gptCompletionApi(controller.signal, request);

  await onBegin?.();

  const handle = createStreamHandle();
  const streamTask = streamToHandle(response, handle, controller);

  let fullText = "";
  while (!handle.finish_reason || handle.text) {
    if (handle.text) {
      const text = handle.text;
      handle.text = "";

      fullText += text;
      await onText?.(text);
    } else {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  // bubble up any errors from stream task
  await streamTask;

  return { text: fullText, finish_reason: handle.finish_reason };
};
