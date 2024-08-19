
import * as React from "react";
import * as ReactDOM from "react-dom";
import { CustomTable } from "./CustomTable";
import PaginationComponent from "./PaginationComponent";

looker.plugins.visualizations.add({
  create: function (element, config) {

  },

  updateAsync: function (data, element, config, queryResponse, details, done) {

    const { dimension_like: dimensionLike } = queryResponse.fields;
    const dimensions = dimensionLike.map((dimension) => ({
      label: dimension.label_short ?? dimension.label,
      name: dimension.name
    }));

    const { measure_like: measureLike } = queryResponse.fields;
    const measures = measureLike.map((measure) => ({
      label: measure.label_short ?? measure.label,
      name: measure.name,
    }));


    const fieldOptions = [...dimensions, ...measures].map((dim) => ({
      [dim.label]: queryResponse.data.map(row => row[dim.name].value).join(",")
    }));

    // get max of each object in data
    const data_val = Object.values(data)
    const len = Object.keys(data[0]).length
    const arr_len = Array(len).fill(0)
    let max_len = data
      .map((obj) => Object.values(obj))
      .map(innerArray => innerArray.map(obj => obj.value))
      .reduce((acc, el) => acc.map((max, i) => Math.max(max, el[i])), arr_len)
    // get keys of each object
    const keys = [dimensions.map((dim) => dim.name), measures.map((measure) => measure.name)].flat()
    
    let objMax = {};
    for (let i = 0; i < keys.length; i++) {
      objMax[keys[i]] = max_len[i];
    }
    let refs = {}
    
    let options = {
 

      tableBordered: {
        type: "boolean",
        label: "Hide Header (thead)",
        default: false,
        order: 5,
        section: "Style",
      },

      index: {
        type: "boolean",
        label: "Show Row Index",
        default: true,
        order: 3,
        section: "Table",
      },

      border: {
        type: "boolean",
        label: "Remove Border",
        default: false,
        order: 12,
        section: "Style",
      },

      bodyStyle: {
        type: "string",
        label: "Choose Font",
        display: "select",
        values: [{ "Roboto": "'Roboto'" }, { "Open Sans": "'Open Sans'" }, { "Montserrat": "'Montserrat'" }],
        section: "Style",
        default: "'Roboto', sans-serif;",
        order: 29,
      },

      fontSizeHeader: {
        type: "string",
        label: "Header Font Size",
        default: "12",
        display: "text",
        placeholder: "12",
        section: "Style",
        order: 41,
      },
      fontSizeBody: {
        type: "string",
        label: "Body Font Size",
        default: "12",
        display: "text",
        placeholder: "12",
        section: "Style",
        order: 41,
      },
      weight2: {
        type: "string",
        label: "Font Weight Table",
        default: "300",
        display: "text",
        placeholder: "300",
        section: "Style",
        order: 31,
      },

      fontColor: {
        type: "string",
        label: "Change Table Font Color",
        default: "#212529",
        display: "color",
        placeholder: "#212529",
        section: "Style",
        order: 32,
      },


      odd: {
        type: "string",
        label: "th Odd Background Color",
        default: "#FCFBFA",
        display: "color",
        placeholder: "#FCFBFA",
        section: "Style",
        order: 33,
      },

      short: {
        type: "string",
        label: "Choose Measure Width",
        default: "200px",
        display: "text",
        placeholder: "200px",
        order: 6,
        section: "Table",
      },
      dimensionWidth: {
        type: "string",
        label: "Choose Dimension Wdith",
        default: "100px",
        display: "text",
        placeholder: "100px",
        order: 7,
        section: "Table",
      },
      dollarFormat: {
        type: "boolean",
        label: "Format as Dollars",
        default: true,
        order: 8,
        section: "Table",
      },

      wrapText: {
        type: "boolean",
        label: "Wrap Text",
        default: false,
        order: 11,
        section: "Table",
      },
    };

    measures.forEach((measure, order) => {
      if (typeof config[measure.name] !== 'undefined' && config[measure.name] !== null && config[measure.name] !== 'none') {
        const referenceSeries = config[`${measure.name} Referencing`]
        if (referenceSeries) {
          refs[config[`${measure.name} Referencing`]] = `${measure.name}`
          const thisMax = objMax[measure.name]
          const referenceMax = objMax[referenceSeries]
          objMax[referenceSeries] = Math.max(thisMax, referenceMax);
       }
      }
      options[measure.name] =
      {
        order: 2* (order+1),
        section: "Series",
        type: "boolean",
        label: `Hide ${measure.label}`
      }
      options[`${measure.name} Referencing`] =
      {
        order: 2* (order +1) + 1,
        section: "Series",
        type: "string",
        display: "select",
        label: `${measure.label} is a Benchmark for:`,
        default: null,
        values: [...measures.map((x) => ({[x.label] : x.name})), {None: 'none'}]
      }
      options[`${measure.name} Name`] =
      {
        order: 2* (order +1) + 1,
        section: "Series",
        type: "string",
        display: "text",
        label: `Name for ${measure.label}:`,
        default: measure.label,
      }

    })
    
    options['benchmarkColor'] = {
      type: 'array',
      label: 'Benchmark Color',
      display: 'color',
      default: ['#757575'],
      order: 50,
      section: "Style",
    }
    options['colorByPerformance'] = {
      type: 'boolean',
      label: 'Color by Performance',
      default: true,
      order: 51,
      section: "Style",
    }
    options['colorRange'] = {
      type: 'array',
      label: 'Color Range For Performance',
      display: 'colors',
      default: ['#02876c', '#2f9b87', '#6AAFA1', '#D1A6A8', '#db4948', '#a90100'],
      order: 51,
      section: "Style",
    }
    dimensions.forEach((dimension, order) => {
      options[`${dimension.name} Name`] =
      {
        order: order,
        section: "Series",
        type: "string",
        display: "text",
        label: `Name for ${dimension.label}:`,
        default: dimension.label,
      }   
    })
 

    this.trigger("registerOptions", options);   

    ReactDOM.render(

      <CustomTable
        data={data}
        config={config}
        keys={keys}
        details={details}
        done={done}
        objMax={objMax}
        refLines={refs}
      />

      ,

      element
    );

    done()
  },
});
