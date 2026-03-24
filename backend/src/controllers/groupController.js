import { models } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { BaseController } from './baseController.js';

const { Group, Split } = models;

class GroupController extends BaseController {
  constructor() {
    super(Group, 'Group');
  }

  // Override create to add created_by
  create = async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, members, amount } = req.body;
      
      const groupData = {
        name,
        members,
        amount: amount || 0,
        created_by: userId,
      };

      const group = new Group(groupData);
      await group.save();
      
      return sendSuccess(res, group, 'Group created successfully', 201);
    } catch (error) {
      console.error('Error creating group:', error);
      return sendError(res, 'Error creating group', 500, error);
    }
  };

  // Override getAll for custom filtering and population
  getAll = async (req, res) => {
    try {
      const userId = req.user.id;
      
      const groups = await Group.find({
        $or: [
          { created_by: userId },
          { members: userId }
        ]
      }).populate('members').lean();
      
      const groupsWithSplits = await Promise.all(groups.map(async (group) => {
        const splits = await Split.find({ group: group._id }).populate('user');
        return { ...group, splits };
      }));

      return sendSuccess(res, groupsWithSplits, 'Groups fetched successfully');
    } catch (error) {
      return sendError(res, 'Error fetching groups', 500, error);
    }
  };

  // Override delete to handle ownership
  delete = async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const group = await Group.findById(id);
      if (!group) {
        return sendError(res, 'Group not found', 404);
      }
      
      if (group.created_by.toString() !== userId) {
        return sendError(res, 'You are not authorized to delete this group', 403);
      }
      
      await Group.findByIdAndDelete(id);
      return sendSuccess(res, null, 'Group deleted successfully');
    } catch (error) {
      return sendError(res, 'Error deleting group', 500, error);
    }
  };

  // Override update to handle ownership
  update = async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { name, members, amount } = req.body;

      const group = await Group.findById(id);
      if (!group) {
        return sendError(res, 'Group not found', 404);
      }
      
      if (group.created_by.toString() !== userId) {
        return sendError(res, 'You are not authorized to update this group', 403);
      }

      const updatedGroup = await Group.findByIdAndUpdate(id, {
        name,
        members,
        amount: amount || 0,
      }, { new: true });
      
      return sendSuccess(res, updatedGroup, 'Group updated successfully');
    } catch (error) {
      return sendError(res, 'Error updating group', 500, error);
    }
  };

  // Custom method for split expenses
  splitExpenses = async (req, res) => {
    try {
      const { groupId, splits, splitType } = req.body;

      await Split.deleteMany({ group: groupId });

      const splitPromises = splits.map(item => {
        const splitEntry = new Split({
          group: groupId,
          user: item.member || item.userId,
          amount: item.amount,
          splitType: splitType,
        });
        return splitEntry.save();
      });

      await Promise.all(splitPromises);
      return sendSuccess(res, null, 'Expenses split successfully');
    } catch (error) {
      return sendError(res, 'Error splitting expenses', 500, error);
    }
  };
}

const groupController = new GroupController();

export default groupController;

export const createGroup = groupController.create;
export const getGroups = groupController.getAll;
export const deleteGroup = groupController.delete;
export const updateGroup = groupController.update;
export const splitExpenses = groupController.splitExpenses;
