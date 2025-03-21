const http = require('http');
const PORT = process.env.PORT || 8081;

// Create a basic server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  
  // Set CORS headers to allow requests from your static website
  res.setHeader('Access-Control-Allow-Origin', '*');  // Allow from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Handle API routes
  if (req.url === '/api/telemetry/global') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    const data = [
      { id: "US1", country: "United States", region: "North America", status: "green", last_updated: new Date().toISOString() },
      { id: "UK1", country: "United Kingdom", region: "Europe", status: "yellow", last_updated: new Date().toISOString() },
      { id: "DE1", country: "Germany", region: "Europe", status: "green", last_updated: new Date().toISOString() },
      { id: "FR1", country: "France", region: "Europe", status: "green", last_updated: new Date().toISOString() }
    ];
    res.end(JSON.stringify(data));
    return;
  }
  
  if (req.url.startsWith('/api/telemetry/country/')) {
    const countryId = req.url.split('/').pop();
    res.writeHead(200, {'Content-Type': 'application/json'});
    const data = {
      id: countryId,
      country: countryId === "US1" ? "United States" : (countryId === "UK1" ? "United Kingdom" : countryId),
      region: countryId.startsWith("US") ? "North America" : "Europe",
      status: "green",
      last_updated: new Date().toISOString(),
      details: {
        callsTotal: 1250,
        callsSuccessful: 1200,
        callsFailed: 50,
        avgLatency: 120,
        timeouts: 15
      }
    };
    res.end(JSON.stringify(data));
    return;
  }
  
  if (req.url === '/api/history') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    // Create a very simple history array
    const historyData = [
      { date: "2025-03-01", status: "green", countries: ["US", "UK", "DE", "FR"] },
      { date: "2025-03-02", status: "yellow", countries: ["US", "UK", "DE", "FR"] },
      { date: "2025-03-03", status: "green", countries: ["US", "UK", "DE", "FR"] }
    ];
    
    console.log('Sending history data:', JSON.stringify(historyData));
    res.end(JSON.stringify(historyData));
    return;
  }
  
  // Default response for all other routes
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Telephony Monitor API</title>
      </head>
      <body>
        <h1>Telephony Monitoring API</h1>
        <p>Server is running. Available endpoints:</p>
        <ul>
          <li><a href="/api/telemetry/global">/api/telemetry/global</a></li>
          <li><a href="/api/telemetry/country/US1">/api/telemetry/country/US1</a></li>
          <li><a href="/api/history">/api/history</a></li>
        </ul>
        <p>Current time: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
