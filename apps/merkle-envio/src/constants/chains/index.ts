import * as arbitrum from "./arbitrum";
import * as base from "./base";
import * as blast from "./blast";
import * as bsc from "./bsc";
import * as gnosis from "./gnosis";
import * as mainnet from "./mainnet";
import * as optimism from "./optimism";
import * as polygon from "./polygon";
import * as scroll from "./scroll";
import * as sepolia from "./sepolia";
import * as zksync from "./zksync";

/** Airstreams don't have a deployment on Avalanche*/

const filter = (list: string[][], version: string) => {
  return (
    list
      .filter((entry) => entry[2] === version)
      .map((entry) => ({
        address: entry[0]?.toLowerCase() || "",
        alias: entry[1],
        version: entry[2],
      })) || []
  );
};

export const chains = () => {
  const list = [
    arbitrum,
    base,
    blast,
    bsc,
    gnosis,
    mainnet,
    optimism,
    polygon,
    scroll,
    sepolia,
    zksync,
  ] as const;

  return list.map((item) => ({
    id: item.chainId,
    name: item.chain,
    start_block: item.startBlock,
    V21: {
      factory: filter(item.factory, "V21"),
    },
    V22: {
      factory: filter(item.factory, "V22"),
    },
  }));
};
