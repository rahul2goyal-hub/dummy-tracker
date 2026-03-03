'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, CheckCircle2, Circle, Plus, MessageSquare, Archive, Flame, Check } from 'lucide-react'

export default function Tracker() {
  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState('')
  const [remarks, setRemarks] = useState('')
  const [category, setCategory] = useState('Work')
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
      else fetchTasks()
    }
    init()
  }, [])

  async function fetchTasks() {
    const { data } = await supabase.from('checklists').select('*').order('created_at', { ascending: false })
    if (data) setTasks(data)
    setLoading(false)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('checklists').insert([{ 
      task_name: newTask, category, remarks, user_id: user?.id, status: 'Pending' 
    }])
    setNewTask(''); setRemarks(''); fetchTasks()
  }

  async function updateStatus(id: string, isDone: boolean) {
    await supabase.from('checklists').update({ 
      is_completed: isDone, 
      status: isDone ? 'Done' : 'Pending' 
    }).eq('id', id)
    fetchTasks()
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Aurora Background Effect */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-300 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <Flame className="text-orange-500" fill="currentColor" /> FlowState
            </h1>
            <p className="text-slate-500 font-medium mt-1">Productivity Console v2.6</p>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} 
            className="p-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white hover:bg-white transition-all shadow-sm">
            <LogOut size={20} className="text-slate-600" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: ADD TASK CONSOLE */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-xl sticky top-12">
              <h2 className="font-bold text-lg mb-4">New Objective</h2>
              <form onSubmit={addTask} className="space-y-4">
                <input className="w-full p-4 bg-slate-100/50 rounded-2xl border-none focus:ring-2 ring-indigo-500 outline-none placeholder:text-slate-400"
                  placeholder="Task title..." value={newTask} onChange={e => setNewTask(e.target.value)} />
                
                <textarea className="w-full p-4 bg-slate-100/50 rounded-2xl border-none focus:ring-2 ring-indigo-500 outline-none text-sm h-24 resize-none"
                  placeholder="Add remarks or notes..." value={remarks} onChange={e => setRemarks(e.target.value)} />
                
                <div className="flex gap-2">
                  <select className="flex-1 p-3 bg-slate-100/50 rounded-xl text-sm font-bold border-none" value={category} onChange={e => setCategory(e.target.value)}>
                    <option>Work</option>
                    <option>Urgent</option>
                  </select>
                  <button className="bg-slate-900 text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all">
                    <Plus size={24} />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: LISTS */}
          <div className="lg:col-span-2 space-y-10">
            {/* ACTIVE SECTION */}
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" /> In Progress
              </h3>
              <div className="space-y-4">
                {tasks.filter(t => !t.is_completed).map(task => (
                  <TaskCard key={task.id} task={task} onToggle={() => updateStatus(task.id, true)} />
                ))}
              </div>
            </section>

            {/* DONE SECTION */}
            <section className="opacity-60 grayscale-[0.5]">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                <Archive size={14} /> Completed
              </h3>
              <div className="space-y-3">
                {tasks.filter(t => t.is_completed).map(task => (
                  <TaskCard key={task.id} task={task} onToggle={() => updateStatus(task.id, false)} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task, onToggle }: { task: any, onToggle: () => void }) {
  return (
    <div className="group bg-white/70 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/50 shadow-sm hover:shadow-md transition-all flex gap-4 items-start">
      <button onClick={onToggle} className="mt-1">
        {task.is_completed ? 
          <div className="bg-green-500 p-1 rounded-full"><Check size={14} className="text-white" /></div> : 
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-400 transition-colors" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={`font-bold truncate ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {task.task_name}
          </p>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-400 uppercase tracking-tighter">
            {task.category}
          </span>
        </div>
        {task.remarks && (
          <p className="text-sm text-slate-500 bg-slate-50/50 p-2 rounded-lg border border-slate-100 flex items-start gap-2">
            <MessageSquare size={14} className="mt-1 shrink-0 opacity-40" />
            {task.remarks}
          </p>
        )}
      </div>
    </div>
  )
}
