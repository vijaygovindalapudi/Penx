import { useEffect, useId, useRef } from "react";
import BrandLogo from "./BrandLogo";

const DURATION = 5600;

export default function StartupAnimation({ onComplete }) {
  const id = useId().replace(/:/g, "");
  const finished = useRef(false);
  const callback = useRef(onComplete);
  callback.current = onComplete;

  function finish() {
    if (finished.current) return;
    finished.current = true;
    callback.current();
  }

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function complete() {
      if (finished.current) return;
      finished.current = true;
      callback.current();
    }

    const timer = window.setTimeout(
      complete,
      reduced ? 150 : DURATION
    );

    function handleKey(event) {
      if (event.key === "Escape") complete();
    }

    window.addEventListener("keydown", handleKey);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  const paint = (name) => `url(#${id}-${name})`;

  return (
    <div className="px-intro">
      <style>{styles}</style>

      <div className="px-intro-grid" aria-hidden="true" />
      <div className="px-intro-aurora" aria-hidden="true" />

      <div className="px-intro-top" aria-hidden="true">
        <span className="px-intro-dot" />
        PENX
      </div>

      <div className="px-intro-stage">
        <svg
          className="px-intro-device-scene"
          viewBox="0 0 900 460"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient
              id={`${id}-frame`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop stopColor="#7595AF" />
              <stop offset=".35" stopColor="#253D53" />
              <stop offset="1" stopColor="#102032" />
            </linearGradient>

            <linearGradient
              id={`${id}-screen`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop stopColor="#132A40" />
              <stop offset=".55" stopColor="#091421" />
              <stop offset="1" stopColor="#07101C" />
            </linearGradient>

            <linearGradient
              id={`${id}-usb`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop stopColor="#426079" />
              <stop offset=".12" stopColor="#253F55" />
              <stop offset=".55" stopColor="#12273B" />
              <stop offset="1" stopColor="#091726" />
            </linearGradient>

            <linearGradient
              id={`${id}-metal`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop stopColor="#E5F0F9" />
              <stop offset=".45" stopColor="#8EA7BE" />
              <stop offset="1" stopColor="#4D687F" />
            </linearGradient>

            <linearGradient id={`${id}-trail`}>
              <stop stopColor="#00C8FF" stopOpacity="0" />
              <stop offset="1" stopColor="#00C8FF" />
            </linearGradient>

            <radialGradient id={`${id}-floor`}>
              <stop stopColor="#00BFFF" stopOpacity=".22" />
              <stop offset="1" stopColor="#00BFFF" stopOpacity="0" />
            </radialGradient>

            <radialGradient id={`${id}-screen-light`}>
              <stop stopColor="#39DDFF" stopOpacity=".4" />
              <stop offset="1" stopColor="#00BFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Soft pool of light underneath the hardware */}
          <ellipse
            cx="455"
            cy="344"
            rx="305"
            ry="48"
            fill={paint("floor")}
            className="px-intro-floor"
          />

          {/* Everything is aligned around the port at x=410, y=285. */}
          <g>
            <g className="px-intro-usb">
              <g className="px-intro-trails">
                <path
                  d="M20 271H257"
                  stroke={paint("trail")}
                  strokeWidth="1"
                />
                <path
                  d="M70 285H257"
                  stroke={paint("trail")}
                  strokeWidth="2"
                />
                <path
                  d="M130 299H257"
                  stroke={paint("trail")}
                  strokeWidth="1"
                />
              </g>

              {/* Connector: slides underneath the laptop edge */}
              <rect
                x="370"
                y="275"
                width="52"
                height="20"
                rx="2"
                fill={paint("metal")}
              />
              <path
                d="M380 277V293M388 277V293"
                stroke="#536B80"
                strokeWidth="2"
              />

              {/* USB housing */}
              <rect
                x="260"
                y="260"
                width="112"
                height="50"
                rx="15"
                fill={paint("usb")}
                stroke="#7599B4"
                strokeWidth="1.3"
              />

              <path
                d="M276 263H356"
                stroke="#C4E5F9"
                strokeOpacity=".5"
                strokeLinecap="round"
              />

              <rect
                x="270"
                y="274"
                width="14"
                height="22"
                rx="6"
                fill="#081421"
                stroke="#4F718C"
              />

              <path
                d="M310 275L329 295M329 275L310 295"
                stroke="#23D4FF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              <circle
                className="px-intro-usb-led"
                cx="355"
                cy="285"
                r="3"
                fill="#426A82"
              />
            </g>

            <g className="px-intro-laptop">
              {/* Display housing */}
              <rect
                x="443"
                y="105"
                width="280"
                height="163"
                rx="14"
                fill={paint("frame")}
                stroke="#8AA8BE"
                strokeWidth="1.3"
              />

              <rect
                x="451"
                y="113"
                width="264"
                height="147"
                rx="9"
                fill={paint("screen")}
              />

              <path
                d="M458 116H701"
                stroke="#D0EAFB"
                strokeOpacity=".15"
                strokeLinecap="round"
              />

              <circle
                cx="583"
                cy="109"
                r="1.8"
                fill="#8BAABD"
              />

              {/* Screen content appears only after connection */}
              <g className="px-intro-screen-on">
                <ellipse
                  cx="583"
                  cy="191"
                  rx="122"
                  ry="67"
                  fill={paint("screen-light")}
                />

                <path
                  d="M473 227L511 195L543 210L578 166L613 186L652 147L694 164"
                  stroke="#42DFFF"
                  strokeWidth="1.4"
                  strokeOpacity=".65"
                  fill="none"
                />

                <path
                  d="M473 239H693"
                  stroke="#2B94BE"
                  strokeOpacity=".35"
                />

                <rect
                  x="565"
                  y="169"
                  width="36"
                  height="36"
                  rx="10"
                  fill="#103A50"
                  stroke="#51E1FF"
                />

                <path
                  d="M574 187L581 194L593 180"
                  stroke="#9BF0FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </g>

              {/* Keyboard deck */}
              <path
                d="M435 268H731L759 291H410Z"
                fill="#21394D"
                stroke="#688AA4"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {[0, 1, 2].map((row) => (
                <path
                  key={row}
                  d={`M${455 - row * 5} ${273 + row * 4}
                      H${710 + row * 5}`}
                  stroke="#59768D"
                  strokeOpacity=".55"
                  strokeWidth="1"
                />
              ))}

              <path
                d="M551 282H610L616 287H545Z"
                fill="#162C3F"
                stroke="#58778D"
                strokeWidth=".7"
              />

              {/* Front edge occludes the inserted connector */}
              <path
                d="M410 271L435 268L759 291V300H410Z"
                fill="#12283B"
                stroke="#5B7D97"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              <path
                d="M438 291H750"
                stroke="#84AAC3"
                strokeOpacity=".55"
              />

              <path
                d="M410 275H422V295H410"
                fill="#07111C"
                stroke="#35D5FF"
                strokeWidth="1.4"
              />

              <path
                className="px-intro-edge-light"
                d="M423 295H752"
                stroke="#39DDFF"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>

            {/* One small pulse at the exact connection point */}
            <g className="px-intro-pulse">
              <circle
                cx="411"
                cy="285"
                r="20"
                fill="none"
                stroke="#4CDFFF"
                strokeWidth="1.5"
              />
              <circle
                cx="411"
                cy="285"
                r="6"
                fill="#C4F7FF"
              />
            </g>
          </g>
        </svg>

        <div className="px-intro-title">
          <div className="px-intro-logo-glow" aria-hidden="true" />

          <div className="px-intro-logo">
            <BrandLogo size={108} showTagline={false} />
          </div>

          <div className="px-intro-title-line" aria-hidden="true" />

          <p className="px-intro-tagline">
            Your files. Your control.
          </p>
        </div>
      </div>

      <div className="px-intro-bottom" aria-hidden="true">
        <span>CONNECT.</span>
        <span>PROTECT.</span>
        <span>OWN IT.</span>
      </div>

      <button
        type="button"
        className="px-intro-skip"
        onClick={finish}
      >
        Skip intro <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}

const styles = `
.px-intro {
  position: fixed;
  inset: 0;
  z-index: 100000;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: #f5f7fa;
  background: #070d17;
  font-family: Inter, system-ui, sans-serif;
  isolation: isolate;
}

.px-intro-grid {
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: .12;
  background-image:
    linear-gradient(#24405c 1px, transparent 1px),
    linear-gradient(90deg, #24405c 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(
    ellipse at center,
    black,
    transparent 65%
  );
}

.px-intro-aurora {
  position: absolute;
  width: min(900px, 100vw);
  height: 650px;
  border-radius: 50%;
  z-index: -1;
  background: radial-gradient(
    ellipse,
    #07384c 0%,
    #0a1c30 35%,
    transparent 70%
  );
  opacity: .7;
  animation: pxAmbient 5.6s both;
}

.px-intro-top {
  position: absolute;
  top: 34px;
  left: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .32em;
  color: #9ab0c5;
}

.px-intro-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #25d5ff;
  box-shadow: 0 0 14px #00bfff80;
}

.px-intro-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: min(1080px, 100vw);
  aspect-ratio: 900 / 460;
}

.px-intro-device-scene {
  width: 100%;
  display: block;
  overflow: visible;
  animation: pxHardware 5.6s both;
}

.px-intro-usb {
  animation: pxUsb 2.5s both;
}

.px-intro-laptop {
  animation: pxLaptop 1.95s cubic-bezier(.18,.72,.2,1) both;
}

.px-intro-trails {
  animation: pxTrails 2.5s both;
}

.px-intro-floor {
  animation: pxFloor 5.6s both;
}

.px-intro-usb-led {
  animation: pxLed 5.6s both;
}

.px-intro-screen-on {
  animation: pxScreen 5.6s both;
}

.px-intro-edge-light {
  stroke-dasharray: 340;
  stroke-dashoffset: 340;
  animation: pxEdge 5.6s both;
}

.px-intro-pulse {
  transform-origin: 411px 285px;
  animation: pxPulse 5.6s both;
}

.px-intro-title {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: pxTitle 5.6s both;
}

.px-intro-logo {
  position: relative;
  z-index: 1;
}

.px-intro-logo-glow {
  position: absolute;
  width: 420px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse,
    #00bfff18,
    transparent 70%
  );
}

.px-intro-title-line {
  width: 54px;
  height: 1px;
  margin: 25px 0 18px;
  background: linear-gradient(
    90deg,
    transparent,
    #39dcff,
    transparent
  );
  animation: pxTagline 5.6s both;
}

.px-intro-tagline {
  margin: 0;
  font-size: clamp(12px, 1.5vw, 17px);
  letter-spacing: .13em;
  color: #b9c9d9;
  animation: pxTagline 5.6s both;
}

.px-intro-bottom {
  position: absolute;
  bottom: 42px;
  display: flex;
  gap: 22px;
  color: #68849d;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: .22em;
}

.px-intro-bottom span:nth-child(2) {
  color: #87b5c9;
}

.px-intro-skip {
  position: absolute;
  right: 30px;
  bottom: 29px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 11px 15px;
  border: 1px solid #ffffff14;
  border-radius: 10px;
  background: #ffffff04;
  color: #91a8bd;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  transition:
    color .2s,
    background .2s,
    border-color .2s;
}

.px-intro-skip:hover {
  color: white;
  background: #00bfff0d;
  border-color: #00bfff55;
}

.px-intro-skip:focus-visible {
  outline: 2px solid #00bfff;
  outline-offset: 4px;
}

@keyframes pxUsb {
  0% {
    opacity: 0;
    transform: translateX(-480px);
  }
  12% { opacity: 1; }
  74% {
    opacity: 1;
    transform: translateX(-26px);
    animation-timing-function: ease-out;
  }
  85% {
    opacity: 1;
    transform: translateX(-26px);
    animation-timing-function: cubic-bezier(.4,0,.2,1);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pxLaptop {
  from {
    opacity: 0;
    transform: translateX(480px);
  }
  15% { opacity: 1; }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pxTrails {
  0%, 10% { opacity: 0; }
  30%, 55% { opacity: .55; }
  83%, 100% { opacity: 0; }
}

@keyframes pxLed {
  0%, 44% { fill: #426a82; }
  46%, 100% { fill: #71edff; }
}

@keyframes pxScreen {
  0%, 45% { opacity: 0; }
  54%, 100% { opacity: 1; }
}

@keyframes pxEdge {
  0%, 45% {
    opacity: 0;
    stroke-dashoffset: 340;
  }
  46% { opacity: 1; }
  56%, 100% {
    opacity: 1;
    stroke-dashoffset: 0;
  }
}

@keyframes pxPulse {
  0%, 44% {
    opacity: 0;
    transform: scale(.3);
  }
  46% {
    opacity: .9;
    transform: scale(.5);
  }
  57%, 100% {
    opacity: 0;
    transform: scale(3.5);
  }
}

@keyframes pxHardware {
  0%, 55% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
  66%, 100% {
    opacity: 0;
    transform: scale(1.055);
    filter: blur(5px);
  }
}

@keyframes pxTitle {
  0%, 63% {
    opacity: 0;
    transform: translateY(14px) scale(.94);
    filter: blur(6px);
  }
  77%, 100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes pxTagline {
  0%, 76% {
    opacity: 0;
    transform: translateY(7px);
  }
  88%, 100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pxFloor {
  0% { opacity: 0; }
  30%, 54% { opacity: .9; }
  68%, 100% { opacity: 0; }
}

@keyframes pxAmbient {
  0% { opacity: .15; }
  45% { opacity: .55; }
  54% { opacity: .95; }
  78%, 100% { opacity: .45; }
}

@media (max-width: 600px) {
  .px-intro-top {
    top: 24px;
    left: 24px;
  }

  .px-intro-logo {
    transform: scale(.8);
  }

  .px-intro-bottom {
    bottom: 88px;
    gap: 14px;
    font-size: 8px;
  }

  .px-intro-skip {
    bottom: 24px;
    right: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .px-intro-device-scene {
    display: none;
  }

  .px-intro-title,
  .px-intro-tagline,
  .px-intro-title-line,
  .px-intro-aurora {
    animation: none;
  }
}
`;