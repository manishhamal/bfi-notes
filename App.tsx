import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleReader from './pages/ArticleReader';
import About from './pages/About';
import Authors from './pages/Authors';
import SubjectCategoryHub from './pages/subjects/SubjectCategoryHub';
import SubjectKindTopics from './pages/subjects/SubjectKindTopics';
import SubjectKindList from './pages/subjects/SubjectKindList';
import { AuthProvider } from './components/AuthProvider';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Editor from './pages/admin/Editor';
import TranslationHelper from './pages/admin/TranslationHelper';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="articles" element={<Articles />} />
            <Route path="authors" element={<Authors />} />
            <Route path="about" element={<About />} />
            <Route path="subjects/:category" element={<SubjectCategoryHub />} />
            <Route path="subjects/:category/:kind" element={<SubjectKindTopics />} />
            <Route path="subjects/:category/:kind/:topic" element={<SubjectKindList />} />
          </Route>
          <Route path="articles/:id" element={<ArticleReader />} />
          
          {/* Login */}
          <Route path="login" element={<Login />} />

          {/* Protected Admin routes */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="editor" element={<Editor />} />
            <Route path="translation-helper" element={<TranslationHelper />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
