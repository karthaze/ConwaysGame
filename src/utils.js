export function generateEmptyGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function nextGeneration(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = generateEmptyGrid(rows, cols);

  const getNeighbors = (i, j) => {
    let count = [0, 0, 0];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (x === 0 && y === 0) continue;
        const ni = i + x;
        const nj = j + y;
        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
          count[grid[ni][nj]]++;
        }
      }
    }
    return count;
  };

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const [nb, st, dy] = getNeighbors(i, j);
      const totalAlive = st + nb;
      const current = grid[i][j];

      if (current === 1 && (totalAlive < 2 || totalAlive > 3)) {
        newGrid[i][j] = 2; // dying
      } else if ((current === 0 || current === 2) && totalAlive === 3) {
        newGrid[i][j] = 0; // newBorn
      } else {
        newGrid[i][j] = current === 2 ? 0 : 1; // transition dying -> newBorn, else stable
      }
    }
  }
  return newGrid;
}