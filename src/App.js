import React, { useContext } from 'react';
import Select from 'react-select';

import './App.css';
import AppContext from './AppContext';
import DatePicker from './DatePicker';
import HeatmapUSA from './HeatmapUSA';
import LineGraph from './LineGraph';


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
    updateSelectedDate
  } = useContext(AppContext);

  return (
    <div className='App'>
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
      <HeatmapUSA
        selectedDate={selectedDate}
        selectedMetric={selectedMetric}
      />
      <LineGraph
        selectedMetric={selectedMetric}
        selectedDate={selectedDate}
        onTrackerChanged={updateSelectedDate}
      />
    </div>
  );
}


export default App;
