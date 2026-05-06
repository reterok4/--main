import express from 'express';
import ticketRoutes from './routes/ticket.routes';
import { errorHandler } from './middleware/error-handler';
import userRoutes from './routes/user.routes';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"))

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

app.get("/health", (_req,res) => res.status(200).json({ok:true}))

app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});