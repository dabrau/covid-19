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
  } = useContext(AppContext);

  return (
    <div className='App'>
      <div className="title">
        <h1>COVID Tracker</h1>
        <p>datasource: 
          <a href="https://covidtracking.com/" target="_blank">The COVID Tracking Project</a>
        </p>
      </div>
      <div className='side-block'>
        <Select
          value={selectedMetric}
          onChange={updateSelectedMetric}
          options={metricOptions}
        />
        <HeatmapUSA
         selectedDate={selectedDate}
         selectedMetric={selectedMetric}
         toggleSelectedState={toggleSelectedState}
         selectedStates={selectedStates}
       />
     </div>
     <div className='plots'>
        <DateRangeSelector
          selectedMetric={selectedMetric}
          selectedDate={selectedDate}
          selectedDateRange={selectedDateRange}
          updateSelectedDateRange={updateSelectedDateRange}
          selectedStates={selectedStates}
        />
        <LineGraph
          selectedMetric={selectedMetric}
          selectedDate={selectedDate}
          onTrackerChanged={updateSelectedDate}
          selectedStates={selectedStates}
          selectedDateRange={selectedDateRange}
          updateSelectedDateRange={updateSelectedDateRange}
        />
      </div>
    </div>
  );
}

export default App;
