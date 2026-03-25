import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Trash2, CheckCircle2, Circle, Edit2, Check, ExternalLink } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';

export default function Task({ task, onUpdate, onDelete, type }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleToggle = () => {
    onUpdate({ is_completed: !task.is_completed });
  };

  const saveEdit = () => {
    if (editContent.trim() && editContent !== task.content) {
      onUpdate({ content: editContent });
    } else {
      setEditContent(task.content); // reset if empty
    }
    setIsEditing(false);
  };

  const handleMove = (newQuadrant) => {
    onUpdate({ quadrant: newQuadrant });
  };

  const isCompleted = task.is_completed;

  return (
    <div className={`group flex items-start gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm transition-all hover:bg-white hover:shadow hover:border-slate-300/80 ${isCompleted ? 'opacity-60 saturate-50' : ''}`}>
      <button 
        onClick={handleToggle}
        className={`mt-0.5 flex-shrink-0 focus:outline-none transition-colors ${isCompleted ? 'text-green-500 hover:text-green-600' : 'text-slate-300 hover:text-slate-400'}`}
      >
        {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </button>
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
            className="w-full bg-slate-50 border-none outline-none text-sm text-slate-800 rounded py-0"
          />
        ) : (
          <span 
            className={`text-sm block w-full truncate cursor-pointer select-none transition-all ${isCompleted ? 'line-through text-slate-400' : 'text-slate-700 group-hover:text-slate-900'}`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {task.content}
          </span>
        )}
      </div>

      <div className="relative flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 outline-none transition-colors">
            <MoreHorizontal size={16} />
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden divide-y divide-slate-100">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`${active ? 'bg-slate-50 text-slate-900' : 'text-slate-700'} group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                    >
                      <Edit2 size={14} className="mr-3 text-slate-400 group-hover:text-blue-500" />
                      Edit Task
                    </button>
                  )}
                </Menu.Item>
              </div>
              <div className="py-1">
                <p className="px-4 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Move to</p>
                {[1, 2, 3, 4].map(q => task.quadrant !== q && (
                  <Menu.Item key={q}>
                    {({ active }) => (
                      <button
                        onClick={() => handleMove(q)}
                        className={`${active ? 'bg-slate-50 text-slate-900' : 'text-slate-700'} group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                      >
                        <ExternalLink size={14} className="mr-3 text-slate-400 group-hover:text-indigo-500" />
                        Quadrant {q}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onDelete}
                      className={`${active ? 'bg-red-50 text-red-700' : 'text-red-600'} group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                    >
                      <Trash2 size={14} className="mr-3 text-red-400 group-hover:text-red-600" />
                      Delete Task
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}
