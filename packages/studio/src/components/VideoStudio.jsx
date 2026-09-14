import { useEffect, useState } from 'react';
import { getMuapiPriceMap } from '../utils/muapiPricing';

export default function VideoStudio() {
  const [priceMap, setPriceMap] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const prices = await getMuapiPriceMap();
        setPriceMap(prices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pricing');
      }
    };

    loadPricing();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return <div>{priceMap ? 'Pricing loaded' : 'Loading pricing...'}</div>;
}
