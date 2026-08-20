import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="container footer-content">
        <div className="footer-brand">
          <span className="brand-name">DevBlog</span>
          <p className="brand-desc">A premium platform for developers to share insights, tutorials, and stories.</p>
        </div>
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} DevBlog. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
