import React, { useContext } from 'react';
import Select from 'react-select';

import './App.css';
import AppContext from './AppContext';
import DatePicker from './DatePicker';
import HeatmapUSA from './HeatmapUSA';
import LineGraph, { DateRangeSelector } from './LineGraph';


import DailyCovidTrackingContext from './DailyCovidTrackingContext';


function FakeApp(props) {
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
    <div>
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
  )
}




function App() {
  const {
    selectedMetric,
    updateSelectedMetric,
    metricOptions,
    minDate,
    maxDate,
    selectedDateRange,
    updateSelectedDateRange,
    selectedDate,
    updateSelectedDate,
    toggleSelectedState,
    selectedStates
  } = useContext(AppContext);

  return (
    <div className='App'>
      <div className='selectors'> 
        <div className='side-block'>
          <div className="title">
            <h1>COVID Tracker</h1>
            <p>datasource: <a href="https://covidtracking.com/" target="_blank">The COVID Tracking Project</a></p>
          </div>
          <Select
            value={selectedMetric}
            onChange={updateSelectedMetric}
            options={metricOptions}
          />
          <DatePicker
            startDate={selectedDateRange.start}
            endDate={selectedDateRange.end}
            minDate={minDate}
            maxDate={maxDate}
            onChange={updateSelectedDateRange}
          />
        </div>
        <HeatmapUSA
          selectedDate={selectedDate}
          selectedMetric={selectedMetric}
          toggleSelectedState={toggleSelectedState}
          selectedStates={selectedStates}
        />
      </div> 
      <LineGraph
        selectedMetric={selectedMetric}
        selectedDate={selectedDate}
        onTrackerChanged={updateSelectedDate}
        selectedStates={selectedStates}
        selectedDateRange={selectedDateRange}
      />
    </div>
  );
}

export default FakeApp;
