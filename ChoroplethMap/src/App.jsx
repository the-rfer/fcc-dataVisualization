import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const ChoroplethMap = () => {
    const svgRef = useRef();

    useEffect(() => {
        // Fetch data
        const fetchData = async () => {
            const countyDataUrl =
                'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
            const educationDataUrl =
                'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

            const countyData = await d3.json(countyDataUrl);
            const educationData = await d3.json(educationDataUrl);

            drawChoropleth(countyData, educationData);
        };

        // Draw the choropleth map
        const drawChoropleth = (countyData, educationData) => {
            // Dimensions and margins
            const margin = { top: 50, right: 20, bottom: 50, left: 20 };
            const width = 960 - margin.left - margin.right;
            const height = 800 - margin.top - margin.bottom;

            // Append SVG element
            const svg = d3
                .select(svgRef.current)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // Map and projection
            const path = d3.geoPath();

            // Education data map
            const educationMap = new Map(educationData.map((d) => [d.fips, d]));

            // Color scale
            const color = d3
                .scaleThreshold()
                .domain(d3.range(2, 70, 10))
                .range(d3.schemeBlues[9]);

            // Tooltip
            const tooltip = d3
                .select('#tooltip')
                .style('opacity', 0)
                .style('background-color', 'white');

            // Draw counties
            svg.append('g')
                .selectAll('path')
                .data(
                    topojson.feature(countyData, countyData.objects.counties)
                        .features
                )
                .enter()
                .append('path')
                .attr('class', 'county')
                .attr('data-fips', (d) => d.id)
                .attr('data-education', (d) => {
                    const result = educationMap.get(d.id);
                    return result ? result.bachelorsOrHigher : 0;
                })
                .attr('fill', (d) => {
                    const result = educationMap.get(d.id);
                    return result ? color(result.bachelorsOrHigher) : color(0);
                })
                .attr('d', path)
                .on('mouseover', (event, d) => {
                    const result = educationMap.get(d.id);
                    tooltip.style('opacity', 0.9);
                    tooltip
                        .html(
                            `${result.area_name}, ${result.state}: ${result.bachelorsOrHigher}%`
                        )
                        .attr('data-education', result.bachelorsOrHigher)
                        .style('left', `${event.pageX}px`)
                        .style('top', `${event.pageY - 28}px`);
                })
                .on('mouseout', () => {
                    tooltip.style('opacity', 0);
                });

            // Legend
            const legendWidth = 300;
            const legendHeight = 10;

            const legend = svg
                .append('g')
                .attr('id', 'legend')
                .attr(
                    'transform',
                    `translate(${width - legendWidth},${height + 40})`
                );

            const legendScale = d3
                .scaleLinear()
                .domain([2, 70])
                .range([0, legendWidth]);

            legend
                .selectAll('rect')
                .data(
                    color.range().map((d) => {
                        d = color.invertExtent(d);
                        if (d[0] == null) d[0] = legendScale.domain()[0];
                        if (d[1] == null) d[1] = legendScale.domain()[1];
                        return d;
                    })
                )
                .enter()
                .append('rect')
                .attr('height', legendHeight)
                .attr('x', (d) => legendScale(d[0]))
                .attr('width', (d) => legendScale(d[1]) - legendScale(d[0]))
                .attr('fill', (d) => color(d[0]));

            legend
                .call(
                    d3
                        .axisBottom(legendScale)
                        .tickSize(legendHeight)
                        .tickFormat((x) => Math.round(x) + '%')
                        .tickValues(color.domain())
                )
                .select('.domain')
                .remove();
        };

        // Fetch and draw the map
        fetchData();

        // Cleanup function
        return () => {
            d3.select('#tooltip').remove();
            d3.select(svgRef.current).selectAll('*').remove();
        };
    }, []);

    return (
        <div>
            <h1 id='title'>United States Educational Attainment</h1>
            <p id='description'>
                Percentage of adults age 25 and older with a bachelors degree or
                higher (2010-2014)
            </p>
            <svg ref={svgRef}></svg>
            <div
                id='tooltip'
                style={{ position: 'absolute', opacity: 0 }}
            ></div>
        </div>
    );
};

export default ChoroplethMap;
