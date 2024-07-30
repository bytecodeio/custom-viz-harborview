import {
  Fields,
  Link,
  LookerChartUtils,
  TooltipData,
  TooltipRow,
  TooltipValues,
  VisConfig,
  VisData,
} from "../types";
import getBestTextColor from "../utils/getBestTextColor";
import React, { startTransition, useRef, useEffect, useMemo, useLayoutEffect, useState } from "react";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatNumber } from "../utils";
import styled from "styled-components";
import {
  Chart as ChartJS,
  ArcElement,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip as ChartJsTooltip,
  LineController,
  BarController,
  ScatterController,
  ChartType,
  ChartOptions,
  Filler,
  ChartData,
  Point,
  BubbleDataPoint,
  ChartTypeRegistry,
  TooltipModel,
} from "chart.js";
import Tooltip from "./Tooltip";
import { Chart } from "react-chartjs-2";
import Annotation from 'chartjs-plugin-annotation';
import "bootstrap/scss/bootstrap.scss";
import chroma from 'chroma-js';

ChartJS.register(
  Annotation,
  LinearScale,
  ArcElement,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  ChartJsTooltip,
  LineController,
  BarController,
  Filler,
  ScatterController,
  ChartDataLabels
);



interface BarLineVisProps {
  data: VisData;
  fields: Fields;
  config: VisConfig;
  lookerCharts: LookerChartUtils;
  lookerVis?: any;
  element: HTMLElement;
}

const chartPlugins = [
  {
    id: "padding-below-legend",
    beforeInit(chart: any) {
      // Get a reference to the original fit function
      const originalFit = chart.legend.fit;

      // Override the fit function
      chart.legend.fit = function fit() {
        // Call the original function and bind scope in order to use `this` correctly inside it
        originalFit.bind(chart.legend)();
        this.height += 10;
      };
    },
  },
];


ChartJS.defaults.font.family = "Roboto";
ChartJS.defaults.font.size = 14;
ChartJS.defaults.color = "#262D33";

