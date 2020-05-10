import React, { useRef, useEffect } from 'react';
import USAMap from 'react-usa-map';
import { max } from 'd3-array';
import { scaleSequential } from 'd3-scale';
import { select } from 'd3-selection';
import { interpolateBlues } from 'd3-scale-chromatic';
import { interpolateRound } from 'd3-interpolate';
import { axisBottom } from 'd3-axis';

export default function HeatmapUSA({statesMetrics, selectedMetric, availableStates, title, legendTitle, description}) {
  const colorScale = scaleSequential()
      .domain([0, 1])
      .interpolator(interpolateBlues);

  const statesConfig = availableStates
    .reduce((acc, state) => ({
        ...acc,
        [state]: { 
          fill: '#808080',
          stroke: 'white'
        }
    }), {});

  if (selectedMetric) {
    const maxValue = max(statesMetrics, d => d[selectedMetric.value])
    colorScale.domain([0, maxValue]);

    statesMetrics.forEach((metric => {
      statesConfig[metric.state]['fill'] = colorScale(metric[selectedMetric.value])
    }))
  }

  return (
    <div>
      <h5>{title}</h5>
      <p>{description}</p>
      <Legend colorScale={colorScale} legendTitle={legendTitle}/>
      <USAMap customize={statesConfig} />
    </div>
  );
}

function colorRamp(colorScale, width) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d');
  for (let i = 0; i < width; ++i) {
    context.fillStyle = colorScale(i / (width - 1));
    context.fillRect(i, 0, 1, 40);
  }
  return canvas;
}

function Legend({colorScale, legendTitle}) {
  const tickSize = 6
  const width = 320
  const height = 44 + tickSize
  const marginTop = 18
  const marginRight = 0
  const marginBottom = 16 + tickSize
  const marginLeft = 0
  const title = legendTitle
  
  const legendRef = useRef(null);

  useEffect(() => {
    const legendSvg = select(legendRef.current)

    legendSvg.selectAll('*').remove()

    legendSvg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .style('overflow', 'visible')
      .style('display', 'block');

    let tickAdjust = g => g.selectAll('.tick line').attr('y1', marginTop + marginBottom - height);
    const legendColorScale = Object.assign(colorScale.copy()
        .interpolator(interpolateRound(marginLeft, width - marginRight)),
        {range() { return [marginLeft, width - marginRight]; }});


    legendSvg.append('image')
        .attr('x', marginLeft)
        .attr('y', marginTop)
        .attr('width', width - marginLeft - marginRight)
        .attr('height', height)
        .attr('preserveAspectRatio', 'none')
        .attr('xlink:href', colorRamp(colorScale.interpolator(), width).toDataURL());

    legendSvg.append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(axisBottom(legendColorScale))
      .call(tickAdjust)
      .call(g => g.select('.domain').remove())
      .call(g => g.append('text')
        .attr('x', marginLeft)
        .attr('y', marginTop + marginBottom - height - 6)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text(title));
  }, [colorScale, height, marginBottom, title]);

  return <svg ref={legendRef}></svg>;
}