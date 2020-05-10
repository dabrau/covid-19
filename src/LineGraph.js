import React, { useContext } from 'react';
import moment from 'moment';
import { debounce } from 'lodash';
import {
    Charts,
    ChartContainer,
    ChartRow,
    YAxis,
    LineChart
} from 'react-timeseries-charts';
import { TimeSeries, TimeRange } from 'pondjs';

import DailyCovidTrackingContext from './DailyCovidTrackingContext';


export default function LineGraph({selectedMetric, selectedDate, onTrackerChanged}) {
  const covidTracking = useContext(DailyCovidTrackingContext);

  const metricData = covidTracking
    .filter(d => d[selectedMetric.value]);

  const metricValues = metricData
    .map(d => d[selectedMetric.value]);
  const minValue = Math.min(...metricValues);
  const maxValue = Math.max(...metricValues);

  const dates = metricData.map(d => d.standardizedDate);
  const timerange = new TimeRange(moment.min(dates), moment.max(dates));
  
  const stateMetricLines = covidDataToStatesTimeSeries(metricData, selectedMetric.value)
    .map(stateTS =>
      <LineChart
        key={stateTS.name}
        axis='axis1'
        series={stateTS}
        columns={['value']}
      />);

  const onTimeSelectionChange = debounce(d => onTrackerChanged(moment(d)), 20)

  return (
    <ChartContainer
      paddingLeft={-45}
      paddingBottom={-10}
      timeAxisHeight={35}
      timeRange={timerange}
      width={900}
      style={{background: 'white'}}
      trackerPosition={selectedDate.toDate()}
      onTrackerChanged={onTimeSelectionChange}
    >
      <ChartRow height='70'>
        <YAxis id='axis1'
          type='linear' 
          min={minValue}
          max={maxValue}
        />
        <Charts>
          {stateMetricLines}
        </Charts>
      </ChartRow>
    </ChartContainer>
  )
}

function covidDataToStatesTimeSeries(covidData, selectedMetric) {
  const dataByStates = covidData
    .reduce((acc, curr) => {
      if (acc[curr.state]) {
        acc[curr.state].push(curr)
      } else {
        acc[curr.state] = [curr];
      }
      return acc;
    }, {});

  return Object.values(dataByStates)
    .map(stateData => 
      new TimeSeries({
        name: stateData.state,
        columns: ['index', 'value'],
        points: stateData
          .sort((a,b) => a.standardizedDate.unix() - b.standardizedDate.unix())
          .map(event => [
            event.standardizedDate.format('YYYY-MM-DD'),
            event[selectedMetric]
          ])
      })
    );
}


