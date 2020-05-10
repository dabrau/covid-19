import React from 'react';
import moment from 'moment';
import {
    Charts,
    ChartContainer,
    ChartRow,
    YAxis,
    LineChart,
    TimeMarker
} from 'react-timeseries-charts';
import { TimeSeries } from 'pondjs';
//import covidData from './covid_tracking_states_daily_2020-05-09.json'


export default function LineGraph({covidData, selectedMetric, statesFormat}) {
  const covidTS = covidDataToTimeSeries(covidData);
  const stateMetricLines = covidDataToStatesTimeSeries(covidData)
    .map(stateTS =>
      <LineChart
        key={stateTS.name}
        axis='axis1'
        series={stateTS}
        columns={[selectedMetric.value]}
      />);

  const titleStyle = {
    fontWeight: 200,
    fill: 'black'
  }

  return (
    <ChartContainer
      title={`COVID 19 - ${selectedMetric.label}`}
      titleStyle={titleStyle}
      timeRange={covidTS.timerange()}
      width={900}
      style={{background: 'white'}}
      trackerPosition={null}
    >
      <ChartRow height='150'>
        <YAxis id='axis1'
          width='60'
          type='linear' 
          min={covidTS.collection().min(selectedMetric.value)}
          max={covidTS.collection().max(selectedMetric.value)}
        />
        <TimeMarker></TimeMarker>
        <Charts>
            {stateMetricLines}
        </Charts>
      </ChartRow>
    </ChartContainer>
  )
}



function covidDataToTimeSeries(covidData) {
  const attributes = Array.from(new Set(covidData.flatMap(d => Object.keys(d))));
  const columns = ['index', ...attributes];

  const points = covidData
    .sort((a,b) => moment(String(a.date)).unix() - moment(String(b.date)).unix())
    .map(event => [
      moment(String(event.date)).format('YYYY-MM-DD'),
      ...attributes.map(att => event[att])
    ])

  const tsData = {
    'name': 'daily covid tracking',
    columns,
    points
  };
  
  return new TimeSeries(tsData);
}


function covidDataToStatesTimeSeries(covidData) {
  const dataByStates = covidData
    .reduce((acc, curr) => {
      if (acc[curr.state]) {
        acc[curr.state].push(curr)
      } else {
        acc[curr.state] = [curr];
      }
      return acc;
    },
    {});

  const attributes = Array.from(new Set(covidData.flatMap(d => Object.keys(d))));
  const columns = ['index', ...attributes];

  return Object.values(dataByStates)
    .map(stateData => 
      new TimeSeries({
        name: stateData.state,
        columns,
        points: stateData
          .sort((a,b) => moment(String(a.date)).unix() - moment(String(b.date)).unix())
          .map(event => [
            moment(String(event.date)).format('YYYY-MM-DD'),
            ...attributes.map(att => event[att])
          ])
      })
    );
}


