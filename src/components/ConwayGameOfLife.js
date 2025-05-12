// ConwayGameOfLife.js
import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './GameOfLife.module.css';

const presets = {
  Glider: [
    [1, 0], [2, 1], [0, 2], [1, 2], [2, 2]
  ],
  Blinker: [
    [1, 0], [1, 1], [1, 2]
  ],
  Toad: [
    [1, 1], [1, 2], [1, 3], [2, 0], [2, 1], [2, 2]
  ],
  Pulsar: [
    [2, 4], [2, 5], [2, 6], [2, 10], [2, 11], [2, 12],
    [4, 2], [4, 7], [4, 9], [4, 14],
    [5, 2], [5, 7], [5, 9], [5, 14],
    [6, 2], [6, 7], [6, 9], [6, 14],
    [7, 4], [7, 5], [7, 6], [7, 10], [7, 11], [7, 12],
    [9, 4], [9, 5], [9, 6], [9, 10], [9, 11], [9, 12],
    [10, 2], [10, 7], [10, 9], [10, 14],
    [11, 2], [11, 7], [11, 9], [11, 14],
    [12, 2], [12, 7], [12, 9], [12, 14],
    [14, 4], [14, 5], [14, 6], [14, 10], [14, 11], [14, 12]
  ]
};

export default function ConwayGameOfLife() {
  const [grid, setGrid] = useState([]);
  const [running, setRunning] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 25, cols: 25 });
  const [speed, setSpeed] = useState(300);
  const runningRef = useRef(running);
  runningRef.current = running;

  const initializeGrid = useCallback(() => {
    const { rows, cols } = gridSize;
    const newGrid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ alive: false, age: 0 }))
    );
    setGrid(newGrid);
    setRunning(false);
  }, [gridSize]);

  const loadPreset = (name) => {
    if (!name) return;
    
    initializeGrid();
    const preset = presets[name];
    
    setGrid((g) => {
      const newGrid = g.map((row) => row.map((cell) => ({ ...cell })));
      preset.forEach(([r, c]) => {
        if (r < gridSize.rows && c < gridSize.cols) {
          newGrid[r][c].alive = true;
          newGrid[r][c].age = 1;
        }
      });
      return newGrid;
    });
  };

  const toggleCell = (row, col) => {
    if (running) return;
    setGrid((g) => {
      const newGrid = g.map((r, rIdx) =>
        r.map((cell, cIdx) =>
          rIdx === row && cIdx === col
            ? { alive: !cell.alive, age: !cell.alive ? 1 : 0 }
            : cell
        )
      );
      return newGrid;
    });
  };

  const getCellClass = (cell) => {
    if (!cell.alive) return styles.cell;
    if (cell.age === 1) return `${styles.cell} ${styles.cellBorn}`;
    if (cell.age > 4) return `${styles.cell} ${styles.cellDying}`;
    return `${styles.cell} ${styles.cellAlive}`;
  };

  const countNeighbors = (grid, row, col) => {
    const { rows, cols } = gridSize;
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const r = (row + i + rows) % rows;
        const c = (col + j + cols) % cols;
        if (grid[r][c].alive) count++;
      }
    }
    return count;
  };

  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;
    setGrid((currentGrid) => {
      const { rows, cols } = gridSize;
      const newGrid = currentGrid.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          const neighbors = countNeighbors(currentGrid, rIdx, cIdx);
          if (cell.alive) {
            if (neighbors < 2 || neighbors > 3) return { alive: false, age: 0 };
            return { alive: true, age: Math.min(cell.age + 1, 5) };
          }
          return neighbors === 3 ? { alive: true, age: 1 } : cell;
        })
      );
      return newGrid;
    });
    setTimeout(runSimulation, speed);
  }, [gridSize, speed]);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  useEffect(() => {
    if (running) runSimulation();
  }, [running, runSimulation]);

  useEffect(() => {
    const resize = () => {
      const isMobile = window.innerWidth < 768;
      setGridSize({ rows: isMobile ?25:30, cols: isMobile?25:30 });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleSpeedChange = (e) => {
    setSpeed(600 - e.target.value);
  };

  return (
    <div
      className={styles.gameContainer}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
      onMouseLeave={() => setMouseDown(false)}
    >
      <p className={styles.subtitle}>Conway's Game in a softer world</p>

      <div className={styles.controls}>
          <select
            className={styles.select}
            onChange={(e) => loadPreset(e.target.value)}
          >
            <option value="">Select Pattern</option>
            {Object.keys(presets).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          
          <button 
            className={`${styles.button} ${styles.startButton}`} 
            onClick={() => setRunning(true)} 
            disabled={running}
          >
            Begin
          </button>
          
          <button 
            className={`${styles.button} ${styles.pauseButton}`} 
            onClick={() => setRunning(false)} 
            disabled={!running}
          >
            Pause
          </button>
          
          <button 
            className={`${styles.button} ${styles.resetButton}`} 
            onClick={initializeGrid}
          >
            Clear
          </button>
      </div>

      <div className={styles.gridContainer}>
        
        <div
          className={styles.grid}
          style={{
            gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
            gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`
          }}
        >
          
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(cell)}
                onMouseEnter={() => mouseDown && toggleCell(rowIndex, colIndex)}
                onClick={() => toggleCell(rowIndex, colIndex)}
              />
            ))
          )}
        </div>
      </div>

      <div className={styles.controlsContainer}>
        

        <div className={styles.speedControl}>
          <span>Speed</span>
          <input
            type="range"
            min="100"
            max="500"
            value={600 - speed}
            onChange={handleSpeedChange}
            className={styles.slider}
          />
        </div>
      </div>
    </div>
  );
}