import React, { useEffect, useState, DragEvent } from 'react';
import './TasksPage.css';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type TaskStatus = 'todo' | 'in_progress' | 'done';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assigned: { full_name: string; avatar_url: string } | null;
  pr: { id: string; title: string; github_pr_id: string } | null;
}

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const token = session?.access_token;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium' });

  // Filters mapping
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    if (!token) return;
    fetchTasks();

    // Subscribe to real-time task updates
    const channel = supabase
      .channel('tasks-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          console.log('Task change:', payload);
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [...prev, payload.new as Task]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as Task : t));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [token]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setTasks(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingTaskId(null);
    setTaskForm({ title: '', description: '', priority: 'medium' });
    setIsModalOpen(true);
  }

  const handleOpenEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskForm({ title: task.title, description: task.description || '', priority: task.priority });
    setIsModalOpen(true);
  }

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !taskForm.title) return;

    try {
      const url = editingTaskId ? `${API_URL}/api/tasks/${editingTaskId}` : `${API_URL}/api/tasks`;
      const method = editingTaskId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm),
      });
      const json = await res.json();
      
      if (json.success) {
        if (editingTaskId) {
          setTasks(tasks.map(t => t.id === editingTaskId ? json.data : t));
        } else {
          setTasks([json.data, ...tasks]);
        }
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTaskId || !window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${editingTaskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== editingTaskId));
        setIsModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    // Optimistic UI update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    // Backend update
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchTasks(); // Revert on failure
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Required to allow dropping
  };

  const columns: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'done', label: 'Done' },
  ];

  const filteredTasks = tasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="tasks-container fade-in">
        <header className="tasks-header">
          <div>
            <h1>Task Board</h1>
            <p>Manage your sprint and drag issues to completion.</p>
          </div>
          <div className="tasks-header-actions" style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="task-search-input"
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
            />
            <select 
              value={filterPriority} 
              onChange={e => setFilterPriority(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button className="btn-primary" onClick={handleOpenCreate}>
              + New Task
            </button>
          </div>
        </header>

        {loading ? (
          <div style={{ color: '#94a3b8' }}>Loading tasks...</div>
        ) : (
          <div className="kanban-board">
            {columns.map(col => (
              <div 
                key={col.id} 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="column-header">
                  <h2>{col.label}</h2>
                  <span className="task-count">{filteredTasks.filter(t => t.status === col.id).length}</span>
                </div>
                <div className="column-content">
                  {filteredTasks.filter(t => t.status === col.id).map(task => (
                    <div 
                      key={task.id} 
                      className="task-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => handleOpenEdit(task)}
                    >
                      <h3 className="task-title">{task.title}</h3>
                      {task.description && <p className="task-desc">{task.description}</p>}
                      <div className="task-footer">
                        <span className={`task-priority priority-${task.priority}`}>
                          {task.priority}
                        </span>
                        {task.pr && (
                          <span style={{ fontSize: '12px', color: '#6366f1' }}>🔗 PR #{task.pr.github_pr_id}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingTaskId ? 'Edit Task' : 'Create New Task'}</h2>
              <form onSubmit={handleSaveTask}>
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Fix login CSS bug"
                    value={taskForm.title} 
                    onChange={e => setTaskForm({...taskForm, title: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    rows={3} 
                    placeholder="Provide some details..."
                    value={taskForm.description} 
                    onChange={e => setTaskForm({...taskForm, description: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select 
                    value={taskForm.priority} 
                    onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="modal-actions" style={{ justifyContent: 'space-between', display: 'flex' }}>
                  {editingTaskId ? (
                    <button type="button" className="btn-secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={handleDeleteTask}>Delete Task</button>
                  ) : <div />}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn-primary">{editingTaskId ? 'Save' : 'Create'}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
