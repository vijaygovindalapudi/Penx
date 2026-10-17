import React, { useId } from "react";

export default function BrandLogo({
  variant = "reversed",
  size = 40,
  className = "",
  alt = "PenX",
  showTagline = false,
}) {
  const id = useId().replace(/:/g, "");
  const maskId = `penx-counter-${id}`;

  const height =
    Number.isFinite(Number(size)) && Number(size) > 0
      ? Number(size)
      : 40;

  const symbolOnly = variant === "symbol";
  const lightBackground = variant === "primary";

  const counterPath =
    "M61 56C56 55 53 59 53 64V108C53 114 57 119 63 117C86 110 112 95 112 78C112 68 84 58 61 56Z";

  return (
    <span
      role="img"
      aria-label={alt}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: height * 0.23,
        flexShrink: 0,
        verticalAlign: "middle",
        whiteSpace: "nowrap",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 160 240"
        width={height * (2 / 3)}
        height={height}
        fill="none"
        aria-hidden="true"
        focusable="false"
        style={{
          display: "block",
          flexShrink: 0,
          width: height * (2 / 3),
          height,
        }}
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="160"
            height="240"
          >
            <rect width="160" height="240" fill="white" />
            <path d={counterPath} fill="black" />
          </mask>
        </defs>

        {/* Cyan diagonal: hidden X */}
        <path
          d="M22 104L145 76V117C145 131 139 139 129 149L53 224C42 235 22 228 22 212V104Z"
          fill="#00BFFF"
          mask={`url(#${maskId})`}
        />

        {/* USB connector, P curve and crossing ribbon */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d={
            "M66 8H100C103 8 105 10 105 13V34" +
            "C129 40 145 55 145 76" +
            "C145 98 127 117 106 131L82 147L133 198" +
            "C143 208 143 218 133 227" +
            "C125 235 115 234 106 225L38 157" +
            "C27 146 22 132 22 117V73" +
            "C22 50 38 35 61 32V13C61 10 63 8 66 8Z" +
            counterPath
          }
          fill={lightBackground ? "#111B2B" : "#F5F7FA"}
        />
      </svg>

      {!symbolOnly && (
        <span
          aria-hidden="true"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: height * 0.065,
          }}
        >
          <span
            style={{
              fontFamily:
                "Inter, ui-sans-serif, system-ui, sans-serif",
              fontSize: height * 0.73,
              fontWeight: 750,
              lineHeight: 1,
              letterSpacing: "-0.045em",
              color: lightBackground ? "#111B2B" : "#F5F7FA",
            }}
          >
            Pen<span style={{ color: "#00BFFF" }}>X</span>
          </span>

          {showTagline && (
            <span
              style={{
                fontSize: height * 0.145,
                lineHeight: 1.4,
                letterSpacing: "0.025em",
                color: lightBackground ? "#526174" : "#B8C4D5",
              }}
            >
              Your files. Your control.
            </span>
          )}
        </span>
      )}
    </span>
  );
}