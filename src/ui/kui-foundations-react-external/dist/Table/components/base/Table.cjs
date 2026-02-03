/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var react = require('react');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var TableBody = require('../composed/TableBody.cjs');
var TableDataCell = require('../composed/TableDataCell.cjs');
var TableHead = require('../composed/TableHead.cjs');
var TableHeaderCell = require('../composed/TableHeaderCell.cjs');
var TableRoot = require('../composed/TableRoot.cjs');
var TableRow = require('../composed/TableRow.cjs');

const Table = react.forwardRef(
  ({ columns, rows, attributes, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsxs(TableRoot.TableRoot, { ...mergeProps.mergeProps({ ref }, props), children: [
      /* @__PURE__ */ jsxRuntime.jsx(TableHead.TableHead, { ...attributes?.TableHead, children: /* @__PURE__ */ jsxRuntime.jsx(TableRow.TableRow, { ...attributes?.TableRow, children: columns.map((column, index) => {
        if (typeof column === "string") {
          return /* @__PURE__ */ jsxRuntime.jsx(TableHeaderCell.TableHeaderCell, { children: column }, index);
        }
        return /* @__PURE__ */ jsxRuntime.jsx(
          TableHeaderCell.TableHeaderCell,
          {
            onClick: () => column.onColumnSelect?.({ columnIndex: index }),
            ...column.attributes?.TableHeaderCell,
            children: column.children ?? column.slotHeader
          },
          index
        );
      }) }) }),
      /* @__PURE__ */ jsxRuntime.jsx(TableBody.TableBody, { ...attributes?.TableBody, children: rows.map((row, rowIndex) => /* @__PURE__ */ jsxRuntime.jsx(
        TableRow.TableRow,
        {
          onClick: () => row.onRowSelect?.({ rowId: row.id }),
          selected: row.selected,
          ...row.attributes?.TableRow,
          children: row.cells.map((cell, columnIndex) => {
            if (typeof cell === "string") {
              return /* @__PURE__ */ jsxRuntime.jsx(TableDataCell.TableDataCell, { children: cell }, columnIndex);
            }
            return /* @__PURE__ */ jsxRuntime.jsx(
              TableDataCell.TableDataCell,
              {
                onClick: () => cell.onCellSelect?.({
                  rowId: row.id,
                  columnIndex
                }),
                ...cell.attributes?.TableDataCell,
                children: cell.children ?? cell.slotContent
              },
              columnIndex
            );
          })
        },
        row.id ?? rowIndex
      )) })
    ] });
  }
);
Table.displayName = "Table";

exports.Table = Table;
