import './Home.scss';

function Home() {
  return (
    <div className="app-container home-container">
      <h1>Welcome to My App! 🏠</h1>
      <a href="/tasks" className="nav-link">View Task List ➡️</a>
    </div>
  );
}

export default Home;
