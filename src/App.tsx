import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Practice from './pages/Practice';
import WrongReview from './pages/WrongReview';
import Exam from './pages/Exam';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="practice" element={<Practice />} />
          <Route path="wrong" element={<WrongReview />} />
          <Route path="exam" element={<Exam />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
