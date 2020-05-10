import React, { useState, useEffect, useContext } from 'react';
import moment from 'moment';
import DailyCovidTrackingContext from './DailyCovidTrackingContext';


const AppContext = React.createContext(undefined);


export function AppContextProvider({children}) {
  const covidTracking = useContext(DailyCovidTrackingContext);

  const [selectedMetric, setSelectedMetric] = useState({
    value: 'positive',
    label: 'Positive'
  });

  const defaultDate = moment('2020-04-12');
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedDateRange, setSelectedDateRange] = useState({start: null, end: null});

  const [metricOptions, setMetricOptions] = useState([]);
  const [minMaxDates, setMinMaxDates] = useState({min: null, max: null });
  
  useEffect(() => {
    // update selectable options
    const options = Array.from(new Set(
      covidTracking
        .flatMap(dailyStat => 
            Object.entries(dailyStat)
              .filter(([metric, value]) => Number.isInteger(value))
              .map(([metric, _]) => metric)
        )
    )).map(metric => ({
      value: metric,
      label: camelCaseToWords(metric)
    }));
    setMetricOptions(options);

    // update min and max selectable dates 
    const dates = covidTracking.map(d => d.standardizedDate)
    setMinMaxDates({
      min: moment.min(dates),
      max: moment.max(dates)
    })

  }, [covidTracking]);

  const updateSelectedDate = (date) => {
    if (
      date.isValid &&
      date.isAfter(minMaxDates.min) &&
      date.isBefore(minMaxDates.max)
    ) {
      setSelectedDate(date)
    }
  }

  const context = {
    metricOptions,
    selectedMetric,
    updateSelectedMetric: setSelectedMetric,
    selectedDate,
    updateSelectedDate,
    selectedDateRange,
    updateSelectedDateRange: setSelectedDateRange,
    minDate: minMaxDates.min,
    maxDate: minMaxDates.max
  }

  return (
    <AppContext.Provider value={context}>
      {children}
    </AppContext.Provider>
  );
}


function camelCaseToWords(str) {
    return str.match(/^[a-z]+|[A-Z][a-z]*/g).map(function(x){
        return x[0].toUpperCase() + x.substr(1).toLowerCase();
    }).join(' ');
};

export default AppContext;


