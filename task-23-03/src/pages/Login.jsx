import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLoginStatus } from '../store/globalSlice';
import { useLoginMutation } from '../store/apiServices';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './Auth.scss';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginApi, { isLoading }] = useLoginMutation();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const data = await loginApi(values).unwrap();
        const accessToken = data?.accessToken;
        const refreshToken = data?.refreshToken;

        if (accessToken) {
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          dispatch(setLoginStatus({ status: true, name: data?.user?.name || '' }));
          toast.success('Login successful! 🎉');
          navigate('/');
        } else {
          throw new Error('Token not found in response');
        }
      } catch (err) {
        const errorMsg = err.data?.message || 'Invalid email or password ⚠️';
        toast.error(errorMsg);
      }
    },
  });

  return (
    <div className="auth-page">
      <h2>Login 🔑</h2>
      
      <form className="auth-form" onSubmit={formik.handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="Enter your email"
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
            placeholder="Enter your password"
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
          {isLoading || formik.isSubmitting ? 'Processing...' : 'Login Now 🚀'}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account? <Link to="/register">Create new</Link>
      </div>
    </div>
  );
}

export default Login;
