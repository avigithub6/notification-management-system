function Header({ title, description }) {
  return (
    <header className="header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="header-actions">
        <div className="connection-status">
          <span className="connection-dot" />
          Connected
        </div>

        <div className="user-avatar">A</div>
      </div>
    </header>
  );
}

export default Header;
