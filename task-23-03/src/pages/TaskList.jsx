import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { addLog as addLogToStore, clearLogs } from '../store/globalSlice'
import { useGetTasksQuery, useAddTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from '../store/apiServices'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import './TaskList.scss'

const generateId = () => Date.now();
const getTimeString = () => new Date().toLocaleTimeString();

function TaskList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // RTK Query hooks
  const { data: tasks = [], isLoading: isFetching } = useGetTasksQuery();
  const [addTaskApi] = useAddTaskMutation();
  const [updateTaskApi] = useUpdateTaskMutation();
  const [deleteTaskApi] = useDeleteTaskMutation();

  const logs = useSelector(state => state.global.logs);

  const [editId, setEditId] = useState(null);

  const formik = useFormik({
    initialValues: {
      title: ''
    },
    validationSchema: Yup.object({
      title: Yup.string().trim().required('Task title is required')
    }),
    onSubmit: async (values, { resetForm }) => {
      const now = generateId();
      const timeStr = getTimeString();
      
      try {
        if (editId !== null) {
          // Update Logic
          await updateTaskApi({ id: editId, title: values.title }).unwrap();
          setEditId(null);
          toast.success('Task updated successfully! 🔄');
          addLog("Update Task", [
            `Searching for ID ${editId}...`,
            `New value: "${values.title}"`,
            "API Call (PUT) success",
            "RTK Query cache invalidated"
          ], now, timeStr);
        } else {
          // Add Logic
          await addTaskApi({ title: values.title }).unwrap();
          toast.success('New task added! 🚀');
          addLog("Add Task", [
            `New task: "${values.title}"`,
            "API Call (POST) success",
            "RTK Query cache invalidated"
          ], now, timeStr);
        }
        resetForm();
      } catch (err) {
        toast.error(err.data?.message || 'Failed to process task ⚠️');
        console.error('Task action failed:', err);
      }
    },
  });

  // લોગ ઉમેરવા માટેનું ફંક્શન
  const addLog = (action, steps, providedId, providedTime) => {
    const timestamp = providedId || generateId();
    const timeString = providedTime || getTimeString();
    dispatch(addLogToStore({
      id: timestamp,
      action: action,
      steps: steps,
      time: timeString
    }));
  };

  const editTask = (id, title) => { 
    setEditId(id);
    formik.setFieldValue('title', title);
    addLog("Edit Mode", [`ID ${id}  selected`, "Value set in input box", "UI switched to edit mode"], generateId(), getTimeString());
  };

  const deleteTask = async (id) => {
    const taskToDelete = tasks.find(t => t.id === id || t._id === id);
    const now = generateId();
    const timeStr = getTimeString();

    try {
      await deleteTaskApi(id).unwrap();
      toast.info('Task deleted! 🗑️');
      addLog("Delete Task", [
        `Searching for task "${taskToDelete?.title}"...`,
        "API Call (DELETE) success",
        "RTK Query cache invalidated"
      ], now, timeStr);
      if (editId === id) {
        setEditId(null);
        formik.resetForm();
      }
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete task ⚠️');
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="main-layout">
      {/* Left Side: Task List UI */}
      <div className="app-container">
        <h1>My Task List 📝</h1>
        
        <form onSubmit={formik.handleSubmit} className="input-container">
          <input 
            type="text" 
            name="title"
            placeholder="Write a task..." 
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            onKeyPress={(e) => e.key === 'Enter' && formik.handleSubmit()}
          />
          <button type="submit" className={`add-btn ${editId !== null ? 'update-btn' : ''}`}>
            {editId !== null ? 'Update' : 'Add'}
          </button>
          {editId !== null && (
            <button type="button" className="cancel-btn" onClick={() => { setEditId(null); formik.resetForm(); }}>Cancel</button>
          )}
        </form>
        {formik.touched.title && formik.errors.title && (
          <div className="error-msg">{formik.errors.title}</div>
        )}

        {isFetching ? (
          <p>Loading tasks...</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task._id || task.id} className="task-item">
                <span className="task-text">{task.title}</span>
                <div className="btn-group">
                  <button className="edit-btn" onClick={() => editTask(task._id || task.id, task.title)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteTask(task._id || task.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tasks.length === 0 && !isFetching && <p>No tasks yet. Add a new one! 😊</p>}

        <div className="back-btn-container">
          <button 
            onClick={() => navigate('/')} 
            className="add-btn"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>

      {/* Right Side: Flow Visualization */}
      <div className="flow-container">
        <div className="flow-header">
          <span>React Process Flow (RTK Query) ⚡</span>
          <button onClick={() => dispatch(clearLogs())}>Clear</button>
        </div>
        
        {logs.length === 0 ? (
          <p style={{ color: '#888' }}>Process will be shown here when you take an action...</p>
        ) : (
          logs.map(log => (
            <div key={log.id} className="log-item">
              <span className="log-action">[{log.time}] {log.action}</span>
              {log.steps.map((step, index) => (
                <span key={index} className="log-step">➔ {step}</span>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TaskList;
