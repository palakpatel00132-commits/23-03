import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../store/apiServices';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './Auth.scss';

function Register() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

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
    onSubmit: async (values) => {
      try {
        await register(values).unwrap();
        toast.success('Registration successful! 🎉 Please login.');
        navigate('/login');
      } catch (err) {
        toast.error(err.data?.message || 'Registration failed ⚠️');
      }
    },
  });

  return (
    <div className="auth-page">
      <h2>Create New Account 👤</h2>
      
      <form className="auth-form" onSubmit={formik.handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            placeholder="Enter your name"
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
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="e.g. rahul@gmail.com"
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
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            placeholder="Set a strong password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={formik.touched.password && formik.errors.password ? 'input-error' : ''}
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="error-msg">{formik.errors.password}</div>
          ) : null}
        </div>

        <button type="submit" className="auth-btn" disabled={isLoading || formik.isSubmitting}>
          {isLoading || formik.isSubmitting ? 'Processing...' : 'Register Now 🚀'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Login here</Link>
      </div>
    </div>
  );
}

export default Register;
