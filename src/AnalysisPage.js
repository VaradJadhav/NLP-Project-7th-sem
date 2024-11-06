import React, { useState } from 'react';
import AnalysisCharts from './AnalysisCharts';
import axios from 'axios';
import './App.css';

function AnalysisPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [keywordData, setKeywordData] = useState(null);

  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  const fetchData = async () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = (end - start) / (1000 * 3600 * 24);

    if (timeDiff > 20) {
      setError('Date range should not exceed 20 days.');
      setData(null);
      return;
    }
    try {
      const response = await axios.post('http://127.0.0.1:5000/analyze', {
        startDate,
        endDate
      });
      console.log(response.data.analysisData,'jijiji')
      setData(response.data.analysisData);
      setKeywordData(response.data.keywordFrequency);
      setError('');
    } catch (error) {
    }
    console.error('Error fetching data:', error);
  };
  console.log(data,'hihhihi')
  return (
    <div className="analysis-page">
      <h1>Data Analysis</h1>
      <label>Start Date:</label>
      <input type="date" value={startDate} onChange={handleStartDateChange} />
      <label>End Date:</label>
      <input type="date" value={endDate} onChange={handleEndDateChange} />
      <button onClick={fetchData}>Analyze</button>

      {error && <p className="error">{error}</p>}
      {data && <AnalysisCharts data={data} keywordData={keywordData} />}
    </div>
  );
}

export default AnalysisPage;
