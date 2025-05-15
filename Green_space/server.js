// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Introduce modular routing (standard express.Router)
const plantRoutes = require('./routes/plants');
const spaceRoutes = require('./routes/spaces');
const plantIdentifier = require('./routes/identifier');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home Test
app.get('/', (req, res) => {
  res.send('🌿 The server is running, welcome to the Green Space Plant API');
});

//  Correctly load the router module path prefix
// app.use('/spaces', spaceRoutes);
// app.use('/plants', plantRoutes);
app.use('/', spaceRoutes);
app.use('/', plantRoutes);
app.use('/', plantIdentifier);


// Start the service
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
