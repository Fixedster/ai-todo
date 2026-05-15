import { create } from 'zustand'

export interface Task {
  id: number
  title: string
  description?: string
  priority: number
  status: number
  dueDate?: string
  parentId?: number
  tags?: string[]
  sortOrder: number
  isDeleted: number
  createdAt: string
  updatedAt: string
}

interface TaskState {
  tasks: Task[]
  loading: boolean
  filters: {
    status?: number
    priority?: number
    keyword?: string
    tag?: string
    startDate?: string
    endDate?: string
  }
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: number, task: Partial<Task>) => void
  deleteTask: (id: number) => void
  setLoading: (loading: boolean) => void
  setFilters: (filters: Partial<TaskState['filters']>) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loading: false,
  filters: {},
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
}))
