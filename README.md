# Cryptocurrency Trading Simulator

This application fetches live cryptocurrency price data from a public API and simulates trades based on simple moving averages (SMAs). It efficiently manages recent price data using a circular buffer and logs simulated buy/sell trades.

## Features

- **API Integration**: Connects to CoinGecko API to fetch real-time Bitcoin price data
- **Trade Simulation**:
  - Computes a short-term SMA (average of the last 5 prices)
  - Computes a long-term SMA (average of the last 20 prices)
  - Generates buy signals when short-term SMA rises above long-term SMA
  - Generates sell signals when short-term SMA falls below long-term SMA
- **Efficient Data Handling**: Uses a circular buffer to store only the most recent prices for SMA calculations
- **Visualization**: Displays price and SMA data in a real-time chart
- **Trade Logging**: Records all simulated trades with timestamps
- **User Interface**: Clean, responsive design with status indicators and controls

## Setup Instructions

### Prerequisites

- A modern web browser
- Internet connection (for API access)

### Installation

1. Clone this repository:
   \`\`\`
   git clone https://github.com/yourusername/crypto-trading-simulator.git
   cd crypto-trading-simulator
   \`\`\`

2. Open the application:
   - Simply open the `index.html` file in your web browser
   - Alternatively, you can use a local development server:
     \`\`\`
     npx http-server
     \`\`\`
     Then navigate to `http://localhost:8080` in your browser

## How to Use

1. Click the "Start Simulation" button to begin fetching price data and generating signals
2. The current price, short-term SMA, and long-term SMA will update at regular intervals
3. When a buy or sell signal is generated, it will be displayed in the signal area and added to the trade log
4. You can adjust the polling interval using the dropdown menu
5. Click "Stop Simulation" to pause the data fetching

## How It Works

1. The application polls the CoinGecko API at regular intervals to get the current Bitcoin price
2. Price data is stored in two circular buffers:
   - Short-term buffer (capacity: 5)
   - Long-term buffer (capacity: 20)
3. SMAs are calculated based on the data in these buffers
4. When the short-term SMA crosses above the long-term SMA, a buy signal is generated
5. When the short-term SMA crosses below the long-term SMA, a sell signal is generated
6. All trades are logged with timestamp, type, price, and quantity
7. The price chart visualizes the price movement and SMA lines

## Design Decisions

### Circular Buffer Implementation

I chose to implement a circular buffer (also known as a ring buffer) for efficient data storage. This data structure:
- Has O(1) time complexity for insertions
- Automatically discards old data when capacity is reached
- Maintains a fixed memory footprint regardless of how long the application runs

### API Selection

CoinGecko was chosen because:
- It provides free access to cryptocurrency price data
- It has a simple API that doesn't require authentication for basic usage
- It has good reliability and uptime

### Polling Interval

The application allows users to select different polling intervals. For demonstration purposes, the default is 10 seconds. In a real trading scenario, this might be set to a longer interval (e.g., 1 minute) to:
- Reduce API rate limiting concerns
- Better match typical trading strategy timeframes
- Reduce computational overhead

### Error Handling

The application includes fallback mechanisms for API failures:
- Returns mock data if the API request fails
- Logs errors to the console for debugging
- Continues operation without crashing

## Future Improvements

- Add support for multiple cryptocurrencies
- Implement more sophisticated trading strategies
- Add backtesting capabilities using historical data
- Implement user authentication and persistent storage of trade history
- Add performance metrics (profit/loss calculations)
- Add notifications for trade signals

## License

MIT
\`\`\`

