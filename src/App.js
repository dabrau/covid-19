import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import USAMap from 'react-usa-map';
import { max, extent } from 'd3-array';
import { scaleSequential } from 'd3-scale';
import { select } from 'd3-selection';
import { interpolateBlues } from 'd3-scale-chromatic';
import { interpolateRound } from 'd3-interpolate';
import { axisBottom } from 'd3-axis';
import DatePicker from './DatePicker';
import moment from 'moment';
import Select from 'react-select';

const camelCaseToWords = str => {
    return str.match(/^[a-z]+|[A-Z][a-z]*/g).map(function(x){
        return x[0].toUpperCase() + x.substr(1).toLowerCase();
    }).join(' ');
};

function App() {
  const [dailyStats, setDailyStats] = useState([]);
  const [metricOptions, setMetricOptions] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [minMaxDates, setMinMaxDates] = useState({min: null, max: null})
  const [selectedDateRange, setSelectedDateRange] = useState({start: null, end: null})
  

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
      setSelectedDateRange({
        start: moment(String(minDate)),
        end: moment(String(maxDate))
      });
    }
  }, [dailyStats])

  const dates = dailyStats.map(stat => stat.date);
  const lastDate = dates ? max(dates) : null;

  const selectedDayStats = dailyStats
    .filter(stats => stats.date === lastDate);


  const maxValue = max(selectedDayStats, d => d.positive)
  const colorScale = scaleSequential()
    .domain([0, maxValue])
    .interpolator(interpolateBlues);


  const statesConfig = selectedDayStats
    .reduce((acc, usState) => {
      return {
        ...acc,
        [usState.state]: {
          fill: colorScale(usState.positive)
        }
      };
    }, {});

  const legend = useRef(null);

  useEffect(() => {
    const tickSize = 6
    const width = 320
    const height = 44 + tickSize
    const marginTop = 18
    const marginRight = 0
    const marginBottom = 16 + tickSize
    const marginLeft = 0
    const title = 'COVID 19 Postive'

    const legendSvg = select(legend.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .style('overflow', 'visible')
      .style('display', 'block');

    let tickAdjust = g => g.selectAll('.tick line').attr('y1', marginTop + marginBottom - height);
    let x;

    x = Object.assign(colorScale.copy()
        .interpolator(interpolateRound(marginLeft, width - marginRight)),
        {range() { return [marginLeft, width - marginRight]; }});


    legendSvg.append('image')
        .attr('x', marginLeft)
        .attr('y', marginTop)
        .attr('width', width - marginLeft - marginRight)
        .attr('height', height)
        .attr('preserveAspectRatio', 'none')
        .attr('xlink:href', ramp(colorScale.interpolator(), width).toDataURL());

    legendSvg.append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(axisBottom(x))
      .call(tickAdjust)
      .call(g => g.select('.domain').remove())
      .call(g => g.append('text')
        .attr('x', marginLeft)
        .attr('y', marginTop + marginBottom - height - 6)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text(title));
  }, [colorScale])

  return (
    <div className='App'>
      <Select
        value={selectedMetric}
        isLoading={metricOptions ? false : true}
        onChange={setSelectedMetric}
        options={metricOptions}
      />
      {minMaxDates.min && minMaxDates.max &&
        <DatePicker
          startDate={selectedDateRange.start}
          endDate={selectedDateRange.end}
          minDate={minMaxDates.min}
          maxDate={minMaxDates.max}
          onChange={null}
        />
      }
      <svg ref={legend}></svg>
      <USAMap customize={statesConfig} />
    </div>
  );
}

function ramp(color, n = 256) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d');
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 40);
  }
  return canvas;
}

export default App;