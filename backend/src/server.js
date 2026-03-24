import express from 'express';
import env from 'dotenv';
import { connectDB } from './config/db.js';
import { models } from './models/index.js';
import routes from './routes/index.js';
import cors from 'cors';
import { apiLimiter } from './middleware/rateLimiter.js';

env.config();

const app = express();

const port = process.env.PORT;

app.use(express.json());
app.use(cors(
    {
        origin: 'http://localhost:5173',
    }
));

// Apply global rate limiter to all API routes
app.use('/api', apiLimiter);

// Use combined routes in a single line
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

connectDB();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});



