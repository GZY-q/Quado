import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Trash2, CheckCircle2, Circle, Edit2, ExternalLink, GripVertical } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useDraggable } from '@dnd-kit/core';

const QUADRANT_LABELS = {
  1: '第一象限 (优先执行)',
  2: '第二象限 (计划日程)',
  3: '第三象限 (委托他人)',
  4: '第四象限 (尽量消除)',
};

export default function Task({ task, onUpdate, onDelete, type }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const inputRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

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
      setEditContent(task.content);
    }
    setIsEditing(false);
  };

  const handleMove = (newQuadrant) => {
    onUpdate({ quadrant: newQuadrant });
  };

  const isCompleted = task.is_completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-2 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm transition-all hover:bg-white hover:shadow hover:border-slate-300/80 ${isCompleted ? 'opacity-60 saturate-50' : ''} ${isDragging ? 'opacity-40 scale-95 shadow-none' : ''}`}
    >
      {/* Drag Handle */}
      <button
        {...listeners}
        {...attributes}
        className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity touch-none"
        title="拖拽移动"
      >
        <GripVertical size={16} />
      </button>

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

      <div className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onDelete}
          className="p-1 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 outline-none transition-colors"
          title="删除任务"
        >
          <Trash2 size={15} />
        </button>
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
            <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden divide-y divide-slate-100">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`${active ? 'bg-slate-50 text-slate-900' : 'text-slate-700'} group flex w-full items-center px-4 py-2.5 text-sm transition-colors`}
                    >
                      <Edit2 size={14} className="mr-3 text-slate-400 group-hover:text-blue-500" />
                      编辑任务
                    </button>
                  )}
                </Menu.Item>
              </div>
              <div className="py-1">
                <p className="px-4 py-1.5 text-xs font-semibold text-slate-500 tracking-wider">移动至</p>
                {[1, 2, 3, 4].map(q => task.quadrant !== q && (
                  <Menu.Item key={q}>
                    {({ active }) => (
                      <button
                        onClick={() => handleMove(q)}
                        className={`${active ? 'bg-slate-50 text-slate-900' : 'text-slate-700'} group flex w-full items-center px-4 py-2.5 text-sm transition-colors`}
                      >
                        <ExternalLink size={14} className="mr-3 text-slate-400 group-hover:text-indigo-500" />
                        {QUADRANT_LABELS[q]}
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
                      className={`${active ? 'bg-red-50 text-red-700' : 'text-red-600'} group flex w-full items-center px-4 py-2.5 text-sm transition-colors`}
                    >
                      <Trash2 size={14} className="mr-3 text-red-400 group-hover:text-red-600" />
                      删除任务
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
