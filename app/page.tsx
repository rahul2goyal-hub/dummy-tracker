'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  LogOut, CheckCircle2, Circle, Plus, MessageSquare, 
  Search, Calendar, Star, Inbox, ChevronRight, Hash, Flame, AlertCircle 
} from 'lucide-react'

export default function StandardApp() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState('')
  const [remarks, setRemarks] = useState('')
  const [category, setCategory] = useState('Work')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Alert State
  const [alert, setAlert] = useState<{msg: string, type: 'success' | 'error'} | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        fetchTasks()
      }
    }
    init()
  }, [router, supabase])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      triggerAlert("Failed to load tasks", "error")
    } else if (data) {
      setTasks(data)
    }
    setLoading(false)
  }

  function triggerAlert(msg: string, type: 'success' | 'error') {
    setAlert({ msg, type })
    setTimeout(() => setAlert(null), 3000)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('checklists').insert([{ 
      task_name: newTask, 
      category, 
      remarks, 
      user_id: user?.id, 
      status: 'Pending',
      is_completed: false
    }])

    if (error) {
      triggerAlert(error.message, "error")
    } else {
      triggerAlert("Task created successfully!", "success")
      setNewTask('')
      setRemarks('')
      fetchTasks()
    }
  }

  async function toggleDone(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('checklists')
      .update({ is_completed: !currentStatus, status: !currentStatus ? 'Done' : 'Pending' })
      .eq('id', id)
    
    if (error) {
      triggerAlert("Update failed", "error")
    } else {
      fetchTasks()
    }
  }

  const filteredTasks = tasks.filter(t => 
    t.task_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeTasks = filteredTasks.filter(t => !t.is_completed)
  const completedTasks = filteredTasks.filter(t => t.is_completed)

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-slate-900 font-sans overflow-hidden">
      
      {/* --- ALERT TOAST --- */}
      {alert && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
          alert.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
        }`}>
          {alert.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm">{alert.msg}</span>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold italic shadow-lg shadow-indigo-500/20">DF</div>
          <span className="font-bold text-white tracking-tight text-lg">DataFlow</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={<Inbox size={18}/>} label="All Tasks" active />
          <SidebarItem icon={<Calendar size={18}/>} label="Today" />
          <SidebarItem icon={<Star size={18}/>} label="Important" />
          <div className="pt-8 pb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Categories</div>
          <SidebarItem icon={<Hash size={18}/>} label="Work" />
          <SidebarItem icon={<Hash size={18}/>} label="Personal" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} 
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all text-sm font-medium text-slate-400">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Quick search..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-4 ring-indigo-50">RG</div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-4xl mx-auto">
            
            {/* ADD TASK BOX */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 mb-10 group focus-within:shadow-xl focus-within:border-indigo-100 transition-all duration-300">
              <form onSubmit={addTask} className="space-y-4">
                <input 
                  className="w-full text-xl font-bold outline-none placeholder:text-slate-300 text-slate-800"
                  placeholder="Create a new objective..."
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                />
                <textarea 
                  className="w-full text-sm text-slate-500 outline-none resize-none placeholder:text-slate-300 h-10 transition-all focus:h-20"
                  placeholder="Remarks or context..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex gap-2">
                    {['Work', 'Urgent', 'Personal'].map(cat => (
                      <button 
                        key={cat} type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${category === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all active:scale-95 shadow-lg">
                    <Plus size={18} /> Add to Flow
                  </button>
                </div>
              </form>
            </div>

            {/* TASK RENDERING */}
            <div className="space-y-8">
              {/* ACTIVE */}
              <section>
                <div className="flex items-center gap-2 px-2 mb-4">
                  <Flame size={16} className="text-orange-500" />
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Focus</h2>
                </div>
                <div className="space-y-3">
                  {activeTasks.length === 0 && !loading && <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-sm">No active tasks. Start your flow above.</div>}
                  {activeTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onToggle={() => toggleDone(task.id, task.is_completed)} />
                  ))}
                </div>
              </section>

              {/* COMPLETED */}
              {completedTasks.length > 0 && (
                <section>
                  <h2 className="text-xs font-black text-slate-300 uppercase tracking-widest px-2 mb-4">Archive</h2>
                  <div className="space-y-3 opacity-60">
                    {completedTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onToggle={() => toggleDone(task.id, task.is_completed)} />
                    ))}
                  </div>
                </section>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

function TaskCard({ task, onToggle }: { task: any, onToggle: () => void }) {
  return (
    <div className="group bg-white rounded-[1.5rem] border border-slate-100 p-5 flex gap-4 items-start hover:shadow-lg hover:border-indigo-100 transition-all duration-300">
      <button onClick={onToggle} className="mt-1 transition-transform active:scale-75">
        {task.is_completed ? 
          <CheckCircle2 className="text-emerald-500" size={26} /> : 
          <Circle className="text-slate-200 group-hover:text-indigo-400" size={26} />
        }
      </button>
      <div className="flex-1">
        <h3 className={`font-bold text-[15px] ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
          {task.task_name}
        </h3>
        {task.remarks && (
          <div className="mt-2 flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
            <MessageSquare size={14} className="mt-0.5 text-slate-400 shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed italic">"{task.remarks}"</p>
          </div>
        )}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-black uppercase tracking-tighter">
            {task.category}
          </span>
          <span className="text-[10px] text-slate-300 font-bold">{new Date(task.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-200 opacity-0 group-hover:opacity-100 transition-all mt-1" />
    </div>
  )
}

function SidebarItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all text-sm font-bold ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 translate-x-1' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
      {icon} {label}
    </div>
  )
}
