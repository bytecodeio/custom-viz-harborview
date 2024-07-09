import React from "react";
import { DownArrowSVG } from "../icons/DownArrowSVG";
import { UpArrowSVG } from "../icons/UpArrowSVG";
import { TooltipData, TooltipRow } from "../types";

interface TooltipRowProps {
  hasPivot: boolean;
  hasNoPivot: boolean;
  style: React.CSSProperties;
  tooltipRow: TooltipRow;
}

const TooltipRow: React.FC<TooltipRowProps> = ({
  hasPivot,
  hasNoPivot,
  style,
  tooltipRow,
}) => {
  const {
    hasPreviousPeriod,
    measureValue,
    periodComparisonValue,
    pivotColor,
    pivotText,
    dimensionName,
    dimensionLabel,
    measureLabel,
    measureLabel0,
    dimensionLabel0
  } = tooltipRow;


  return (
    <div className="tooltip-row" style={style}>

      {hasPivot && (
        <div className="pivot-label">
          <div
            className="pivot-color"
            style={{ backgroundColor: pivotColor }}
          ></div>
          <div className="pivot-text">{pivotText}</div>
        </div>
      )}
      {hasPivot && (
      <div className="measure-comparison-wrapper">

        <div className="measure-value">{measureValue}</div>

      </div>
        )}


    </div>
  );
};

interface TooltipProps {
  hasPivot: boolean;
  hasNoPivot: boolean;

}

const Tooltip: React.FC<TooltipProps> = (
  { hasPivot, hasNoPivot, tooltipData, measureValue, dimensionName, measureLabel, dimensionLabel0, measureLabel0 }


) => {
const { dimensionLabel, left, rows, top, yAlign, measureValue, dimensionName, measureLabel, dimensionLabel0, measureLabel0 } = tooltipData;

  return (
    <div
      className={`chartjs-tooltip ${yAlign ?? "no-transform"}`}
      style={{ left, top }}
    >

      {hasPivot && (
      <div className="dimension-label mb-3">{dimensionLabel}</div>

      )}

      {hasNoPivot && (
      <div className="measure-comparison-wrapper d-flex flex-column justify-content-start text-left align-item-start">


      <div className="dimension-label">{dimensionLabel0}</div>
      <div className="dimension-label">{dimensionLabel}</div>
      <div className="dimension-label">{measureLabel}</div>
      <div className="dimension-label">{measureLabel0}</div>

      </div>
        )}

      {rows.map((tooltipRow, i) => (
        <TooltipRow
          hasPivot={hasPivot}
          hasNoPivot={hasNoPivot}
          key={tooltipRow.pivotColor}
          style={{ marginTop: i > 0 ? "8px" : "3px" }}
          tooltipRow={tooltipRow}
        />
      ))}
    </div>
  );
};

export default Tooltip;
