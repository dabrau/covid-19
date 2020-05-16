import React, { useState, useEffect } from 'react';
import moment from 'moment';

import DailyCovidTracking from './covid_tracking_states_daily_2020-05-09.json'


const DailyCovidTrackingContext = React.createContext(undefined);


export function DailyCovidTrackingProvider({children}) {
  const [covidTracking, setCovidTracking] = useState(transformCovidTracking(DailyCovidTracking));
  

  useEffect(() => {
    fetch('https://covidtracking.com/api/states/daily')
      .then(resp => resp.json())
      .then(data => setCovidTracking(transformCovidTracking(data)));
  }, []);

  return (
    <DailyCovidTrackingContext.Provider value={covidTracking}>
      {children}
    </DailyCovidTrackingContext.Provider>
  );
}

export { standardizeDate };
export default DailyCovidTrackingContext;

function standardizeDate(date) {
  return moment(String(date));
} 

function transformCovidTracking(covidTrackingData) {
  const states = new Set();
  const metrics = {};

  covidTrackingData.forEach(stateData => {
    states.add(stateData.state);
    const date = standardizeDate(stateData.date);

    Object.entries(stateData).forEach(([metric, value]) => {
      if (!metrics[metric]) {
        metrics[metric] = {
          maxDate: date,
          minDate: date,
          maxValue: value,
          minValue: value,
          metricsByDate: { [stateData.date]: { [stateData.state]: value } }
        };
      } else {
        const accMetric = metrics[metric];
        accMetric.maxDate = accMetric.maxDate.isBefore(date) ? date : accMetric.maxDate;
        accMetric.minDate = accMetric.minDate.isAfter(date) ? date : accMetric.minDate;

        accMetric.maxValue = value > accMetric.maxValue ? value : accMetric.maxValue;
        accMetric.minValue = value < accMetric.minValue ? value : accMetric.minValue;

        if (accMetric.metricsByDate[stateData.date]) {
          accMetric.metricsByDate[stateData.date][stateData.state] = value;
        } else {
          accMetric.metricsByDate[stateData.date] = {[stateData.state]: value};
        }
      }
    })
  });

  const metricNames = Object.keys(metrics)

  return {
    covidTracking: covidTrackingData,
    states,
    metrics,
    metricNames
  };
}