import { useCallback } from 'react';
import { Account } from '../../../../generated/graphql';
import { AccountSelector } from './../AccountSelector';
import {
  ModalPortalElementFactory,
  ModalPortalElementFactoryArgs,
} from './../../../Balance/AssetBalanceInput/hooks/useModalPortal';
import { WalletProps } from '../../Wallet';

export type ModalPortalElement = ({
  accounts,
  onAccountSelected,
  onAccountCleared,
  account,
  isExtensionAvailable,
}: Pick<
  WalletProps,
  | 'accounts'
  | 'onAccountSelected'
  | 'onAccountCleared'
  | 'account'
  | 'isExtensionAvailable'
>) => ModalPortalElementFactory;
export type CloseModal = ModalPortalElementFactoryArgs['closeModal'];

export const useModalPortalElement: ModalPortalElement = ({
  accounts,
  onAccountSelected,
  onAccountCleared,
  account,
  isExtensionAvailable,
}) => {
  const handleAccountSelected = useCallback(
    (closeModal: CloseModal) => (account: Account) => {
      closeModal();
      onAccountSelected(account);
    },
    [onAccountSelected]
  );

  const handleAccountCleared = useCallback(
    (closeModal: CloseModal) => () => {
      closeModal();
      onAccountCleared();
    },
    [onAccountCleared]
  );

  return useCallback(
    ({ closeModal, elementRef, isModalOpen }) => {
      return isModalOpen ? (
        <AccountSelector
          innerRef={elementRef}
          accounts={accounts}
          account={account}
          onAccountSelected={handleAccountSelected(closeModal)}
          onAccountCleared={handleAccountCleared(closeModal)}
          closeModal={closeModal}
          isExtensionAvailable={isExtensionAvailable}
        />
      ) : (
        <></>
      );
    },
    [
      accounts,
      account,
      handleAccountSelected,
      isExtensionAvailable,
      handleAccountCleared,
    ]
  );
};
