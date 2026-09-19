import { useEffect, useState } from 'react';
import { getMuapiPriceMap } from '../utils/muapiPricing';

export default function ImageStudio() {
  const [priceMap, setPriceMap] = useState(null);
  const [pricingStatus, setPricingStatus] = useState('loading');

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const prices = await getMuapiPriceMap();
        setPriceMap(prices);
        setPricingStatus('loaded');
      } catch {
        setPricingStatus('unavailable');
      }
    };

    loadPricing();
  }, []);

  if (pricingStatus === 'unavailable') {
    return <div>Pricing temporarily unavailable</div>;
  }

  return <div>{priceMap ? 'Pricing loaded' : 'Loading pricing...'}</div>;
}