function BarLineVis({
  data,
  fields,
  config,
  lookerCharts,
  element,
}: BarLineVisProps): JSX.Element {


  // config values
  const {
    showXGridLines,
    showYGridLines,
    showXAxisLabel,
    xAxisText,
    showYAxisLabel,
    yAxisText,
    showLineChartGradient,
    showAllValuesInTooltip,
    xAxisSize,
    yAxisSize,
    color_range,
    showPercentToggle,
    colorByPerformance
  } = config;

  // Chart type toggle
  interface ChartTypeOption {
    label: string;
    value: ChartType;
  }

  const chartTypeOptions: ChartTypeOption[] = [
    {
      label: "Bar",
      value: "bar",
    },
  ];

  const [selectedChartType, setSelectedChartType] = useState(
    chartTypeOptions[0].value
  );

  const chartValueOptions = [
    {
      label: "100%",
      value: "percent",
    },
    {
      label: "Absolute",
      value: "raw",
    },

  ];

  const [selectedChartValue, setSelectedChartValue] = useState(
    chartValueOptions[0].value
  );
  // map Looker query data to ChartJS data format
  const dimensionName = fields.dimensions[0];
  const measureName = fields.measures[0];
  const benchmarkMeasureName = fields.measures[1];

  const dimensionLabel = fields.dimensionsLabel[0];
  const measureLabel = fields.measuresLabel[0];
  const comparisonMeasureLabel = fields.measuresLabel[1];

  const [firstData = {}] = data;
  let cols_to_hide = [];

  for (const [key, value] of Object.entries(firstData)) {
    if (key.split(".")[1] === "currency_number_format") {
      cols_to_hide = firstData[key].value.split(",").map((e: any) => e.trim());

    }
  }


  let text = cols_to_hide.toString()

  const labels = data.map(
    (row) => row[dimensionName].rendered ?? row[dimensionName].value ?? "∅"
  );


  const colors = config.color_range

  const hasPivot = !!fields.pivots && fields.pivots.length > 0;

  const hasNoPivot = !!fields.pivots && fields.pivots.length === 0;

  const fill = showLineChartGradient ? "origin" : false;

  const defaultChartData: ChartData<
    | "bar"
    | "line"
    | "scatter"
    | "bubble"
    | "pie"
    | "doughnut"
    | "polarArea"
    | "radar",
    (number | Point | [number, number] | BubbleDataPoint)[],
    any
  > = {
    labels,
    datasets: [],
  };
  const [chartData, setChartData] = useState(defaultChartData);


  let benchmarkAnnotations: any[] = [];

  const formatDecimal = (value: number) => {
    console.log('value:', value)
    if (value >= 1000 && value < 1000000) {
      return (value / 1000).toFixed(1) + 'K'; // Convert to K for thousands
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M'; // Convert to M for millions
    } else if (value < 10) {
      return value.toFixed(2);
    } else {
      return value.toFixed(0); // Keep as is for values less than 1000
    }
  }
  const formatDollar = (value: number) => {
    // For dollar format
    if (value >= 1000 && value < 1000000) {
      return '$' + (value / 1000).toFixed(1) + 'K'; // Convert to K for thousands
    } else if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M'; // Convert to M for millions
    } else if (value < 10) {
      return '$' + value.toFixed(2);
    } else {
      return '$' + value.toFixed(0); // Keep as is for values less than 1000
    }
  }
  // Formatter function to format numbers as dollars or with K/M suffixes
  const formatValue = (value: number) => {
    if (selectedChartValue === "raw" && valueFormat === ValueFormat.Decimal) {
      return formatDecimal(value);
    } else if (selectedChartValue === "raw" && valueFormat === ValueFormat.Currency) {
      return formatDollar(value);
    } else if (selectedChartValue === "percent") {
      return (100 * value).toFixed(1) + '%';
    } else console.log("Error in formatting values.: selectedChartValue: ", selectedChartValue, "valueFormat: ", valueFormat);
  };

  const formatDollarOrDecimal = (value: number, isDollar: boolean) => {
    if (isDollar) {
      return formatDollar(value);
    } else {
      return formatDecimal(value);
    }
  };
  const deltaFormatter = (value: number) => {
    if (value >= 0) {
      return "+" + (100 * value).toFixed(1) + '%';
    } else {
      return (100 * value).toFixed(1) + '%';
    }
  };


  let columnColor = colors ? colors : ['black'];
  if (colorByPerformance) {
    columnColor = data.map((row) => {
      const comparisonValue = row[benchmarkMeasureName].value;
      const currentValue = row[measureName].value;
      if (!currentValue || currentValue === 0) return '#bfbfbf'; // Grey

      const delta = (currentValue - comparisonValue) / comparisonValue;

      if (delta >= 0.2) return color_range[0];
      else if (delta >= 0.1) return color_range[1];
      else if (delta >= 0) return color_range[2];
      else if (delta >= -0.1) return color_range[3];
      else if (delta >= -0.2) return color_range[4];
      else return color_range[5];

    })
  }

  function updateChartData(chartType: ChartType) {
    let datasets = [];
    let canvasElement = document.getElementById("chart") as HTMLCanvasElement;
    if (canvasElement) {
      const ctx = canvasElement.getContext("2d");

      if (hasPivot) {
        const pivotValues = Object.keys(data[0][measureName]);
        let rowTotals = data.map((row) => {
          return pivotValues.reduce((acc, pivotValue) => {
            return acc + Number(row[measureName][pivotValue].value);
          }, 0);
        })
        pivotValues.forEach((pivotValue, i) => {
          const columnData = data.map(
            (row, i) => {
              if (selectedChartValue === "percent") {
                return Number(row[measureName][pivotValue].value) / rowTotals[i];
              } else {
                return Number(row[measureName][pivotValue].value);
              }
            });
          const deltaColumnData = data.map(
            (row, i) => {
              const lastYear = row[benchmarkMeasureName][pivotValue].value;
              const currentYear = row[measureName][pivotValue].value;
              if (lastYear === 0 || currentYear === 0) return 0;
              return (Number(row[measureName][pivotValue].value) -
                Number(row[benchmarkMeasureName][pivotValue].value)) /
                Number(row[benchmarkMeasureName][pivotValue].value)
            });
          datasets.push({
            datalabels: {
              anchor: 'center', // Position the anchor of the label in the center for better control
              align: "start",
              offset: -10,
              font: {
                weight: 'bold',
                size: config.labelFontSize,
              },
              color: getBestTextColor(colors[i]), // Outputs 'white' or 'black' based on contrast
              formatter: (value: any, context: any) => formatDecimal(value)
            },
            labels: pivotValues,
            type: chartType,
            label: pivotValue,
            // barThickness: 75,
            backgroundColor: `${color_range ? colors[i] : colors[i]}`,
            borderColor: `${color_range ? colors[0] : colors[0]}`,
            pointBackgroundColor: `${color_range ? colors[0] : colors[0]}`,
            data: columnData,
            yAxisID: "yLeft",
            fill,
            stack: 'stack1',
            showInLegend: true,
          });
          datasets.push({
            datalabels: {
              anchor: 'center',
              align: "start",
              offset: -10,
              font: {
                size: config.labelFontSize,
              },
              color: (context: any) => deltaColumnData[context.dataIndex] > 0 ? 'green' : 'orange', // Outputs 'white' or 'black' based on contrast
              formatter: (value: any, context: any) => deltaFormatter(deltaColumnData[context.dataIndex])

            },
            labels: pivotValues,
            type: chartType,
            label: pivotValue,
            // barThickness: 75,
            backgroundColor: 'rgba(0,0,0,0)', // Transparent
            borderColor: 'rgba(0,0,0,0)', // Transparent
            pointBackgroundColor: `${color_range ? colors[0] : colors[0]}`,
            data: columnData,
            yAxisID: "yLeft",
            fill: false,
            stack: 'stack2',
            showInLegend: false,
          });

        });
        // Add a dataset for the row totals
        datasets.push({
          datalabels: {
            anchor: 'start', // Position the label above the stack
            align: 'end',
            offset: 10,
            font: {
              weight: 'bold',
              size: config.labelFontSize,
            },
            color: '#444', // Choose a color that stands out
            formatter: (value: any, context: any) => {
              // Assuming the total for each stack is at the same index as the context's dataIndex
              return formatDecimal(rowTotals[context.dataIndex]);
            }
          },
          label: 'Total', // Label for the dataset, won't actually display since we're using this dataset only for the datalabels
          backgroundColor: 'rgba(0,0,0,0)', // Transparent
          borderColor: 'rgba(0,0,0,0)', // Transparent
          data: rowTotals.map(() => 0.001), // Use the calculated totals for each row
          yAxisID: "yLeft",
          type: 'bar', // Assuming this is a bar chart. Adjust the type as necessary.
          // barThickness: 1, // Set the bar thickness to 1px to minimize its visual impact
          showInLegend: false, // Ensure this dataset doesn't appear in the legend
          fill: false, // Ensure this dataset doesn't visually appear as part of the chart
          stack: 'stack1', // Ensure this dataset is stacked with the other datasets
        });

      }
      else {
        let finalColor = colorByPerformance ? columnColor : `${color_range ? colors[0] : colors[0]}`
        datasets.push({

          datalabels: {
            display: (context) => {
              const value = data[context.dataIndex][measureName].value;
              return !value || value === 0
            },
            formatter: formatDecimal,
          },
          labels: [],
          type: chartType,
          color: columnColor,
          label: measureLabel,
          backgroundColor: finalColor.map(x => chroma(x).alpha(0.3).css()),
          borderColor: finalColor,
          pointBackgroundColor: finalColor,
          borderWidth: 2,
          data: data.map((row) => {
            if (!row[measureName].value || row[measureName].value === 0) {
              return row[benchmarkMeasureName].value;
            }
            return row[measureName].value
          }),
          yAxisID: "yLeft",
          fill,
          borderRadius: 5,
        });


      }
      setChartData({ labels, datasets });
    }
  }

  useEffect(() => {
    updateChartData(selectedChartType);
  }, [selectedChartType, selectedChartValue, config]);

  // chart tooltip
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const hasPeriodComparisonMeasure = fields.measures.length > 1;
  const periodComparisonMeasure = fields.measures[1];



  interface TooltipContext {
    chart: ChartJS<
      keyof ChartTypeRegistry,
      (number | Point | [number, number] | BubbleDataPoint)[],
      unknown
    >;
    tooltip: TooltipModel<"bar" | "line">;
  }

  function tooltipHandler(
    context: TooltipContext,
    setTooltip: (newState: TooltipData | null) => void
  ) {
    const isTooltipVisible = context.tooltip.opacity !== 0;
    if (isTooltipVisible) {
      const position = context.chart.canvas.getBoundingClientRect();
      const { dataIndex } = context.tooltip.dataPoints[0];
      const lookerRow = data[dataIndex];
      const currentPeriodValue = lookerRow[measureName].value;
      // Period comparison
      const previousPeriodValue =
        lookerRow[benchmarkMeasureName].value;

      const hasCurrentValue: boolean = currentPeriodValue !== null && currentPeriodValue !== 0;
      const periodComparisonPercent =
        ((currentPeriodValue - previousPeriodValue) /
          previousPeriodValue) *
        100;

      const tooltipArguments: TooltipData =  {
        // dimensionLabel: `${context.tooltip.title[0]}`,
        measureLabel: `${context.tooltip.dataPoints[0].dataset.label}: `,
        // measureLabel0: `${context.tooltip.dataPoints[0].formattedValue}`,
        left: position.left + window.pageXOffset + context.tooltip.caretX + "px",
        top:
          position.top +
          window.pageYOffset +
          context.tooltip.caretY -
          20 +
          "px",
        yAlign: context.tooltip.yAlign,
        dimensionLabel: `${dimensionLabel}`,
        dimensionValue: lookerRow[dimensionName].rendered as string ?? lookerRow[dimensionName].value,
        measureValue: `${formatDecimal(currentPeriodValue)}`,
        comparisonMeasureValue: `${formatDecimal(previousPeriodValue)}`,
        // measureLabel: `${measureLabel}:`,
        comparisonMeasureLabel: `${comparisonMeasureLabel}`,
        comparisonPercent: `${periodComparisonPercent.toFixed(1)}%`,

      }
      console.log('tooltip args: ',  tooltipArguments)
      setTooltip(tooltipArguments);
    } else { 
      setTooltip(null);
     }
  }


  const annotations = data.reduce((acc, row, index) => {
    const comparisonValue = row[benchmarkMeasureName].value;
    const annotationName = `benchmark-${index}`;
    const currentValue = row[measureName].value;
    // determine if the primary value is null or zero and abort annotation creation if so

    if (!currentValue || currentValue === 0) return acc;

    // Assuming 'index' correctly maps to the bar's position on the x-axis
    // and 'benchmark' is the value for the y-axis height
    acc[annotationName] = {
      type: 'line',
      mode: 'vertical',
      xMin: index - 0.45, // Position the line at the start of the bar
      xMax: index + 0.45, // Position the line at the end of the bar (for a single point, xMin = xMax)
      yMin: comparisonValue - 3, // The bottom of the line (can be 0 if you want it to start from the bottom)
      yMax: comparisonValue + 3, // The top of the line (the benchmark value)
      borderColor: config.referenceColor || 'yellow',
      color: config.referenceColor || 'yellow',
      borderWidth: 3,
      xScaleID: 'x',
      yScaleID: 'yLeft',
    };

    const labelAnnotationName = `label-${index}`;
    const deltaLabelAnnotationname = `deltaLabel-${index}`;
    let deltaColumnData
    if (comparisonValue === 0 || currentValue === 0) deltaColumnData = 0;
    deltaColumnData = (Number(row[measureName].value) -
      Number(row[benchmarkMeasureName].value)) /
      Number(row[benchmarkMeasureName].value)

    const labelPosition = Math.max(comparisonValue, currentValue) + 5;
    const deltaValue = deltaFormatter(deltaColumnData);
    acc[labelAnnotationName] = {
      type: 'label',
      xValue: index,
      yValue: labelPosition,
      backgroundColor: 'transparent',
      content: formatDecimal(currentValue),
      color: 'black', // Main value color
      font: {
        weight: '600',
        size: config.labelFontSize,
      },
      position: {
        x: 'center',
        y: 'bottom',
      },
      xAdjust: 0,
      yAdjust: -10, // Adjust based on your chart's scale
    }
    acc[deltaLabelAnnotationname] = {
      type: 'label',
      xValue: index,
      yValue: labelPosition,
      backgroundColor: 'transparent',
      content: deltaValue,
      color: columnColor[index],
      font: {
        weight: '600',
        size: config.labelFontSize,
      },
      position: {
        x: 'center',
        y: 'bottom',
      },
      xAdjust: 0,
      yAdjust: -25, // Adjust based on your chart's scale
    }


    return acc;
  }, {});


  // chart options
  const chartOptions: ChartOptions<"bar" | "line"> = useMemo(
    () => ({
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 50,
          bottom: 10
        },
      },


      onClick: (event, elements, chart) => {

        if (!elements.length) {
          return;
        }
        const { datasetIndex, index: dataIndex } = elements[0];

        if (hasPivot) {

          const measureLinks = Object.values(data[dataIndex][measureName])[datasetIndex].links ?? [];
          const dimensionLinks = (data[dataIndex][dimensionName].links as Link[]) ?? [];

        }
        else {
          const measureLinks = data[dataIndex][measureName].links ?? [];

          const dimensionLinks = (data[dataIndex][dimensionName].links) ?? [];
        }

        lookerCharts.Utils.openDrillMenu({
          links: [...measureLinks, ...dimensionLinks],
          event: event.native,
        });
      },

      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        datalabels: {
          display: true,
          anchor: 'center', // Position the anchor of the label in the center for better control
          align: 'end',
          offset: 10,
          color: 'black',
        },
        legend: {
          position: "bottom",
          labels: {
            color: '#262D33',
            font: {
              size: 14,
              weight: '500',
              family: "Roboto"

            },
            usePointStyle: true,
            filter: function (legendItem, chartData) {
              // Assuming `showInLegend` is a custom property you've added to your datasets
              // Only show the dataset in the legend if `showInLegend` is true
              const dataset = chartData.datasets[legendItem.datasetIndex];
              return dataset.showInLegend;
            }
          },
          align: "center" as const,
          // display: hasNoPivot || hasPivot,
        },
        tooltip: {
          enabled: false,
          position: "nearest",
          external: (context: any) =>
            tooltipHandler(context, setTooltip),
        },
        annotation: {
          clip: false,
          annotations: annotations,
        }
      },

      scales: {
        x: {

          grid: {
            display: showXGridLines,
          },
          stacked: true,
          title: {
            display: showXAxisLabel,
            text: `${xAxisText ? xAxisText : dimensionLabel}`,
            font: {
              size: `${xAxisSize ? xAxisSize : 14}`,
              weight: 'bold'
            }
          },
          ticks: {
            font: {
              size: `${xAxisSize ? xAxisSize : 14}`
            },
          }

        },

        yLeft: {
          grid: {
            display: showYGridLines,
          },
          position: "left" as const,
          stacked: true,
          // display: false,
          ticks: {
            padding: 50,
            display: false,
            callback: function (value: number) {
              return formatNumber(value);
            },
          },
          title: {
            display: showYAxisLabel,
            text: `${yAxisText ? yAxisText : measureLabel}`,
            font: {
              size: `${yAxisSize ? yAxisSize : 14}`
            }
          },
        },
      },
    }),
    []
  );

  return (
    <div id="vis-wrapper">



      <div id="chart-wrapper">
        <Chart
          type={selectedChartType}
          data={chartData}
          options={chartOptions}
          id="chart"
          plugins={chartPlugins}
        />
        {tooltip && <Tooltip {...tooltip} />}
      </div>
    </div>
  );
}

export default BarLineVis;
