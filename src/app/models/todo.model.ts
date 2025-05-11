// src/app/models/todo.model.ts

export interface Todo {
    $$index?: number;
    completed: boolean;
    important: boolean;
    name: string;
    streamUrl: string;
    id: number;
  }
  