import debounce from 'lodash/debounce';

const checkWalletAvailability = debounce(async () => {
  const response = await window?.solana?.isPhantom;
  return !!response;
}, 5000); // Check every 5 seconds instead of continuously