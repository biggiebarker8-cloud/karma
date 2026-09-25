import { useEffect, useState } from 'react';
import { getMuapiPriceMap } from '../utils/muapiPricing.js';

export function useMuapiPricing() {
  const [priceMap, setPriceMap] = useState(null);
  const [pricingStatus, setPricingStatus] = useState('loading');

  useEffect(() => {
    let isActive = true;

    const loadPricing = async () => {
      try {
        const prices = await getMuapiPriceMap();
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
    };
  }, []);

  return { priceMap, pricingStatus };
}
