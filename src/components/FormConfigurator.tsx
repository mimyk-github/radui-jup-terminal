import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormState, UseFormReset, UseFormSetValue } from 'react-hook-form';
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import Toggle from './Toggle';
import Tooltip from './Tooltip';
import { AVAILABLE_EXPLORER } from '../contexts/preferredExplorer/index';
import { IFormConfigurator, INITIAL_FORM_CONFIG } from 'src/constants';
import { useRouter } from 'next/router';
import { base64ToJson } from 'src/misc/utils';
import { SwapMode } from 'src/types/enums';

const templateOptions: { name: string; description: string; values: IFormConfigurator }[] = [
  {
    name: 'Default',
    description: 'Full functionality and swap experience of Terminal.',
    values: {
      ...INITIAL_FORM_CONFIG,
      formProps: { ...INITIAL_FORM_CONFIG.formProps },
    },
  },
  {
    name: 'For payments',
    description: `
    Purchase a specified amount of specific token.
    e.g. Imagine paying for 1 NFT at the price of 1 SOL.
    e.g. Paying for RPC service at the price of 100 USDC.
    `,
    values: {
      ...INITIAL_FORM_CONFIG,
      formProps: {
        ...INITIAL_FORM_CONFIG.formProps,
        swapMode: SwapMode.ExactOut,
        initialAmount: '1000000000',
        fixedAmount: true,
        fixedOutputMint: true,
      },
    },
  },
  {
    name: 'Buy a project token',
    description: `To purchase a specific token.`,
    values: {
      ...INITIAL_FORM_CONFIG,
      formProps: {
        ...INITIAL_FORM_CONFIG.formProps,
        swapMode: SwapMode.ExactIn,
        initialOutputMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        fixedOutputMint: true,
      },
    },
  },
  {
    name: 'Exact Out',
    description: `
    On Exact Out mode, user specify the amount of token to receive instead.
    `,
    values: {
      ...INITIAL_FORM_CONFIG,
      formProps: {
        ...INITIAL_FORM_CONFIG.formProps,
        swapMode: SwapMode.ExactOut,
      },
    },
  },
  {
    name: 'APE',
    description: `
    APE. Just APE.
    `,
    values: {
      ...INITIAL_FORM_CONFIG,
      strictTokenList: false,
      formProps: {
        ...INITIAL_FORM_CONFIG.formProps,
        initialAmount: '8888888800000',
        fixedAmount: false,
        initialInputMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        fixedInputMint: false,
        initialOutputMint: 'AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR',
        fixedOutputMint: true,
      },
    },
  },
];

