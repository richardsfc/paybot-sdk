import { getFrame } from "frames.js";

async function submitPaybotTransaction(frameLink: string) {
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
}

module.exports = submitPaybotTransaction;
