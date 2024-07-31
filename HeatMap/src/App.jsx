import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const HeatMap = () => {
    const svgRef = useRef();

    useEffect(() => {
        fetch(
            'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
        )
            .then((response) => response.json())
            .then((data) => {
                drawHeatMap(data);
            });

        const drawHeatMap = (data) => {
            const baseTemperature = data.baseTemperature;
            const dataset = data.monthlyVariance;

            const margin = { top: 80, right: 20, bottom: 100, left: 100 };
            const width = 1200 - margin.left - margin.right;
            const height = 600 - margin.top - margin.bottom;

            const svg = d3
                .select(svgRef.current)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const xScale = d3
                .scaleBand()
                .domain(dataset.map((d) => d.year))
                .range([0, width])
                .padding(0.01);

            const yScale = d3
                .scaleBand()
                .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
                .range([0, height])
                .padding(0.01);

            const colorScale = d3
                .scaleSequential(d3.interpolateCool)
                .domain(
                    d3.extent(dataset, (d) => baseTemperature + d.variance)
                );

            const xAxis = d3
                .axisBottom(xScale)
                .tickValues(xScale.domain().filter((year) => year % 10 === 0))
                .tickFormat(d3.format('d'));
            svg.append('g')
                .attr('id', 'x-axis')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);

            const yAxis = d3
                .axisLeft(yScale)
                .tickFormat((month) =>
                    d3.timeFormat('%B')(new Date(0).setUTCMonth(month))
                );
            svg.append('g').attr('id', 'y-axis').call(yAxis);

            svg.selectAll('.cell')
                .data(dataset)
                .enter()
                .append('rect')
                .attr('class', 'cell')
                .attr('x', (d) => xScale(d.year))
                .attr('y', (d) => yScale(d.month - 1))
                .attr('width', xScale.bandwidth())
                .attr('height', yScale.bandwidth())
                .attr('fill', (d) => colorScale(baseTemperature + d.variance))
                .attr('data-year', (d) => d.year)
                .attr('data-month', (d) => d.month - 1)
                .attr('data-temp', (d) => baseTemperature + d.variance)
                .on('mouseover', (event, d) => {
                    const tooltip = d3
                        .select('#tooltip')
                        .style('opacity', 1)
                        .attr('data-year', d.year)
                        .html(
                            `Year: ${d.year}<br>Month: ${d3.timeFormat('%B')(
                                new Date(0).setUTCMonth(d.month - 1)
                            )}<br>Temperature: ${(
                                baseTemperature + d.variance
                            ).toFixed(1)}°C`
                        );

                    tooltip
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY - 30}px`)
                        .style('background-color', 'white')
                        .style('padding', '5px')
                        .style('border-radius', '5px');
                })
                .on('mouseout', () => {
                    d3.select('#tooltip').style('opacity', 0);
                });

            const legend = svg
                .append('g')
                .attr('id', 'legend')
                .attr(
                    'transform',
                    `translate(0, ${height + margin.bottom / 2})`
                );

            const legendWidth = 300;
            const legendHeight = 20;
            const legendColors = colorScale.ticks(6);
            const legendScale = d3
                .scaleBand()
                .domain(legendColors.map((d) => d.toFixed(1)))
                .range([0, legendWidth]);

            legend
                .selectAll('rect')
                .data(legendColors)
                .enter()
                .append('rect')
                .attr('x', (d) => legendScale(d.toFixed(1)))
                .attr('y', 0)
                .attr('width', legendScale.bandwidth())
                .attr('height', legendHeight)
                .attr('fill', (d) => colorScale(d));

            legend
                .append('g')
                .attr('transform', `translate(0, ${legendHeight})`)
                .call(d3.axisBottom(legendScale).tickFormat(d3.format('.1f')));
        };

        return () => {
            d3.select(svgRef.current).selectAll('*').remove();
        };
    }, []);

    return (
        <div>
            <h1 id='title'>Monthly Global Land-Surface Temperature</h1>
            <p id='description'>1753 - 2015: base temperature 8.66℃</p>
            <svg ref={svgRef}></svg>
            <div
                id='tooltip'
                style={{ position: 'absolute', opacity: 0 }}
            ></div>
        </div>
    );
};

export default HeatMap;
