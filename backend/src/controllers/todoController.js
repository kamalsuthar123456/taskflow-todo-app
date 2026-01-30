import { Todo } from "../models/Todo.js";

// Get all todos for a board
export const getTodosByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    const todos = await Todo.find({ boardId })
      .sort("createdAt");

    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching todos",
      error: error.message
    });
  }
};

// Create new todo
export const createTodo = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Todo title is required"
      });
    }

    const todo = await Todo.create({
      boardId,
      title: title.trim(),
      description: description || "",
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null
    });

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating todo",
      error: error.message
    });
  }
};

// Update todo
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    const todo = await Todo.findByIdAndUpdate(
      id,
      {
        title: title?.trim(),
        description,
        status,
        priority,
        dueDate
      },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found"
      });
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating todo",
      error: error.message
    });
  }
};

// Delete todo
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found"
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting todo",
      error: error.message
    });
  }
};
