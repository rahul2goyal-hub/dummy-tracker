'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle, Circle, Plus, BarChart3 } from 'lucide-react'

export default function Tracker() {
  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState('')
  const [category, setCategory] = useState('Work')
  const supabase = createClient()

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const { data } = await supabase.from('checklists').select('*').order('created_at', { ascending: false })
    if (data) setTasks(data)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask) return
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from('checklists').insert([
      { task_name: newTask, category, user_id: user?.id }
    ])
    setNewTask('')
    fetchTasks()
  }

  async function toggleTask(id: string, is_completed: boolean) {
    await supabase.from('checklists').update({ is_completed: !is_completed }).eq('id', id)
    fetchTasks()
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Team Tracker</h1>
        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Power BI Sync Active</div>
      </header>

      <form onSubmit={addTask} className="flex gap-2 mb-8 bg-white p-4 rounded-xl shadow-sm">
        <input 
          className="flex-1 p-2 border-none outline-none text-slate-700"
          placeholder="Add new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <select 
          className="bg-slate-100 p-2 rounded text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Work</option>
          <option>Personal</option>
          <option>Urgent</option>
        </select>
        <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
          <Plus size={20} />
        </button>
      </form>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
            <button onClick={() => toggleTask(task.id, task.is_completed)}>
              {task.is_completed ? <CheckCircle className="text-green-500" /> : <Circle className="text-slate-300" />}
            </button>
            <span className={`flex-1 ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
              {task.task_name}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">
              {task.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
