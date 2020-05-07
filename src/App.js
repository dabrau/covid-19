import React, { useState, useEffect } from 'react';
import './App.css';
import USAMap from 'react-usa-map';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';

function App() {
  const [dailyStats, setDailyStats] = useState([]);

  useEffect(() => {
    fetch('https://covidtracking.com/api/states/daily')
      .then(resp => resp.json())
      .then(data => setDailyStats(data))
  }, []);

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();

  const selectedDayState = dailyStats
    .filter(stats => stats.date === parseInt(`${yyyy}${mm}${dd}`));

  console.log(selectedDayState)

  const range = extent(selectedDayState, d => d.positive)
  const colorScale = scaleLinear().domain(range).range(['white', 'blue']);

  const statesConfig = selectedDayState
    .reduce((acc, usState) => {
      return {
        ...acc,
        [usState.state]: {
          fill: colorScale(usState.positive)
        }
      };
    }, {});



  console.log(statesConfig)
  

  return (
    <div className="App">
      <USAMap customize={statesConfig} />
      <svg id="legend-svg"></svg>
    </div>
  );
}

export default App;
