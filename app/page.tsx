// 1. Add this near your other state variables
const [alert, setAlert] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

// 2. Update your addTask function to show the alert
async function addTask(e: React.FormEvent) {
  e.preventDefault();
  if (!newTask) return;
  
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('checklists').insert([{ 
    task_name: newTask, 
    category, 
    remarks, 
    user_id: user?.id, 
    status: 'Pending' 
  }]);

  if (error) {
    setAlert({ msg: "Failed to save: " + error.message, type: 'error' });
  } else {
    setAlert({ msg: "Task added successfully!", type: 'success' });
    setNewTask(''); 
    setRemarks(''); 
    fetchTasks();
    // Auto-hide alert after 3 seconds
    setTimeout(() => setAlert(null), 3000);
  }
}
