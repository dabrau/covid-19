import React, { useContext, Fragment, useState, useEffect } from 'react';
import moment from 'moment';
import { debounce } from 'lodash';
import {
    Charts,
    ChartContainer,
    ChartRow,
    YAxis,
    LineChart,
    styler,
    ValueAxis,
    LabelAxis,
    Brush
} from 'react-timeseries-charts';
import { TimeSeries, TimeRange } from 'pondjs';

import DailyCovidTrackingContext from './DailyCovidTrackingContext';





export default function LineGraph({
  selectedMetric,
  selectedDate,
  onTrackerChanged,
  selectedStates,
  selectedDateRange,
  updateSelectedDateRange
}) {
  const { metrics } = useContext(DailyCovidTrackingContext);
  const { timeseries, maxValue, minValue, maxDate, minDate } = metrics[selectedMetric.value]

  const timerange = new TimeRange(minDate, maxDate);
  const { start, end } = selectedDateRange;
  const timeWindow = new TimeRange(start, end);
    
  const timeseriesWindow = timeseries.crop(timeWindow);
  const stateMetricLines = Object.entries(selectedStates)
    .map(([state, color]) => {
      const props = {
          axis: state + 'axis',
          series: timeseriesWindow,
          columns: [state],
          style: styler([{key: state, color: color, width: 3}])
      };
      return (
        <ChartRow height='100' key={state}>
          <LabelAxis id={state + 'axis'}
            width={140}
            min={timeseriesWindow.collection().min(state)}
            max={timeseriesWindow.collection().max(state)}
          />
          <Charts>
            <LineChart key={state} {...props}/>
          </Charts>
          <ValueAxis value={600} id={state} width={140} detail='show some shit'/>
        </ChartRow>
      );
    });

  const [trackerPosition, setTrackerPosition] = useState(selectedDate.toDate());

  const dateSelectionChange = d => {
    setTrackerPosition(d)
    const date = moment(d);
    if (date.isBefore(selectedDate, 'day') || date.isAfter(selectedDate, 'day')) {
      onTrackerChanged(moment(d));
    }
  };

  return (
    <ChartContainer
      paddingLeft={-45}
      paddingBottom={-10}
      paddingRight={30}
      timeAxisHeight={35}
      timeRange={timeWindow}
      width={900}
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
  selectedMetric,
  selectedDate,
  selectedStates,
}) {
  const { metrics } = useContext(DailyCovidTrackingContext);
  const { timeseries, maxValue, minValue } = metrics[selectedMetric.value];

  const onTimeRangeChanged = tr => updateSelectedDateRange({start: tr.begin(), end: tr.end()});

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
       paddingLeft={30}
       paddingRight={30}
       paddingBottom={-10}
       paddingTop={5}
       timeRange={timeseries.timerange()}
       width={900}
       style={{background: 'white'}}
       trackerPosition={selectedDate.toDate()}
    >
      <ChartRow height='50'>
        <Brush
          timeRange={new TimeRange(selectedDateRange.start, selectedDateRange.end)}
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