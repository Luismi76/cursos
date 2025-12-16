// src/types/react-calendar-heatmap.d.ts
declare module 'react-calendar-heatmap' {
  import * as React from 'react';

  interface HeatmapValue {
    date: string;
    count?: number;
  }

  interface ReactCalendarHeatmapProps {
    startDate: string | Date;
    endDate: string | Date;
    values: HeatmapValue[];
    classForValue?: (value: HeatmapValue) => string;
    tooltipDataAttrs?: (value: HeatmapValue) => { [key: string]: string };
    showWeekdayLabels?: boolean;
    onClick?: (value: HeatmapValue) => void;
    gutterSize?: number;
    horizontal?: boolean;
    showOutOfRangeDays?: boolean;
    transformDayElement?: (
      rectElement: React.ReactElement,
      value: HeatmapValue,
      index: number
    ) => React.ReactNode;
  }

  export default class ReactCalendarHeatmap extends React.Component<ReactCalendarHeatmapProps> {}
}
