// Shapes a pivot into header + body rows. Shared by the on-screen table, the PDF and the Excel export.
export function toReportTable({ dimensions, measures, entries }) {
  const head = [...dimensions.map((dimension) => dimension.label), ...measures.map((measure) => measure.label)];
  const body = entries.map((entry) => {
    const dimCells = dimensions.map(() => '');
    if (entry.type === 'detail') {
      // District is shown once per block, like the pivot layout.
      entry.dims.forEach((value, index) => {
        dimCells[index] = index === 0 && !entry.first ? '' : value;
      });
    } else {
      dimCells[0] = entry.label;
    }
    return [...dimCells, ...measures.map((measure) => entry.values[measure.key])];
  });
  const kinds = entries.map((entry) => entry.type);
  return { head, body, kinds, dimensionCount: dimensions.length };
}
