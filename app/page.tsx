'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, CheckCircle2, Circle, Plus, Paperclip, Clock } from 'lucide-react'

export default function Tracker() {
  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState('')
  const [category, setCategory] = useState('Work')
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  // 1. Load data and check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        fetchTasks()
      }
    }
    checkUser()
  }, [])

  async function fetchTasks() {
    const { data } = await supabase.from('checklists').select('*').order('created_at', { ascending: false })
    if (data) setTasks(data)
    setLoading(false)
  }

  // 2. The Logout Function (Now inside the component!)
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask) return
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('checklists').insert([
      { task_name: newTask, category, user_id: user?.id, status: 'Pending' }
    ])
    if (!error) { setNewTask(''); fetchTasks() }
  }

  async function toggleTask(id: string, is_completed: boolean) {
    const newStatus = !is_completed ? 'Completed' : 'Pending'
    await supabase.from('checklists').update({ 
      is_completed: !is_completed,
      status: newStatus 
    }).eq('id', id)
    fetchTasks()
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Team Workspace</h1>
            <p className="text-slate-500 text-sm">Manage your private tasks and docs</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-medium text-sm"
          >
            <LogOut size={18} /> Logout
          </button>
        </header>

        {/* Form Section */}
        <form onSubmit={addTask} className="bg-white p-4 rounded-2xl shadow-sm border mb-8 flex gap-3">
          <input 
            className="flex-1 outline-none px-2"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <select className="bg-slate-100 rounded-lg px-3 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
            <option>Work</option>
            <option>Urgent</option>
          </select>
          <button className="bg-blue-600 text-white p-2 rounded-xl"><Plus /></button>
        </form>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-5 rounded-2xl border flex items-center gap-4">
              <button onClick={() => toggleTask(task.id, task.is_completed)}>
                {task.is_completed ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-slate-300" />}
              </button>
              <div className="flex-1">
                <p className={task.is_completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>
                  {task.task_name}
                </p>
              </div>
              
              {/* STATUS PILL */}
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                task.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {task.status || 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
