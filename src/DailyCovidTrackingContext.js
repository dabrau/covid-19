import React, { useState, useEffect } from 'react';
import moment from 'moment';

import DailyCovidTracking from './covid_tracking_states_daily_2020-05-09.json'


const DailyCovidTrackingContext = React.createContext(undefined);

const standardizeDate = date => moment(String(date));

const dataTransform = d =>
  d.map(metricsData => ({
    ...metricsData,
    standardizedDate: standardizeDate(metricsData.date)
  }));


export function DailyCovidTrackingProvider({children}) {
  const [covidTracking, setCovidTracking] = useState(dataTransform(DailyCovidTracking));

  useEffect(() => {
    fetch('https://covidtracking.com/api/states/daily')
      .then(resp => resp.json())
      .then(data => setCovidTracking(dataTransform(data)));
  }, []);

  return (
    <DailyCovidTrackingContext.Provider value={covidTracking}>
      {children}
    </DailyCovidTrackingContext.Provider>
  );
}

export { standardizeDate };
export default DailyCovidTrackingContext;