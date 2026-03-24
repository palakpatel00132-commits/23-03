import Task from '../models/task.js';
import { BaseController } from './baseController.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

class TaskController extends BaseController {
  constructor() {
    super(Task, 'Task');
  }

  // Override create to add created_by
  create = async (req, res) => {
    try {
      const userId = req.user.id;
      const { title } = req.body;
      
      const task = new Task({
        title,
        created_by: userId,
      });

      await task.save();
      return sendSuccess(res, task, 'Task created successfully', 201);
    } catch (error) {
      return sendError(res, 'Internal Server Error', 500, error);
    }
  };

  // Override getAll to filter by user (if exists) and populate
  getAll = async (req, res) => {
    try {
      const filter = req.user ? { created_by: req.user.id } : {};
      const tasks = await Task.find(filter).populate('created_by', 'name email');
      return sendSuccess(res, tasks, 'Tasks retrieved successfully');
    } catch (error) {
      return sendError(res, 'Internal Server Error', 500, error);
    }
  };

  // Override update to handle ownership and custom fields
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const userId = req.user.id;

      const task = await Task.findById(id);
      if (!task) {
        return sendError(res, 'Task not found', 404);
      }

      // Check ownership
      if (task.created_by.toString() !== userId) {
        return sendError(res, 'You are not authorized to update this task', 403);
      }

      task.title = title || task.title;
      await task.save();

      return sendSuccess(res, task, 'Task updated successfully');
    } catch (error) {
      return sendError(res, 'Internal Server Error', 500, error);
    }
  };

  // Override delete to handle ownership
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const task = await Task.findById(id);
      if (!task) {
        return sendError(res, 'Task not found', 404);
      }
      
      if (task.created_by.toString() !== userId) {
        return sendError(res, 'You are not authorized to delete this task', 403);
      }
      
      await Task.findByIdAndDelete(id);
      return sendSuccess(res, null, 'Task deleted successfully');
    } catch (error) {
      return sendError(res, 'Internal Server Error', 500, error);
    }
  };
}

const taskController = new TaskController();

export default taskController;

export const createTask = taskController.create;
export const getTasks = taskController.getAll;
export const updateTask = taskController.update;
export const deleteTask = taskController.delete;
