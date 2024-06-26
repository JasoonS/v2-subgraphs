import {
  MerkleLockupV21Contract_Clawback_handler as Handler_V21,
  MerkleLockupV21Contract_Clawback_loader as Loader_V21,
  MerkleLockupV22Contract_Clawback_handler as Handler_V22,
  MerkleLockupV22Contract_Clawback_loader as Loader_V22,
} from "../../generated/src/Handlers.gen";

import type { Action, ClawbackHandler, ClawbackLoader } from "../types";

import {
  createAction,
  generateCampaignId,
  getOrCreateWatcher,
  getCampaign,
} from "../helpers";
import { ActionCategory } from "../constants";

function loader(input: ClawbackLoader) {
  const { context, event } = input;

  const campaignId = generateCampaignId(event, event.srcAddress);
  const watcherId = event.chainId.toString();

  context.Campaign.load(campaignId, {});
  context.Watcher.load(watcherId);
}

function handler(input: ClawbackHandler) {
  const { context, event } = input;

  /** ------- Fetch -------- */

  let watcher = getOrCreateWatcher(event, context.Watcher.get);
  let campaign = getCampaign(event, context.Campaign.get);

  /** ------- Process -------- */

  const post_action = createAction(event, watcher);

  const action: Action = {
    ...post_action.entity,
    category: ActionCategory.Clawback,
    campaign_id: campaign.id,
    /** --------------- */
    clawbackFrom: event.params.admin.toLowerCase(),
    clawbackTo: event.params.to.toLowerCase(),
    clawbackAmount: BigInt(event.params.amount),
  };

  watcher = post_action.watcher;

  campaign = {
    ...campaign,
    clawbackTime: BigInt(event.blockTimestamp),
    clawbackAction_id: action.id,
  };

  context.Action.set(action);
  context.Campaign.set(campaign);
  context.Watcher.set(watcher);
}

Loader_V21(loader);
Handler_V21(handler);

Loader_V22(loader);
Handler_V22(handler);
