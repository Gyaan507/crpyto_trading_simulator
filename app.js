/**
 * Circular Buffer implementation for efficient data storage
 * This ensures O(1) time complexity for updates
 */
class CircularBuffer {
  constructor(capacity) {
    this.buffer = new Array(capacity);
    this.capacity = capacity;
    this.size = 0;
    this.head = 0;
    this.tail = 0;
  }

  /**
   * Add a new item to the buffer
   * @param {number} item - The number to add to the buffer
   */
  push(item) {
    // Store the item at the current head position
    this.buffer[this.head] = item;
    
    // Update head position (wrap around if needed)
    this.head = (this.head + 1) % this.capacity;
    
    // If buffer is not full yet, increment size
    if (this.size < this.capacity) {
      this.size++;
    } else {
      // If buffer is full, move tail pointer as well
      this.tail = (this.tail + 1) % this.capacity;
    }
  }

  /**
   * Get all items currently in the buffer
   * @returns {number[]} Array of numbers in the buffer
   */
  getItems() {
    const result = [];
    
    if (this.size === 0) {
      return result;
    }
    
    let index = this.tail;
    for (let i = 0; i < this.size; i++) {
      result.push(this.buffer[index]);
      index = (index + 1) % this.capacity;
    }
    
    return result;
  }

  /**
   * Check if the buffer is full
   * @returns {boolean} True if buffer is at capacity
   */
  isFull() {
    return this.size === this.capacity;
  }

  /**
   * Get the current number of items in the buffer
   * @returns {number} Number of items in buffer
   */
  getSize() {
    return this.size;
  }

  /**
   * Clear all items from the buffer
   */
  clear() {
    this.size = 0;
    this.head = 0;
    this.tail = 0;
  }
}

// DOM Elements
const currentPriceEl = document.getElementById('current-price');
const shortSmaEl = document.getElementById('short-sma');
const longSmaEl = document.getElementById('long-sma');
const signalEl = document.getElementById('signal');
const lastUpdateEl = document.getElementById('last-update');
const toggleSimulationBtn = document.getElementById('toggle-simulation');
const tradeLogEl = document.getElementById('trade-log');
const noTradesRow = document.getElementById('no-trades-row');
const pollingIntervalSelect = document.getElementById('polling-interval');
const refreshRateEl = document.getElementById('refresh-rate');

// State variables
let isRunning = false;
let intervalId = null;
let pollingInterval = 10000; // 10 seconds default
let priceHistory = [];
let trades = [];
let lastSignal = null;

// Initialize buffers for SMA calculations
const shortTermBuffer = new CircularBuffer(5);  // For 5-period SMA
const longTermBuffer = new CircularBuffer(20); // For 20-period SMA

// Initialize chart
let priceChart;

/**
 * Initialize the price chart
 */
function initializeChart() {
  const ctx = document.getElementById('price-chart').getContext('2d');
  
  priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Price',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          borderWidth: 2
        },
        {
          label: 'Short SMA (5)',
          data: [],
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
          borderWidth: 2
        },
        {
          label: 'Long SMA (20)',
          data: [],
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false
        }
      },
      animation: {
        duration: 0 // Disable animation for better performance
      },
      plugins: {
        legend: {
          position: 'top',
        }
      }
    }
  });
}

/**
 * Calculate Simple Moving Average (SMA) from an array of numbers
 * @param {number[]} data - Array of price data
 * @returns {number} - The calculated SMA or 0 if no data
 */
function calculateSMA(data) {
  if (data.length === 0) return 0;
  
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
}

/**
 * Fetch the current price of Bitcoin from a public API
 * @returns {Promise<number>} Promise resolving to the current price
 */
async function fetchCryptoPrice() {
  try {
    // Using CoinGecko API to fetch Bitcoin price in USD
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.bitcoin.usd;
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    // Return a random price for demo/testing purposes if API fails
    return 20000 + Math.random() * 2000;
  }
}

/**
 * Format a number as currency
 * @param {number} value - The number to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
  return '$' + value.toFixed(2);
}

/**
 * Update the UI with current data
 */
function updateUI() {
  // Update status elements
  currentPriceEl.textContent = formatCurrency(priceHistory[priceHistory.length - 1]?.price || 0);
  shortSmaEl.textContent = formatCurrency(priceHistory[priceHistory.length - 1]?.shortSMA || 0);
  longSmaEl.textContent = formatCurrency(priceHistory[priceHistory.length - 1]?.longSMA || 0);
  
  // Update signal display
  if (lastSignal) {
    signalEl.textContent = lastSignal.toUpperCase();
    signalEl.className = lastSignal; // Apply appropriate class
  } else {
    signalEl.textContent = 'None';
    signalEl.className = '';
  }
  
  // Update last update time
  lastUpdateEl.textContent = new Date().toLocaleTimeString();
  
  // Update chart
  updateChart();
}

/**
 * Update the price chart with new data
 */
function updateChart() {
  if (!priceChart) return;
  
  // Only keep the last 20 data points for the chart
  const chartData = priceHistory.slice(-20);
  
  // Update chart data
  priceChart.data.labels = chartData.map(item => item.time);
  priceChart.data.datasets[0].data = chartData.map(item => item.price);
  priceChart.data.datasets[1].data = chartData.map(item => item.shortSMA);
  priceChart.data.datasets[2].data = chartData.map(item => item.longSMA);
  
  // Update chart
  priceChart.update();
}

