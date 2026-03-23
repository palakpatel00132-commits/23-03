import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetGroupsQuery, useAddGroupMutation, useUpdateGroupMutation, useDeleteGroupMutation, useSplitExpensesMutation, useGetUsersQuery } from '../store/apiServices';
import { toast } from 'react-toastify';
import MemberModal from '../components/MemberModal';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './Groups.scss';

function Groups() {
  const navigate = useNavigate();
  
  // RTK Query hooks
  const { data: groups = [], isLoading: isFetching } = useGetGroupsQuery();
  const { data: dbUsers = [] } = useGetUsersQuery();
  const [addGroupApi] = useAddGroupMutation();
  const [updateGroupApi] = useUpdateGroupMutation();
  const [deleteGroupApi] = useDeleteGroupMutation();
  const [splitExpensesApi] = useSplitExpensesMutation();

  // State for editing
  const [editGroupId, setEditGroupId] = useState(null); 
  
  // States for Split Modal
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [splitType, setSplitType] = useState('equal'); 
  const [manualAmounts, setManualAmounts] = useState({}); 
  
  // States for Add Member Modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Group Form Validation Schema
  const groupValidationSchema = Yup.object({
    name: Yup.string().required('Group name is required'),
    amount: Yup.number().positive('Amount must be positive').required('Total cost is required'),
    members: Yup.array().min(1, 'Select at least one member').required('Members are required'),
  });

  const groupFormik = useFormik({
    initialValues: {
      name: '',
      amount: '',
      members: []
    },
    validationSchema: groupValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editGroupId !== null) {
          // Update Logic
          await updateGroupApi({ id: editGroupId, ...values }).unwrap();
          setEditGroupId(null);
          toast.success('Group updated! 🔄');
        } else {
          // Create Logic
          await addGroupApi(values).unwrap();
          toast.success('Group created! 🚀');
        }
        resetForm();
      } catch (err) {
        toast.error(err.data?.message || 'Failed to save group ⚠️');
      }
    },
  });

  // Helper function to get user name by ID
  const getUserNameById = (userId) => {
    const user = dbUsers.find(u => (u._id || u.id) === userId);
    return user ? user.name : userId;
  };

  const toggleMemberSelection = (userId) => {
    const currentMembers = [...groupFormik.values.members];
    if (currentMembers.includes(userId)) {
      groupFormik.setFieldValue('members', currentMembers.filter(id => id !== userId));
    } else {
      groupFormik.setFieldValue('members', [...currentMembers, userId]);
    }
  };

  const editGroup = (group) => {
    setEditGroupId(group._id || group.id);
    groupFormik.setValues({
      name: group.name,
      amount: group.amount,
      members: group.members.map(m => typeof m === 'object' ? (m._id || m.id) : m)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteGroup = async (id) => {
    if (window.confirm("Do you want to delete this group?")) {
      try {
        await deleteGroupApi(id).unwrap();
        toast.info('Group deleted! 🗑️');
        if (editGroupId === id) {
          setEditGroupId(null);
          groupFormik.resetForm();
        }
      } catch (err) {
        toast.error(err.data?.message || 'Failed to delete group ⚠️');
      }
    }
  };

  const cancelEdit = () => {
    setEditGroupId(null);
    groupFormik.resetForm();
  };

  const openSplitModal = (group) => {
    setActiveGroup(group);
    
    const initialManual = {};
    const hasSplits = group.splits && group.splits.length > 0;
    
    if (hasSplits) {
      setSplitType(group.splits[0].splitType || 'equal');
      group.splits.forEach(split => {
        const userId = split.user?._id || split.user;
        initialManual[userId] = split.amount;
      });
    } else {
      setSplitType('equal');
      const equalAmount = (group.amount / (group.members?.length || 1)).toFixed(2);
      group.members.forEach(member => {
        const memberId = typeof member === 'object' ? (member._id || member.id) : member;
        initialManual[memberId] = equalAmount;
      });
    }
    
    setManualAmounts(initialManual);
    setShowSplitModal(true);
  };

  const handleManualAmountChange = (member, value) => {
    setManualAmounts({
      ...manualAmounts,
      [member]: value
    });
  };

  const handleSaveSplit = async () => {
    let finalSplitData = {};
    
    if (splitType === 'equal') {
      const equalAmount = (activeGroup.amount / activeGroup.members.length).toFixed(2);
      activeGroup.members.forEach(member => {
        const memberId = typeof member === 'object' ? (member._id || member.id) : member;
        finalSplitData[memberId] = equalAmount;
      });
    } else {
      finalSplitData = manualAmounts;
    }

    try {
      // Backend expects splits as an array of objects
      const splitsArray = Object.entries(finalSplitData).map(([memberId, amount]) => ({
        member: memberId,
        amount: Number(amount)
      }));

      await splitExpensesApi({ 
        groupId: activeGroup._id || activeGroup.id, 
        splits: splitsArray, 
        splitType 
      }).unwrap();

      setShowSplitModal(false);
      toast.success('Split details saved! 💸');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save split ⚠️');
    }
  };

  const totalManualAmount = Object.values(manualAmounts).reduce((sum, val) => sum + parseFloat(val || 0), 0);

  return (
    <div className="main-layout groups-page">
      {/* Add Member Modal */}
      <MemberModal 
        isOpen={showAddMemberModal} 
        onClose={() => setShowAddMemberModal(false)} 
      />

      {/* Split Modal */}
      {showSplitModal && activeGroup && (
        <div className="split-modal-overlay">
          <div className="split-modal">
            <h2>Split Expenses 💸</h2>
            <p>Group: <b>{activeGroup.name}</b> | Total: <b>₹{activeGroup.amount}</b></p>
            
            <div className="split-tabs">
              <button 
                className={splitType === 'equal' ? 'active' : ''}
                onClick={() => setSplitType('equal')}
              >Equal</button>
              <button 
                className={splitType === 'manual' ? 'active' : ''}
                onClick={() => setSplitType('manual')}
              >Manual</button>
            </div>

            <div className="split-list">
              {activeGroup.members.map((member, idx) => {
                const memberId = typeof member === 'object' ? (member._id || member.id) : member;
                const memberName = getUserNameById(memberId);
                const amounts = Object.values(manualAmounts).map(Number);
                const maxAmount = Math.max(...amounts);
                const isSponsor = splitType === 'manual' && Number(manualAmounts[memberId]) === maxAmount && maxAmount > 0;
                
                return (
                  <div key={idx} className="split-item">
                    <div className="member-info">
                      <span>{memberName}</span>
                      {isSponsor && <span className="sponsor-badge">SPONSOR</span>}
                    </div>
                    {splitType === 'equal' ? (
                      <span style={{ fontWeight: 'bold' }}>₹{(activeGroup.amount / activeGroup.members.length).toFixed(2)}</span>
                    ) : (
                      <div className="manual-input">
                        ₹<input 
                          type="number"
                          value={manualAmounts[memberId] || ""}
                          onChange={(e) => handleManualAmountChange(memberId, e.target.value)}
                          className={isSponsor ? 'sponsor-input' : ''}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {splitType === 'manual' && (
              <p className={`total-status ${totalManualAmount.toFixed(2) === parseFloat(activeGroup.amount).toFixed(2) ? 'matched' : 'mismatched'}`}>
                Total: ₹{totalManualAmount.toFixed(2)} / ₹{activeGroup.amount}
              </p>
            )}

            <div className="modal-actions">
              <button onClick={() => setShowSplitModal(false)} className="close-btn">Close</button>
              <button 
                disabled={splitType === 'manual' && totalManualAmount.toFixed(2) !== parseFloat(activeGroup.amount).toFixed(2)}
                onClick={handleSaveSplit}
                className="save-btn"
                style={{ opacity: (splitType === 'equal' || totalManualAmount.toFixed(2) === parseFloat(activeGroup.amount).toFixed(2)) ? 1 : 0.5 }}
              >Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="group-form-container">
        <h2>{editGroupId ? "Update Group 🔄" : "Create New Group 🚀"}</h2>
        <form onSubmit={groupFormik.handleSubmit} className="group-form">
          <div className="form-group">
            <label>Group Name:</label>
            <input 
              type="text" 
              name="name"
              placeholder="e.g. Goa Trip, Rent, Dinner" 
              value={groupFormik.values.name}
              onChange={groupFormik.handleChange}
              onBlur={groupFormik.handleBlur}
              className={groupFormik.touched.name && groupFormik.errors.name ? 'input-error' : ''}
            />
            {groupFormik.touched.name && groupFormik.errors.name && (
              <div className="error-msg">{groupFormik.errors.name}</div>
            )}
          </div>
          
          <div className="form-group">
            <label>Total Cost (₹):</label>
            <input 
              type="number" 
              name="amount"
              placeholder="0.00" 
              value={groupFormik.values.amount}
              onChange={groupFormik.handleChange}
              onBlur={groupFormik.handleBlur}
              className={groupFormik.touched.amount && groupFormik.errors.amount ? 'input-error' : ''}
            />
            {groupFormik.touched.amount && groupFormik.errors.amount && (
              <div className="error-msg">{groupFormik.errors.amount}</div>
            )}
          </div>

          <div className="form-group">
            <label>Select Members: 👥</label>
            <div className="members-grid">
              {dbUsers.map(user => {
                const userId = user._id || user.id;
                const isSelected = groupFormik.values.members.includes(userId);
                return (
                  <div 
                    key={userId} 
                    className={`member-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleMemberSelection(userId)}
                  >
                    {user.name}
                  </div>
                );
              })}
              <div 
                className="member-chip add-new"
                onClick={() => setShowAddMemberModal(true)}
              >
                + Add New
              </div>
            </div>
            {groupFormik.touched.members && groupFormik.errors.members && (
              <div className="error-msg">{groupFormik.errors.members}</div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="add-btn">
              {editGroupId ? "Update Group" : "Create Group"}
            </button>
            {editGroupId && (
              <button 
                type="button" 
                className="cancel-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <button 
          onClick={() => navigate('/')} 
          className="add-btn" 
          style={{ backgroundColor: '#282c34', marginTop: '20px', width: '100%' }}
        >
          🏠 Back to Home
        </button>
      </div>

      <div className="flow-container">
        <div className="flow-header">
          <span>Created Groups 📋</span>
        </div>
        
        {isFetching ? (
          <p>Loading groups...</p>
        ) : groups.length === 0 ? (
          <p style={{ color: '#888' }}>No groups created yet.</p>
        ) : (
          groups.map(group => (
            <div key={group._id || group.id} className="log-item" style={{ borderLeftColor: '#61dafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="log-action" style={{ color: '#61dafb', fontSize: '18px' }}>{group.name} - ₹{group.amount}</span> 
                  <span className="log-step">
                    Members: {group.members.map(m => {
                      const memberId = typeof m === 'object' ? (m._id || m.id) : m;
                      return getUserNameById(memberId);
                    }).join(", ")}
                  </span>
                  {group.splits && group.splits.length > 0 ? (
                    <div className="split-details-box">
                      <span className="split-title">
                        Split Details ({group.splits[0].splitType === 'equal' ? 'Equal' : 'Manual'}):
                      </span>
                      {group.splits.map((split) => {
                        const memberName = split.user?.name || getUserNameById(split.user?._id || split.user);
                        const amounts = group.splits.map(s => Number(s.amount));
                        const maxAmount = Math.max(...amounts);
                        const isSponsor = split.splitType === 'manual' && Number(split.amount) === maxAmount && maxAmount > 0;
                        
                        return (
                          <div key={split._id || split.id} className="split-row">
                            <span>
                              {memberName}
                              {isSponsor && <span className="sponsor-badge">SPONSOR</span>}
                            </span>
                            <span className={isSponsor ? 'sponsor-text' : ''}>₹{split.amount}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="log-step" style={{ color: '#fff', fontWeight: 'bold' }}>Per person: ₹{(group.amount / (group.members?.length || 1)).toFixed(2)} (Default)</span>
                  )}
                </div>
                <div className="group-actions">
                  <button onClick={() => openSplitModal(group)} className="split-btn">Split</button>
                  <button onClick={() => editGroup(group)} className="edit-btn">Edit</button>
                  <button onClick={() => deleteGroup(group._id || group.id)} className="delete-btn">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Groups;
