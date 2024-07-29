import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import data from './data/data.json';

function App() {
    return (
        <>
            <BarChart data={data.data} />
        </>
    );
}

const BarChart = ({ data }) => {
    const svgRef = useRef();

    useEffect(() => {
        const h = 800;
        const w = 1000;
        const padding = 60;
        const barWidth = 4;

        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3
            .select(svgRef.current)
            .attr('width', w)
            .attr('height', h);

        data.forEach((item) => {
            item.push(new Date(item[0]).getTime() / 1000);
        });

        const xScale = d3
            .scaleTime()
            .domain([
                d3.min(data, (d) => new Date(d[0])),
                d3.max(data, (d) => new Date(d[0])),
            ])
            .range([padding, w - padding]);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d[1])])
            .range([h - padding, padding]);

        const unixScale = d3
            .scaleLinear()
            .domain([d3.min(data, (d) => d[2]), d3.max(data, (d) => d[2])])
            .range([padding, w - padding]);

        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('fill', 'green')
            .attr('x', (d) => unixScale(d[2]))
            .attr('y', (d) => yScale(d[1]))
            .attr('width', barWidth)
            .attr('height', (d) => h - padding - yScale(d[1]))
            .attr('data-date', (d) => d[0])
            .attr('data-gdp', (d) => d[1])
            .on('mouseover', (event, d) => {
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .attr('data-date', d[0])
                    .html(`Date: ${d[0]}<br>GDP: ${d[1]}`)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 28}px`)
                    .style('background-color', 'white');
            })
            .on('mouseout', () => {
                d3.select('#tooltip').style('opacity', 0);
            });

        const xAxis = d3.axisBottom(xScale);
        svg.append('g')
            .attr('transform', `translate(0, ${h - padding})`)
            .attr('id', 'x-axis')
            .call(xAxis);

        const yAxis = d3.axisLeft(yScale);
        svg.append('g')
            .attr('transform', `translate(${padding}, 0)`)
            .attr('id', 'y-axis')
            .call(yAxis);

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -h / 2)
            .attr('y', padding * 1.5)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Gross Domestic Product');

        svg.append('text')
            .attr('x', w - 300)
            .attr('y', 800)
            .attr('class', 'info')
            .style('text-anchor', 'middle')
            .text(
                'More Information: http://www.bea.gov/national/pdf/nipaguid.pdf'
            );
    }, [data]);

    return (
        <>
            <div className='container'>
                <h1 id='title'>Gross Domestic Product</h1>
                <svg ref={svgRef}></svg>
                <div
                    id='tooltip'
                    style={{ position: 'absolute', opacity: 0 }}
                ></div>
            </div>
        </>
    );
};

export default App;
