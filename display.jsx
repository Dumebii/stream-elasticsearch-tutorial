import React, { useState } from 'react';
import axios from 'axios';

function MessageSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const res = await axios.get('/search-messages', { params: { query } });
      setResults(res.data.results);
    } catch (error) {
      console.error('Error searching messages:', error);
    }
  };

  return (
    <div>
      <h2>Search Chat Messages</h2>
      <input
        type="text"
        placeholder="Enter search text..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <ul>
        {results.map(item => (
          <li key={item.id}>
            <strong>{item.user_id}:</strong> {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MessageSearch;
