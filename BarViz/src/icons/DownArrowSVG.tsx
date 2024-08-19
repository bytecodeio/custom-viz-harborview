import React from "react";
import { negativeTextColor } from "../constants";

export const DownArrowSVG: React.FC<{}> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={negativeTextColor}
    width="14px"
    height="14px"
    viewBox="0 0 24 24"
  >
    <title />
    <g id="Complete">
      <g id="arrow-down-right">
        <g>
          <polyline
            fill="none"
            data-name="Right"
            id="Right-2"
            points="11.6 18.7 18.7 18.7 18.7 11.6"
            stroke={negativeTextColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />

          <line
            fill="none"
            stroke={negativeTextColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            x1="5.3"
            x2="17.1"
            y1="5.3"
            y2="17.1"
          />
        </g>
      </g>
    </g>
  </svg>
);
