import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GlobalView from './views/GlobalView';
import GlobalHistoryView from './views/GlobalHistoryView';
import CountryView from './views/CountryView';
import NotFoundView from './views/NotFoundView';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="content">
        <Routes>
          <Route path="/" element={<GlobalView />} />
          <Route path="/history" element={<GlobalHistoryView />} />
          <Route path="/country/:countryId" element={<CountryView />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;