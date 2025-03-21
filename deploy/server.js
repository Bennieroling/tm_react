const http = require('http');
const PORT = process.env.PORT || 8081;

// Create a basic server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle API routes
  if (req.url === '/api/telemetry/global') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    const data = [
      { region: "North America", countryId: "US", name: "United States", status: "green" },
      { region: "Europe", countryId: "UK", name: "United Kingdom", status: "yellow" }
    ];
    res.end(JSON.stringify(data));
    return;
  }
  
  // Default response for all other routes
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Telephony Monitor</title>
      </head>
      <body>
        <h1>Telephony Monitoring API</h1>
        <p>Server is running. Available endpoints:</p>
        <ul>
          <li><a href="/api/telemetry/global">/api/telemetry/global</a></li>
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
