import { getFrame } from "frames.js";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { FrameAction } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { mainnet, base, optimism, degen } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, publicActions } from "viem";

export class AuthInfo {
  neynarApiKey: string;
  // neynar generated signer uuid
  signerUuid: string;
  // private key of the crypto wallet that sends the transaction
  walletPrivateKey: `0x${string}`;
  // the http transport of the viem client; if not specified, will use default http()
  viemTransport?: string;

  constructor(
    neynarApiKey: string,
    signerUuid: string,
    walletPrivateKey: `0x${string}`,
    viemTransport?: string,
  ) {
    this.neynarApiKey = neynarApiKey;
    this.signerUuid = signerUuid;
    this.walletPrivateKey = walletPrivateKey;
    if (viemTransport) {
      this.viemTransport = viemTransport;
    }
  }
}

export class TransactionInput {
  castHash: string;
  frameLink: string;
  authInfo: AuthInfo;

  constructor(castHash: string, frameLink: string, authInfo: AuthInfo) {
    this.castHash = castHash;
    this.frameLink = frameLink;
    this.authInfo = authInfo;
  }
}

export async function submitPaybotTransaction(input: TransactionInput) {
  const frameResponse = await fetch(input.frameLink, {
    method: "GET",
  });

  if (!frameResponse.ok) {
    const errorMsg = await frameResponse.text();
    throw new Error(errorMsg);
  }
  const html = await frameResponse.text();
  const frame = await getFrame({
    htmlString: html,
    url: "",
  });

  if (frame["status"] != "success") {
    throw new Error(`Frame link did not return a valid frame: ${html}`);
  }

  const callback_url = frame["frame"]["postUrl"];
  let txButton;
  let txIndex = 0;

  for (const button of frame["frame"]["buttons"]!) {
    txIndex += 1;
    if (button["action"] == "tx") {
      txButton = button;
      break;
    }
  }

  const neynarClient = new NeynarAPIClient(input.authInfo.neynarApiKey);

  const txAction: FrameAction = {
    button: {
      index: txIndex,
      action_type: "tx",
      target: txButton!["target"],
    },
    frames_url: input.frameLink,
    post_url: callback_url!,
  };
  let neynarResponse = await neynarClient.postFrameAction(
    input.authInfo.signerUuid,
    input.castHash,
    txAction,
  );

  const txData = JSON.parse(JSON.stringify(neynarResponse));

  const getChainConfig = (chainId: string) => {
    switch (chainId) {
      case "eip155:1":
        return mainnet;
      case "eip155:8453":
        return base;
      case "eip155:10":
        return optimism;
      case "eip155:666666666":
        return degen;
      default:
        throw new Error("Unsupported chain");
    }
  };

  const { chainId, method, params } = txData.transaction_calldata;
  const { to, data, value } = params;

  const walletClient = createWalletClient({
    chain: getChainConfig(chainId),
    transport: input.authInfo.viemTransport
      ? http(input.authInfo.viemTransport)
      : http(),
  }).extend(publicActions);

  const account = privateKeyToAccount(input.authInfo.walletPrivateKey);

  const hash = await walletClient.sendTransaction({
    account: account,
    to,
    value,
    data,
  });

  await walletClient.waitForTransactionReceipt({ hash });

  const confirmAction: FrameAction = {
    button: {
      index: txIndex,
      action_type: "tx",
      target: txButton!["target"],
    },
    frames_url: txData.frames_url,
    post_url: txData.post_url ? txData.post_url : txData.frames_url,
    transaction: {
      hash: hash,
    },
  };
  neynarResponse = await neynarClient.postFrameAction(
    input.authInfo.signerUuid,
    input.castHash,
    confirmAction,
  );

  return JSON.stringify(neynarResponse);
}

// module.exports = submitPaybotTransaction;
