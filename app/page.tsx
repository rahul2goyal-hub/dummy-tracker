'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle2, Circle, Plus, LayoutDashboard, Database, ListChecks } from 'lucide-react'

export default function Tracker() {
  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState('')
  const [category, setCategory] = useState('Work')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    const { data } = await supabase.from('checklists').select('*').order('created_at', { ascending: false })
    if (data) setTasks(data)
    setLoading(false)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask) return
    const { error } = await supabase.from('checklists').insert([{ task_name: newTask, category }])
    if (!error) { setNewTask(''); fetchTasks() }
  }

  async function toggleTask(id: string, is_completed: boolean) {
    await supabase.from('checklists').update({ is_completed: !is_completed }).eq('id', id)
    fetchTasks()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar - Pro Look */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-10 text-blue-600">
          <Database size={24} />
          <span className="font-bold text-xl tracking-tight">DATAFLOW</span>
        </div>
        <nav className="space-y-1">
          <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg font-medium cursor-pointer">
            <LayoutDashboard size={18} /> Dashboard
          </div>
          <div className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer transition-all">
            <ListChecks size={18} /> My Tasks
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-4xl mx-auto w-full">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Task Tracker</h1>
            <p className="text-slate-500">Live sync with Supabase & Power BI</p>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            LIVE CONNECTION
          </div>
        </header>

        {/* Input Card */}
        <section className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-8 flex items-center gap-2">
          <form onSubmit={addTask} className="flex w-full gap-2">
            <input 
              className="flex-1 px-4 py-3 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
              placeholder="What needs to be tracked?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <select 
              className="bg-slate-50 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 outline-none border border-transparent focus:border-blue-200"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Work</option>
              <option>Urgent</option>
              <option>Review</option>
            </select>
            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95">
              <Plus size={20} />
            </button>
          </form>
        </section>

        {/* List Content */}
        <div className="space-y-3">
          {loading ? (
             <div className="text-center py-10 text-slate-400">Loading your data...</div>
          ) : tasks.map((task) => (
            <div key={task.id} className="group flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
              <button onClick={() => toggleTask(task.id, task.is_completed)} className="transition-transform active:scale-90">
                {task.is_completed ? 
                  <CheckCircle2 className="text-green-500 w-6 h-6" /> : 
                  <Circle className="text-slate-300 w-6 h-6 group-hover:text-blue-400" />
                }
              </button>
              <div className="flex-1">
                <p className={`font-medium ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {task.task_name}
                </p>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                  {task.category}
                </span>
              </div>
              <div className="text-[10px] text-slate-300 font-mono">
                {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
