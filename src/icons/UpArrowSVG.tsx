import React from "react";
import { positiveTextColor } from "../constants";

export const UpArrowSVG: React.FC<{}> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={positiveTextColor}
    width="14px"
    height="14px"
    viewBox="0 0 24 24"
  >
    <title />

    <g id="Complete">
      <g id="arrow-up-right">
        <g>
          <polyline
            data-name="Right"
            fill={positiveTextColor}
            id="Right-2"
            points="18.7 12.4 18.7 5.3 11.6 5.3"
            stroke="#39800B"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />

          <line
            fill={positiveTextColor}
            stroke="#39800B"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            x1="5.3"
            x2="17.1"
            y1="18.7"
            y2="6.9"
          />
        </g>
      </g>
    </g>
  </svg>
);
