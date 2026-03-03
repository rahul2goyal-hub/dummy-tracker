'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell, Paperclip, Loader2, LogOut } from 'lucide-react'

export default function ProTracker() {
  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dueDate, setDueDate] = useState('')
  const supabase = createClient()

  async function handleUpload(file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .upload(fileName, file)
    
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('task-attachments').getPublicUrl(fileName)
    return publicUrl
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    let uploadedUrl = null
    if (file) uploadedUrl = await handleUpload(file)

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('checklists').insert([{ 
      task_name: newTask, 
      user_id: user?.id,
      file_url: uploadedUrl,
      due_date: dueDate,
      status: 'In Progress'
    }])
    
    setNewTask(''); setFile(null); fetchTasks()
  }

  // ... (Keep your fetchTasks and UI logic from before)
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* New Input Form with File & Date */}
      <form onSubmit={addTask} className="bg-white p-6 rounded-2xl shadow-lg border mb-10">
        <input 
          className="w-full text-xl font-bold outline-none mb-4" 
          placeholder="Task Name..." 
          onChange={e => setNewTask(e.target.value)}
        />
        
        <div className="flex flex-wrap gap-4 items-center">
          <input 
            type="datetime-local" 
            className="border p-2 rounded-lg text-sm"
            onChange={e => setDueDate(e.target.value)}
          />
          
          <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 transition">
            <Paperclip size={18}/>
            <span className="text-sm">{file ? file.name : "Attach Doc"}</span>
            <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>

          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg ml-auto">Save Task</button>
        </div>
      </form>

      {/* List display remains similar but shows a 'Clip' icon if file_url exists */}
    </div>
  )
}
