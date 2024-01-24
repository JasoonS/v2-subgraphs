import type {
  Address,
  Asset,
  Campaign,
  Event,
  Factory,
  Mutable,
  Watcher,
  CreateLinearArgs,
} from "../types";

import { StreamCategory, StreamVersion } from "../constants";
import { bindRoot } from "./root";

type Entity = Partial<Mutable<Campaign>>;

function createCampaign(
  event: Event,
  address: Address,
  entities: {
    factory: Factory;
    watcher: Watcher;
  },
) {
  let { factory, watcher } = entities;
  const id = generateCampaignId(event, address);

  /** --------------- */

  const entity = {
    id,
    address,
    subgraphId: watcher.campaignIndex,
    hash: event.transactionHash,
    timestamp: BigInt(event.blockTimestamp),
    chainId: BigInt(event.chainId),

    /** --------------- */

    clawbackAction: null,
    clawbackTime: 0n,

    claimedAmount: 0n,
    claimedCount: 0n,

    factory: factory.id,
  } satisfies Entity;

  /** --------------- */

  watcher = {
    ...watcher,
    campaignIndex: watcher.campaignIndex + 1n,
  };

  return {
    entity,
    watcher,
  };
}

export async function createLinearCampaign(
  event: Event<CreateLinearArgs>,
  entities: {
    asset: Asset;
    factory: Factory;
    watcher: Watcher;
  },
) {
  let { asset, factory, watcher } = entities;

  const { entity: partial, ...post_create } = createCampaign(
    event,
    event.params.merkleStreamer,
    {
      factory,
      watcher,
    },
  );

  watcher = post_create.watcher;

  /** --------------- */

  let entity = {
    ...partial,
    expires: event.params.expiration !== 0n,
    expiration: event.params.expiration,
    /** --------------- */
    admin: event.params.admin,
    lockup: event.params.lockupLinear,
    /** --------------- */
    ipfsCID: event.params.ipfsCID,
    aggregateAmount: event.params.aggregateAmount,
    totalRecipients: event.params.recipientsCount,
    /** --------------- */
    category: StreamCategory.LockupLinear,
    streamCliff: event.params.streamDurations[0] !== 0n,
    streamCliffDuration: event.params.streamDurations[0],
    streamTotalDuration: event.params.streamDurations[1],
    streamCancelable: event.params.cancelable,
    streamTransferable: event.params.transferable,

    version: StreamVersion.V21,
  } satisfies Entity;

  /** --------------- */
  /** Asset: managed by the event handler (upstream) */
  const partAsset = { asset: asset.id } satisfies Entity;

  /** --------------- */
  const partRoot = await bindRoot(entity);

  /** --------------- */
  const campaign: Campaign = {
    ...entity,
    ...partAsset,
    ...partRoot,
  };

  return {
    campaign,
    watcher,
  };
}

export async function getCampaign_async(
  event: Event,
  loader: (id: string) => Campaign | undefined,
) {
  const id = generateCampaignId(event, event.srcAddress);
  const loaded = await loader(id);

  if (loaded === undefined) {
    throw new Error("Missing campaign instance");
  }

  return loaded;
}

export function getCampaign(
  event: Event,
  loader: (id: string) => Campaign | undefined,
) {
  const id = generateCampaignId(event, event.srcAddress);
  const loaded = loader(id);

  if (loaded === undefined) {
    throw new Error("Missing campaign instance");
  }

  return loaded;
}

/** --------------------------------------------------------------------------------------------------------- */
/** --------------------------------------------------------------------------------------------------------- */
/** --------------------------------------------------------------------------------------------------------- */

export function generateCampaignId(event: Event, address: Address) {
  let id = ""
    .concat(address.toLowerCase())
    .concat("-")
    .concat(event.chainId.toString());

  return id;
}
