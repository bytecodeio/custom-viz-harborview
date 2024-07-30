import React from "react";
import { DownArrowSVG } from "../icons/DownArrowSVG";
import { UpArrowSVG } from "../icons/UpArrowSVG";
import { TooltipData } from "../types";



const Tooltip: React.FC<TooltipData> = (
  props
) => {
  const  {  left, top, yAlign, dimensionLabel, dimensionValue, measureValue, comparisonMeasureValue, measureLabel, comparisonMeasureLabel, comparisonPercent} = props
  console.log('in the final tooltip:',  left, top, yAlign, dimensionLabel, dimensionValue, measureValue, comparisonMeasureValue, measureLabel, comparisonMeasureLabel, comparisonPercent)
  return (
    <div
      className={`chartjs-tooltip ${yAlign ?? "no-transform"}`}
      style={{ left: left, top: top }}
    >
      <div className="measure-label">{dimensionLabel}: {dimensionValue}</div>
      <div className="measure-label">{measureLabel}: {measureValue}</div>
      <div className="comparison-measure-label">{comparisonMeasureLabel}: {comparisonMeasureValue}</div>
      <div className="comparison-percent">Difference: {comparisonPercent}</div>
    </div>
  );
};

export default Tooltip;
