import React, { useEffect, useState, DragEvent } from 'react';
import './TasksPage.css';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks';

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
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });

  useEffect(() => {
    if (!token) return;
    fetchTasks();
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTask.title) return;

    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      const json = await res.json();
      if (json.success) {
        setTasks([json.data, ...tasks]);
        setIsModalOpen(false);
        setNewTask({ title: '', description: '', priority: 'medium' });
      }
    } catch (err) {
      console.error(err);
    }
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

  return (
    <DashboardLayout>
      <div className="tasks-container fade-in">
        <header className="tasks-header">
          <div>
            <h1>Task Board</h1>
            <p>Manage your sprint and drag issues to completion.</p>
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + New Task
          </button>
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
                  <span className="task-count">{tasks.filter(t => t.status === col.id).length}</span>
                </div>
                <div className="column-content">
                  {tasks.filter(t => t.status === col.id).map(task => (
                    <div 
                      key={task.id} 
                      className="task-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
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
              <h2>Create New Task</h2>
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Fix login CSS bug"
                    value={newTask.title} 
                    onChange={e => setNewTask({...newTask, title: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    rows={3} 
                    placeholder="Provide some details..."
                    value={newTask.description} 
                    onChange={e => setNewTask({...newTask, description: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select 
                    value={newTask.priority} 
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
