import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State for input text
  const [text, setText] = useState('');
  // State to store predictions from the backend
  const [predictions, setPredictions] = useState([]);
  // State to control modal visibility
  const [showModal, setShowModal] = useState(false);

  // Handler to update the text input state
  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  // Handler to send the text to the backend and get predictions
  const handlePredict = async () => {
    try {
      // Send POST request to the backend with the input text
      const response = await axios.post('http://127.0.0.1:5000/predict', { text });
      setPredictions(response.data.predictions); // Update predictions state with backend response
      setShowModal(true); // Show modal with predictions
    } catch (error) {
      console.error('Error during prediction:', error); // Log any errors
    }
  };

  // Handler to close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="App">
      <h1>Text Prediction</h1>

      {/* Textarea for user input */}
      <textarea
        value={text}
        onChange={handleInputChange}
        placeholder="Enter text here" // Placeholder text
        rows={4} // Number of visible rows
        cols={50} // Number of visible columns
      />
      
      {/* Button to trigger the prediction */}
      <button onClick={handlePredict}>Predict</button>

      {/* Conditional rendering of modal */}
      {showModal && (
        <div className="modal-background" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2>Predictions</h2>
            
            {/* Display the original text */}
            <h4>Text - {text}</h4>
            
            {/* Display predictions in a table */}
            <table>
              <thead>
                <tr>
                  <th>Model</th> {/* Column for model name */}
                  <th>Prediction</th> {/* Column for prediction result */}
                </tr>
              </thead>
              <tbody>
                {/* Map over predictions and render rows */}
                {predictions.map((pred, index) => (
                  <tr key={index}>
                    <td>{pred[0]}</td> {/* Model name */}
                    <td>{pred[1]}</td> {/* Prediction value */}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Button to close the modal */}
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
