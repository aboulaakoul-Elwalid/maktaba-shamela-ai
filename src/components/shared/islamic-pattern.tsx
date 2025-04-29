import React from "react";

interface IslamicPatternProps {
  isDark?: boolean;
}

export default function IslamicPattern({
  isDark = false,
}: IslamicPatternProps) {
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Core geometric pattern */}
        <pattern
          id="islamic-geometric"
          patternUnits="userSpaceOnUse"
          width="80"
          height="80"
        >
          {/* Eight-pointed star - classic Islamic pattern */}
          <path
            d="M40,0 L50,10 L60,10 L70,20 L80,20 L80,40 L70,40 L70,50 L60,60 L60,70 L40,80 L40,70 L30,70 L20,60 L10,60 L0,40 L10,40 L10,30 L20,20 L20,10 Z"
            fill="none"
            stroke={isDark ? "#D4A017" : "#8C2B47"}
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />

          {/* Inner geometric details */}
          <path
            d="M40,10 L40,70"
            fill="none"
            stroke={isDark ? "#D4A017" : "#8C2B47"}
            strokeWidth="0.3"
            strokeOpacity="0.4"
          />
          <path
            d="M10,40 L70,40"
            fill="none"
            stroke={isDark ? "#D4A017" : "#8C2B47"}
            strokeWidth="0.3"
            strokeOpacity="0.4"
          />
          <circle
            cx="40"
            cy="40"
            r="8"
            fill="none"
            stroke={isDark ? "#D4A017" : "#8C2B47"}
            strokeWidth="0.4"
            strokeOpacity="0.3"
          />
          <circle
            cx="40"
            cy="40"
            r="15"
            fill="none"
            stroke={isDark ? "#D4A017" : "#8C2B47"}
            strokeWidth="0.3"
            strokeOpacity="0.2"
          />
        </pattern>

        {/* Arabesque floral patterns */}
        <pattern
          id="arabesque-floral"
          patternUnits="userSpaceOnUse"
          width="200"
          height="200"
        >
          {/* Central medallion */}
          <circle
            cx="100"
            cy="100"
            r="50"
            fill="none"
            stroke={isDark ? "#D4A017" : "#8C2B47"}
            strokeWidth="0.5"
            strokeOpacity="0.15"
          />

          {/* Floral elements - stylized arabesque */}
          <path
            d="M100,50 Q130,75 100,100 Q70,75 100,50"
            fill="none"
            stroke={isDark ? "#D4A017" : "#8C2B47"}
            strokeWidth="0.6"
            strokeOpacity="0.2"
          />
          <path
            d="M100,150 Q130,125 100,100 Q70,125 100,150"
            fill="none"
            stroke={isDark ? "#D4A017" : "#8C2B47"}
            strokeWidth="0.6"
            strokeOpacity="0.2"
          />
          <path
            d="M50,100 Q75,130 100,100 Q75,70 50,100"
            fill="none"
            stroke={isDark ? "#D4A017" : "#8C2B47"}
            strokeWidth="0.6"
            strokeOpacity="0.2"
          />
          <path
            d="M150,100 Q125,130 100,100 Q125,70 150,100"
            fill="none"
            stroke={isDark ? "#D4A017" : "#8C2B47"}
            strokeWidth="0.6"
            strokeOpacity="0.2"
          />

          {/* Decorative corners */}
          <path
            d="M30,30 Q50,50 100,100 Q50,150 30,170"
            fill="none"
            stroke={isDark ? "#D4A017" : "#8C2B47"}
            strokeWidth="0.5"
            strokeOpacity="0.1"
          />
          <path
            d="M170,30 Q150,50 100,100 Q150,150 170,170"
            fill="none"
            stroke={isDark ? "#D4A017" : "#8C2B47"}
            strokeWidth="0.5"
            strokeOpacity="0.1"
          />
        </pattern>
      </defs>

      {/* Base layer - geometric pattern */}
      <rect width="100%" height="100%" fill="url(#islamic-geometric)" />

      {/* Overlay layer - arabesque floral */}
      <rect width="100%" height="100%" fill="url(#arabesque-floral)" />
    </svg>
  );
}
