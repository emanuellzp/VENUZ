// src/services/studyPlan.ts
import api from './api';
import { StudyPlan } from '../types';

export default {
  list: () => api.get<StudyPlan[]>('/study-plans'),
  create: (data: Omit<StudyPlan,'id'>) => api.post<StudyPlan>('/study-plans', data),
  update: (id: number, data: Partial<Omit<StudyPlan,'id'>>) => api.put<StudyPlan>(`/study-plans/${id}`, data),
  remove: (id: number) => api.delete<void>(`/study-plans/${id}`),
};
