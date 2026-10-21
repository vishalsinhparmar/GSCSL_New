import { DIMENSIONS, MEASURES } from './reportConfig.js';
import { clean } from './calculations.js';

export const BLANK_LABEL = '(blank)';

const collator = new Intl.Collator('en', { sensitivity: 'base' });

const dimensionValue = (row, key) => clean(row[key]) || BLANK_LABEL;

function aggregate(rows, measures) {
  const values = {};
  for (const { key, aggregate: type, field } of measures) {
    if (type === 'sum') {
      values[key] = rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
    } else if (type === 'countNonBlank') {
      values[key] = rows.reduce((count, row) => count + (clean(row[field]) ? 1 : 0), 0);
    } else if (type === 'distinctCount') {
      values[key] = new Set(rows.map((row) => clean(row[field])).filter(Boolean)).size;
    } else {
      throw new Error(`Unknown aggregate "${type}" for measure "${key}"`);
    }
  }
  return values;
}

function groupBy(items, keyOf) {
  const groups = new Map();
  for (const item of items) {
    const key = keyOf(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

const compareDims = (a, b) => {
  for (let i = 0; i < a.length; i += 1) {
    const diff = collator.compare(a[i], b[i]);
    if (diff !== 0) return diff;
  }
  return 0;
};

/**
 * Builds a pivot-style report from flat rows.
 *
 * Output is an ordered list of entries:
 *  - detail:   one row per unique combination of all dimensions
 *  - subtotal: "<first dimension> Total", computed over the whole block (distinct counts stay distinct)
 *  - grand:    "Grand Total" over every row
 *
 * Works for any dimension/measure configuration, so other reports only need a new config.
 */
export function buildPivot(rows, { dimensions = DIMENSIONS, measures = MEASURES } = {}) {
  const dimKeys = dimensions.map((dimension) => dimension.key);
  const [topKey] = dimKeys;
  const entries = [];

  const blocks = [...groupBy(rows, (row) => dimensionValue(row, topKey)).entries()]
    .sort(([a], [b]) => collator.compare(a, b));

  for (const [topValue, blockRows] of blocks) {
    const leaves = [...groupBy(blockRows, (row) => dimKeys.map((key) => dimensionValue(row, key)).join('\u0001')).values()]
      .map((leafRows) => ({ dims: dimKeys.map((key) => dimensionValue(leafRows[0], key)), rows: leafRows }))
      .sort((a, b) => compareDims(a.dims, b.dims));

    leaves.forEach((leaf, index) => {
      entries.push({
        type: 'detail',
        dims: leaf.dims,
        first: index === 0,
        values: aggregate(leaf.rows, measures),
      });
    });
    entries.push({
      type: 'subtotal',
      label: `${topValue} Total`,
      dims: [topValue],
      values: aggregate(blockRows, measures),
    });
  }

  entries.push({ type: 'grand', label: 'Grand Total', values: aggregate(rows, measures) });
  return { dimensions, measures, entries };
}
