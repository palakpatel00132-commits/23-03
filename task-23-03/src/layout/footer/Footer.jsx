import './Footer.scss';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-info">
          <h3>TaskMaster</h3>
          <p>Organize your tasks and groups efficiently. 🚀</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/tasks">Tasks</a></li>
            <li><a href="/groups">Groups</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Support</h4>
          <p>Email: help@taskmaster.com</p>
          <div className="social-icons">
            <span>🌐</span>
            <span>🐦</span>
            <span>📸</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} TaskMaster App. Made with ❤️ in India. જય શ્રી કૃષ્ણ 🤍</p>
      </div>
    </footer>
  );
}

export default Footer;