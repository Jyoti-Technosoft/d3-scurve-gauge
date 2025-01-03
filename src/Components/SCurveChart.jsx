import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { actualData, plannedData } from "../Constants/Data";

const SCurveChart = () => {
  const svgRef = useRef();
  const [timeInterval, setTimeInterval] = useState("daily");

  // Transform data for plotting
  const transformData = (planned, actual, timeInterval) => {
    // const plannedPoints = planned.map((d) => ({
    //   date: new Date(d.startDate),
    //   value: d.baselinePlannedTotalCostPercentage,
    // }));

    // const actualPoints = actual.map((d) => ({
    //   date: new Date(d.startDate),
    //   value: d.physicalProgressPercentage,
    // }));
    const plannedPoints = groupData(planned, timeInterval);

    const actualPoints = groupData(actual, timeInterval);
    console.log("PLANED DATA ===> ", plannedPoints, actualPoints);

    return { plannedPoints, actualPoints };
  };

  const groupData = (data, interval) => {
    const groupedData = d3.group(data, (d) => {
      const date = new Date(d.startDate);
      if (interval === "daily") {
        return new Date(d3.timeFormat("%Y-%m-%d")(date));
      } else if (interval === "weekly") {
        const weekStart = d3.timeMonday(date);
        return new Date(d3.timeFormat("%Y-%m-%d")(weekStart));
      } else if (interval === "monthly") {
        return new Date(d3.timeFormat("%Y-%m")(date));
      }
    });

    return Array.from(groupedData, ([key, values]) => {
      const totalPlanned = d3.sum(values, (d) =>
        d.baselinePlannedTotalCostPercentage
          ? d.baselinePlannedTotalCostPercentage
          : d.physicalProgressPercentage
      );
      return { date: key, value: totalPlanned / values.length };
    });
  };

  const calculateVariance = (planned, actual) => {
    // const plannedPoints = planned.map((d) => ({
    //   date: new Date(d.startDate),
    //   value: d.baselinePlannedTotalCostPercentage,
    // }));
    // const actualPoints = actual.map((d) => ({
    //   date: new Date(d.startDate),
    //   value: d.physicalProgressPercentage,
    // }));
    // return { plannedPoints, actualPoints };
    return actual - planned;
  };

  useEffect(() => {
    const { plannedPoints, actualPoints } = transformData(
      plannedData,
      actualData,
      timeInterval
    );
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const xScale = d3
      .scaleTime()
      .domain(d3.extent([...plannedPoints, ...actualPoints], (d) => d.date))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max([...plannedPoints, ...actualPoints], (d) => d.value)])
      .range([height, 0]);

    const yScaleRight = d3
      .scaleLinear()
      .domain([0, d3.max([...plannedPoints, ...actualPoints], (d) => d.value)])
      .range([height, 0]);

    // svg
    //   .append("g")
    //   .attr("class", "y-axis-right")
    //   .attr("transform", `translate(${width}, 0)`)
    //   .call(d3.axisRight(yScaleRight));

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y"));
    const yAxis = d3.axisLeft(yScale);
    const yAxisRight = d3.axisRight(yScaleRight);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    svg.append("g").attr("class", "y-axis1").call(yAxis);
    svg
      .append("g")
      .attr("class", "y-axis2")
      .attr("transform", `translate(${width}, 0)`)
      .call(yAxisRight);

    // Create tooltip
    const tooltip = svg
      .append("text")
      .attr("class", "tooltip")
      .attr("x", 0)
      .attr("y", 0)
      .style("visibility", "hidden");

    // Create vertical line
    const line = svg
      .append("line")
      .attr("class", "vertical-line")
      .attr("stroke", "red")
      .attr("stroke-dasharray", "10,10")
      .attr("stroke-width", "3px")
      .style("visibility", "hidden");

    // Mouse move event
    svg.on("mousemove", function (event) {
      const [mouseX] = d3.pointer(event);
      const xDate = xScale.invert(mouseX); // Get the date from the X scale
      const closestPlannedPoint = plannedPoints.reduce((prev, curr) => {
        return Math.abs(curr.date - xDate) < Math.abs(prev.date - xDate)
          ? curr
          : prev;
      });
      const closestActualPoint = actualPoints.reduce((prev, curr) => {
        return Math.abs(curr.date - xDate) < Math.abs(prev.date - xDate)
          ? curr
          : prev;
      });

      // Get the Y value for the closest point
      const yValuePlanned = closestPlannedPoint
        ? closestPlannedPoint.value
        : null;
      const yValueActual = closestActualPoint ? closestActualPoint.value : null;

      // Update tooltip position and text
      tooltip
        .attr("x", mouseX)
        .attr("y", yScale(yValuePlanned || yValueActual)) // Use the Y value of the closest point
        // .text(
        //   `Status Date: ${d3.timeFormat("%b %d, %Y")(xDate)} | Planned: ${
        //     yValuePlanned.toFixed(2) || 0
        //   } | Actual: ${yValueActual.toFixed(2) || 0}`
        // )
        .text(
          `Status Date: ${d3.timeFormat("%b %d, %Y")(xDate)} | Variance: ${
            calculateVariance(yValuePlanned, yValueActual).toFixed(2) || 0
          }`
        )
        .style("visibility", "visible");

      // Update vertical line position
      line
        .attr("x1", mouseX)
        .attr("y1", margin.top)
        .attr("x2", mouseX)
        .attr("y2", height + margin.top)
        .style("visibility", "visible");
    });

    // Mouse out event
    svg.on("mouseout", function () {
      tooltip.style("visibility", "hidden");
      line.style("visibility", "hidden");
    });

    const linePlanned = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value));

    const lineActual = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value));

    svg
      .append("path")
      .datum(plannedPoints)
      .attr("class", "line planned")
      .attr("d", linePlanned)
      .attr("fill", "none")
      .attr("stroke", "#00FF00")
      .attr("stroke-width", 4);

    svg
      .append("path")
      .datum(actualPoints)
      .attr("class", "line actual")
      .attr("d", lineActual)
      .attr("fill", "none")
      .attr("stroke", "#2F5233")
      .attr("stroke-width", 4);
  }, [timeInterval]);

  return (
    <div>
      <div>
        <button onClick={() => setTimeInterval("daily")}>Daily</button>
        <button onClick={() => setTimeInterval("weekly")}>Weekly</button>
        <button onClick={() => setTimeInterval("monthly")}>Monthly</button>
      </div>
      <svg ref={svgRef} width={730} height={400}></svg>
    </div>
  );
};

export default SCurveChart;
