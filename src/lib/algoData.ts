// Fix: AlgoGreedy has wrong imports from algorithms.ts — activities/jobs/resources come from mockData
// This re-exports the correct data shapes for AlgoGreedy
export { ACTIVITIES, JOBS, RESOURCES, SENSOR_DATA_TEXT } from './mockData';
