// Load Testing Script for Flood Watch API
// Run with: k6 run load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
    stages: [
        { duration: '30s', target: 20 },  // Ramp up to 20 users
        { duration: '1m', target: 50 },   // Ramp up to 50 users
        { duration: '2m', target: 100 },  // Peak at 100 users
        { duration: '30s', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
        http_req_failed: ['rate<0.05'],   // Less than 5% failures
        errors: ['rate<0.1'],             // Less than 10% errors
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

// Test data
const testUser = {
    user_id: `test_user_${Date.now()}`,
    phone_number: '+254712345678',
};

export default function () {
    // Test 1: Health Check
    let healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, {
        'health check status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);

    // Test 2: Get Active Incidents (Public)
    let incidentsRes = http.get(`${BASE_URL}/api/incidents/active`);
    check(incidentsRes, {
        'active incidents status is 200': (r) => r.status === 200,
        'response has incidents array': (r) => Array.isArray(r.json()),
    }) || errorRate.add(1);

    sleep(1);

    // Test 3: Create Report
    const reportPayload = JSON.stringify({
        user_id: testUser.user_id,
        lat: -1.2921 + (Math.random() * 0.1 - 0.05),
        lon: 36.8219 + (Math.random() * 0.1 - 0.05),
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        description: 'Load test flood report',
        address: 'Test Street, Nairobi',
        water_level_cm: Math.floor(Math.random() * 100),
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    let reportRes = http.post(
        `${BASE_URL}/api/reports/`,
        reportPayload,
        params
    );

    check(reportRes, {
        'create report status is 201': (r) => r.status === 201,
        'report has id': (r) => r.json('id') !== undefined,
    }) || errorRate.add(1);

    sleep(2);

    // Test 4: Get Public Stats
    let statsRes = http.get(`${BASE_URL}/api/public/stats`);
    check(statsRes, {
        'public stats status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);
}

// Summary function
export function handleSummary(data) {
    return {
        'load-test-summary.json': JSON.stringify(data, null, 2),
        stdout: textSummary(data, { indent: '  ', enableColors: true }),
    };
}

function textSummary(data, opts) {
    const { indent = '', enableColors = false } = opts || {};
    let summary = '\n';

    summary += `${indent}Test Duration: ${data.state.testRunDurationMs}ms\n`;
    summary += `${indent}Virtual Users: ${data.metrics.vus.values.max}\n`;
    summary += `${indent}Total Requests: ${data.metrics.http_reqs.values.count}\n`;
    summary += `${indent}Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n`;
    summary += `${indent}Average Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}P95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    summary += `${indent}Failed Requests: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
    summary += `${indent}Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%\n`;

    return summary;
}
