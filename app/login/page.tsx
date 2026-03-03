'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (type: 'login' | 'signup') => {
    setLoading(true)
    const { error } = type === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) alert(error.message)
    else router.push('/') // Go to tracker after success
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Welcome to DataFlow</h2>
        <div className="space-y-4">
          <input 
            type="email" placeholder="Email" 
            className="w-full p-3 rounded-xl border outline-none focus:ring-2 ring-blue-100"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-3 rounded-xl border outline-none focus:ring-2 ring-blue-100"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            disabled={loading}
            onClick={() => handleAuth('login')}
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            {loading ? 'Processing...' : 'Log In'}
          </button>
          <button 
            onClick={() => handleAuth('signup')}
            className="w-full text-slate-500 text-sm hover:underline"
          >
            Don't have an account? Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}
