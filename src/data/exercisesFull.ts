import { Exercise } from '../services/exerciseService';
const data = require('./exercises-full.json') as Exercise[];
export const exercisesFull: Exercise[] = data;
