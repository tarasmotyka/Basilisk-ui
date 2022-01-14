import { Account } from '../../../../generated/graphql';
import classNames from 'classnames';
import { FormattedBalance } from '../../../Balance/FormattedBalance/FormattedBalance';
import { UnitStyle } from '../../../Balance/metricUnit';
import './AccountItem.scss';

import Identicon from '@polkadot/react-identicon';
import { useSetActiveAccountMutation } from '../../../../hooks/accounts/mutations/useSetActiveAccountMutation';
export interface AccountItemProps {
  account: Account;
  onClick: () => void;
  active: boolean;
}

export const AccountItem = ({ account, onClick, active }: AccountItemProps) => {
  const [setActiveAccount] = useSetActiveAccountMutation({
    id: account?.id,
  });

  return (
    <div
      className={
        'account-item ' +
        classNames({
          'account-item--active': active,
        })
      }
      onClick={() => {
        setActiveAccount().then(onClick);
      }}
    >
      <div className="d-flex flex-align-space">
        <div className="account-item__heading">{account.name}</div>
        <div>
          {account?.balances.map((balance, i) => (
            <FormattedBalance
              balance={balance}
              unitStyle={UnitStyle.SHORT}
              precision={1}
            />
          ))}
        </div>
      </div>
      <div className="d-flex flex-column">
        <div className="d-flex gap-2 my-1">
          <Identicon value={account?.id} size={32} />
          <div className="d-flex flex-column">
            <div className="account-item__chain-name">Basilisk</div>
            <div className="account-item__chain-address">{account?.id}</div>
          </div>
        </div>
        <div className="d-flex gap-2 my-1">
          <Identicon value={account?.id} size={32} theme="polkadot" />
          <div className="d-flex flex-column">
            <div className="account-item__chain-name">Kusama</div>
            <div className="account-item__chain-address">{account?.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
