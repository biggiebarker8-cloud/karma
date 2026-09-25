import { useMuapiPricing } from './useMuapiPricing.js';

export default function VideoStudio() {
  const { priceMap, pricingStatus } = useMuapiPricing();

  if (pricingStatus === 'unavailable') {
    return <div>Pricing temporarily unavailable</div>;
  }

  return <div>{priceMap ? 'Pricing loaded' : 'Loading pricing...'}</div>;
}
