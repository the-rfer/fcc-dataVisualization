/* eslint-disable react-hooks/exhaustive-deps */
import * as d3 from 'd3';
import { useRef, useEffect } from 'react';

const App = () => {
    const chartRef = useRef(null);
    const margin = { top: 60, right: 30, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    console.log('new render');

    useEffect(() => {
        const svg = d3
            .select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        d3.json(
            'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
        ).then((data) => {
            data.forEach((d) => {
                d.Year = new Date(d.Year, 0);
                d.Time = new Date(
                    1970,
                    0,
                    1,
                    0,
                    ...d.Time.split(':').map((t) => +t)
                );
            });

            const xScale = d3
                .scaleTime()
                .domain(d3.extent(data, (d) => d.Year))
                .range([0, width]);

            const yScale = d3
                .scaleTime()
                .domain(d3.extent(data, (d) => d.Time))
                .range([0, height]);

            const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y'));
            const yAxis = d3
                .axisLeft(yScale)
                .tickFormat(d3.timeFormat('%M:%S'));

            svg.append('g')
                .attr('id', 'x-axis')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);

            svg.append('g').attr('id', 'y-axis').call(yAxis);

            svg.selectAll('.dot')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', (d) => xScale(d.Year))
                .attr('cy', (d) => yScale(d.Time))
                .attr('r', 5)
                .attr('data-xvalue', (d) => d.Year)
                .attr('data-yvalue', (d) => d.Time)
                .on('mouseover', (event, d) => {
                    d3.select('#tooltip')
                        .style('opacity', 1)
                        .style('background-color', 'white')
                        .attr('data-year', d.Year)
                        .html(
                            `Year: ${d.Year.getFullYear()}<br>Time: ${d3.timeFormat(
                                '%M:%S'
                            )(d.Time)}`
                        )
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY - 30}px`);
                })
                .on('mouseout', () => {
                    d3.select('#tooltip').style('opacity', 0);
                });
        });

        return () => {
            d3.select(chartRef.current).selectAll('*').remove();
        };
    }, []);
    return (
        <>
            <h1 id='title'>Cyclist Performance Data</h1>
            <h2 id='legend'>Doping Allegations</h2>
            <div id='chart' ref={chartRef}></div>
            <div
                id='tooltip'
                style={{ position: 'absolute', opacity: 0 }}
            ></div>
        </>
    );
};
export default App;
