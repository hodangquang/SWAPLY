import React from 'react';
import styled from 'styled-components';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
}

const Loader = ({ fullScreen = true, message = "Đang tải dữ liệu..." }: LoaderProps) => {
  return (
    <StyledWrapper className={fullScreen ? "fullscreen" : ""}>
      <div className="loader-container">
        <div className="loader">
          <svg height={0} width={0} viewBox="0 0 64 64" className="absolute">
            <defs>
              <linearGradient gradientUnits="userSpaceOnUse" y2={2} x2={0} y1={62} x1={0} id="b">
                <stop stopColor="#ff385c" />
                <stop stopColor="#973BED" offset={1} />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" y2={0} x2={0} y1={64} x1={0} id="c">
                <stop stopColor="#ff385c" />
                <stop stopColor="#007CFF" offset={1} />
                <animateTransform repeatCount="indefinite" keySplines=".42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1" keyTimes="0; 0.125; 0.25; 0.375; 0.5; 0.625; 0.75; 0.875; 1" dur="8s" values="0 32 32;-270 32 32;-270 32 32;-540 32 32;-540 32 32;-810 32 32;-810 32 32;-1080 32 32;-1080 32 32" type="rotate" attributeName="gradientTransform" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" y2={2} x2={0} y1={62} x1={0} id="d">
                <stop stopColor="#007CFF" />
                <stop stopColor="#ff385c" offset={1} />
              </linearGradient>
            </defs>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height={64} width={64} className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth={8} stroke="url(#b)" d="M 54.722656,3.9726563 A 2.0002,2.0002 0 0 0 54.941406,4 h 5.007813 C 58.955121,17.046124 49.099667,27.677057 36.121094,29.580078 a 2.0002,2.0002 0 0 0 -1.708985,1.978516 V 60 H 29.587891 V 31.558594 A 2.0002,2.0002 0 0 0 27.878906,29.580078 C 14.900333,27.677057 5.0448787,17.046124 4.0507812,4 H 9.28125 c 1.231666,11.63657 10.984383,20.554048 22.6875,20.734375 a 2.0002,2.0002 0 0 0 0.02344,0 c 11.806958,0.04283 21.70649,-9.003371 22.730469,-20.7617187 z" className="dash" id="y" pathLength={360} />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" style={{ transformOrigin: 'center' }} viewBox="0 0 64 64" height={64} width={64} className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth={10} stroke="url(#c)" d="M 32 32 m 0 -27 a 27 27 0 1 1 0 54 a 27 27 0 1 1 0 -54" className="spin" id="o" pathLength={360} />
          </svg>
          <div className="w-2" />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" style={{ transformOrigin: 'center' }} viewBox="0 0 64 64" height={64} width={64} className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth={8} stroke="url(#d)" d="M 4,4 h 4.6230469 v 25.919922 c -0.00276,11.916203 9.8364941,21.550422 21.7500001,21.296875 11.616666,-0.240651 21.014356,-9.63894 21.253906,-21.25586 a 2.0002,2.0002 0 0 0 0,-0.04102 V 4 H 56.25 v 25.919922 c 0,14.33873 -11.581192,25.919922 -25.919922,25.919922 a 2.0002,2.0002 0 0 0 -0.0293,0 C 15.812309,56.052941 3.998433,44.409961 4,29.919922 Z" className="dash" id="u" pathLength={360} />
          </svg>
        </div>
        <div className="logo-text">SWAPLY</div>
        {message && <div className="loading-message">{message}</div>}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  &.fullscreen {
    position: fixed;
    inset: 0;
    z-index: 99999;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
  }

  .loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .absolute {
    position: absolute;
  }

  .inline-block {
    display: inline-block;
  }

  .loader {
    display: flex;
    margin: 0.25em 0;
  }

  .w-2 {
    width: 0.5em;
  }

  .dash {
    animation: dashArray 2s ease-in-out infinite,
      dashOffset 2s linear infinite;
  }

  .spin {
    animation: spinDashArray 2s ease-in-out infinite,
      spin 8s ease-in-out infinite,
      dashOffset 2s linear infinite;
    transform-origin: center;
  }

  .logo-text {
    font-size: 2.5rem;
    font-weight: 900;
    letter-spacing: 0.2em;
    background: linear-gradient(135deg, #ff385c 0%, #973BED 50%, #007CFF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-top: 1.5rem;
    animation: pulse 2s ease-in-out infinite;
    text-align: center;
    font-family: sans-serif;
  }

  .loading-message {
    font-size: 0.85rem;
    color: #666;
    margin-top: 0.5rem;
    font-weight: 500;
    letter-spacing: 0.05em;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.7;
      transform: scale(0.97);
    }
    50% {
      opacity: 1;
      transform: scale(1.03);
    }
  }

  @keyframes dashArray {
    0% {
      stroke-dasharray: 0 1 359 0;
    }
    50% {
      stroke-dasharray: 0 359 1 0;
    }
    100% {
      stroke-dasharray: 359 1 0 0;
    }
  }

  @keyframes spinDashArray {
    0% {
      stroke-dasharray: 270 90;
    }
    50% {
      stroke-dasharray: 0 360;
    }
    100% {
      stroke-dasharray: 270 90;
    }
  }

  @keyframes dashOffset {
    0% {
      stroke-dashoffset: 365;
    }
    100% {
      stroke-dashoffset: 5;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    12.5%, 25% {
      transform: rotate(270deg);
    }
    37.5%, 50% {
      transform: rotate(540deg);
    }
    62.5%, 75% {
      transform: rotate(810deg);
    }
    87.5%, 100% {
      transform: rotate(1080deg);
    }
  }
`;

export default Loader;
