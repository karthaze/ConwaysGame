import React from 'react';
import ConwayGameOfLife from './components/ConwayGameOfLife';
import './App.css';

function App() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500&display=swap" rel="stylesheet" />
      <div className="App">
        <ConwayGameOfLife />
      </div>
    </>
  );
}

export default App;