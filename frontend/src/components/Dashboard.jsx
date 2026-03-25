import { useState, useEffect } from 'react';
import { tasks as tasksApi } from '../api';
import Quadrant from './Quadrant';
import { LogOut, Plus } from 'lucide-react';

export default function Dashboard({ onLogout }) {
  const [taskList, setTaskList] = useState([]);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskQuadrant, setNewTaskQuadrant] = useState(1);

  const fetchTasks = async () => {
    try {
      const data = await tasksApi.getAll();
      setTaskList(data);
    } catch (e) {
      if (e.response?.status === 401) {
        onLogout();
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;
    try {
      const newTask = await tasksApi.create({
        content: newTaskContent,
        quadrant: parseInt(newTaskQuadrant)
      });
      setTaskList([newTask, ...taskList]);
      setNewTaskContent('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (id, changes) => {
    try {
      setTaskList(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t));
      await tasksApi.update(id, changes);
    } catch (e) {
      fetchTasks(); // rollback
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      setTaskList(prev => prev.filter(t => t.id !== id));
      await tasksApi.delete(id);
    } catch (e) {
      fetchTasks(); // rollback
      console.error(e);
    }
  };

  const p1Tasks = taskList.filter(t => t.quadrant === 1);
  const p2Tasks = taskList.filter(t => t.quadrant === 2);
  const p3Tasks = taskList.filter(t => t.quadrant === 3);
  const p4Tasks = taskList.filter(t => t.quadrant === 4);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Quadrant Todo</h1>
        
        <form onSubmit={handleCreateTask} className="hidden md:flex flex-1 max-w-2xl mx-6 items-center bg-slate-100 rounded-full pl-4 pr-1 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
          <input 
            type="text" 
            placeholder="What needs to be done?" 
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-slate-800"
          />
          <select 
            value={newTaskQuadrant} 
            onChange={(e) => setNewTaskQuadrant(e.target.value)}
            className="text-xs bg-slate-200 text-slate-700 rounded-full px-3 py-2 mr-2 outline-none appearance-none font-medium cursor-pointer"
          >
            <option value={1}>P1: Do First</option>
            <option value={2}>P2: Schedule</option>
            <option value={3}>P3: Delegate</option>
            <option value={4}>P4: Eliminate</option>
          </select>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center transition-colors">
            <Plus size={16} />
          </button>
        </form>

        <button 
          onClick={onLogout} 
          className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors"
          title="Sign out"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Mobile Input (visible only on small screens) */}
      <div className="md:hidden p-4 bg-white border-b border-slate-200 shadow-sm">
        <form onSubmit={handleCreateTask} className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Add a task..." 
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select 
            value={newTaskQuadrant} 
            onChange={(e) => setNewTaskQuadrant(e.target.value)}
            className="w-24 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 text-xs outline-none"
          >
            <option value={1}>P1</option>
            <option value={2}>P2</option>
            <option value={3}>P3</option>
            <option value={4}>P4</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg">
            <Plus size={20} />
          </button>
        </form>
      </div>

      <main className="flex-1 p-2 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 lg:grid-rows-2 h-full">
        <Quadrant 
          title="Do First" 
          subtitle="Urgent & Important" 
          type="p1"
          tasks={p1Tasks} 
          onUpdate={handleUpdate} 
          onDelete={handleDelete}
        />
        <Quadrant 
          title="Schedule" 
          subtitle="Not Urgent but Important" 
          type="p2"
          tasks={p2Tasks} 
          onUpdate={handleUpdate} 
          onDelete={handleDelete}
        />
        <Quadrant 
          title="Delegate" 
          subtitle="Urgent but Not Important" 
          type="p3"
          tasks={p3Tasks} 
          onUpdate={handleUpdate} 
          onDelete={handleDelete}
        />
        <Quadrant 
          title="Eliminate" 
          subtitle="Not Urgent & Not Important" 
          type="p4"
          tasks={p4Tasks} 
          onUpdate={handleUpdate} 
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
