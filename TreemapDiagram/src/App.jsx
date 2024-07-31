import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Treemap = () => {
    const svgRef = useRef();

    useEffect(() => {
        const width = 960;
        const height = 570;

        d3.json(
            'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
        ).then((data) => {
            const root = d3
                .hierarchy(data)
                .eachBefore(
                    (d) =>
                        (d.data.id =
                            (d.parent ? d.parent.data.id + '.' : '') +
                            d.data.name)
                )
                .sum((d) => d.value)
                .sort((a, b) => b.height - a.height || b.value - a.value);

            d3.treemap().size([width, height]).paddingInner(1)(root);

            const svg = d3
                .select(svgRef.current)
                .attr('width', width)
                .attr('height', height)
                .style('font', '10px sans-serif');

            const categories = root
                .leaves()
                .map((nodes) => nodes.data.category);
            const uniqueCategories = [...new Set(categories)];

            const color = d3
                .scaleOrdinal()
                .domain(uniqueCategories)
                .range(d3.schemeCategory10);

            const tooltip = d3
                .select('body')
                .append('div')
                .attr('id', 'tooltip')
                .style('opacity', 0)
                .style('position', 'absolute')
                .style('background-color', 'white')
                .style('border', '1px solid #ccc')
                .style('padding', '10px')
                .style('pointer-events', 'none');

            const cell = svg
                .selectAll('g')
                .data(root.leaves())
                .enter()
                .append('g')
                .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

            const formattedNumber = (number) =>
                new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(number);

            cell.append('rect')
                .attr('class', 'tile')
                .attr('id', (d) => d.data.id)
                .attr('width', (d) => d.x1 - d.x0)
                .attr('height', (d) => d.y1 - d.y0)
                .attr('data-name', (d) => d.data.name)
                .attr('data-category', (d) => d.data.category)
                .attr('data-value', (d) => d.data.value)
                .attr('fill', (d) => color(d.data.category))
                .on('mouseover', (event, d) => {
                    tooltip
                        .style('opacity', 0.9)
                        .attr('data-value', d.data.value)
                        .html(
                            `Name: ${d.data.name}<br>Category: ${
                                d.data.category
                            }<br>Value: ${formattedNumber(d.data.value)}`
                        )
                        .style('left', `${event.pageX + 5}px`)
                        .style('top', `${event.pageY - 28}px`);
                })
                .on('mouseout', () => tooltip.style('opacity', 0));

            cell.append('text')
                .selectAll('tspan')
                .data((d) => {
                    const words = d.data.name.split(' ');
                    const lines = [];
                    let line = '';
                    words.forEach((word) => {
                        if ((line + word).length * 6 > d.x1 - d.x0) {
                            lines.push(line);
                            line = word;
                        } else {
                            line = line ? `${line} ${word}` : word;
                        }
                    });
                    lines.push(line);
                    return lines;
                })
                .enter()
                .append('tspan')
                .attr('class', 'tspan-line')
                .attr('x', 4)
                .attr('y', (d, i) => 14 + i * 12)
                .text((d) => d);

            const legendWidth = 500;
            const legendRectSize = 18;
            const legendSpacing = 4;

            const legend = d3
                .select('#legend')
                .append('svg')
                .attr('width', legendWidth)
                .attr(
                    'height',
                    uniqueCategories.length * (legendRectSize + legendSpacing)
                )
                .style('font', '10px sans-serif');

            legend
                .selectAll('rect')
                .data(uniqueCategories)
                .enter()
                .append('rect')
                .attr('class', 'legend-item')
                .attr('x', 0)
                .attr('y', (d, i) => i * (legendRectSize + legendSpacing))
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .attr('fill', (d) => color(d));

            legend
                .selectAll('text')
                .data(uniqueCategories)
                .enter()
                .append('text')
                .attr('x', legendRectSize + legendSpacing)
                .attr(
                    'y',
                    (d, i) =>
                        i * (legendRectSize + legendSpacing) +
                        legendRectSize / 2
                )
                .attr('dy', '.35em')
                .text((d) => d);
        });
    }, []);

    return (
        <div>
            <h1 id='title'>Movie Sales</h1>
            <p id='description'>
                Top 100 Highest Grossing Movies Grouped By Genre
            </p>
            <svg ref={svgRef}></svg>
            <div id='legend'></div>
        </div>
    );
};

export default Treemap;
