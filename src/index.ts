import express from 'express';
import kardashianRouter from './routes/kardashians';

const app = express();

app.use('/', kardashianRouter);

app.get('/', (req, res) => {
    res.json({
        name: "Placeholder APIs",
        description: "A collection of placeholder APIs for various use cases.",
        availableApis: {
            kardashians: "/kardashians"
            // Add other APIs here as they are developed
        }
    });
});


app.listen(8080, () => {
    console.log('Server started on http://localhost:8080');
});
