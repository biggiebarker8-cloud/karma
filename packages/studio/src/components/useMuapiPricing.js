import { useEffect, useState } from 'react';
import { getMuapiPriceMap } from '../utils/muapiPricing.js';

export function useMuapiPricing() {
  const [priceMap, setPriceMap] = useState(null);
  const [pricingStatus, setPricingStatus] = useState('loading');

  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();

    const loadPricing = async () => {
      try {
        const prices = await getMuapiPriceMap({ signal: abortController.signal });
        if (!isActive) {
          return;
        }
        setPriceMap(prices);
        setPricingStatus('loaded');
      } catch {
        if (!isActive) {
          return;
        }
        setPricingStatus('unavailable');
      }
    };

    loadPricing();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, []);

  return { priceMap, pricingStatus };
}
