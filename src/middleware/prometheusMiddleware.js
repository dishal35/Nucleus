const prometheus = require('prom-client');
const express = require('express');

// Create a Registry to register metrics
const register = new prometheus.Registry();

// Add default metrics (CPU, memory, etc.)
prometheus.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 1.5, 2, 3, 4, 5]
});

const httpRequestsTotalCounter = new prometheus.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotalCounter);

// Create metrics endpoint
const metricsApp = express();

metricsApp.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

// Middleware to collect metrics
const prometheusMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        
        httpRequestDurationMicroseconds
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .observe(duration / 1000);

        httpRequestsTotalCounter
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .inc();
    });

    next();
};

module.exports = {
    prometheusMiddleware,
    metricsApp
}; 