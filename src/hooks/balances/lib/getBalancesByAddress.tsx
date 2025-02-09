import { ApiPromise } from '@polkadot/api';
import { includes } from 'lodash';
import { Balance } from '../../../generated/graphql';
import constants from '../../../constants';
import { OrmlAccountData } from '@open-web3/orml-types/interfaces';
import '@polkadot/api-augment';

/**
 * This function fetches asset balances only for a given set of assetIds.
 *
 * @param apiInstance polkadotJs ApiPromise instance
 * @param address of the entity eg. account, LBPPool, XYKPool
 * @param assetIds an array of assets
 * @returns an array of balances
 */
export const getBalancesByAddress = async (
  apiInstance: ApiPromise,
  address: string,
  assetIds: string[]
): Promise<Balance[]> => {
  let balances: Balance[] = [];

  if (includes(assetIds, constants.nativeAssetId)) {
    const nativeBalance = await fetchNativeAssetBalance(apiInstance, address);
    balances.push(nativeBalance);
  }

  // make sure that there is no native assetId
  const nonNativeAssetIds = assetIds.filter(
    (id) => id !== constants.nativeAssetId
  );
  // fetch non-native assets only if needed
  if (nonNativeAssetIds.length) {
    const nonNativeBalances = await fetchNonNativeAssetBalancesByAssetIds(
      apiInstance,
      address,
      nonNativeAssetIds
    );

    balances.push(...nonNativeBalances);
  }

  if (assetIds.length === 0) {
    const nonNativeBalances = await fetchNonNativeAssetBalances(
      apiInstance,
      address
    );

    balances.push(...nonNativeBalances);
  }

  return balances;
};

export const fetchNativeAssetBalance = async (
  apiInstance: ApiPromise,
  address: string
): Promise<Balance> => {
  // no handling of undefined because apiInstance returns default value of 0 for native asset
  const nativeAssetBalance = await apiInstance.query.system.account(address);

  return {
    assetId: constants.nativeAssetId,
    balance: nativeAssetBalance.data.free.toString(),
  };
};

/**
 * This function fetches balances for multiple non-native assetIds.
 *
 * @param apiInstance PolkadotJS ApiPromise
 * @param address of the account
 * @param assetIds of non-native tokens
 * @returns balance object with assetId and balance
 */
export const fetchNonNativeAssetBalancesByAssetIds = async (
  apiInstance: ApiPromise,
  address: string,
  assetIds: string[]
): Promise<Balance[]> => {
  // compose search parameter as [[address, assetIdA], [address, assetIdB], ...]
  const queryParameter: string[][] = assetIds.map((assetId) => [
    address,
    assetId,
  ]);
  const searchResult =
    await apiInstance.query.tokens.accounts.multi<OrmlAccountData>(
      queryParameter
    );

  const balances: Balance[] = searchResult.map((balanceData, i) => {
    // extract free balance as string
    const freeBalance = balanceData.free.toString();

    return {
      assetId: assetIds[i], // pair assetId in the same order as provided in query parameter
      balance: freeBalance,
    };
  });
  return balances;
};

/**
 * This function fetches all non-native token balances for given address.
 *
 * @param apiInstance PolkadotJS ApiPromise
 * @param address of the account
 * @returns balance object with assetId and balance
 */
export const fetchNonNativeAssetBalances = async (
  apiInstance: ApiPromise,
  address: string
) => {
  const allNonNativeTokens =
    await apiInstance.query.tokens.accounts.entries<OrmlAccountData>(address);

  const balances: Balance[] = allNonNativeTokens.map(([key, balanceData]) => {
    // TODO: better type casting for next line
    const [, assetId] = key.toHuman() as [string, string]; // [Address, AssetId]

    const freeBalance = balanceData.free.toString();

    return {
      assetId: assetId,
      balance: freeBalance,
    };
  });

  return balances;
};
