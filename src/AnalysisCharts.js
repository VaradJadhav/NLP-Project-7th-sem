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
  // Check if data is available, else return loading message
  if (!data) {
    return <div>Loading...</div>;
  }

  // 1. Pie charts for categorical data
  const categoricalData = {
    accessVector: data.accessVector,
    accessComplexity: data.accessComplexity,
    confidentialityImpact: data.confidentialityImpact,
    authentication: data.authentication,
    integrityImpact: data.integrityImpact,
    availabilityImpact: data.availabilityImpact,
  };

  const categoricalCharts = Object.entries(categoricalData).map(
    ([key, values]) => {
      const chartData = {
        labels: values ? Object.keys(values) : [],
        datasets: [
          {
            data: values ? Object.values(values) : [],
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ],
          },
        ],
      };
      return (
        <div key={key} className="chartContainerStyle">
          <h3>
            {key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}
          </h3>
          <Pie
            data={chartData}
            options={{
              plugins: { legend: { position: "bottom" } },
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      );
    }
  );

  // 2. Histograms for linear data
  const linearData = {
    exploitabilityScore: data.exploitabilityScore,
    impactScore: data.impactScore,
    baseScore: data.baseScore,
  };

  const linearCharts = Object.entries(linearData).map(([key, values]) => {
    const chartData = {
      labels: values ? values.map((_, idx) => `Index ${idx + 1}`) : [],
      datasets: [
        {
          label: key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
          data: values || [],
          backgroundColor: "#36A2EB",
          borderColor: "#1F77B4",
          borderWidth: 1,
        },
      ],
    };
    return (
      <div key={key} className="chartContainerStyle">
        <h3>
          {key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
        </h3>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: "Score" } },
              x: { title: { display: true, text: "Index" } },
            },
            plugins: { legend: { display: true, position: "top" } },
          }}
        />
      </div>
    );
  });

  // 3. Boolean graphs (calculate False values and show as a pie chart)
  const booleanData = {
    acInsufInfo: data.acInsufInfo,
    obtainAllPrivilege: data.obtainAllPrivilege,
    obtainUserPrivilege: data.obtainUserPrivilege,
    obtainOtherPrivilege: data.obtainOtherPrivilege,
    userInteractionRequired: data.userInteractionRequired,
  };

  const baseScoreSize = data.baseScore ? data.baseScore.length : 0;
  const booleanCharts = Object.entries(booleanData).map(([key, trueCount]) => {
    const falseCount = baseScoreSize - trueCount;
    const chartData = {
      labels: ["True", "False"],
      datasets: [
        {
          data: [trueCount, falseCount],
          backgroundColor: ["#FF6384", "#36A2EB"],
        },
      ],
    };
    return (
      <div key={key} className="chartContainerStyle">
        <h3>
          {key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
        </h3>
        <Pie
          data={chartData}
          options={{
            plugins: { legend: { position: "bottom" } },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    );
  });

  // 4. Keyword frequency bar chart
  const keywordData = {
    labels: data.keywordFrequency ? Object.keys(data.keywordFrequency) : [],
    datasets: [
      {
        label: "Keyword Frequency",
        data: data.keywordFrequency ? Object.values(data.keywordFrequency) : [],
        backgroundColor: "#36A2EB",
        borderColor: "#1F77B4",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <div className="Charts">
        <h2>Categorical Data (Pie Charts)</h2>
        <div className="eachCategoryCharts">{categoricalCharts}</div>
        <h2>Linear Data (Histograms)</h2>
        <div className="eachCategoryCharts">{linearCharts}</div>
        <h2>Boolean Data (True/False Distribution)</h2>
        <div className="eachCategoryCharts">{booleanCharts}</div>
        <h2>Top 20 Keyword Frequency</h2>
        <div>
          <Bar
            data={keywordData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true, title: { display: true, text: "Frequency" } },
                x: { title: { display: true, text: "Keywords" } },
              },
              plugins: { legend: { display: false } },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AnalysisCharts;
