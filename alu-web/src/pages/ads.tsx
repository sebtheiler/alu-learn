import { useDetectAdBlock } from 'adblock-detect-react';
import { useEffect } from 'react';
import './ads.scss';

type AdType = 'meta-sidebar' | 'finished-studying';
export default function AdComponent({ adType, isPro }: { adType: AdType, isPro: boolean}) {
  const adBlockDetected = useDetectAdBlock();

  useEffect(()=>{
    if (!isPro) {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, [isPro]);

  if (isPro) return null;
  return (
    <div className='profit-generator'>
      <p className='hr-separator'>Advertisement</p>
      {adBlockDetected && <p>
        Alu relies on ads and <a href='/pro/'>pro-mode</a> to stay free and open to all.
        We aren't a large corporation, and every bit helps.
        Please consider disabling your adblocker or <a href='/pro/'>upgrading</a> to support Alu.
        <br /><br />
        :)
      </p>}
      <ins
        className='adsbygoogle'
        style={{ display: 'block' }}
        data-ad-test={process.env.REACT_APP_DEBUG ? 'on' : 'off'}
        data-ad-client={process.env.REACT_APP_AD_CLIENT_ID}
        data-ad-slot={process.env.REACT_APP_AD_SLOTS && process.env.REACT_APP_AD_SLOTS[adType]}
        data-ad-format='auto'
        data-full-width-responsive='true'
      />
      {!adBlockDetected && <p className='mt-2 mb-0'>
        <a href='/pro/'><strong>REMOVE ADS</strong></a>
      </p>}
    </div>
  );
}
