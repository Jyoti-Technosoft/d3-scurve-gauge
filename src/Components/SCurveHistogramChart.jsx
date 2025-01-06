import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const SCurveHistogramChart = ({ data }) => {
  const svgRef = useRef();
  const [timeInterval, setTimeInterval] = useState("daily");
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const actualData =
    data.filter((d) => d.projectType === "UPDATED_PROJECT") || [];
  const plannedData =
    data.filter((d) => d.projectType === "BASELINE_PROJECT") || [];

  const transformData = (planned, actual, timeInterval) => {
    const plannedPoints = groupData(planned, timeInterval);

    const actualPoints = groupData(actual, timeInterval);

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
        d.sumBaselinePlannedTotalCost ? d.sumBaselinePlannedTotalCost : d.sumActualCost
      );
      if (values.length > 0 && values[0].sumBaselinePlannedTotalCost) {
        return {...values[0], startDate: key, sumBaselinePlannedTotalCost: totalPlanned }
      } else if (values.length > 0 && values[0].sumActualCost) {
        return {...values[0], startDate: key, sumActualCost: totalPlanned }
      }
      // return { date: key, value: totalPlanned };
    });
  };

  useEffect(() => {
    const { plannedPoints, actualPoints } = transformData(
      plannedData,
      actualData,
      timeInterval
    );
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    // Parse dates
    const parsedData = actualData.map((d) => ({
      ...d,
      startDate: new Date(d.startDate),
      finishDate: new Date(d.finishDate),
    }));

    const parsedData2 = plannedData.map((d) => ({
      ...d,
      startDate: new Date(d.startDate),
      finishDate: new Date(d.finishDate),
    }));

    // Define X and Y scales
    const xScale = d3
      .scaleTime()
      .domain([
        d3.min([...parsedData, ...parsedData2], (d) => d.startDate),
        d3.max([...parsedData, ...parsedData2], (d) => d.finishDate),
      ])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max([...parsedData, ...parsedData2], (d) => d.sumBaselinePlannedTotalCost ? d.sumBaselinePlannedTotalCost : d.sumActualCost)])
      .range([height - margin.bottom, margin.top]);

    // Create bins for the histogram
    const histogram = d3
      .bin()
      .value((d) => d.startDate) // Bins based on startDate
      .domain(xScale.domain())
      .thresholds(xScale.ticks(parsedData.length));

    const histogram1 = d3
      .bin()
      .value((d) => d.startDate) // Bins based on startDate
      .domain(xScale.domain())
      .thresholds(xScale.ticks(parsedData2.length));


    const bins = histogram(parsedData);
    const bins2 = histogram1(parsedData2);

    // Create SVG
    svg
      .attr("width", width)
      .attr("height", height);

    // Add X-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat("%Y-%m-%d")))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-45)");

    // Add Y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Draw histogram bars
    svg
      .selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.x0))
      .attr("y", (d) => yScale(d3.sum(d, (item) => item.sumActualCost)))
      .attr("width", (d) => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("height", (d) =>
        height - margin.bottom - yScale(d3.sum(d, (item) => item.sumActualCost))
      )
      .attr("fill", "red")
      .attr("opacity", "0.6");

    svg
      .selectAll("rect2")
      .data(bins2)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.x0))
      .attr("y", (d) => yScale(d3.sum(d, (item) => item.sumBaselinePlannedTotalCost)))
      .attr("width", (d) => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("height", (d) =>
        height - margin.bottom - yScale(d3.sum(d, (item) => item.sumBaselinePlannedTotalCost))
      )
      .attr("fill", "steelblue")
      .attr("opacity", "0.6");

    // Add labels
    // svg
    //   .selectAll(".label")
    //   .data(bins)
    //   .enter()
    //   .append("text")
    //   .attr("x", (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
    //   .attr("y", (d) => yScale(d3.sum(d, (item) => item.cumSumActualCost)) - 5)
    //   .attr("text-anchor", "middle")
    //   .style("font-size", "12px")
    //   .style("fill", "#333")
    //   .text((d) => d3.sum(d, (item) => item.cumSumActualCost).toFixed(2));

  }, [timeInterval, dimensions]);

  return (
    // <div>
    //   <div>
    //     <button onClick={() => setTimeInterval("daily")}>Daily</button>
    //     <button onClick={() => setTimeInterval("weekly")}>Weekly</button>
    //     <button onClick={() => setTimeInterval("monthly")}>Monthly</button>
    //   </div>
    //   <svg ref={svgRef} width={730} height={400}></svg>
    // </div>
    <div className="scurve-chart-container">
      <h2 className="chart-title">S-Curve-Histogram</h2>

    <div className="legend-filter">
      <div className="legends">
        <div className="legend">
          <span className="legend-icon planned"></span>
          Planned %
        </div>
        <div className="legend">
          <span className="legend-icon actual"></span>
          Actual %
        </div>
      </div>

      <div className="dropdown-container">
        <select
          className="dropdown"
          value={timeInterval}
          onChange={(e) => setTimeInterval(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
    </div>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
      ></svg>
    </div>
  );
};

export default SCurveHistogramChart;