const FormConfigurator = ({
  simulateWalletPassthrough,
  useUserSlippage,
  strictTokenList,
  defaultExplorer,
  formProps,

  // Hook form
  reset,
  setValue,
  formState,
}: IFormConfigurator & {
  // Hook form
  reset: UseFormReset<IFormConfigurator>;
  setValue: UseFormSetValue<IFormConfigurator>;
  formState: FormState<IFormConfigurator>;
}) => {
  const currentTemplate = useRef('');
  const { query, replace } = useRouter();

  const [isImported, setIsImported] = useState(false);

  const onSelect = useCallback(
    (index: number) => {
      console.log('called')
      reset(templateOptions[index].values);

      const templateName = templateOptions[index].name;
      currentTemplate.current = templateName;

      console.log('templateName', templateName);
      replace(
        {
          query:
            templateName === 'Default'
              ? undefined
              : {
                  template: templateName,
                },
        },
        undefined,
        { shallow: true },
      );

      setActive(index);
      setIsOpen(false);
    },
    [replace, reset],
  );

  // Initial pre-populate
  const prepopulated = useRef(false);
  useEffect(() => {
    const templateString = query?.import;
    if (templateString) {
      const data = base64ToJson(templateString as string);

      if (!data) {
        replace({ query: undefined });
        return;
      }

      reset({
        ...formState.defaultValues,
        ...data,
      });
      setIsImported(true);
      return;
    }

    const templateName = query?.template;
    if (currentTemplate.current === templateName) return;

    const foundIndex = templateOptions.findIndex((item) => item.name === templateName);
    if (foundIndex >= 0 && !prepopulated.current) {
      prepopulated.current = true;
      onSelect(foundIndex);
    }
  }, [formState.defaultValues, onSelect, query, replace, reset]);

  const [isOpen, setIsOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [isExplorerDropdownOpen, setIsExplorerDropdownOpen] = React.useState(false);
  const [isSwapModeOpen, setIsSwapModeOpen] = React.useState(false);

  return (
    <div className="w-full max-w-full md:mx-0 md:max-w-[340px] max-h-[725px] overflow-y-scroll overflow-x-hidden webkit-scrollbar bg-v3-light border-2 border-l-v3-dark p-4 border-y-v3-dark">
      <div className="w-full">
        <div className="relative inline-block text-left text-v3-dark w-full">
          <p className="text-v3-dark text-sm font-semibold">Template</p>

          <div className="mt-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="w-full flex justify-between items-center space-x-2 text-left bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border-2 border-v3-dark"
              id="menu-button"
              aria-expanded="true"
              aria-haspopup="true"
            >
              <div className="flex items-center justify-center space-x-2.5">
                <p>{isImported ? `Imported` : templateOptions[active].name}</p>

                <Tooltip
                  variant="dark"
                  content={<div className="text-v3-dark text-xs">{templateOptions[active].description}</div>}
                >
                  <div className="flex items-center text-v3-dark-35 fill-current">
                    <InfoIconSVG width={12} height={12} />
                  </div>
                </Tooltip>

                {formState?.isDirty ? (
                  <p className="text-[10px] text-v3-dark/50 py-1 px-2 border-2 border-white/50 leading-none">
                    Custom
                  </p>
                ) : null}
              </div>

              <ChevronDownIcon />
            </button>

            {isOpen ? (
              <div
                className="absolute left-0 z-10 ml-1 mt-1 origin-top-right shadow-xl bg-zinc-700 w-full border-2 border-white/20"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
              >
                {templateOptions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(index)}
                    type="button"
                    className={classNames(
                      'flex items-center w-full px-4 py-2 text-sm hover:bg-white/20 text-left',
                      active === index ? '' : '',
                      index !== templateOptions.length - 1 ? 'border-b-2 border-v3-dark' : '',
                    )}
                  >
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <p className="text-v3-dark mt-8 text-sm font-semibold">Things you can configure</p>

      {/* Fixed input */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-v3-dark/75">Fixed input mint</p>
          <p className="text-xs text-v3-dark/30">Input mint cannot be changed</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={!!formProps.fixedInputMint}
          onClick={() => setValue('formProps.fixedInputMint', !formProps.fixedInputMint, { shouldDirty: true })}
        />
      </div>
      <div className="w-full border-b-2 border-v3-dark py-3" />

      {/* Fixed output */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-v3-dark/75">Fixed output mint</p>
          <p className="text-xs text-v3-dark/30">Output mint cannot be changed</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={!!formProps.fixedOutputMint}
          onClick={() => setValue('formProps.fixedOutputMint', !formProps.fixedOutputMint, { shouldDirty: true })}
        />
      </div>
      <div className="w-full border-b-2 border-v3-dark py-3" />

      {/* Exact out */}
      <div className="relative inline-block text-left text-v3-dark w-full mt-5">
        <p className="text-v3-dark text-sm font-semibold">Exact output mode</p>
        <div className="text-xs text-v3-dark/30">
          {formProps.swapMode === 'ExactInOrOut' && (
            <span>User can freely switch between ExactIn or ExactOut mode.</span>
          )}
          {formProps.swapMode === 'ExactIn' && <span>User can only edit input.</span>}
          {formProps.swapMode === 'ExactOut' && <span>User can only edit exact amount received.</span>}
        </div>

        <div className="mt-2">
          <button
            onClick={() => setIsSwapModeOpen((prev) => !prev)}
            type="button"
            className="w-full flex justify-between items-center space-x-2 text-left bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border-2 border-v3-dark"
            id="menu-button"
            aria-expanded="true"
            aria-haspopup="true"
          >
            <div className="flex items-center justify-center space-x-2.5">
              <p>{formProps.swapMode}</p>
            </div>

            <ChevronDownIcon />
          </button>

          {isSwapModeOpen ? (
            <div
              className="absolute left-0 top-15 z-10 ml-1 mt-1 origin-top-right shadow-xl bg-zinc-700 w-full border-2 border-white/20"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
            >
              {Object.values(SwapMode).map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setValue('formProps.swapMode', item);
                    setIsSwapModeOpen(false);
                  }}
                  type="button"
                  className={classNames(
                    'flex items-center w-full px-4 py-2 text-sm hover:bg-white/20 text-left',
                    active === index ? '' : '',
                    'last:border-b-2 last:border-v3-dark',
                  )}
                >
                  <span>{item}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="w-full border-b-2 border-v3-dark py-3" />

      {/* Fixed amount */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-v3-dark/75">Fixed amount</p>
          <p className="text-xs text-v3-dark/30">Depending on Exact In / Exact Out, the amount cannot be changed</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={!!formProps.fixedAmount}
          onClick={() => setValue('formProps.fixedAmount', !formProps.fixedAmount, { shouldDirty: true })}
        />
      </div>
      <div className="w-full border-b-2 border-v3-dark py-3" />

      {/* Use user slippage */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-v3-dark/75">Use user slippage</p>
          <p className="text-xs text-v3-dark/30">{`Prevent Initial slippage from overriding user's last saved slippage`}</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={useUserSlippage}
          onClick={() => setValue('useUserSlippage', !useUserSlippage)}
        />
      </div>
      <div className="w-full border-b-2 border-v3-dark py-3" />

      {/* Initial Slippage */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-v3-dark/75">Initial slippage</p>
          <p className="text-xs text-v3-dark/30">Slippage to be prefilled on first load</p>
          {useUserSlippage && <p className="text-xs text-warning">Use user slippage is true</p>}
        </div>
      </div>
      <input
        className="mt-2 text-v3-dark w-full flex justify-between items-center space-x-2 text-left bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border-2 border-v3-dark"
        value={formProps.initialSlippageBps}
        inputMode="numeric"
        maxLength={4}
        onChange={(e) => {
          const regex = /^[0-9\b]+$/;
          const value = e.target.value;
          if (value === '' || regex.test(value)) {
            setValue('formProps.initialSlippageBps', Number(value));
          }
        }}
      />
      <div className="w-full border-b-2 border-v3-dark py-3" />

      {/* Initial Amount */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-v3-dark/75">Initial amount</p>
          <p className="text-xs text-v3-dark/30">Amount to be prefilled on first load</p>
        </div>
      </div>
      <input
        className="mt-2 text-v3-dark w-full flex justify-between items-center space-x-2 text-left bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border-2 border-v3-dark"
        value={formProps.initialAmount}
        inputMode="numeric"
        onChange={(e) => {
          const regex = /^[0-9\b]+$/;
          const value = e.target.value;
          if (value === '' || regex.test(value)) {
            setValue('formProps.initialAmount', value);
          }
        }}
      />
      <div className="w-full border-b-2 border-v3-dark py-3" />

      {/* Wallet passthrough */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-v3-dark/75">Simulate wallet passthrough</p>
          <p className="text-xs text-v3-dark/30">Simulate Terminal with a fake wallet passthrough</p>
          <p className="text-xs text-v3-dark/30">(Testing available on Desktop only)</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={simulateWalletPassthrough}
          onClick={() => setValue('simulateWalletPassthrough', !simulateWalletPassthrough)}
        />
      </div>
      <div className="w-full border-b-2 border-v3-dark py-3" />

      {/* Strict Token List  */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-v3-dark/75">Strict Token List</p>
          <p className="text-xs text-v3-dark/30">{`The strict list contains a smaller set of validated tokens. To see all tokens, toggle "off".`}</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={strictTokenList}
          onClick={() => setValue('strictTokenList', !strictTokenList)}
        />
      </div>
      <div className="w-full border-b-2 border-v3-dark py-3" />

      {/* Preferred Explorer  */}
      <div className="relative inline-block text-left text-v3-dark w-full mt-5">
        <p className="text-v3-dark text-sm font-semibold">Preferred Explorer</p>

        <div className="mt-4">
          <button
            onClick={() => setIsExplorerDropdownOpen(!isExplorerDropdownOpen)}
            type="button"
            className="w-full flex justify-between items-center space-x-2 text-left bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border-2 border-v3-dark"
            id="menu-button"
            aria-expanded="true"
            aria-haspopup="true"
          >
            <div className="flex items-center justify-center space-x-2.5">
              <p>{Object.values(AVAILABLE_EXPLORER).find((item) => item.name === defaultExplorer)?.name}</p>
            </div>

            <ChevronDownIcon />
          </button>

          {isExplorerDropdownOpen ? (
            <div
              className="absolute left-0 bottom-6 z-10 ml-1 mt-1 origin-top-right shadow-xl bg-zinc-700 w-full border-2 border-white/20"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
            >
              {AVAILABLE_EXPLORER.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setValue('defaultExplorer', item.name);
                    setIsExplorerDropdownOpen(false);
                  }}
                  type="button"
                  className={classNames(
                    'flex items-center w-full px-4 py-2 text-sm hover:bg-white/20 text-left',
                    active === index ? '' : '',
                    index !== AVAILABLE_EXPLORER.length - 1 ? 'border-b-2 border-v3-dark' : '',
                  )}
                >
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FormConfigurator;
