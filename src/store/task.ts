import { defineStore } from 'pinia'
import { TaskList, TaskData } from '../type'
import { taskData } from '../assets/data/default'

export const taskStore = defineStore('task', {
  state: () => {
    const taskList: TaskList = new Map()
    const rightTaskId = ''
    return {
      taskList,
      rightTaskId
    }
  },
  getters: {
    rightTask (state) {
      const task = state.taskList.get(state.rightTaskId)
      if (state.rightTaskId && task) {
        return task
      } else {
        return taskData
      }
    },
    taskListArray (state) {
      return Array.from(state.taskList)
    }
  },
  actions: {
    setTaskList (taskList: TaskList) {
      this.taskList = taskList
    },
    getTask (id: string) {
      return this.taskList.get(id)
    },
    setTask (taskList: TaskData[]) {
      taskList.forEach(task => {
        this.taskList.set(task.id, task)
        // 修改electron-store
        const path = `taskList.${task.id}`
        window.electron.setStore(path, task)
      })
    },
    setTaskEasy (taskList: TaskData[]) {
      taskList.forEach(task => {
        this.taskList.set(task.id, task)
      })
    },
    deleteTask (list: string[]) {
      list.forEach(id => {
        this.taskList.delete(id)
        // 修改electron-store
        const path = `taskList.${id}`
        window.electron.deleteStore(path)
      })
    },
    has (id: string) {
      return this.taskList.has(id)
    },
    setRightTaskId (id: string) {
      this.rightTaskId = id
    }
  }
})
