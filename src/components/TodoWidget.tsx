import { useState } from 'react';
import { Plus, Check, Trash2, Calendar } from 'lucide-react';
import { useStore } from '../store';

export function TodoWidget() {
  const { todos, addTodo, toggleTodo, deleteTodo, settings } = useStore();
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  if (!settings.showTodo) return null;

  return (
    <div className="w-full max-w-sm bg-surface rounded-2xl border border-line-light shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-line-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-ink-secondary" />
            <h3 className="text-sm font-semibold text-ink tracking-tight">待办事项</h3>
          </div>
          <span className="text-xs text-ink-tertiary font-medium tabular-nums">
            {completedCount}/{todos.length}
          </span>
        </div>

        {todos.length > 0 && (
          <div className="mt-3 h-1 bg-surface-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Todo list */}
      <div className="max-h-64 overflow-y-auto">
        {todos.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-ink-tertiary">暂无待办事项</p>
            <p className="text-xs text-ink-tertiary mt-1">添加一个开始吧</p>
          </div>
        ) : (
          <div className="py-1.5">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-center gap-3 px-5 py-2.5 hover:bg-surface-hover transition-colors"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    todo.completed
                      ? 'bg-accent border-accent'
                      : 'border-line hover:border-accent'
                  }`}
                >
                  {todo.completed && <Check className="w-3 h-3 text-white" />}
                </button>
                <span
                  className={`flex-1 text-sm transition-all ${
                    todo.completed
                      ? 'text-ink-tertiary line-through'
                      : 'text-ink'
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-danger-soft text-ink-tertiary hover:text-danger transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add todo */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-line-light bg-surface-hover/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="添加新事项..."
            className="flex-1 px-3 py-2 text-sm bg-surface rounded-lg border border-line-light text-ink placeholder-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!newTodo.trim()}
            className="p-2 rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
