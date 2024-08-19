import "./style.scss";
import { createRoot } from "react-dom/client";
import React from "react";
import "bootstrap/scss/bootstrap.scss";
import { Fields, Looker, LookerChartUtils } from "./types";
import BarLineVis from "./components/BarLineVis";

// Global values provided via the Looker custom visualization API
declare var looker: Looker;
declare var LookerCharts: LookerChartUtils;

interface ConfigOptions {
  [key: string]: {
    [key: string]: any;
    default: any;
  };
}

looker.plugins.visualizations.add({
  // The create method gets called once on initial load of the visualization.
  // It's just a convenient place to do any setup that only needs to happen once.
  create: function (element, config) { },

  // The updateAsync method gets called any time the visualization rerenders due to any kind of change,
  // such as updated data, configuration options, etc.
  updateAsync: function (data, element, config, queryResponse, details, done) {

    const { measure_like: measureLike } = queryResponse.fields;
    const { dimension_like: dimensionLike } = queryResponse.fields;

    const dimensions1 = dimensionLike.map((dimension) => ({
      label: dimension.label_short ?? dimension.label,
      name: dimension.name

    }));

    const measures1 = measureLike.map((measure) => ({
      label: measure.label_short ?? measure.label,
      name: measure.name,
    }));

    const fieldOptions = [...dimensions1, ...measures1].map((dim) => ({
      [dim.label]: queryResponse.data.map(row => row[dim.name].value).join(",")
    }));

    const empty = [...dimensions1, ...measures1].map((dim) => ({
      thing: queryResponse.data.map(row => row[dim.name].value).join(",")
    }));

    interface Measure {
      label: string;
      name: string;
    }

    interface Dimension {
      label: string;
      name: string;
    }

    const measures: Measure[] = measureLike.map((measure) => ({
      label: measure.label_short ?? measure.label,
      name: measure.name,
    }));

    const dimensions: Dimension[] = dimensionLike.map((dimension) => ({
      label: dimension.label_short ?? dimension.label,
      name: dimension.name,
    }));

    interface FieldOption {
      [key: string]: string;
    }
    const fieldOptions0: FieldOption[] = [...dimensions, ...measures].map((all) => ({
      [all.label]: all.name,
    }));



    const lookerVis = this;

    // config
    const configOptions: ConfigOptions = {

      showXAxisLabel: {
        type: "boolean",
        label: "Show X Axis Label",
        default: true,
        order: 3,
      },
      xAxisText: {
        type: "string",
        label: "X Axis Text",
        default: "",
        order: 4,
      },
      xAxisSize: {
        type: "number",
        label: "X Axis Font Size",
        default: 16,
        display: "text",
        placeholder: "",

        order: 5,
      },
      showYAxisLabel: {
        type: "boolean",
        label: "Show Y Axis Label",
        default: true,
        order: 6,
      },
      yAxisText: {
        type: "string",
        label: "Y Axis Text",
        default: "",
        order: 7,
      },
      yAxisSize: {
        type: "number",
        label: "Y Axis Font Size",
        default: 16,
        display: "text",
        placeholder: "",

        order: 8,
      },
      labelFontSize: {
        type: "number",
        label: "Label Font Size",
        default: 16,
        display: "text",
        placeholder: "",

        order: 9,
      },
      showXGridLines: {
        type: "boolean",
        label: "Show X Grid Lines",
        default: false,
        order: 10,
      },
      showYGridLines: {
        type: "boolean",
        label: "Show Y Grid Lines",
        default: true,
        order: 11,
      },

      showAllValuesInTooltip: {
        type: "boolean",
        label: "Show All Row Values in Tooltip",
        default: true,
        order: 12,
      },

      colorByPerformance: {
        type: "boolean",
        label: "Color bars and labels by performance",
        default: true,
        order: 14,
      },
      referenceColor: {
        type: 'array',
        label: 'Reference Color',
        display: 'color',
        default: '#fff97f',
        order: 23,
      },
      color_range: {
        type: 'array',
        label: 'Color Range',
        display: 'colors',
        default: ['#02876c', '#2f9b87', '#6AAFA1', '#D1A6A8', '#db4948', '#a90100'],
        order: 24,
      },
      xAxisName: {
        type: 'string',
        label: 'X Axis Name',
        default: 'X Axis',
        order: 25,
      },
      actualsName: {
        type: 'string',
        label: 'Actuals Name',
        default: 'Actuals',
        order: 26,
      },
      forecastName: {
        type: 'string',
        label: 'Forecast Name',
        default: 'Forecast',
        order: 27,
      },
      unresolvedForecastName: {
        type: 'string',
        label: 'Unresolved Forecast',
        default: 'Unresolved Forecast',
        order: 28,
      }
      
    };

    lookerVis.trigger("registerOptions", configOptions);


    // assign defaults to config values, which first render as undefined until configOptions is registered
    const validatedConfig = { ...config };
    const configKeys = Object.keys(validatedConfig);
    for (let i = 0; i < configKeys.length; i++) {
      if (validatedConfig[configKeys[i]] === undefined) {
        const configKey = configKeys[i] as keyof typeof configOptions;
        validatedConfig[configKey] = configOptions[configKey].default;
      }
    }

    // get dimensions and measures
    const { dimension_like, measure_like, pivots } = queryResponse.fields;
    const fields: Fields = {
      dimensions: dimension_like.map((d) => d.name),
      dimensionsLabel: dimension_like.map((d) => d.label),
      measures: measure_like.map((m) => m.name),
      measuresLabel: measure_like.map((m) => m.label),
      pivots: pivots?.map((p) => p.name),
    };


    const hasCurrency: boolean = queryResponse.fields.measures[0].value_format && queryResponse.fields.measures[0].value_format.includes('$')
    console.log(hasCurrency)
    if (empty[1].thing === "" || empty[0].thing === "") {


      // create react root
      element.innerHTML = "<div id='app'><p style='text-align:center;font-size:1.25em;padding-top:2em;font-family: 'Open Sans',serif;'>The data returned from the query is empty.</p></div>";


    }
    else {

      // create react root
      element.innerHTML = '<div id="app"></div>';



      const root = createRoot(document.getElementById("app"));
      root.render(
        <BarLineVis
          data={data}
          fields={fields}
          config={validatedConfig}
          lookerCharts={LookerCharts}
          element={element}
        />
      );

    }

    done();
  },

});
