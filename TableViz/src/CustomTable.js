import React, {
  Fragment,
  useMemo,
  useState,
} from "react";

import styled from "styled-components";
import "./style.css";
import {
  useTable,
  useBlockLayout,
  useResizeColumns,
  usePagination,
  useSortBy,
} from "react-table";
import chroma from 'chroma-js';
import "bootstrap/dist/css/bootstrap.min.css";

import { ProgressBar, Button,  Container} from "react-bootstrap";

function Tooltip({ children, content }) {
  return (
    <div className="tooltip">
      {children}
      <div className="tooltip-content">{content}</div>
    </div>
  );
}

const formatDecimal = (value) => {
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
const formatDollar = (value) => {
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

const getTooltipContent = (row, config, refLines) => {
  const keys = Object.keys(row.original);

  const names = keys.map((key) => config[`${key} Name`] || key)
  const firstMeasureIndex = keys.findIndex((key, keyIndex) => {
    const isHidden = config[key] === true;
    return !isHidden && keyIndex > config.query_fields.dimensions.length - 1;
  });

  const tooltipContent = keys.map((key, keyIndex) => {
    const isHidden = config[key] === true;
     if (!isHidden) { // Ensure hidden fields are not included
      if (keyIndex < firstMeasureIndex) {
        return <div key={key}>{names[keyIndex]}: {row.original[key]?.value}</div>;
      } else {
        console.log('reflines',refLines)
        const refname = refLines[`key`]
        console.log('refname',refname)
        const ref = row.original[refLines[key]];
      if (ref !== undefined) { // Check if ref is defined
        const refName = config[`${refLines[key]} Name`] || refLines[key];
        const currentValue = row.original[key]?.value ?? 0; // Fallback to 0 if undefined
        const percentChange = ((currentValue - ref.value) / (ref.value || 1)) * 100;
        return (
          <>
            <div key={`${key}-value`}>{names[keyIndex]}: {formatDecimal(currentValue)}</div>
            <div key={`${key}-change`}>Change from {refName}: {percentChange.toFixed(2)}%</div>
            <div key={`${key}-compared`}>Compared to {refName}: {formatDecimal(ref.value)}</div>
          </>
        );
      } else {
        // Handle the case where ref is undefined, possibly by returning null or a placeholder
        return <div key={key}>Data for {names[keyIndex]} is unavailable.</div>;
      }
      }
    }
    return null; // Return null for hidden fields to exclude them
  }).filter(Boolean); // Filter out null values
  return <>{tooltipContent}</>; // Wrap in a fragment if needed
}

const format = (value, isDollar) => isDollar ? formatDollar(value) : formatDecimal(value);

const Styles = ({ children, config }) => {
  var { thColor, fontSizeHeader, tableBordered, hidePag, removeBars, rightPag, index, border, toolOn, bodyStyle, fontSizeBody, columnsToHide, freeze, wrapText, freeze3, short, freeze150, freeze3150, weight, weight2, fontColor, odd, benchmarkColor } = config;

  const StyledWrapper = styled.div`

  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap');

  @import url('https://fonts.googleapis.com/css?family=Open+Sans:wght@100;300;400;500;700;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap');

  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,100;1,700&display=swap');


  @import url("https://kit-pro.fontawesome.com/releases/v5.15.1/css/pro.min.css");


  .transparentText{
    visibility: hidden;
  }

  .th {
    font-size: ${fontSizeHeader | 12}px;
    background-color: #e6e6e6;
  }

  .tr {
    font-size: ${fontSizeBody | 12}px;
    text-wrap: ${wrapText ? 'wrap' : 'nowrap'};
  }
  .reference-mark {
    position: absolute;
    top: 0;
    width: 4px; 
    height: 100%;
    background-color: ${benchmarkColor && benchmarkColor.length > 0 ? benchmarkColor[0] : 'red'}; /* or any color that indicates the reference mark */
    margin-top: -3px;
    margin-left: -2px;
    height: 34px;
    
  }
  .label {
    position: absolute;
    top: -6px;
    margin-left: 10px;
    height: 100%;
 }

  #vis-container {
      height: 100%;
      max-height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;

      font-weight: 300;
      justify-content:center;

 }
  #vis {
      min-height: 500px;
        justify-content:center;
        display: flex;
        flex-direction: column;
        align-items:center;

 }

  .redGradient {
      fill: rgb(199, 32, 10) !important;
 }

  thead th {

      color: ${thColor};
      font-weight: 400;

      text-align: left;
 }
  tbody > tr > td {
      vertical-align: middle;
      font-size: ${config.fontSizeBody | 12}px
 }
  .table tbody > tr > td, .table tbody > tr > th, .table tfoot > tr > td, .table tfoot > tr > th, .table thead > tr > td, .table thead > tr > th {
      border: none;
 }
  table img {
      width: 33px !important;
 }
  .moveRight {
      margin: 0em 0em 0em 0.5em !important;

 }
  .d-flex {
      display: flex;
 }
  .align-items-center {
      align-items: center;
 }
  .flex-column {
      flex-direction: column;
 }
  .img-fluid {
      max-width: 100%;
      height: auto;
 }
  h3 {
      color: #1d1e20 !important;
      font-size: 13px !important;
      margin-bottom: 0 !important;
      color: #1d1e20 !important;
      font-weight: 400 !important;

      margin-top: 0 !important;
      min-width: 2rem;
 }
  .var h3 {
      width: 2em;
 }
  p.small {
      color: #72777e !important;
      font-weight: 300 !important;
      font-size: 11px !important;

 }
  p {
      margin: 0rem !important;
 }
  p.black {
      color: black !important;
 }
  span.type {
      border-radius: 2px;
      padding: 0.25em 0.55em;
 }
  span.type.positive {
      background: #eef8e8;
      color: #39800b;
 }
  span.type.positive i {
      transform: rotate(45deg);
 }
  span.type.negative {
      background: #fbe7e5;
      color: #c7200a;
 }
  span.type.negative i {
      transform: rotate(135deg);
 }
  li.tag {
      font-size: 11px;
      padding: 0.25em 1.55em;
      border-radius: 1rem;
      color: #1d1e20;
      font-weight: 400;
      display: flex;
      justify-content: center;
      align-items: center;
 }
  li.tag:first-child {
 }
  .neutral {
      background: #e8edf3;
      max-width: 5em;
 }
  .branded {
      background: #ccccff;
      max-width: 5em;
 }
  .critical {
      background: #fdb6b0;
      max-width: 5em;
 }
  .warning {
      background: #ffd87f;
      position: relative;
      padding: 0.25em 0.75em 0.25em 1.55em !important;
 }
  .warning::before {
      font-family: "Font Awesome 5 Pro";
      position: absolute;
      content: "\f06a";
      display: inline-block;
      left: 5px;
      top: 4px;
 }
  .success {
      background: #d1ecc0;
      max-width: 5em;
 }
  .informational {
      background: #b6dff7;
      position: relative;
      padding: 0.25em 0.75em 0.25em 1.55em !important;
 }
  .informational::before {
      font-family: "Font Awesome 5 Pro";
      position: absolute;
      content: "\f05a";
      display: inline-block;
      left: 5px;
      top: 4px;
 }
  #sentimentInfo, #tagInfo {
      padding-left: 1em;
 }
  .neg {
      color: #c7200a;
      font-size: 12px;
      position: relative;
 }
  .neg::before {
      font-family: "Font Awesome 5 Pro";
      position: absolute;
      content: "\f119";
      display: inline-block;
      left: -15px;
      top: 2px;
 }
  .pos {
      color: #008759;
      font-size: 12px;
      position: relative;
 }
  .pos::before {
      font-family: "Font Awesome 5 Pro";
      position: absolute;
      content: "\f118";
      display: inline-block;
      left: -15px;
      top: 2px;
 }
  .neut {
      color: #ff9e00;
      font-size: 12px;
      position: relative;
 }
  .neut::before {
      font-family: "Font Awesome 5 Pro";
      position: absolute;
      content: "\f11a";
      display: inline-block;
      left: -15px;
      top: 2px;
 }
  p.sentiment {
      font-size: 12px;
 }
  .mr-2 {
      margin-right: 0.55rem;
 }
  .pr-1 {
      padding-right: 0.25rem;
 }
  .progress {
      --bs-progress-height: 24px !important;
      --bs-progress-bg: transparent;
      --bs-progress-border-radius: 2px !important;
      --bs-progress-bar-color: black;
      max-width: ${config.short} !important;
      min-width: ${config.short} !important;   
  }
  .progress::after: {content: 'foo';}
  .skinny .progress {
      --bs-progress-height: 8px !important;
      --bs-progress-bg: #e5e5e5 !important;
      --bs-progress-border-radius: 2px !important;
      width: ${config.short} !important;
 }
  .skinny .progress-bar {
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      white-space: nowrap;
      overflow: visible;
 }
  .progress-label {
      color: #000000;
      font-size: ${fontSizeBody | 10}px;
      font-weight: 300;
      z-index: 2;
      position: absolute;
 }
  #tagInfo ul {
      margin: 0;
      display: flex;
      justify-content: flex-start;
      margin-left: -3.5em;
      flex-wrap: wrap;
 }
  #tagInfo li {
      list-style: none;
      margin-bottom: 0.2rem;
      margin-right: 0.2rem;
 }
  td div {
      position: relative;
 }
  .react-bootstrap-table table {
      table-layout: unset !important;
 }

 .btn.disabled, .btn:disabled, fieldset:disabled .btn {
     color: #CCCCCC;
     pointer-events: none;
     background-color: #F7F7F7;
     border-color: #CCCCCC;
        font-size: 13px !important;

   }

 .btn,
  .btn:active{
   color:#000000;
  background-color:transparent;
    border-color: #CCCCCC;
    font-size: 13px !important;
 }

 .form-control {
    display: block;
    width: 100%;
    padding: 0;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: unset;
    background-color: unset;
    background-clip: padding-box;
    border: none !important;
    appearance: none;
    border-radius: unset;
    max-width: 25px;
    font-size: 13px !important;
    display: flex;
    justify-content: center;
}

 .form-control:focus{
   box-shadow:none
 }

 .form-select{
   max-width: 62px;

    max-height: 35px;
  font-size: 13px !important;
  padding:.5em 1em;
 }

.rightSide{
  min-width:15%;
}

  .avatar {
      width: 40px !important;
      height: 40px !important;
      border-radius: 50%;
      object-fit: cover;
      object-position: center right;
 }


  tr {
      border-bottom: 1px solid #FCFBFA;
      width: unset !important;
 }
  td {
      display: flex !important;
      align-items: center;
 }

tr:nth-child(odd) td{
  background: #FCFBFA !important
}


 }

 ::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 7px;
}

::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background-color: rgba(0, 0, 0, .5);
  box-shadow: 0 0 1px rgba(255, 255, 255, .5);
}
  .bordered td {
      border-right: 1px solid #d0d9e1 !important;

      padding: 0.5rem;
      padding-left:1em;
      margin: 0;

    position: relative;
 }
  .bordered td:first-child {
      border-left: 1px solid #d0d9e1 !important;
 }

.clear{
  background:transparent  !important;
}

.hidePag{
  display:none
}

.rightPag {
display: flex;
justify-content: flex-end;
}

.rightPag .rightSide {
    min-width: 15%;
    margin-top: 0.5em;
}

.rightPag .bottomPagination{
  flex-direction:column;
  justify-content:flex-end !important
}

.fixAcross{
position: fixed;
width: 99%;
}

  thead {
      position: sticky;
      top: 0;
      z-index: 100;
 }
  .table {
      border-radius: 0.25rem;
      display: inline-block;
      border-spacing: 0;
      .th {
          font-size: ${fontSizeHeader | 12}px;
          text-transform: capitalize;
          border: 1px solid grey;


}
          text-align: left;
          font-weight: 700;
     }
      .td {

          text-align: left;
          min-height: unset !important;
          height:auto !important
     }
      .th, .td {
          margin: 0;
          padding: .6rem;
          position: relative;
          font-weight:300;
          height: 75px;
          
     }


     .th{
height: auto;
display: flex !important;
align-items: center;
font-weight: 400;
     }


      .td:last-child {
          border-right: 0;
     }
      .resizer {
          display: inline-block;
          width: 10px;
          height: 100%;
          position: absolute;
          right: 0;
          top: 0;
          transform: translateX(50%);
          z-index: 1;
          touch-action: none;
          &.isResizing {
         }
     }
 }
  .footer-container {
      display: flex;
      text-align: center;
 }
  .button-previous {
      margin: 0;
      background: none;
      border-radius: 2px 0 0 2px;
      border: 1px solid #d0d9e1;
 }
  .button-next {
      background: none;
      border-radius: 0 2px 2px 0;
      border: 1px solid #d0d9e1;
 }
  button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
 }
  .input-page {
      height: 28px;
      margin: 0;
      background: none;
      text-align: center;
      border: 1px solid #d0d9e1;
 }

  .font-page-options {

      color: #A6A6A6 !important;
      font-weight: 100 !important;
      font-size: 13px !important;

      min-width: 70%;
      margin-right:.5em;
      line-height:1
 }
  .button-page {
      margin-left: 10px;
      border: 1px solid #d0d9e1;
      appearance: none;
      width: 32px;
      text-align: center;
      border-radius: 2px;
 }

 .numBack{
   background:#F7F5F5;
   border-radius:50%;
   padding:1em;
   display:flex;
   justify-content:center;
   align-items:center;
   height: 1em !important;
    width: 1em !important;
    margin-right:.5rem
 }

 .clearBack{
   background:transparent;
   border-radius:50%;
   padding:1em;
   display:flex;
   justify-content:center;
   align-items:center;
   height: 1em !important;
   width: 1em !important;
  margin-left:.25rem
 }

 .pagination span{
   font-size: 14px;
 }

  .pagination{
    margin-top:-1em
  }

 .btn{
   color:#171616 !important
 }

 .btn i{
   font-size: 20px;
   color:#171616
 }

 .btn:disabled i{
   color:#C9C5C3
 }

 .clear{
   background:none !important;
   border:none;
   padding: 12px;
   margin-top: 3px;
 }

.bold{
  font-weight:700
}

.hidden{
  display:none !important
}

.padding-0{
  padding: 0;

}

.scrunch{
  padding:0;
  margin-bottom:3rem;
  margin-top:.5rem;
  display:flex;
  justify-content:center;
  align-items:center;
  flex-direction:column;

}

.fixedTD{
max-width:120px !important;
}

 .th.smallerWidth:first-child {
 max-width:120px !important;
}

.removeBorder #height{
  border:none;
}

thead th{

  line-height: 1.2;
}

.greenBox{
  background: #00363d;
  padding: 0em 0.5em 1em 0.5em;
  text-align: center;
}
.greenBox p{
  color:white;
  font-weight: 500;
  font-size: 15px;
}

thead{

  background:transparent
}

#height{

  border: 1px solid black;
  margin: 2em auto 0 auto;
  max-width: fit-content !important;
}

.table{


}


h5{
  color:white;

  position:relative;
  display: inline-block;


}

a{
  color:black;

}
    .arrow{
     display:none !important
    }

    .redBackground::before {
        position: absolute;
        content: "";
        width: 100%;
        left: 0;
        z-index: 1;
        background-color: rgba(253, 182, 176, 0.2);
        height: 100%;
        right:0;
        top:0
    }

    #vis {
        height: 100%;
        width: 100% !important;
        margin: 0 !important;
        border: none;
    }


th, .th, td, .td{
  font-family:${bodyStyle ? bodyStyle : "'Roboto'"}
}

table>:not(caption)>*>* {
    padding: unset;
  }

.makeGray td,
.makeGray tr:nth-child(odd) td,
.makeGray .td,
.makeGray,
.makeGray2 td,
.makeGray2 tr:nth-child(odd) td,
.makeGray2 .td,
.makeGray2
{
  background: #f4f3f3 !important
}

.fixHeight .td{
  height:70px !important;

word-break: break-all !important
}
.wrapText td,
.wrapText .td{
word-break: break-all !important
}

.makeGray th,
.makeGray2 th,
.makeGray2 .td,
{
  width:${freeze150 || freeze3150 ? "150px !important" : "160px !important"}
}


.short th,
.short .th,
.short td,
.short .td{
  word-break: unset !important;
  height: auto !important;
  
}



h5{
  font-weight: ${weight ? `${weight} !important` : "300"};

}

.td,
.th{
  color: ${fontColor ? `${fontColor} !important` : "#212529"};
  font-weight: ${weight2 ? `${weight2} !important` : "300"};

}
tr:nth-child(odd) td {
  background: ${odd ? `${odd} !important` : "#FCFBFA !important"};
}


.wrapText .short th,
.wrapText .short .th,
.wrapText .short td,
.wrapText .short .td
{
  min-width:100px !important;
  word-break: break-all !important;
}

.aroundIt {
}

#height div > div.progress > div.progress-bar {
  border-radius: 0 2px 2px 0;
  border-width: 2px 2px 2px 1px;
  border-style: solid;
  border-color: var(--bs-progress-bar-border-color);
  border-color-left: black;
  overflow: visible;
}

.dimensionWidth {
 width: ${config.dimensionWidth} !important; 
}

.measureWidth {
  width: ${!isNaN(parseInt(config.short))
      ? (parseInt(config.short.replace('px', '')) + 70) + 'px !important'
      : 'auto'
    }; 
}
    
.tooltip {
  position: relative;
  display: contents;
  text-wrap: ${wrapText ? 'wrap' : 'nowrap'};
}

.tooltip-content {
  visibility: hidden;
  width: unset;
  background-color: black;
  color: #fff;
  text-align: left;
  border-radius: 2px;
  padding: 5px ;
  position: absolute;
  z-index: 10;
  top: 100%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip:hover .tooltip-content {
  visibility: visible;
  opacity: 1;
}`
    ;

  return <StyledWrapper>{children}</StyledWrapper>;
};

function Table({ columns, data, config, refLines }) {

  var { colorByPerformance, colorRange, tableBordered, hidePag, rightPag, removeBars, index, border, toolOn, headerText, yesText, unsetWidth, bodyStyle, tableFontSize, columnsToHide, freeze, wrapTex, freeze3, short, freeze150, freeze3150 } = config;

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 40,
      width: Number(String(config.short).replace("px", "")) + 40,
      maxWidth: 400,
    }),
    []
  );
  const {

    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,

    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },

  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: { pageIndex: 0, pageSize: 500 },
      disableSortRemove: true,
      defaultCanSort: true
    },
    useSortBy,
    usePagination,
    useBlockLayout,
    useResizeColumns
  );

  const keys = Object.keys(data[0]);

  const firstMeasureIndex = keys.findIndex((key, keyIndex) => {
    const isHidden = config[key] === true;
    return !isHidden && keyIndex > config.query_fields.dimensions.length - 1;
  });

  return (
    <>
      <div className={`
     ${config.border ? "removeBorder" : ""}
     `}>
        <Container fluid className={`${config.removeBars ? "scrunch" : "padding-0 second"}`} id="height">
          <div className={`${config.short ? "short" : ""}`}>
            <div className="aroundIt">

              <table className="table" {...getTableProps()}>
                {

                  <Fragment>
                    <thead className={`${config.tableBordered ? "hidden" : ""}`}>
                      {headerGroups.map((headerGroup, index) => (
                        <tr
                          key={headerGroup.id}
                          {...headerGroup.getHeaderGroupProps()} className="tr">

                          {config.index && <th className="th smallerWidth" />}

                          {headerGroup.headers.map((column, i) => (
                            <th

                              key={column.id}
                              {...column.getHeaderProps(column.getSortByToggleProps())}
                              className={i < firstMeasureIndex ? "th dimensionWidth" : "th measureWidth"}
                            >

                              {column.render("Header")}


                              <span style={{ fontSize: '8px' }}>
                                {/* {column.isSorted ? (column.isSortedDesc ? "↓"  : "↑"  ) : " "}  */}
                                {column.isSorted ? " ⇅" : " "}
                              </span>
                              {/* Use column.getResizerProps to hook up the events correctly */}
                              <div
                                {...column.getResizerProps()}
                                className={`resizer ${column.isResizing ? "isResizing" : ""
                                  }`}
                              />
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>

                    <tbody {...getTableBodyProps()}>
                      {page.map((row, i) => {
                        prepareRow(row);
                        const tooltipContent = getTooltipContent(row, config, refLines)
                        return (
                          <tr
                            key={row.id}
                            {...row.getRowProps()} className="tr">
                            {config.index && <td className="td fixedTD">
                              {pageIndex * pageSize + i + 1}
                            </td>}
                            {row.cells.map((cell, columnIndex) => {
                              return (
                                <td
                                  key={cell.id}
                                  {...cell.getCellProps()}
                                  className={columnIndex < firstMeasureIndex ? "td dimensionWidth" : "td measureWidth"}
                                >
                                  <Tooltip content={tooltipContent}>
                                    {cell.render("Cell")}
                                  </Tooltip>
                                </td>


                              );
                            })}
                          </tr>

                        );
                      })}
                    </tbody>
                  </Fragment>



                }


              </table>

            </div>



          </div>


        </Container>

      </div>

      <div className={`${config.hidePag ? "hidden" : "hidden"}`}>

        <Button className="clear" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {<i className="fal fa-angle-double-left"></i>}
        </Button>{' '}
        <Button className="clear" onClick={() => previousPage()} disabled={!canPreviousPage}>
          {<i className="fal fa-angle-left"></i>}
        </Button>{' '}

        <span className="numBack">{pageIndex + 1}</span> <span>of</span> <span className="clearBack">{pageOptions.length}</span>

        {' '}

        <Button className="clear" onClick={() => nextPage()} disabled={!canNextPage}>
          {<i className="fal fa-angle-right"></i>}
        </Button>{' '}
        <Button className="clear" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {<i className="fal fa-angle-double-right"></i>}
        </Button>{' '}


      </div>

    </>
  );
}


export const CustomTable = ({ data, config, keys, details, done, objMax, refLines }) => {

  const [page, setPage] = useState(2);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [firstData] = data;


  const firstMeasureIndex = keys.findIndex((key, keyIndex) => {
    const isHidden = config[key] === true;
    return !isHidden && keyIndex > config.query_fields.dimensions.length - 1;
  });


  let columns = useMemo(
    () =>
      keys.map((key, keyIndex) => {
        const isHidden = config[key] === true;
        const name = config[`${key} Name`] || key
        if (keyIndex >= firstMeasureIndex) {

          return isHidden ? null : {
            Header: name,

            accessor: (d) => {
              return <div>d[key].value</div>;
            },

            sortable: true,

            sortType: "basic",


            Cell: ({ cell, value, row }) => {


              if (row.original[key]?.html) {


                let comment1 = `${row.original[key]?.html}`
                return <div dangerouslySetInnerHTML={{ __html: comment1 }} />

              }
              else {

                const now = row.original[key]?.value;
                const ref = row.original[refLines[key]]?.value;
                const refMarkPosition = (ref / objMax[key]) * 100;
                const barPosition = (now / objMax[key]) * 100;
                const labelPosition = Math.max(refMarkPosition, barPosition);
                const firstKey = keys
                const firstDimensionData = row.original[firstKey]?.value
                let columnColor = config.defaultColor || config.defaultColor;
                let columnInnerColor = columnColor
                let label = row.original[key]?.rendered || format(row.original[key]?.value, config.dollarFormat);
                let deltaLabel = '';
                if (config.colorByPerformance) {

                  if (ref === 0 || now === 0) columnColor = 'black';
                  const delta = (now - ref) / ref
                  if (delta >= 0.2) columnColor = config.colorRange[0];
                  else if (delta >= 0.1) columnColor = config.colorRange[1];
                  else if (delta >= 0) columnColor = config.colorRange[2];
                  else if (delta >= -0.1) columnColor = config.colorRange[3];
                  else if (delta >= -0.2) columnColor = config.colorRange[4];
                  else columnColor = config.colorRange[5];
                  columnInnerColor = chroma(columnColor).alpha(0.3).css();
                  if (delta > 0) {
                    deltaLabel = ' +' + (delta * 100).toFixed(0) + '%';
                  } else {
                    deltaLabel = (delta * 100).toFixed(0) + '%';
                  }
                }



                return (
                  <>
                    <div className="position-relative">

                      <ProgressBar
                        now={now}
                        max={objMax[key]}

                        style={{ '--bs-progress-bar-bg': `${columnInnerColor}`, '--bs-progress-bar-border-color': `${columnColor}` }}
                      />

                      {/* Overlay for the reference mark */}
                      {refMarkPosition > -1 ? (
                        <div className="reference-mark" style={{ left: `${refMarkPosition}%` }} />
                      ) : null}
                      {labelPosition > -1 ? (
                        <div className="label" style={{ left: `${labelPosition}%` }}>
                          <div style={{ color: `${columnColor}` }}>{deltaLabel}</div >
                          <div>{label}</div >
                        </div>
                      ) : null}

                    </div>
                  </>
                );
              }

              {/*return row.original[key]?.rendered || row.original[key]?.value*/ }
            },

            headerClassName: "table-header1",
          };



        }

        else {
          return {
            id: key,
            Header: name,
            accessor: (d) => {
              return d[key].value
            },

            sortable: true,

            sortType: 'basic',
            // Cell: (  { row: { original } }) => {
            //   return original[key]?.rendered || original[key]?.value;
            // },
            Cell: ({ cell, value, row }) => {

              if (row.original[key]?.html) {

                let comment1 = `${row.original[key]?.html}`
                return <div dangerouslySetInnerHTML={{ __html: comment1 }} />

              }
              else {
                return row.original[key]?.rendered || row.original[key]?.value
              }

              {/*return row.original[key]?.rendered || row.original[key]?.value*/ }
            },
            headerClassName: "table-header1",
          };

        }

      }).filter(column => column !== null),
    [config]
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));

    setPage(0);
  };




  return (
    <Styles config={config}>
      <Table

        config={config}
        columns={columns}
        data={data}
        refLines={refLines}
      />

    </Styles>
  );
};
