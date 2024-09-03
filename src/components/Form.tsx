import { MouseEvent, useCallback, useEffect, useMemo } from 'react';
import { NumberFormatValues, NumericFormat } from 'react-number-format';

import { useAccounts } from '../contexts/accounts';

import { MAX_INPUT_LIMIT, MINIMUM_SOL_BALANCE } from '../misc/constants';

import CoinBalance from './Coinbalance';
import FormError from './FormError';
import JupButton from './JupButton';

import TokenIcon from './TokenIcon';

import { UnifiedWalletButton } from '@jup-ag/wallet-adapter';
import classNames from 'classnames';
import { useSwapContext } from 'src/contexts/SwapContext';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import { RoutesSVG } from 'src/icons/RoutesSVG';
import WalletIcon from 'src/icons/WalletIcon';
import { detectedSeparator, hasNumericValue } from 'src/misc/utils';
import { WRAPPED_SOL_MINT } from '../constants';
import { CoinBalanceUSD } from './CoinBalanceUSD';
import PriceInfo from './PriceInfo/index';
import V2SexyChameleonText from './SexyChameleonText/V2SexyChameleonText';
import SwitchPairButton from './SwitchPairButton';
import useTimeDiff from './useTimeDiff/useTimeDiff';

const Form: React.FC<{
  onSubmit: () => void;
  isDisabled: boolean;
  setSelectPairSelector: React.Dispatch<React.SetStateAction<'fromMint' | 'toMint' | null>>;
  setIsWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ onSubmit, isDisabled, setSelectPairSelector, setIsWalletModalOpen }) => {
  const { publicKey } = useWalletPassThrough();
  const { accounts } = useAccounts();
  const {
    form,
    setForm,
    isToPairFocused,
    errors,
    fromTokenInfo,
    toTokenInfo,
    quoteResponseMeta,
    formProps: { swapMode, fixedAmount, fixedInputMint, fixedOutputMint },
    jupiter: { quoteResponseMeta: route, loading, error, refresh },
  } = useSwapContext();
  const [hasExpired, timeDiff] = useTimeDiff();
  useEffect(() => {
    if (hasExpired) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasExpired]);

  const walletPublicKey = useMemo(() => publicKey?.toString(), [publicKey]);

  const onChangeFromValue = ({ value, floatValue, formattedValue }: NumberFormatValues) => {
    if (value === '' || !floatValue) {
      setForm((form) => ({ ...form, fromValue: '', toValue: '' }));
      return;
    }

    const isInvalid = Number.isNaN(value);
    if (isInvalid) return;

    setForm((form) => ({ ...form, fromValue: value }));
  };

  const onChangeToValue = ({ value, floatValue, formattedValue }: NumberFormatValues) => {
    if (value === '' || !floatValue) {
      setForm((form) => ({ ...form, fromValue: '', toValue: '' }));
      return;
    }

    const isInvalid = Number.isNaN(value);
    if (isInvalid) return;

    setForm((form) => ({ ...form, toValue: value }));
  };

  const balance = useMemo(() => {
    return fromTokenInfo ? accounts[fromTokenInfo.address]?.balance || 0 : 0;
  }, [accounts, fromTokenInfo]);

  const onClickMax = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();

      if (!balance || swapMode === 'ExactOut') return;

      if (fromTokenInfo?.address === WRAPPED_SOL_MINT.toBase58()) {
        setForm((prev) => ({
          ...prev,
          fromValue: String(balance > MINIMUM_SOL_BALANCE ? (balance - MINIMUM_SOL_BALANCE).toFixed(6) : 0),
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          fromValue: String(balance),
        }));
      }
    },
    [balance, fromTokenInfo?.address, setForm, swapMode],
  );

  const onClickSwitchPair = () => {
    setForm((prev) => ({
      ...prev,
      fromValue: '',
      toValue: '',
      fromMint: prev.toMint,
      toMint: prev.fromMint,
    }));
  };

  const hasFixedMint = useMemo(() => fixedInputMint || fixedOutputMint, [fixedInputMint, fixedOutputMint]);
  const { inputAmountDisabled } = useMemo(() => {
    const result = { inputAmountDisabled: true, outputAmountDisabled: true };
    if (!fixedAmount) {
      if (swapMode === 'ExactOut') {
        result.outputAmountDisabled = false;
      } else {
        result.inputAmountDisabled = false;
      }
    }
    return result;
  }, [fixedAmount, swapMode]);

  const marketRoutes = quoteResponseMeta
    ? quoteResponseMeta.quoteResponse.routePlan.map(({ swapInfo }) => swapInfo.label).join(', ')
    : '';

  const onClickSelectFromMint = useCallback(() => {
    if (fixedInputMint) return;
    setSelectPairSelector('fromMint');
  }, [fixedInputMint, setSelectPairSelector]);

  const onClickSelectToMint = useCallback(() => {
    if (fixedOutputMint) return;
    setSelectPairSelector('toMint');
  }, [fixedOutputMint, setSelectPairSelector]);

  const fixedOutputFomMintClass = useMemo(() => {
    if (swapMode === 'ExactOut' && !form.toValue) return 'opacity-20 hover:opacity-100';
    return '';
  }, [form.toValue, swapMode]);

  const thousandSeparator = useMemo(() => (detectedSeparator === ',' ? '.' : ','), []);
  // Allow empty input, and input lower than max limit
  const withValueLimit = useCallback(
    ({ floatValue }: NumberFormatValues) => !floatValue || floatValue <= MAX_INPUT_LIMIT,
    [],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (window.Jupiter.enableWalletPassthrough && window.Jupiter.onRequestConnectWallet) {
        window.Jupiter.onRequestConnectWallet();
      } else {
        setIsWalletModalOpen(true);
      }
    },
    [setIsWalletModalOpen],
  );

  return (
    <div className="h-full flex flex-col items-center justify-center pb-4">
      <div className="w-full flex flex-col">
        <div className="flex-col">
          <div
            className={classNames(
              'border-b border-transparent transition-all',
              fixedOutputFomMintClass,
            )}
          >
            <div className={classNames('px-x border-transparent ')}>
              <div>
                <div
                  className={classNames(
                    'py-5 px-4 flex flex-col dark:text-v3-light border-b-2 border-v3-dark box-content',
                    'group focus-within:border-v3-dark/100 focus-within:shadow-swap-input-dark',
                  )}
                >
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      className="py-2 px-3 flex items-center bg-v3-light border-2 border-v3-dark hover:bg-v3-light/10 text-v3-dark"
                      disabled={fixedInputMint}
                      onClick={onClickSelectFromMint}
                    >
                      <div className="h-5 w-5">
                        <TokenIcon info={fromTokenInfo} width={20} height={20} />
                      </div>
                      <div className="ml-4 mr-2 font-semibold" translate="no">
                        {fromTokenInfo?.symbol}
                      </div>
                      {fixedInputMint ? null : (
                        <span className="text-v3-dark fill-current">
                          <ChevronDownIcon />
                        </span>
                      )}
                    </button>

                    <div className="ml-4 h-10 text-right border-v3-dark/60 border-b-2">
                      <NumericFormat
                        disabled={fixedAmount || swapMode === 'ExactOut'}
                        value={typeof form.fromValue === 'undefined' ? '' : form.fromValue}
                        decimalScale={fromTokenInfo?.decimals}
                        thousandSeparator={thousandSeparator}
                        allowNegative={false}
                        valueIsNumericString
                        onValueChange={onChangeFromValue}
                        placeholder={'0.00'}
                        className={classNames(
                          'h-full w-full bg-transparent text-v3-dark text-right font-semibold text-lg',
                          { 'cursor-not-allowed': inputAmountDisabled },
                        )}
                        decimalSeparator={detectedSeparator}
                        isAllowed={withValueLimit}
                        onKeyDown={(e) => {
                          isToPairFocused.current = false;
                        }}
                      />
                    </div>
                  </div>

                  {fromTokenInfo?.address ? (
                    <div className="flex justify-between items-center">
                      <div
                        className={classNames('flex mt-3 space-x-1 text-xs items-center text-v3-dark/50 fill-current', {
                          'cursor-pointer': swapMode !== 'ExactOut',
                        })}
                        onClick={(e) => {
                          isToPairFocused.current = false;
                          onClickMax(e);
                        }}
                      >
                        <WalletIcon width={10} height={10}/>
                        <CoinBalance mintAddress={fromTokenInfo.address} />
                        <span>{fromTokenInfo.symbol}</span>
                      </div>

                      {form.fromValue ? (
                        <span className="text-xs text-v3-light/30">
                          <CoinBalanceUSD tokenInfo={fromTokenInfo} amount={form.fromValue} />
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className={'my-2'}>
            {hasFixedMint ? null : (
              <SwitchPairButton
                onClick={onClickSwitchPair}
                className={classNames('transition-all', fixedOutputFomMintClass)}
              />
            )}
          </div>

          <div className="border-b border-transparent">
            <div className="px-x border-transparent">
              <div>
                <div
                  className={classNames(
                    'py-5 px-4 flex flex-col dark:text-v3-light border-b-2 border-t-2 border-v3-dark box-content',
                    'group focus-within:border-v3-dark/100 focus-within:shadow-swap-input-dark',
                  )}
                >
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      className="py-2 px-3 flex items-center bg-v3-light border-2 border-v3-dark hover:bg-v3-light/10 text-v3-dark"
                      disabled={fixedOutputMint}
                      onClick={onClickSelectToMint}
                    >
                      <div className="h-5 w-5">
                        <TokenIcon info={toTokenInfo} width={20} height={20} />
                      </div>
                      <div className="ml-4 mr-2 font-semibold" translate="no">
                        {toTokenInfo?.symbol}
                      </div>

                      {fixedOutputMint ? null : (
                        <span className="text-v3-dark fill-current">
                          <ChevronDownIcon />
                        </span>
                      )}
                    </button>

                    <div className="ml-4 h-9 text-right border-v3-dark/60 border-b-2">
                      <NumericFormat
                        disabled={!swapMode || swapMode === 'ExactIn'}
                        value={typeof form.toValue === 'undefined' ? '' : form.toValue}
                        decimalScale={toTokenInfo?.decimals}
                        thousandSeparator={thousandSeparator}
                        allowNegative={false}
                        valueIsNumericString
                        onValueChange={onChangeToValue}
                        placeholder={swapMode === 'ExactIn' ? '' : 'Enter desired amount'}
                        className={classNames(
                          'h-full w-full bg-transparent text-v3-dark/50 text-right font-semibold  placeholder:text-sm placeholder:font-normal placeholder:text-v3-dark/50 text-lg',
                        )}
                        decimalSeparator={detectedSeparator}
                        isAllowed={withValueLimit}
                        onKeyDown={(e) => {
                          if (
                            e.metaKey ||
                            e.ctrlKey ||
                            e.key === 'Meta' ||
                            e.key === 'Control' ||
                            e.key === 'Alt' ||
                            e.key === 'Shift'
                          )
                            return;
                          isToPairFocused.current = true;
                        }}
                      />
                    </div>
                  </div>

                  {toTokenInfo?.address ? (
                    <div className="flex justify-between items-center">
                      <div className="flex mt-3 space-x-1 text-xs items-center text-v3-dark/50 fill-current">
                        <WalletIcon width={10} height={10} />
                        <CoinBalance mintAddress={toTokenInfo.address} />
                        <span>{toTokenInfo.symbol}</span>
                      </div>

                      {form.toValue ? (
                        <span className="text-xs text-v3-light/30">
                          <CoinBalanceUSD tokenInfo={toTokenInfo} amount={form.toValue} />
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {route?.quoteResponse ? (
            <div className="flex items-center mt-2 text-xs space-x-1">
              <div className="bg-black/20 px-2 py-1 text-v3-light/50 flex items-center space-x-1">
                <RoutesSVG width={7} height={9} />
              </div>
              <span className="text-v3-light/30">using</span>
              <span className="text-v3-light/50 overflow-hidden whitespace-nowrap text-ellipsis max-w-[70%]">
                {marketRoutes}
              </span>
            </div>
          ) : null}
        </div>

        {walletPublicKey ? <FormError errors={errors} /> : null}
      </div>

      <div className="w-full px-12 pt-6">
        {!walletPublicKey ? (
          <UnifiedWalletButton
            buttonClassName="!bg-transparent"
            overrideContent={
              <JupButton size="lg" className="w-full mt-4 bg-v3-primary" type="button" onClick={handleClick}>
                Connect Wallet
              </JupButton>
            }
          />
        ) : (
          <JupButton
            size="lg"
            className="w-full mt-4 disabled:opacity-50"
            type="button"
            onClick={onSubmit}
            disabled={isDisabled || loading}
          >
            {loading ? (
              <span className="text-sm">Loading...</span>
            ) : error ? (
              <span className="text-sm">Error fetching route. Try changing your input</span>
            ) : (
              <div className="text-v3-primary">Swap</div>
            )}
          </JupButton>
        )}

        {route && quoteResponseMeta && fromTokenInfo && toTokenInfo ? (
          <PriceInfo
            quoteResponse={quoteResponseMeta.quoteResponse}
            fromTokenInfo={fromTokenInfo}
            toTokenInfo={toTokenInfo}
            loading={loading}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Form;
