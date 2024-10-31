import { getFrame } from "frames.js";

export async function submitPaybotTransaction(frameLink: string) {
  const response = await fetch(frameLink, {
    method: "GET",
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(errorMsg);
  }
  const html = await response.text();
  const frame = await getFrame({
    htmlString: html,
    url: "",
  });

  if (frame["status"] != "success") {
    throw new Error(`Frame link did not return a valid frame: ${html}`);
  }

  const callback_url = frame["frame"]["postUrl"];
  let tx_url;

  for (const button of frame['frame']["buttons"]!) {
    if (button["action"] == "tx") {
      tx_url = button["target"];
    }
  }

  return frame["frame"];
}

// module.exports = submitPaybotTransaction;
