import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import Explore from './pages/Explore';
import PostDetails from './pages/PostDetails';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Categories from './pages/Categories';
import SavedArticles from './pages/SavedArticles';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/common/ScrollToTop';
import AdminRoute from './components/common/AdminRoute';
import Admin from './pages/Admin';

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="categories" element={<Categories />} />
          <Route path="explore" element={<Explore />} />
          <Route 
            path="posts/create" 
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } 
          />
          <Route path="posts/:id" element={<PostDetails />} />
          <Route 
            path="posts/:id/edit" 
            element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            } 
          />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="saved" 
            element={
              <ProtectedRoute>
                <SavedArticles />
              </ProtectedRoute>
            } 
          />
          <Route path="users/:id" element={<UserProfile />} />
          <Route 
            path="admin" 
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
