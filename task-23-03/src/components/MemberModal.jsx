import { useRegisterMutation } from '../store/apiServices';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function MemberModal({ isOpen, onClose }) {
  const [registerMemberApi, { isLoading: isRegistering }] = useRegisterMutation();

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name is too short')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await registerMemberApi(values).unwrap();
        toast.success('Member registered successfully! 🎉');
        resetForm();
        onClose();
      } catch (err) {
        toast.error(err.data?.message || 'Failed to register member ⚠️');
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="split-modal-overlay">
      <div className="split-modal auth-modal">
        <h2>Add New Member 👤</h2>
        <form onSubmit={formik.handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Name:</label>
            <input 
              type="text" 
              name="name" 
              placeholder="Enter name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.name && formik.errors.name ? 'input-error' : ''}
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="error-msg">{formik.errors.name}</div>
            ) : null}
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              name="email" 
              placeholder="Enter email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.email && formik.errors.email ? 'input-error' : ''}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="error-msg">{formik.errors.email}</div>
            ) : null}
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Set password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.password && formik.errors.password ? 'input-error' : ''}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="error-msg">{formik.errors.password}</div>
            ) : null}
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => { formik.resetForm(); onClose(); }} className="close-btn">Cancel</button>
            <button type="submit" className="save-btn" disabled={isRegistering || formik.isSubmitting}>
              {isRegistering || formik.isSubmitting ? 'Adding...' : 'Add Member 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MemberModal;
