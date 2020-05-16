import React, { useState } from 'react';
import moment from 'moment';
import {
    Charts,
    ChartContainer,
    ChartRow,
    YAxis,
    LineChart,
    styler,
    LabelAxis,
    Brush
} from 'react-timeseries-charts';
import { TimeRange } from 'pondjs';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';


export default function LineGraph({
  selectedDate,
  onTrackerChanged,
  selectedStates,
  selectedDateRange,
  updateSelectedDateRange,
  selectedMetricData
}) {
  const { timeseries } = selectedMetricData;

  const { start, end } = selectedDateRange;
  const timeWindow = new TimeRange(start, end);

  const [trackerPosition, setTrackerPosition] = useState(selectedDate.toDate());

  const updateDate = debounce(d => onTrackerChanged(moment(d), 30));
  const updateTracker = throttle(setTrackerPosition, 10)

  const dateSelectionChange = d => {
    updateTracker(d)
    const date = moment(d);
    if (date.isBefore(selectedDate, 'day') || date.isAfter(selectedDate, 'day')) {
      updateDate(date);
    }
    setTrackerPosition(d)
  }
    
  const timeseriesWindow = timeseries.crop(timeWindow);
  const stateMetricLines = Object.entries(selectedStates)
    .map(([state, color]) => {
      const props = {
          axis: state + 'axis',
          series: timeseriesWindow,
          columns: [state],
          style: styler([{key: state, color: color, width: 3}])
      };

      const axisStyle = {
        label: { fontSize: 30, textAnchor: 'middle', fill: color }
      };

      const min = timeseriesWindow.collection().min(state);
      const max = timeseriesWindow.collection().max(state);
      const value = timeseriesWindow.atTime(selectedDate.toDate())
        .data().get(state)

      const axisValues = [
        {label: 'max', value: max},
        {label: 'min', value: min},
        {label: 'value', value: value}
      ];

      return (
        <ChartRow height='100' key={state}>
          <LabelAxis id={state + 'axis'}
            label={state}
            values={axisValues}
            hideScale={true}
            style={axisStyle}
            width={150}
            min={min}
            max={max}
          />
          <Charts>
            <LineChart key={state} {...props}/>
          </Charts>
        </ChartRow>
      );
    });

  return (
    <ChartContainer
      timeAxisAngledLabels={true}
      paddingRight={10}
      paddingBottom={15}
      timeAxisHeight={35}
      timeRange={timeWindow}
      width={380}
      style={{background: 'white'}}
      trackerPosition={trackerPosition}
      onTrackerChanged={dateSelectionChange}
    >
      {stateMetricLines}
    </ChartContainer>
  );
}


export function DateRangeSelector({
  selectedDateRange,
  updateSelectedDateRange,
  selectedDate,
  selectedStates,
  selectedMetricData
}) {
  const { maxValue, minValue, timeseries } = selectedMetricData;

  const [timerange, setTimeRange] = useState(new TimeRange(selectedDateRange.start, selectedDateRange.end))

  const updateDateRange = debounce(tr => {
    updateSelectedDateRange({start: moment(tr.begin()), end: moment(tr.end())})
  }, 100);
  const updateBrushRange = throttle(tr => setTimeRange(tr), 20);
  const onTimeRangeChanged = tr => {
    updateDateRange(tr);
    updateBrushRange(tr);
  };

  const style = styler(
    timeseries.columns()
      .map(state => ({
        key: state,
        color: selectedStates[state] || 'steelblue',
        width: selectedStates[state] ? 4 : 1
      }))
  );

  return (
    <ChartContainer
      timeAxisAngledLabels={true}
      paddingRight={10}
      paddingLeft={-45}
      paddingBottom={15}
      paddingTop={5}
      timeRange={timeseries.timerange()}
      width={330}
      style={{background: 'white'}}
      trackerPosition={selectedDate.toDate()}
    >
      <ChartRow height='50'>
        <Brush
          timeRange={timerange}
          onTimeRangeChanged={onTimeRangeChanged}
        />
        <YAxis id='axis1'
          type='linear' 
          min={minValue}
          max={maxValue}
          tickCount={3}
        />
        <Charts>
          <LineChart axis='axis1'
            series={timeseries}
            columns={timeseries.columns()}
            style={style}
          />
        </Charts>
      </ChartRow>
    </ChartContainer>
  );
}