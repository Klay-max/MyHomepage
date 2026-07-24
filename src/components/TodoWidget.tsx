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
    <div className="w-full max-w-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">待办事项</h3>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {completedCount}/{todos.length}
          </span>
        </div>
        
        {/* Progress bar */}
        {todos.length > 0 && (
          <div className="mt-3 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 dark:bg-gray-100 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Todo list */}
      <div className="max-h-64 overflow-y-auto">
        {todos.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">暂无待办事项</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">添加一个开始吧</p>
          </div>
        ) : (
          <div className="py-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed
                      ? 'bg-gray-900 dark:bg-gray-100 border-gray-900 dark:border-gray-100'
                      : 'border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400'
                  }`}
                >
                  {todo.completed && <Check className="w-3 h-3 text-white dark:text-gray-900" />}
                </button>
                <span
                  className={`flex-1 text-sm transition-all ${
                    todo.completed
                      ? 'text-gray-400 dark:text-gray-500 line-through'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add todo */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="添加新事项..."
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newTodo.trim()}
            className="p-2 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
