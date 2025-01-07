import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const styles = {
  gaugeContainer: {
    textAlign: "center",
    marginBottom: "20px",
  },
  gaugeTitle: {
    fontSize: "16px",
    fontWeight: "bold",
  },
};

const Gauge = ({ title, value, min, max, enableNeedle = false, enableGradient = false, colorLogic }) => {
  const svgRef = useRef();

  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();
    const width = 220;
    const height = 220;
    const radius = Math.min(width, height) / 2 - 10;
    const arcWidth = 35;
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
    if (enableGradient) {
        const defs = svg.append("defs");

        // Define the gradient
        const gradient = defs
            .append("linearGradient")
            .attr("id", "gauge-gradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "red");
        gradient.append("stop").attr("offset", "50%").attr("stop-color", "orange");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "green");
      }

    const backgroundArc = d3
      .arc()
      .innerRadius(radius - arcWidth)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);
    svg
      .append("path")
      .attr("d", backgroundArc)
      .attr("fill", enableGradient ? "url(#gauge-gradient)" : "#f3f2f1")

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
    const fillColor = colorLogic(value)
    svg.append("path").attr("d", foregroundArc).attr("fill", enableGradient ? "transparent" : fillColor);

    let displayValue;
    if (min === 0 && max === 1) {
      displayValue = `${(value * 100).toFixed(2)}%`;
    } else {
      displayValue = value.toFixed(2);
    }

    if (enableNeedle) {
        // Compute the needle angle based on the value
        const needleAngle = scale(value);

        // Add the label dynamically at the needle's tip
        svg
            .append("text")
            .attr("x", 0)
            .attr("y", -(radius - arcWidth + 40))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "#919392")
            .text(displayValue)
            .attr("transform", `rotate(${(needleAngle * 180) / Math.PI})`);

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
                .text(min.toFixed(1))
                .attr("transform", "rotate(-90) translate(-10,-5)");
            svg
                .append("text")
                .attr("x", (radius - 20) * Math.cos(angle1))
                .attr("y", (radius - 20) * Math.sin(angle1))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#919392")
                .style("writing-mode", "tb")
                .text(max.toFixed(1))
                .attr("transform", "rotate(-90) translate(-10,8)");
        }

        // Add this portion to append the needle
        const needleLength = radius - 40; // Adjust needle length
        const needleWidth = 4; // Needle width

        // Create the needle group
        const needleGroup = svg
            .append("g")
            .attr("transform", `rotate(${(needleAngle * 180) / Math.PI})`);

        // Append the needle shape
        needleGroup
            .append("rect")
            .attr("x", -needleWidth / 2) // Center the needle
            .attr("y", -(radius - arcWidth - 10)) // Start near the center
            .attr("width", needleWidth)
            .attr("height", needleLength)
            .attr("fill", "black");
        // Add a circle at the needle's base
        svg
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 6)
            .attr("fill", "black");

    } else {
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
                .text(min.toFixed(1))
                .attr("transform", "rotate(-90) translate(-10,-5)");

            svg
                .append("text")
                .attr("x", (radius - 20) * Math.cos(angle1))
                .attr("y", (radius - 20) * Math.sin(angle1))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#919392") 
                .style("writing-mode", "tb")
                .text(max.toFixed(1))
                .attr("transform", "rotate(-90) translate(-10,8)");
        }
    }
  }, [value, min, max, colorLogic, enableGradient, enableNeedle]);

  return (
    <div style={styles.gaugeContainer}>
      <h4 style={styles.gaugeTitle}>{title}</h4>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Gauge;
