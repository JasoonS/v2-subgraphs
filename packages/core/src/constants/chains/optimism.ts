export let chainId = 10;
export let chain = "optimism";
export let startBlock = 106405050;

/**
 * Keep aliases unique and always in sync with the frontend
 * @example export let linear = [[address1, alias2], [address2, alias2]]
 */

export let linear: string[][] = [
  ["0xB923aBdCA17Aed90EB5EC5E407bd37164f632bFD", "LL"],
];

export let dynamic: string[][] = [
  ["0x6f68516c21E248cdDfaf4898e66b2b0Adee0e0d6", "LD"],
];

/** PRBProxy registry */
export let registry = "0xD42a2bB59775694c9Df4c7822BfFAb150e6c699D";

/**
 * The initializer contract is used to trigger the indexing of all other contracts.
 * It should be a linear contract, the oldest/first one deployed on this chain.
 */

export let initializer = linear[0][0];
