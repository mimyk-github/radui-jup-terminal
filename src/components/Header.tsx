import React, { useMemo, useState } from 'react';
import { useSwapContext } from 'src/contexts/SwapContext';
import RefreshSVG from 'src/icons/RefreshSVG';
import SettingsSVG from 'src/icons/SettingsSVG';
import { formatNumber } from 'src/misc/utils';

import JupiterLogo from '../icons/JupiterLogo';

import { WalletButton } from './WalletComponents';
import SwapSettingsModal from './SwapSettingsModal/SwapSettingsModal';

const Header: React.FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const {
    form,
    jupiter: { refresh },
  } = useSwapContext();
  const [showSlippapgeSetting, setShowSlippageSetting] = useState(false);

  const jupiterDirectLink = useMemo(() => {
    return `https://jup.ag/swap/${form.fromMint}-${form.toMint}?inAmount=${form.fromValue}`;
  }, [form]);

  const slippageText = useMemo(() => {
    const value = form.slippageBps / 100;
    return isNaN(value) ? '0' : formatNumber.format(value);
  }, [form.slippageBps]);

  return (
    <div className=" h-12 border-v3-primary border-b-2">
      <div className="pl-2 w-full flex items-center justify-between ">
        <a href={jupiterDirectLink} target={'_blank'} rel="noreferrer noopener" className="flex items-center space-x-2">
          <JupiterLogo width={24} height={24} />
          <span className="font-bold text-sm text-v3-primary">Jupiter</span>
        </a>

        <div className="flex items-center">
          <button
            type="button"
            className="h-12 w-10 flex items-center justify-center border-v3-primary border-r-2 border-l-2 text-v3-primary fill-current"
            onClick={refresh}
          >
            <RefreshSVG />
          </button>

          <button
            type="button"
            className="px-2 h-12 flex items-center justify-center border-v3-primary border-r-2 text-v3-primary fill-current"
            onClick={() => setShowSlippageSetting(true)}
          >
            <SettingsSVG />
            <span suppressHydrationWarning className="text-xs text-v3-primary-30">
              {slippageText}%
            </span>
          </button>

          <WalletButton setIsWalletModalOpen={setIsWalletModalOpen} />
        </div>
      </div>

      {showSlippapgeSetting ? (
        <div className="absolute z-10 top-0 left-0 w-full h-full overflow-hidden bg-black/50 flex items-center px-4">
          <SwapSettingsModal closeModal={() => setShowSlippageSetting(false)} />
        </div>
      ) : null}
    </div>
  );
};

export default Header;
