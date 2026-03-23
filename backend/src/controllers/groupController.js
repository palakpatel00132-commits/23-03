import { models } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
const { Group, Split } = models;

export const createGroup = async (req, res) => {
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

export const getGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // એવા બધા ગ્રુપ્સ શોધો જેમાં યુઝર પોતે મેમ્બર હોય અથવા પોતે બનાવ્યા હોય
    const groups = await Group.find({
      $or: [
        { created_by: userId },
        { members: userId }
      ]
    }).populate('members').lean();
    
    // દરેક ગ્રુપ માટે તેના સ્પ્લિટ્સ (splits) પણ ફેચ કરીએ
    const groupsWithSplits = await Promise.all(groups.map(async (group) => {
      const splits = await Split.find({ group: group._id }).populate('user');
      return { ...group, splits };
    }));

    return sendSuccess(res, groupsWithSplits, 'Groups fetched successfully');
  } catch (error) {
    return sendError(res, 'Error fetching groups', 500, error);
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await Group.findByIdAndDelete(id, { created_by: userId });
    return sendSuccess(res, null, 'Group deleted successfully');
  } catch (error) {
    return sendError(res, 'Error deleting group', 500, error);
  }
};

export const updateGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, members } = req.body;

    const group = await Group.findByIdAndUpdate(id, {
      name,
      members,
    }, { created_by: userId });
    return sendSuccess(res, group, 'Group updated successfully');
  } catch (error) {
    return sendError(res, 'Error updating group', 500, error);
  }
};

export const splitExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, splits, splitType } = req.body;

    // પહેલા જૂના સ્પ્લિટ ડિલીટ કરીએ જેથી નવો ડેટા જ રહે
    await Split.deleteMany({ group: groupId });

    // દરેક મેમ્બર માટે સ્પ્લિટ ડેટા સેવ કરીએ
    const splitPromises = splits.map(item => {
      const splitEntry = new Split({
        group: groupId,
        user: item.member || item.userId, // user's request uses 'member'
        amount: item.amount,
        splitType: splitType,
      });
      return splitEntry.save();
    });

    const savedSplits = await Promise.all(splitPromises);

    // ગ્રુપમાં ટોટલ અમાઉન્ટ પણ અપડેટ કરી દઈએ
    const totalAmount = splits.reduce((sum, item) => sum + Number(item.amount), 0);
    await Group.findByIdAndUpdate(groupId, { amount: totalAmount }, { created_by: userId });

    return sendSuccess(res, savedSplits, 'સ્પ્લિટ ડેટા સેવ થઈ ગયો! ✅');
  } catch (error) {
    return sendError(res, 'Error saving split', 500, error);
  }
};



export default{
    createGroup,
    getGroups,
    deleteGroup,
    updateGroup,
    splitExpenses
}
