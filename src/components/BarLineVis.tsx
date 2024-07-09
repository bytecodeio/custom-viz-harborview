import {
  Fields,
  Link,
  LookerChartUtils,
  TooltipData,
  TooltipRow,
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
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

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
  hasCurrency: boolean;
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
  hasCurrency,
}: BarLineVisProps): JSX.Element {


  // config values
  const {
    showXGridLines,
    showYGridLines,
    showXAxisLabel,
    xAxisText,
    showYAxisLabel,
    yAxisText,
    titleText,
    showKpi,
    kpiUnit,
    showLineChartGradient,
    showAllValuesInTooltip,
    titleSize,
    xAxisSize,
    yAxisSize,
    color_range,
    showPercentToggle,
    colorByPerformance,
    maximumPercentSaturation
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

  enum ValueFormat {
    Decimal = "decimal",
    Currency = "currency",
    Percent = "percent",
  }

  const [valueFormat, setValueFormat] = useState<ValueFormat>(
    hasCurrency? ValueFormat.Currency : ValueFormat.Decimal
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
  const previousPeriodFieldName = fields.measures[0];

  const dimensionLabel = fields.dimensionsLabel[0];
  const measureLabel = fields.measuresLabel[0];


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

  function updateChartData(chartType: ChartType) {
    let datasets = [];
    let canvasElement = document.getElementById("chart") as HTMLCanvasElement;
    if (canvasElement) {
      const ctx = canvasElement.getContext("2d");


      const formatDecimal = (value: number) => {
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

      const formatDollarOrDecimal = (value: number) => {
        if (valueFormat === ValueFormat.Currency) {
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
                return (Number(row[measureName][pivotValue].value)-
                Number(row[benchmarkMeasureName][pivotValue].value))/
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
              formatter: (value: any, context: any) => formatValue(value)
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
              color: (context: any) => deltaColumnData[context.dataIndex] > 0 ? 'green': 'orange', // Outputs 'white' or 'black' based on contrast
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
              return formatDollarOrDecimal(rowTotals[context.dataIndex]);
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
        
        let columnColor = colors[0];
        if(colorByPerformance) {
          columnColor = data.map((row) => {
            const lastYear = row[benchmarkMeasureName].value;
            const currentYear = row[measureName].value;
            if (lastYear === 0 || currentYear === 0) return 'black';
            
            const delta = (currentYear - lastYear) / lastYear;

            if (delta > maximumPercentSaturation/100) return `hsl(120, 100%, 20%)`;
            if (delta < -maximumPercentSaturation/100) return "red";

            const transitionRange = maximumPercentSaturation / 100;
            const adjustedDelta = Math.abs(delta) / transitionRange; // Normalize delta to the transition range
            let saturation: number =0
            let lightness: number = 0
            let hue: number = 0
            if (delta>0) {
              // Green
              saturation = 10 + (50 * adjustedDelta);
              lightness = 90 - (40 * adjustedDelta) ; // Keeping lightness constant for simplicity
              // Use HSL for color to easily adjust saturation. Assuming green is at 120 degrees and red at 0 degrees in HSL
              hue = delta > 0 ? 150-(45*adjustedDelta) : 0; // Choose hue based on positive or negative delta
            } else {
              // Red
              saturation = 10 + (50 * adjustedDelta);
              lightness = 90 - (40 * adjustedDelta) ; 
              hue =  0; 
            }
            console.log(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            
          })
        }

        const deltaColumnData = data.map(
          (row, i) => {
            const benchmark = row[benchmarkMeasureName].value;
            const currentYear = row[measureName].value;
            if (benchmark === 0 || currentYear === 0) return 0;
            return (Number(row[measureName].value)-
            Number(row[benchmarkMeasureName].value))/
            Number(row[benchmarkMeasureName].value)                
          });

        datasets.push({
          datalabels: {
            anchor: 'end', // Position the anchor of the label in the center for better control
            align: 'end',
            offset: 0,
            rotation: -90,
            color: colorByPerformance ? columnColor : `${color_range ? colors[0] : 'black'}`,
            font: {
              weight: '600',
              size: config.labelFontSize
            },
            formatter: (value: any, context: any) => {
              // Access the delta value for the current data point
              const deltaValue = deltaFormatter(deltaColumnData[context.dataIndex]);
              // Combine the value and delta into a 2-line label
              return [value, deltaValue];
            }
          },
          labels: [],
          type: chartType,
          color: columnColor, // Outputs 'white' or 'black' based on contrast
          label: measureLabel,
          backgroundColor:
            colorByPerformance ? columnColor : `${color_range ? colors[0] : colors[0]}`,
          borderColor: `${color_range ? colors[0] : colors[0]}`,
          pointBackgroundColor: `${color_range ? colors[0] : colors[0]}`,
          data: data.map((row) => row[measureName].value),
          yAxisID: "yLeft",
          fill,
        });

        // Generate dynamic annotations based on benchmark values
        
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
    isYAxisCurrency: boolean,
    setTooltip: (newState: TooltipData | null) => void
  ) {
    const isTooltipVisible = context.tooltip.opacity !== 0;
    if (isTooltipVisible) {
      const position = context.chart.canvas.getBoundingClientRect();
      const { dataIndex } = context.tooltip.dataPoints[0];
      const lookerRow = data[dataIndex];

      let rows: TooltipRow[] = [];
      if (showAllValuesInTooltip) {
        Object.entries(lookerRow[measureName]).forEach(

          ([pivotName, { value: currentPeriodValue }], i) => {


            // Period comparison
            const previousPeriodValue =
              lookerRow[previousPeriodFieldName][pivotName].value;

            const hasPreviousPeriod =
              hasPeriodComparisonMeasure && !!previousPeriodValue;
            const periodComparisonValue =
              ((currentPeriodValue - previousPeriodValue) /
                previousPeriodValue) *
              100;



            rows.push({
              hasPreviousPeriod,

              measureValue: `${isYAxisCurrency ? "$" : ""
                }${currentPeriodValue}`,

              periodComparisonValue,
              pivotColor: `#${colors[i]}`,
              pivotText: pivotName,


            });


          }
        );
      }


      else {

        const pivotValue = context.tooltip.dataPoints[0].dataset.label;


        const previousPeriodValue =
          data[dataIndex][periodComparisonMeasure][pivotValue].value;
        const currentPeriodValue = context.tooltip.dataPoints[0].raw as number;

        const hasPreviousPeriod =
          hasPeriodComparisonMeasure && !!previousPeriodValue;
        const periodComparisonValue =
          ((currentPeriodValue - previousPeriodValue) / previousPeriodValue) *
          100;

        rows = [
          {
            hasPreviousPeriod,
            measureValue: `${isYAxisCurrency ? "$" : ""}${context.tooltip.dataPoints[0].formattedValue
              }`,

            periodComparisonValue,
            pivotColor: context.tooltip.dataPoints[0].dataset
              .borderColor as string,
            pivotText: context.tooltip.dataPoints[0].dataset.label,
          },
        ];
      }

      setTooltip({
        dimensionLabel0: `${dimensionLabel}:`,
        dimensionLabel: `${context.tooltip.title[0]}`,
        measureLabel: `${context.tooltip.dataPoints[0].dataset.label}: `,
        measureLabel0: `${context.tooltip.dataPoints[0].formattedValue}`,
        left:
          position.left + window.pageXOffset + context.tooltip.caretX + "px",
        rows,
        top:
          position.top +
          window.pageYOffset +
          context.tooltip.caretY -
          20 +
          "px",
        yAlign: context.tooltip.yAlign,
      });

    } else {
      setTooltip(null);
    }
  }


  const annotations = data.reduce((acc, row, index) => {
    const benchmark = row[benchmarkMeasureName].value;
    const annotationName = `benchmark-${index}`;
  
    // Assuming 'index' correctly maps to the bar's position on the x-axis
    // and 'benchmark' is the value for the y-axis height
    acc[annotationName] = {
      type: 'line',
      mode: 'vertical',
      xMin: index -0.45, // Position the line at the start of the bar
      xMax: index +0.45, // Position the line at the end of the bar (for a single point, xMin = xMax)
      yMin: benchmark-3, // The bottom of the line (can be 0 if you want it to start from the bottom)
      yMax: benchmark+3, // The top of the line (the benchmark value)
      borderColor: 'yellow',
      color: 'yellow',
      borderWidth: 3,
      xScaleID: 'x',
      yScaleID: 'yLeft',
    };
  
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
            filter: function(legendItem, chartData) {
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
            tooltipHandler(context, hasCurrency, setTooltip),
        },
        annotation: { 
          // annotations: benchmarkAnnotations,
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
            display: false,
            callback: function (value: number) {
              return `${hasCurrency ? "$" : ""}${formatNumber(value)}`;
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
      { showPercentToggle ?<div id="controls">
            <ButtonGroup size="sm">
              {chartValueOptions.map((chartValueOption) => (
                <Button
                  active={selectedChartValue === chartValueOption.value}
                  key={chartValueOption.value}
                  onClick={() => {setSelectedChartValue(chartValueOption.value)}}
                // variant="outline-secondary"
                >
                  {chartValueOption.label}
                </Button>
              ))}
            </ButtonGroup>
          </div>
          : null}
        
        <Chart
          type={selectedChartType}
          data={chartData}
          options={chartOptions}
          id="chart"
          plugins={chartPlugins}
        />
        {tooltip && <Tooltip hasPivot={hasPivot} hasNoPivot={hasNoPivot} tooltipData={tooltip} />}
      </div>
    </div>
  );
}

export default BarLineVis;
