import { sendSuccess, sendError } from '../utils/responseHandler.js';

export class BaseController {
  constructor(model, resourceName) {
    this.model = model;
    this.resourceName = resourceName;
  }

  // Create
  create = async (req, res) => {
    try {
      const item = new this.model(req.body);
      await item.save();
      return sendSuccess(res, item, `${this.resourceName} created successfully`, 201);
    } catch (error) {
      return sendError(res, `Error creating ${this.resourceName}`, 500, error);
    }
  };

  // Get All
  getAll = async (req, res) => {
    try {
      const items = await this.model.find();
      return sendSuccess(res, items, `${this.resourceName}s fetched successfully`);
    } catch (error) {
      return sendError(res, `Error fetching ${this.resourceName}s`, 500, error);
    }
  };

  // Get By ID
  getById = async (req, res) => {
    try {
      const item = await this.model.findById(req.params.id);
      if (!item) {
        return sendError(res, `${this.resourceName} not found`, 404);
      }
      return sendSuccess(res, item, `${this.resourceName} fetched successfully`);
    } catch (error) {
      return sendError(res, `Error fetching ${this.resourceName}`, 500, error);
    }
  };

  // Update
  update = async (req, res) => {
    try {
      const item = await this.model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item) {
        return sendError(res, `${this.resourceName} not found`, 404);
      }
      return sendSuccess(res, item, `${this.resourceName} updated successfully`);
    } catch (error) {
      return sendError(res, `Error updating ${this.resourceName}`, 500, error);
    }
  };

  // Delete
  delete = async (req, res) => {
    try {
      const item = await this.model.findByIdAndDelete(req.params.id);
      if (!item) {
        return sendError(res, `${this.resourceName} not found`, 404);
      }
      return sendSuccess(res, null, `${this.resourceName} deleted successfully`);
    } catch (error) {
      return sendError(res, `Error deleting ${this.resourceName}`, 500, error);
    }
  };
}
