const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Minimal server is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
