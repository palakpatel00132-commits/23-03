import Task from '../models/task.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const createTask = async (req, res) => {

  try {
    const userId = req.user.id;

    const { title } = req.body;
 
    const task = new Task({
      title,
      created_by: userId,
    });

    await task.save();

    sendSuccess(res, task, 'Task created successfully', 201);
  } catch (error) {
    sendError(res, 'Internal Server Error', 500, error);
  }
};

export const getTasks = async (req, res) => {
    const userId = req.user.id;
  try {
    const tasks = await Task.find({ created_by: userId }).populate('created_by', 'username email');
    sendSuccess(res, tasks, 'Tasks retrieved successfully');
  } catch (error) {
    sendError(res, 'Internal Server Error', 500, error);
  }
};

 export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const created_by = req.user.id;

    const task = await Task.findById(id);
    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    task.title = title || task.title;
    task.created_by = created_by;

    await task.save();

    sendSuccess(res, task, 'Task updated successfully');
  } catch (error) {
    sendError(res, 'Internal Server Error', 500, error);
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const created_by = req.user.id;

    const task = await Task.findById(id);
    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    if (task.created_by.toString() !== created_by) {
      return sendError(res, 'You are not authorized to delete this task', 403);
    }

    await task.deleteOne();

    sendSuccess(res, null, 'Task deleted successfully');
  } catch (error) {
    sendError(res, 'Internal Server Error', 500, error);
  }
};