import React from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./App.css";

// Register Chart.js components
Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

function AnalysisCharts({ data }) {
  // Display a loading message if data is not yet available
  if (!data) {
    return <div>Loading...</div>;
  }

  // Define categorical data for pie charts
  const categoricalData = {
    accessVector: data.accessVector,
    accessComplexity: data.accessComplexity,
    confidentialityImpact: data.confidentialityImpact,
    authentication: data.authentication,
    integrityImpact: data.integrityImpact,
    availabilityImpact: data.availabilityImpact,
  };

  // Generate pie charts for categorical data
  const categoricalCharts = Object.entries(categoricalData).map(
    ([key, values]) => {
      const chartData = {
        labels: values ? Object.keys(values) : [], // Labels from object keys
        datasets: [
          {
            data: values ? Object.values(values) : [], // Data from object values
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ], // Define colors for the chart
          },
        ],
      };
      return (
        <div key={key} className="chartContainerStyle">
          <h3>
            {key
              .replace(/([A-Z])/g, " $1") // Convert camelCase to readable labels
              .replace(/^./, (str) => str.toUpperCase())} // Capitalize the first letter
          </h3>
          <Pie
            data={chartData}
            options={{
              plugins: { legend: { position: "bottom" } }, // Position legend below the chart
              responsive: true,
              maintainAspectRatio: false, // Ensure responsive behavior
            }}
          />
        </div>
      );
    }
  );

  // Define linear data (numeric values) for histograms
  const linearData = {
    exploitabilityScore: data.exploitabilityScore,
    impactScore: data.impactScore,
    baseScore: data.baseScore,
  };

  // Define bin ranges for histograms (e.g., 0-1, 1-2, ..., 9-10)
  const bins = Array.from({ length: 10 }, (_, i) => [i, i + 1]);

  // Generate histograms for linear data
  const linearCharts = Object.entries(linearData).map(([key, values]) => {
    if (!values) values = []; // Handle missing values

    // Count occurrences in each bin
    const binCounts = bins.map(([min, max]) =>
      values.filter((value) => value >= min && value < max).length
    );

    // Prepare chart data
    const chartData = {
      labels: bins.map(([min, max]) => `${min}-${max}`), // Bin labels
      datasets: [
        {
          label: key
            .replace(/([A-Z])/g, " $1") // Convert camelCase to readable labels
            .replace(/^./, (str) => str.toUpperCase()), // Capitalize the first letter
          data: binCounts, // Bin counts as data
          backgroundColor: "#36A2EB",
          borderColor: "#1F77B4",
          borderWidth: 1,
        },
      ],
    };

    return (
      <div key={key} className="chartContainerStyle">
        <h3>
          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
        </h3>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: "Count" } }, // Configure Y-axis
              x: { title: { display: true, text: "Score Range" } }, // Configure X-axis
            },
            plugins: { legend: { display: true, position: "top" } }, // Position legend above the chart
          }}
        />
      </div>
    );
  });

  // Define boolean data for true/false distribution
  const booleanData = {
    acInsufInfo: data.acInsufInfo,
    obtainAllPrivilege: data.obtainAllPrivilege,
    obtainUserPrivilege: data.obtainUserPrivilege,
    obtainOtherPrivilege: data.obtainOtherPrivilege,
    userInteractionRequired: data.userInteractionRequired,
  };

  // Total number of records (baseScore is used as a reference)
  const baseScoreSize = data.baseScore ? data.baseScore.length : 0;

  // Generate pie charts for boolean data
  const booleanCharts = Object.entries(booleanData).map(([key, trueCount]) => {
    const falseCount = baseScoreSize - trueCount; // Calculate the false count
    const chartData = {
      labels: ["True", "False"],
      datasets: [
        {
          data: [trueCount, falseCount], // True and false counts as data
          backgroundColor: ["#FF6384", "#36A2EB"], // Define colors
        },
      ],
    };
    return (
      <div key={key} className="chartContainerStyle">
        <h3>
          {key
            .replace(/([A-Z])/g, " $1") // Convert camelCase to readable labels
            .replace(/^./, (str) => str.toUpperCase())} // Capitalize the first letter
        </h3>
        <Pie
          data={chartData}
          options={{
            plugins: { legend: { position: "bottom" } }, // Position legend below the chart
            responsive: true,
            maintainAspectRatio: false, // Ensure responsive behavior
          }}
        />
      </div>
    );
  });

  // Define data for keyword frequency bar chart
  const keywordData = {
    labels: data.keywordFrequency ? Object.keys(data.keywordFrequency) : [], // Keyword labels
    datasets: [
      {
        label: "Keyword Frequency",
        data: data.keywordFrequency ? Object.values(data.keywordFrequency) : [], // Frequency values
        backgroundColor: "#36A2EB",
        borderColor: "#1F77B4",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <div className="Charts">
        {/* Render categorical data as pie charts */}
        <h2>Categorical Data (Pie Charts)</h2>
        <div className="eachCategoryCharts">{categoricalCharts}</div>

        {/* Render linear data as histograms */}
        <h2>Linear Data (Histograms)</h2>
        <div className="eachCategoryCharts">{linearCharts}</div>

        {/* Render boolean data as true/false pie charts */}
        <h2>Boolean Data (True/False Distribution)</h2>
        <div className="eachCategoryCharts">{booleanCharts}</div>

        {/* Render keyword frequency as a bar chart */}
        <h2>Top 20 Keyword Frequency</h2>
        <div>
          <Bar
            data={keywordData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true, title: { display: true, text: "Frequency" } }, // Y-axis title
                x: { title: { display: true, text: "Keywords" } }, // X-axis title
              },
              plugins: { legend: { display: false } }, // Disable legend
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AnalysisCharts;
