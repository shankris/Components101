import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import YahooFinance from "yahoo-finance2";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const yahooFinance = new YahooFinance();

const DATA_FILE = path.join(__dirname, "../src/data/market.json");

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------

const TARGET_DAYS = 800;

// When updating existing data, fetch this many calendar days
// before the latest existing date. This gives us enough overlap
// for weekends and market holidays.
const LOOKBACK_DAYS = 30;

// Delay between Yahoo requests.
// This is intentionally conservative to avoid making requests
// too quickly during the initial download.
const DELAY_BETWEEN_STOCKS = 3000;

// For the initial download, 800 trading days requires
// considerably more than 800 calendar days because of
// weekends and market holidays.
const INITIAL_CALENDAR_DAYS = 1200;

// ------------------------------------------------------------
// Instruments
// ------------------------------------------------------------

const STOCKS = [
  {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank",
    type: "stock",
  },
  {
    symbol: "ICICIBANK.NS",
    name: "ICICI Bank",
    type: "stock",
  },
  {
    symbol: "INFY.NS",
    name: "Infosys",
    type: "stock",
  },
  {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    type: "stock",
  },
  {
    symbol: "^NSEI",
    name: "NIFTY 50",
    type: "index",
  },
  {
    symbol: "^CNXIT",
    name: "CNX IT",
    type: "index",
  },
  {
    symbol: "^BSESN",
    name: "SENSEX",
    type: "index",
  },
];

// ------------------------------------------------------------
// Utilities
// ------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function readExistingData() {
  if (!fs.existsSync(DATA_FILE)) {
    return null;
  }

  try {
    const contents = fs.readFileSync(DATA_FILE, "utf8");

    return JSON.parse(contents);
  } catch (error) {
    throw new Error(`Unable to read existing market.json: ${error.message}`);
  }
}

function getDateDaysAgo(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() - days);

  return date;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function normalizeHistory(history = []) {
  return history
    .filter((item) => item?.date && typeof item.close === "number" && Number.isFinite(item.close))
    .map((item) => ({
      date: item.date,
      close: Number(item.close.toFixed(2)),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function mergeHistory(existingHistory, newHistory) {
  const combined = [...(existingHistory || []), ...(newHistory || [])];

  // Use a Map so the same date cannot appear twice.
  const unique = new Map();

  for (const item of combined) {
    unique.set(item.date, item);
  }

  return Array.from(unique.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-TARGET_DAYS);
}

// ------------------------------------------------------------
// Fetch data for one instrument
// ------------------------------------------------------------

async function updateStock(stock, existingStock) {
  const existingHistory = normalizeHistory(existingStock?.history);

  let startDate;

  if (existingHistory.length >= TARGET_DAYS) {
    // --------------------------------------------------------
    // Normal incremental update
    // --------------------------------------------------------

    const latestDate = existingHistory[existingHistory.length - 1].date;

    console.log(`  Existing data through ${latestDate}`);

    console.log(`  Existing history: ${existingHistory.length} days`);

    startDate = getDateDaysAgo(latestDate, LOOKBACK_DAYS);
  } else {
    // --------------------------------------------------------
    // Initial download OR expanding an existing dataset
    // --------------------------------------------------------

    if (existingHistory.length > 0) {
      console.log(`  Existing history: ${existingHistory.length} days`);

      console.log(`  Target history: ${TARGET_DAYS} days`);

      console.log(`  Expanding historical data...`);
    } else {
      console.log(`  No existing data for ${stock.symbol}`);
    }

    startDate = getDateDaysAgo(formatDate(new Date()), INITIAL_CALENDAR_DAYS);
  }

  console.log(`  Fetching Yahoo data from ${formatDate(startDate)}...`);

  const result = await yahooFinance.chart(stock.symbol, {
    period1: startDate,
    period2: new Date(),
    interval: "1d",
    events: "history",
  });

  const newHistory = normalizeHistory(
    result.quotes
      .filter((item) => item.date && typeof item.close === "number" && Number.isFinite(item.close))
      .map((item) => ({
        date: item.date.toISOString().slice(0, 10),
        close: item.close,
      })),
  );

  const history = mergeHistory(existingHistory, newHistory);

  if (history.length === 0) {
    throw new Error(`No historical data returned for ${stock.symbol}`);
  }

  const firstDate = history[0].date;
  const lastDate = history[history.length - 1].date;

  console.log(`  ${history.length} trading days`);

  console.log(`  ${firstDate} → ${lastDate}`);

  return {
    symbol: stock.symbol.replace(".NS", ""),
    yahooSymbol: stock.symbol,
    name: stock.name,
    type: stock.type,
    history,
  };
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  console.log("");
  console.log("==============================");
  console.log(" Updating market data");
  console.log("==============================");
  console.log("");

  const existingData = readExistingData();

  if (existingData) {
    console.log("Existing market.json found.");
    console.log(`Last update: ${existingData.updated || "unknown"}`);
  } else {
    console.log("No existing market.json found.");

    console.log(`Performing initial ${TARGET_DAYS}-day download.`);
  }

  console.log("");

  const stocks = [];

  // ----------------------------------------------------------
  // Update each instrument sequentially
  // ----------------------------------------------------------

  for (let i = 0; i < STOCKS.length; i++) {
    const stock = STOCKS[i];

    console.log(`Fetching ${stock.symbol}...`);

    const existingStock = existingData?.stocks?.find((item) => item.yahooSymbol === stock.symbol);

    const updatedStock = await updateStock(stock, existingStock);

    stocks.push(updatedStock);

    console.log("");

    // Wait between Yahoo requests,
    // but not after the final instrument.
    if (i < STOCKS.length - 1) {
      console.log(`Waiting ${DELAY_BETWEEN_STOCKS / 1000} seconds before next request...`);

      await sleep(DELAY_BETWEEN_STOCKS);

      console.log("");
    }
  }

  // ----------------------------------------------------------
  // Build output
  // ----------------------------------------------------------

  const output = {
    updated: new Date().toISOString(),

    periods: ["1D", "1W", "1M", "3M", "6M", "1Y"],

    stocks,
  };

  // ----------------------------------------------------------
  // Only write the file after ALL instruments
  // have successfully updated.
  // ----------------------------------------------------------

  fs.mkdirSync(path.dirname(DATA_FILE), {
    recursive: true,
  });

  fs.writeFileSync(DATA_FILE, JSON.stringify(output, null, 2), "utf8");

  console.log("==============================");
  console.log(" Market data updated");
  console.log("==============================");
  console.log("");

  console.log(`Saved to: ${DATA_FILE}`);

  console.log("");
}

// ------------------------------------------------------------
// Run
// ------------------------------------------------------------

main().catch((error) => {
  console.error("");
  console.error("==============================");
  console.error(" Market data update FAILED");
  console.error("==============================");
  console.error("");

  console.error(error);

  console.error("");

  process.exit(1);
});
