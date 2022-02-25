# MircoService

## Overview
A microservice that can handle 1,000+ request per second with a low error rate (<1%) and low latency (<100ms).

## Result

- Designed and optimized data schema that allows for fast queries, tested using K6. Automated ETL process for 20M+ rows using MongoDB aggregation pipeline.
- Microservice was deployed using AWS EC2. It is scaled to handle > 1,000 RPS (<10ms latency) by using two Node/Express servers, NGINX load balancer, and Redis caching.
- Developed unit and integration test with Jest and Supertest to guide test-driven development.

