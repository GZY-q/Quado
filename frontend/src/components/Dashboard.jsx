import { useState, useEffect, useMemo } from 'react';
import { tasks as tasksApi } from '../api';
import Quadrant from './Quadrant';
import { LogOut, Plus, Search, X, CheckCircle2, ListTodo, TrendingUp } from 'lucide-react';
import { DndContext, DragOverlay, pointerWithin, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

export default function Dashboard({ onLogout }) {
  const [taskList, setTaskList] = useState([]);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskQuadrant, setNewTaskQuadrant] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

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
      fetchTasks();
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('您确定要删除这个任务吗？')) return;
    try {
      setTaskList(prev => prev.filter(t => t.id !== id));
      await tasksApi.delete(id);
    } catch (e) {
      fetchTasks();
      console.error(e);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event) => {
    const task = taskList.find(t => t.id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const targetQuadrant = over.data?.current?.quadrant;

    if (targetQuadrant) {
      const task = taskList.find(t => t.id === taskId);
      if (task && task.quadrant !== targetQuadrant) {
        handleUpdate(taskId, { quadrant: targetQuadrant });
      }
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  // Sort: incomplete first, then by created_at desc
  const sortTasks = (tasks) => {
    return [...tasks].sort((a, b) => {
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  // Filter by search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return taskList;
    const q = searchQuery.toLowerCase();
    return taskList.filter(t => t.content.toLowerCase().includes(q));
  }, [taskList, searchQuery]);

  const p1Tasks = sortTasks(filteredTasks.filter(t => t.quadrant === 1));
  const p2Tasks = sortTasks(filteredTasks.filter(t => t.quadrant === 2));
  const p3Tasks = sortTasks(filteredTasks.filter(t => t.quadrant === 3));
  const p4Tasks = sortTasks(filteredTasks.filter(t => t.quadrant === 4));

  // Statistics
  const totalTasks = taskList.length;
  const completedTasks = taskList.filter(t => t.is_completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">四象限云同步待办</h1>
        
        <form onSubmit={handleCreateTask} className="hidden md:flex flex-1 max-w-2xl mx-6 items-center bg-slate-100 rounded-full pl-4 pr-1 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
          <input 
            type="text" 
            placeholder="填写准备要做些什么？" 
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-slate-800"
          />
          <select 
            value={newTaskQuadrant} 
            onChange={(e) => setNewTaskQuadrant(e.target.value)}
            className="text-xs bg-slate-200 text-slate-700 rounded-full px-3 py-2 mr-2 outline-none appearance-none font-medium cursor-pointer"
          >
            <option value={1}>P1: 优先执行</option>
            <option value={2}>P2: 计划日程</option>
            <option value={3}>P3: 委托他人</option>
            <option value={4}>P4: 尽量消除</option>
          </select>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center transition-colors">
            <Plus size={16} />
          </button>
        </form>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors"
            title="搜索任务"
          >
            <Search size={20} />
          </button>
          <button 
            onClick={onLogout} 
            className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors"
            title="退出登录"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 animate-in slide-in-from-top duration-200">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="搜索任务内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800"
          />
          {searchQuery && (
            <span className="text-xs text-slate-400 flex-shrink-0">
              找到 {filteredTasks.length} / {totalTasks} 项
            </span>
          )}
          <button 
            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
            className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Mobile Input */}
      <div className="md:hidden p-4 bg-white border-b border-slate-200 shadow-sm">
        <form onSubmit={handleCreateTask} className="flex space-x-2">
          <input 
            type="text" 
            placeholder="添加一个任务..." 
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

      {/* Statistics Bar */}
      {totalTasks > 0 && (
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 md:px-8 py-2.5 flex items-center gap-6 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ListTodo size={14} />
            <span>共 <strong className="text-slate-700">{totalTasks}</strong> 项任务</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle2 size={14} />
            <span>已完成 <strong>{completedTasks}</strong> 项</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600">
            <TrendingUp size={14} />
            <span>完成率 <strong>{completionRate}%</strong></span>
          </div>
          <div className="flex-1 hidden sm:block">
            <div className="w-full max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quadrant Grid with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <main className="flex-1 p-2 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 lg:grid-rows-2 h-full">
          <Quadrant 
            title="第一象限 (优先执行)" 
            subtitle="重要且紧急" 
            type="p1"
            quadrant={1}
            tasks={p1Tasks} 
            onUpdate={handleUpdate} 
            onDelete={handleDelete}
          />
          <Quadrant 
            title="第二象限 (计划日程)" 
            subtitle="重要但不紧急" 
            type="p2"
            quadrant={2}
            tasks={p2Tasks} 
            onUpdate={handleUpdate} 
            onDelete={handleDelete}
          />
          <Quadrant 
            title="第三象限 (委托他人)" 
            subtitle="紧急但不重要" 
            type="p3"
            quadrant={3}
            tasks={p3Tasks} 
            onUpdate={handleUpdate} 
            onDelete={handleDelete}
          />
          <Quadrant 
            title="第四象限 (尽量消除)" 
            subtitle="不紧急且不重要" 
            type="p4"
            quadrant={4}
            tasks={p4Tasks} 
            onUpdate={handleUpdate} 
            onDelete={handleDelete}
          />
        </main>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="p-3 bg-white rounded-xl border border-blue-300 shadow-xl text-sm text-slate-700 max-w-xs truncate opacity-90 rotate-2 scale-105">
              {activeTask.content}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
