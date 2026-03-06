import Router from 'preact-router';
import { BlogList } from './components/BlogList.js';
import { BlogDetail } from './components/BlogDetail.js';

export function App() {
  return (
    <Router>
      <BlogList path="/" />
      <BlogDetail path="/blogs/:id" />
    </Router>
  );
}
