import React, { useState } from 'react';
import AnalysisCharts from './AnalysisCharts'; // Component for rendering charts
import axios from 'axios'; // Library for making HTTP requests
import './App.css'; // Custom CSS for styling

function AnalysisPage() {
  // State variables to store user input and fetched data
  const [startDate, setStartDate] = useState(''); // Start date input
  const [endDate, setEndDate] = useState(''); // End date input
  const [error, setError] = useState(''); // Error message for invalid input
  const [data, setData] = useState(null); // Analysis data from the backend
  const [keywordData, setKeywordData] = useState(null); // Keyword frequency data

  // Handlers for updating start and end dates
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  // Function to fetch analysis data from the backend
  const fetchData = async () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if date range exceeds 20 days
    const timeDiff = (end - start) / (1000 * 3600 * 24);
    if (timeDiff > 20) {
      setError('Date range should not exceed 20 days.');
      setData(null); // Clear data if input is invalid
      return;
    }

    try {
      // Send POST request to Flask backend with start and end dates
      const response = await axios.post('http://127.0.0.1:5000/analyze', {
        startDate,
        endDate,
      });

      // Update state with fetched data
      setData(response.data.analysisData);
      setKeywordData(response.data.keywordFrequency);
      setError(''); // Clear any previous error messages
    } catch (error) {
      console.error('Error fetching data:', error); // Log errors for debugging
      setError('Failed to fetch data. Please try again.'); // Show error message
    }
  };

  return (
    <div className="analysis-page">
      <h1>Data Analysis</h1>
      
      {/* Input fields for start and end dates */}
      <label>Start Date:</label>
      <input type="date" value={startDate} onChange={handleStartDateChange} />
      <label>End Date:</label>
      <input type="date" value={endDate} onChange={handleEndDateChange} />
      
      {/* Button to trigger data fetch */}
      <button onClick={fetchData}>Analyze</button>

      {/* Error message display */}
      {error && <p className="error">{error}</p>}

      {/* Render analysis charts if data is available */}
      {data && <AnalysisCharts data={data} keywordData={keywordData} />}
    </div>
  );
}

export default AnalysisPage;
