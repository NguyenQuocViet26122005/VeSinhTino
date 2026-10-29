import { handleTrafficReport, type TrafficEnv } from '../server/traffic-report.js';
import { readTraffic, readRealtime } from '../server/analytics-data.js';

declare const process: { env: TrafficEnv };
export const maxDuration = 60;

export default {
  fetch(request: Request) {
    return handleTrafficReport(request, process.env, readTraffic, fetch, new Date(), readRealtime);
  }
};
