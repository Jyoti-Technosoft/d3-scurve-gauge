import React from "react";

import Gauge from "./GaugeChart";
import data from "../Json/data.json";

const styles = {
  dashboardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    padding: "10px",
  },
};

const Dashboard = () => {
  const colorLogic = {
    schedule: () => "#2596be",
    actual: (value) =>
      value > data.scheduledPercentage / 100 ? "#28a745" : "#f40400",
    index: (value) => (value >= 1 ? "#28a745" : "#f40400"),
  };

  return (
    <div style={styles.dashboardContainer}>
      <Gauge
        title="Schedule Percentage (%)"
        value={data.scheduledPercentage / 100}
        min={0}
        max={1}
        colorLogic={colorLogic.schedule}
      />
      <Gauge
        title="Actual Percentage (%)"
        value={data.actualPercentage / 100}
        min={0}
        max={1}
        colorLogic={colorLogic.actual}
      />
      <Gauge
        title="Schedule Performance Index (SPI)"
        value={data.spi}
        min={0}
        max={2}
        colorLogic={colorLogic.index}
      />
      <Gauge
        title="Cost Performance Index (CPI)"
        value={data.cpi}
        min={0}
        max={2}
        colorLogic={colorLogic.index}
      />
    </div>
  );
};

export default Dashboard;
