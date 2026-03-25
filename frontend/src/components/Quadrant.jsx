import TaskItem from './Task';
import { useDroppable } from '@dnd-kit/core';

export default function Quadrant({ title, subtitle, type, quadrant, tasks, onUpdate, onDelete }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `quadrant-${quadrant}`,
    data: { quadrant }
  });

  const getColors = () => {
    switch(type) {
      case 'p1': return { bg: 'bg-red-50/50 hover:bg-red-50', border: 'border-red-200/50 hover:border-red-300', text: 'text-red-700', badgeInfo: 'bg-red-100 text-red-700', dropHighlight: 'ring-red-400 bg-red-50' };
      case 'p2': return { bg: 'bg-blue-50/50 hover:bg-blue-50', border: 'border-blue-200/50 hover:border-blue-300', text: 'text-blue-700', badgeInfo: 'bg-blue-100 text-blue-700', dropHighlight: 'ring-blue-400 bg-blue-50' };
      case 'p3': return { bg: 'bg-yellow-50/50 hover:bg-yellow-50', border: 'border-yellow-200/50 hover:border-yellow-300', text: 'text-yellow-700', badgeInfo: 'bg-yellow-100 text-yellow-800', dropHighlight: 'ring-yellow-400 bg-yellow-50' };
      case 'p4': return { bg: 'bg-emerald-50/50 hover:bg-emerald-50', border: 'border-emerald-200/50 hover:border-emerald-300', text: 'text-emerald-700', badgeInfo: 'bg-emerald-100 text-emerald-700', dropHighlight: 'ring-emerald-400 bg-emerald-50' };
      default: return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badgeInfo: 'bg-slate-100 text-slate-700', dropHighlight: 'ring-slate-400 bg-slate-50' };
    }
  };

  const colors = getColors();
  const completedCount = tasks.filter(t => t.is_completed).length;

  return (
    <div 
      ref={setNodeRef}
      className={`p-4 md:p-5 rounded-2xl border ${colors.border} ${colors.bg} flex flex-col transition-all duration-300 shadow-sm hover:shadow-md h-[40vh] md:h-auto overflow-hidden group ${isOver ? `ring-2 ${colors.dropHighlight} scale-[1.01]` : ''}`}
    >
      <header className="flex justify-between items-center mb-4 sm:mb-5 pb-3 border-b border-black/5">
        <div>
          <h2 className={`font-bold text-lg ${colors.text} tracking-tight flex items-center gap-2`}>
            {title}
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold opacity-80 ${colors.badgeInfo}`}>
              {tasks.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
        {tasks.length > 0 && (
          <div className="text-xs text-slate-400 font-medium">
            {completedCount}/{tasks.length} 已完成
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 
      [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent 
      [&::-webkit-scrollbar-thumb]:bg-slate-300/50 [&::-webkit-scrollbar-thumb]:rounded-full 
      hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
        {tasks.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center text-slate-400/60 transition-opacity duration-500 ${isOver ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <span className="text-sm font-medium">{isOver ? '松手放置到此象限' : '该象限暂无任务'}</span>
            <span className="text-xs mt-1">{isOver ? '' : '请添加或将任务拖拽至此'}</span>
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onUpdate={(changes) => onUpdate(task.id, changes)} 
              onDelete={() => onDelete(task.id)} 
              type={type}
            />
          ))
        )}
      </div>
    </div>
  );
}
