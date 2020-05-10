import React, { useState, useEffect } from 'react';
import { extent } from 'd3-array';
import moment from 'moment';
import Select from 'react-select';

import './App.css';
import DatePicker from './DatePicker';
import HeatmapUSA from './HeatmapUSA'
import LineGraph from './LineGraph';

//import covidData from './covid_tracking_states_daily_2020-05-09.json'


const camelCaseToWords = str => {
    return str.match(/^[a-z]+|[A-Z][a-z]*/g).map(function(x){
        return x[0].toUpperCase() + x.substr(1).toLowerCase();
    }).join(' ');
};

function App() {
  const [dailyStats, setDailyStats] = useState([]);
  const [metricOptions, setMetricOptions] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [minMaxDates, setMinMaxDates] = useState({ min: null, max: null })
  const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null })
  const [visibleMetrics, setVisibleMetrics] = useState([]);

  useEffect(() => {
    fetch('https://covidtracking.com/api/states/daily')
      .then(resp => resp.json())
      .then(data => setDailyStats(data));
  }, []);

  useEffect(() => {
    const metrics = new Set();

    dailyStats.forEach(dailyStat => {
      Object.entries(dailyStat).forEach(([metric, value]) => {
        if (Number.isInteger(value)) {
          metrics.add(metric);
        }
      });
    });

    const options = Array.from(metrics)
      .map(metric => ({
        value: metric,
        label: camelCaseToWords(metric)
      }));

    setMetricOptions(options);
  }, [dailyStats]);

  useEffect(() => {
    if (metricOptions.length > 1) {
      if (!selectedMetric || !metricOptions.map(option => option.value).includes(selectedMetric.value)) {
        setSelectedMetric(metricOptions[1]);
      }
    } else {
      setSelectedMetric(null);
    }
  }, [selectedMetric, metricOptions]);

  useEffect(() => {
    if (dailyStats.length > 0) {
      const [minDate, maxDate] = extent(dailyStats, stat => stat.date);
      setMinMaxDates({
        min: moment(String(minDate)),
        max: moment(String(maxDate))
      });
    }
  }, [dailyStats]);

  useEffect(() => {
    const visibleStateMetrics = dailyStats
      .filter(statesMetrics => {
        const date = moment(String(statesMetrics.date));
        return date.isSame(selectedDateRange.end, 'day');
      });
    setVisibleMetrics(visibleStateMetrics)
  }, [dailyStats, selectedDateRange]);

  const dataAvailableStates = new Set(dailyStats.map(stat => stat.state));

  const heatmapTitle = selectedMetric ? `COVID 19 - ${selectedMetric.label}` : '';
  const legendTitle = selectedMetric ? selectedMetric.label  : '';
  const heatmapDescription = selectedDateRange.end ? selectedDateRange.end.format('YYYY-MM-DD') : '';

  return (
    <div className='App'>
      <Select
        value={selectedMetric}
        isLoading={metricOptions ? false : true}
        onChange={setSelectedMetric}
        options={metricOptions}
      />
      <DatePicker
        startDate={selectedDateRange.start}
        endDate={selectedDateRange.end}
        minDate={minMaxDates.min}
        maxDate={minMaxDates.max}
        onChange={setSelectedDateRange}
      />
      <HeatmapUSA
        title={heatmapTitle}
        description={heatmapDescription}
        legendTitle={legendTitle}
        statesMetrics={visibleMetrics}
        selectedMetric={selectedMetric}
        availableStates={[...dataAvailableStates]}
      />
      {dailyStats.length > 0 && selectedMetric &&
        <LineGraph
          covidData={dailyStats}
          selectedMetric={selectedMetric}
        />
      }
    </div>
  );
}

export default App;
