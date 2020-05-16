import React, { useState, useContext, useReducer } from 'react';
import moment from 'moment';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { TimeSeries } from 'pondjs';
import DailyCovidTrackingContext, { standardizeDate } from './DailyCovidTrackingContext';



const AppContext = React.createContext(undefined);

const defaultMetric = metricNameToOption('positive');
const defaultDate = moment('2020-04-12');
const defaultStartDate =  defaultDate.clone().subtract(7, 'days');
const defaultEndDate = defaultDate.clone().add(7, 'days');


export function AppContextProvider({children}) {
  const { metricNames, metrics } = useContext(DailyCovidTrackingContext);

  const metricOptions = metricNames
    .filter(m => !['state', 'date'].includes(m))
    .map(m => metricNameToOption(m));
  const [selectedMetric, setSelectedMetric] = useState(defaultMetric);
  
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedDateRange, setSelectedDateRange] = useState({start: defaultStartDate, end: defaultEndDate});

  const updateSelectedDate = (date) => {
    if (
      date.isValid &&
      date.isAfter(selectedDateRange.start) &&
      date.isBefore(selectedDateRange.end)
    ) {
      setSelectedDate(date);
    }
  };

  const updateSelectedDateRange = ({start, end}) => {
    if (selectedDate.isAfter(end)) {
      setSelectedDate(end);
    }

    if (selectedDate.isBefore(start)) {
      setSelectedDate(start);
    }

    setSelectedDateRange({start, end});
  }

  const [selectedStates, toggleSelectedState] = useReducer(selectStatesReducer, {
    colorIndex: 5,
      states : {
        'TX': schemeCategory10[1],
        'CA': schemeCategory10[2],
        'NY': schemeCategory10[3],
        'GA': schemeCategory10[4]
      }
  });

  const selectedTimeSeries = selectedMetricToTimeSeries(selectedMetric, metrics);
  const selectedMetricData = {
    ...metrics[selectedMetric.value],
    timeseries: selectedTimeSeries
  };

  const context = {
    metricOptions,
    selectedMetric,
    updateSelectedMetric: setSelectedMetric,
    selectedDate,
    updateSelectedDate,
    selectedDateRange,
    updateSelectedDateRange,
    toggleSelectedState,
    selectedStates: selectedStates.states,
    selectedMetricData
  };

  return (
    <AppContext.Provider value={context}>
      {children}
    </AppContext.Provider>
  );
}


function selectStatesReducer(prevState, unitedState) {
  const newState = {...prevState, states: {...prevState.states}};
  if (prevState.states.hasOwnProperty(unitedState)) {
    delete newState.states[unitedState];
  } else {
    newState.states[unitedState] = schemeCategory10[newState.colorIndex % schemeCategory10.length];
    newState.colorIndex = newState.colorIndex + 1;
  }

  return newState;
}

function metricNameToOption(metricName) {
  return {
    value: metricName,
    label: camelCaseToWords(metricName)
  };
}


function camelCaseToWords(str) {
    return str.match(/^[a-z]+|[A-Z][a-z]*/g).map(function(x){
        return x[0].toUpperCase() + x.substr(1).toLowerCase();
    }).join(' ');
};

function selectedMetricToTimeSeries(metricSelection, metrics) {
  const { metricsByDate } = metrics[metricSelection.value];
  const dates = Object.keys(metricsByDate)
    .map(d => standardizeDate(d))
    .sort((a, b) => a.unix() - b.unix());

  const states = Array.from(new Set(
    Object.values(metricsByDate)
      .flatMap(valueByState => Object.keys(valueByState))
  ));

  return new TimeSeries({
    name: metricSelection.value,
    columns: ['index', ...states],
    points: dates.map(d => [
        d.format('YYYY-MM-DD'),
        ...states.map(s =>
          metricsByDate[d.format('YYYYMMDD')][s]
        )
      ])
  });
}

export default AppContext;


