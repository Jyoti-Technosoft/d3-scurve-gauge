import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "../Styles/Gauge.css";

const Gauge = ({ title, value, min, max, colorLogic }) => {
    const svgRef = useRef();

    useEffect(() => {
        d3.select(svgRef.current).selectAll("*").remove();

        const width = 220;
        const height = 220;
        const radius = Math.min(width, height) / 2 - 10;
        const arcWidth = 30;

        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const backgroundArc = d3
            .arc()
            .innerRadius(radius - arcWidth)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2)
            .endAngle(Math.PI / 2);

        svg.append("path").attr("d", backgroundArc).attr("fill", "#f3f2f1");

        const scale = d3
            .scaleLinear()
            .domain([min, max])
            .range([-Math.PI / 2, Math.PI / 2]);

        const foregroundArc = d3
            .arc()
            .innerRadius(radius - arcWidth)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2)
            .endAngle(scale(value));

        const fillColor = colorLogic(value);

        svg.append("path").attr("d", foregroundArc).attr("fill", fillColor);

        let displayValue;
        if (min === 0 && max === 1) {
            displayValue = `${(value * 100).toFixed(2)}%`;
        } else {
            displayValue = value.toFixed(2);
        }

        svg
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.8em")
            .style("font-size", "24px")
            .style("fill", "#919392") 
            .text(displayValue);

        const angle0 = -Math.PI / 2;
        const angle1 = Math.PI / 2;

        if (min === 0 && max === 1) {
            svg
                .append("text")
                .attr("x", (radius - 20) * Math.cos(angle0))
                .attr("y", (radius - 20) * Math.sin(angle0))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#919392") 
                .style("writing-mode", "tb")
                .text("0%")
                .attr("transform", "rotate(-90) translate(-10,-5)");

            svg
                .append("text")
                .attr("x", (radius - 20) * Math.cos(angle1))
                .attr("y", (radius - 20) * Math.sin(angle1))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#919392") 
                .style("writing-mode", "tb")
                .text("100%")
                .attr("transform", "rotate(-90) translate(-10,8)");
        } else {
            svg
                .append("text")
                .attr("x", (radius - 20) * Math.cos(angle0))
                .attr("y", (radius - 20) * Math.sin(angle0))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#919392") 
                .style("writing-mode", "tb")
                .text("0")
                .attr("transform", "rotate(-90) translate(-10,-5)");

            svg
                .append("text")
                .attr("x", (radius - 20) * Math.cos(angle1))
                .attr("y", (radius - 20) * Math.sin(angle1))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#919392") 
                .style("writing-mode", "tb")
                .text("2")
                .attr("transform", "rotate(-90) translate(-10,8)");
        }
    }, [value, min, max, colorLogic]);

    return (
        <div className="gauge-container">
            <h4 className="gauge-title">{title}</h4>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default Gauge;
