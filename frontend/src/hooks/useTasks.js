import { useState, useEffect, useCallback } from 'react';
import { boardAPI, todoAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [defaultBoard, setDefaultBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load boards and todos
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📥 Loading boards and tasks...');

      // Get all boards
      const boardsResponse = await boardAPI.getAll();
      const userBoards = boardsResponse.data || [];
      setBoards(userBoards);

      console.log(`✅ Loaded ${userBoards.length} boards`);

      // Find or create default board
      let defaultBoardData = userBoards.find(b => b.title === 'My Tasks');
      
      if (!defaultBoardData && userBoards.length > 0) {
        defaultBoardData = userBoards[0];
      }

      if (!defaultBoardData) {
        console.log('📝 Creating default board...');
        const createResponse = await boardAPI.create({
          title: 'My Tasks',
          description: 'Daily tasks and habits'
        });
        defaultBoardData = createResponse.data;
        setBoards([defaultBoardData]);
      }

      setDefaultBoard(defaultBoardData);

      // Load todos from default board
      if (defaultBoardData) {
        const todosResponse = await todoAPI.getByBoard(defaultBoardData._id);
        const todos = todosResponse.data || [];
        
        // Transform backend todos to match Dashboard format
        const transformedTasks = todos.map(todo => ({
            id: todo._id,
            title: todo.title,
            description: todo.description || '', // ✅ Include description
            completed: todo.status === 'done', // ✅ CRITICAL: Map status to completed
            priority: todo.priority || 'medium',
            status: todo.status,
            boardId: todo.boardId,
            completedAt: todo.completedAt // ✅ Include completion timestamp
            }));

            console.log(`✅ Transformed tasks:`, {
            total: transformedTasks.length,
            completed: transformedTasks.filter(t => t.completed).length,
            active: transformedTasks.filter(t => !t.completed).length
            });

        setTasks(transformedTasks);
        console.log(`✅ Loaded ${transformedTasks.length} tasks`);
      }

    } catch (err) {
      console.error('❌ Failed to load data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load data on mount and when user changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add task
  const addTask = async ({ title, priority }) => {
    if (!defaultBoard) {
      console.error('❌ No default board');
      return;
    }

    try {
      console.log(`📝 Creating task: "${title}"`);

      const response = await todoAPI.create(defaultBoard._id, {
        title,
        priority: priority || 'medium',
        status: 'todo',
        description: ''
      });

      const newTask = {
        id: response.data._id,
        title: response.data.title,
        completed: false,
        priority: response.data.priority,
        status: response.data.status,
        boardId: response.data.boardId,
      };

      setTasks(prev => [newTask, ...prev]);
      console.log('✅ Task created');

      return newTask;
    } catch (err) {
      console.error('❌ Failed to create task:', err);
      throw err;
    }
  };

  // Toggle task
  const toggleTask = async (taskId) => {
    if (!defaultBoard) return;

    try {
      console.log(`🔄 Toggling task: ${taskId}`);

      // Optimistic update
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );

      await todoAPI.toggle(defaultBoard._id, taskId);
      console.log('✅ Task toggled');

    } catch (err) {
      console.error('❌ Failed to toggle task:', err);
      // Revert on error
      loadData();
      throw err;
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!defaultBoard) return;

    try {
      console.log(`🗑️  Deleting task: ${taskId}`);

      // Optimistic update
      setTasks(prev => prev.filter(t => t.id !== taskId));

      await todoAPI.delete(defaultBoard._id, taskId);
      console.log('✅ Task deleted');

    } catch (err) {
      console.error('❌ Failed to delete task:', err);
      // Revert on error
      loadData();
      throw err;
    }
  };

  // Clear completed
  const clearCompleted = async () => {
    if (!defaultBoard) return;

    try {
      const completedTasks = tasks.filter(t => t.completed);
      
      console.log(`🗑️  Clearing ${completedTasks.length} completed tasks`);

      // Delete all completed tasks
      await Promise.all(
        completedTasks.map(task => todoAPI.delete(defaultBoard._id, task.id))
      );

      setTasks(prev => prev.filter(t => !t.completed));
      console.log('✅ Completed tasks cleared');

    } catch (err) {
      console.error('❌ Failed to clear completed:', err);
      loadData();
      throw err;
    }
  };

  return {
    tasks,
    boards,
    defaultBoard,
    loading,
    error,
    addTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    reload: loadData,
  };
}
