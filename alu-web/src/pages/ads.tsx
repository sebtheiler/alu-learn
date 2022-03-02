import { useDetectAdBlock } from 'adblock-detect-react';
import { useEffect, useMemo } from 'react';
import './ads.scss';

type AdType = 'meta-sidebar' | 'finished-studying';
export default function AdComponent({ adType, isPro }: { adType: AdType, isPro: boolean}) {
  const adBlockDetected = useDetectAdBlock();
  const slot = useMemo(() => {
    switch (adType) {
      case 'meta-sidebar':
        return '5982440524';
      case 'finished-studying':
        return '5954520366';
    }
  }, [adType]);

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
        data-ad-test='on'
        data-ad-client='ca-pub-8039497825015260'
        data-ad-slot={slot}
        data-ad-format='auto'
        data-full-width-responsive='true'
      />
    </div>
  );
}
