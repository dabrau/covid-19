import React, { useContext } from 'react';
import Select from 'react-select';

import './App.css';
import AppContext from './AppContext';
import HeatmapUSA from './HeatmapUSA';
import LineGraph, { DateRangeSelector } from './LineGraph';


function App(props) {
  const {
    selectedMetric,
    selectedDate,
    updateSelectedDate,
    metricOptions,
    updateSelectedMetric,
    toggleSelectedState,
    selectedStates,
    selectedDateRange,
    updateSelectedDateRange,
    selectedMetricData
  } = useContext(AppContext);

  return (
    <div className='App'>
      <div className="title">
        <h1>COVID Tracker</h1>
        <p>data source: 
          <a href="https://covidtracking.com/" target="_blank">The COVID Tracking Project</a>
        </p>
      </div>
      <div className='side-block'>
        <Select
          value={selectedMetric}
          onChange={updateSelectedMetric}
          options={metricOptions}
        />
        <DateRangeSelector
          selectedMetricData={selectedMetricData}
          selectedDate={selectedDate}
          selectedDateRange={selectedDateRange}
          updateSelectedDateRange={updateSelectedDateRange}
          selectedStates={selectedStates}
        />
        <HeatmapUSA
          selectedDate={selectedDate}
          selectedMetricData={selectedMetricData}
          toggleSelectedState={toggleSelectedState}
          selectedStates={selectedStates}
        />
      </div>
      <div className='plots'>
        <LineGraph
          selectedDate={selectedDate}
          onTrackerChanged={updateSelectedDate}
          selectedStates={selectedStates}
          selectedMetricData={selectedMetricData}
          selectedDateRange={selectedDateRange}
          updateSelectedDateRange={updateSelectedDateRange}
        />
      </div>
    </div>
  );
}



export default App;
