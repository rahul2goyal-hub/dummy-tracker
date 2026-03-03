'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  LogOut, CheckCircle2, Circle, Plus, MessageSquare, 
  Search, Calendar, Star, Inbox, ChevronRight, Hash 
} from 'lucide-react'

export default function StandardApp() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState('')
  const [remarks, setRemarks] = useState('')
  const [category, setCategory] = useState('Work')
  const [searchQuery, setSearchQuery] = useState('')
  
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

  async function toggleDone(id: string, currentStatus: boolean) {
    await supabase.from('checklists').update({ is_completed: !currentStatus }).eq('id', id)
    fetchTasks()
  }

  const filteredTasks = tasks.filter(t => 
    t.task_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-slate-900 font-sans overflow-hidden">
      
      {/* 1. SIDEBAR NAV */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">D</div>
          <span className="font-bold text-white tracking-tight">DataFlow Pro</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={<Inbox size={18}/>} label="All Tasks" active />
          <SidebarItem icon={<Calendar size={18}/>} label="Today" />
          <SidebarItem icon={<Star size={18}/>} label="Important" />
          
          <div className="pt-8 pb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Projects</div>
          <SidebarItem icon={<Hash size={18}/>} label="Work" />
          <SidebarItem icon={<Hash size={18}/>} label="Personal" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} 
            className="flex items-center gap-3 px-3 py-2 w-full hover:bg-slate-800 rounded-lg transition-colors text-sm">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm outline-none border border-transparent focus:border-indigo-300 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">RG</div>
          </div>
        </header>

        {/* SCROLLABLE VIEW */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F3F4F6]/50">
          <div className="max-w-4xl mx-auto">
            
            {/* INPUT SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
              <form onSubmit={addTask} className="space-y-4">
                <input 
                  className="w-full text-xl font-semibold outline-none placeholder:text-slate-300"
                  placeholder="What's on your mind?"
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                />
                <textarea 
                  className="w-full text-sm text-slate-600 outline-none resize-none placeholder:text-slate-300 h-12"
                  placeholder="Add details or remarks..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <select className="bg-slate-100 text-xs font-bold px-3 py-2 rounded-lg border-none outline-none" value={category} onChange={e => setCategory(e.target.value)}>
                    <option>Work</option>
                    <option>Urgent</option>
                    <option>Personal</option>
                  </select>
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                    Add Task
                  </button>
                </div>
              </form>
            </div>

            {/* TASK LIST */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Active Objectives</h2>
              {filteredTasks.map((task) => (
                <div key={task.id} className="group bg-white rounded-xl border border-slate-200 p-4 flex gap-4 items-start hover:shadow-md hover:border-indigo-200 transition-all">
                  <button onClick={() => toggleDone(task.id, task.is_completed)} className="mt-1">
                    {task.is_completed ? 
                      <CheckCircle2 className="text-emerald-500 bg-emerald-50 rounded-full" size={24} /> : 
                      <Circle className="text-slate-300 hover:text-indigo-400 transition-colors" size={24} />
                    }
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {task.task_name}
                    </h3>
                    {task.remarks && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MessageSquare size={12}/> {task.remarks}</p>}
                    <div className="mt-3 flex gap-2">
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold uppercase text-slate-500">{task.category}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Added {new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${active ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
      {icon} {label}
    </div>
  )
}