/**
 * Add a trade to the trade log
 * @param {Object} trade - The trade to add
 */
function addTradeToLog(trade) {
  // Hide the "no trades" row if it's visible
  if (noTradesRow.style.display !== 'none') {
    noTradesRow.style.display = 'none';
  }
  
  // Create a new row for the trade
  const row = document.createElement('tr');
  
  // Create and populate cells
  const timeCell = document.createElement('td');
  timeCell.textContent = new Date(trade.timestamp).toLocaleString();
  
  const typeCell = document.createElement('td');
  typeCell.textContent = trade.type.toUpperCase();
  typeCell.className = `trade-${trade.type}`;
  
  const priceCell = document.createElement('td');
  priceCell.textContent = formatCurrency(trade.price);
  
  const quantityCell = document.createElement('td');
  quantityCell.textContent = trade.quantity;
  
  // Add cells to row
  row.appendChild(timeCell);
  row.appendChild(typeCell);
  row.appendChild(priceCell);
  row.appendChild(quantityCell);
  
  // Add row to table (at the top)
  tradeLogEl.insertBefore(row, tradeLogEl.firstChild);
  
  // Log trade to console as well
  console.log(`Trade executed: ${trade.type.toUpperCase()} at ${formatCurrency(trade.price)}`);
}

/**
 * Generate trading signals based on SMA crossovers
 * @param {number} shortTermSMA - Short-term SMA value
 * @param {number} longTermSMA - Long-term SMA value
 * @param {number} price - Current price
 * @returns {string|null} - Signal type or null if no signal
 */
function generateSignal(shortTermSMA, longTermSMA, price) {
  if (shortTermSMA > longTermSMA && lastSignal !== 'buy') {
    return 'buy';
  } else if (shortTermSMA < longTermSMA && lastSignal !== 'sell') {
    return 'sell';
  }
  return null;
}

/**
 * Execute a trade based on the signal
 * @param {string} type - Trade type (buy/sell)
 * @param {number} price - Current price
 * @returns {Object} - The executed trade
 */
function executeTrade(type, price) {
  const trade = {
    type,
    price,
    quantity: 1, // Simplified for demo
    timestamp: new Date().toISOString()
  };
  
  trades.push(trade);
  lastSignal = type;
  
  addTradeToLog(trade);
  return trade;
}

/**
 * Update price data and generate trading signals
 */
async function updatePrice() {
  try {
    // Fetch current price
    const price = await fetchCryptoPrice();
    
    // Update buffers
    shortTermBuffer.push(price);
    longTermBuffer.push(price);
    
    // Calculate SMAs
    const shortTermSMA = calculateSMA(shortTermBuffer.getItems());
    const longTermSMA = calculateSMA(longTermBuffer.getItems());
    
    // Add to price history
    const timestamp = new Date();
    priceHistory.push({
      time: timestamp.toLocaleTimeString(),
      price,
      shortSMA: shortTermSMA,
      longSMA: longTermSMA
    });
    
    // Generate trading signals (only if long-term buffer is full)
    if (longTermBuffer.isFull()) {
      const signal = generateSignal(shortTermSMA, longTermSMA, price);
      if (signal) {
        executeTrade(signal, price);
      }
    }
    
    // Update UI
    updateUI();
  } catch (error) {
    console.error("Error updating price:", error);
  }
}

/**
 * Start the trading simulation
 */
function startSimulation() {
  if (isRunning) return;
  
  isRunning = true;
  toggleSimulationBtn.textContent = 'Stop Simulation';
  toggleSimulationBtn.classList.add('running');
  
  // Initial update
  updatePrice();
  
  // Set interval for regular updates
  intervalId = setInterval(updatePrice, pollingInterval);
}

/**
 * Stop the trading simulation
 */
function stopSimulation() {
  if (!isRunning) return;
  
  isRunning = false;
  toggleSimulationBtn.textContent = 'Start Simulation';
  toggleSimulationBtn.classList.remove('running');
  
  // Clear interval
  clearInterval(intervalId);
}

/**
 * Toggle the simulation state
 */
function toggleSimulation() {
  if (isRunning) {
    stopSimulation();
  } else {
    startSimulation();
  }
}

/**
 * Update the polling interval
 */
function updatePollingInterval() {
  const seconds = parseInt(pollingIntervalSelect.value);
  pollingInterval = seconds * 1000;
  refreshRateEl.textContent = seconds;
  
  // Restart the simulation if it's running
  if (isRunning) {
    stopSimulation();
    startSimulation();
  }
}

/**
 * Print a summary of all trades
 */
function printTradeSummary() {
  console.log("\nTrade Summary:");
  console.log("----------------------------------");
  
  if (trades.length === 0) {
    console.log("No trades executed");
    return;
  }
  
  trades.forEach((trade, index) => {
    console.log(`${index + 1}. ${trade.type.toUpperCase()} at ${formatCurrency(trade.price)} - ${new Date(trade.timestamp).toLocaleString()}`);
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Initialize chart
  initializeChart();
  
  // Set up event listeners
  toggleSimulationBtn.addEventListener('click', toggleSimulation);
  pollingIntervalSelect.addEventListener('change', updatePollingInterval);
  
  // Initialize the refresh rate display
  refreshRateEl.textContent = pollingIntervalSelect.value;
});