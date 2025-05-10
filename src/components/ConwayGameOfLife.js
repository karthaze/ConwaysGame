import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './GameOfLife.module.css';

export default function ConwayGameOfLife() {
  const [grid, setGrid] = useState([]);
  const [running, setRunning] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 25, cols: 25 });
  const runningRef = useRef(running);
  runningRef.current = running;


  const initializeGrid = useCallback(() => {
    const rows = gridSize.rows;
    const cols = gridSize.cols;
    const newGrid = Array(rows).fill().map(() => 
      Array(cols).fill().map(() => ({ alive: false, age: 0 }))
    );
    setGrid(newGrid);
    setRunning(false);
  }, [gridSize]);


  const toggleCell = (rowIndex, colIndex) => {
    if (running) return;
    
    const newGrid = [...grid];
    const cell = newGrid[rowIndex][colIndex];
    cell.alive = !cell.alive;
    cell.age = cell.alive ? 1 : 0;
    setGrid(newGrid);
  };

  const startSimulation = () => {
    if (!running) {
      setRunning(true);
    }
  };

  const pauseSimulation = () => {
    setRunning(false);
  };

  const resetSimulation = () => {
    setRunning(false);
    initializeGrid();
  };

  const getCellClass = (cell) => {
    if (!cell.alive) return styles.cell;
    
    if (cell.age === 1) {
      return `${styles.cell} ${styles.cellBorn}`;
    } else if (cell.age > 4) {
      return `${styles.cell} ${styles.cellDying}`;
    } else {
      return `${styles.cell} ${styles.cellAlive}`;
    }
  };

  const countNeighbors = (grid, row, col) => {
    const rows = gridSize.rows;
    const cols = gridSize.cols;
    let count = 0;
    
    // Check all 8 neighbors
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
      const rows = gridSize.rows;
      const cols = gridSize.cols;
      const newGrid = JSON.parse(JSON.stringify(currentGrid));
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const neighbors = countNeighbors(currentGrid, row, col);
          const cell = currentGrid[row][col];
          if (cell.alive) {
            // Live cell with fewer than 2 or more than 3 live neighbors dies
            if (neighbors < 2 || neighbors > 3) {
              newGrid[row][col].alive = false;
              newGrid[row][col].age = 0;
            } else {
              // Live cell with 2 or 3 live neighbors lives on
              newGrid[row][col].age = Math.min(cell.age + 1, 5);
            }
          } else {
            // Dead cell with exactly 3 live neighbors becomes alive
            if (neighbors === 3) {
              newGrid[row][col].alive = true;
              newGrid[row][col].age = 1;
            }
          }
        }
      }
      
      return newGrid;
    });
    
    setTimeout(() => {
      runSimulation();
    }, 400);
  }, [gridSize]);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  useEffect(() => {
    if (running) {
      runSimulation();
    }
  }, [running, runSimulation]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setGridSize({
        rows: isMobile ? 20 : 25,
        cols: isMobile ? 20 : 25
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.gameContainer}>
      <h1 className={styles.title}>Conway's Game of Life</h1>
      
      <div className={styles.controls}>
        <button 
          className={`${styles.button} ${styles.startButton}`} 
          onClick={startSimulation}
          disabled={running}>
          Start
        </button>
        <button 
          className={`${styles.button} ${styles.pauseButton}`} 
          onClick={pauseSimulation}
          disabled={!running}>
          Pause
        </button>
        <button 
          className={`${styles.button} ${styles.resetButton}`} 
          onClick={resetSimulation}>
          Reset
        </button>
      </div>
      
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.cellBorn}`}></div>
          <span>New Cell</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.cellAlive}`}></div>
          <span>Stable Cell</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.cellDying}`}></div>
          <span>Aging Cell</span>
        </div>
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
                onClick={() => toggleCell(rowIndex, colIndex)}
              />
            ))
          )}
        </div>
      </div>
      
      <div className={styles.instructions}>
        <p>Click cells to set initial state, then press Start to begin simulation</p>
        <p>Cells change color as they age through their lifecycle</p>
      </div>
    </div>
  );
}