// Adapted from https://codesandbox.io/s/react-material-design-ripple-effect-kn1tr?file=/src/Ripple.jsx
import { useLayoutEffect, useState } from 'react';
import './style.scss';

const useDebouncedRippleCleanUp = (
  rippleCount: number,
  duration: number,
  cleanUpFunction: () => void,
) => {
  useLayoutEffect(() => {
    let bounce = null;
    if (rippleCount > 0) {
      clearTimeout(bounce);

      bounce = setTimeout(() => {
        cleanUpFunction();
        clearTimeout(bounce);
      }, duration * 4);
    }

    return () => clearTimeout(bounce);
  }, [rippleCount, duration, cleanUpFunction]);
}

interface RippleProps {
  /**
   * Color of the ripple effect
   */
  color?: string;
}
export default function Ripple({ color='white' }: RippleProps) {
  const [rippleArray, setRippleArray] = useState([]);

  useDebouncedRippleCleanUp(rippleArray.length, 800, () => {
    setRippleArray([]);
  });

  const addRipple = (event: React.MouseEvent<HTMLElement>) => {
    const rippleContainer = event.currentTarget.getBoundingClientRect();
    const scrollTop = document.documentElement.scrollTop;

    const size =
      rippleContainer.width > rippleContainer.height
        ? rippleContainer.width
        : rippleContainer.height;
    const x = event.pageX - rippleContainer.x - size / 2;
    const y = event.pageY - rippleContainer.y - size / 2 - scrollTop;

    const newRipple = {
      x,
      y,
      size
    };

    setRippleArray([...rippleArray, newRipple]);
  }

  return (
    <div className='absolute top-0 right-0 bottom-0 left-0' onClick={addRipple}>
      {rippleArray.length > 0 &&
        rippleArray.map((ripple, index) =>
          <span
            key={'span' + index}
            className='ripple'
            style={{
              top: ripple.y,
              left: ripple.x,
              width: ripple.size,
              height: ripple.size,
              background: color,
            }}
          />
        )
      }
    </div>
  );
}
