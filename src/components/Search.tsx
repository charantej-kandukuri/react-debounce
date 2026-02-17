import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "../api/axios";
import useDebounce from "../hooks/useDebounce";

interface WikiResult {
  pageid: number;
  title: string;
  snippet: string;
}

interface WikiReponse {
  query: {
    search: WikiResult[];
  };
}

const Search = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<WikiResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const MIN_LENGTH = 2;

  const debounceQuery = useDebounce(query, 500);

  // ✅ useRef
  const controllerRef = useRef<AbortController | null>(null);

  let fetchResults = async () => {
    if (!debounceQuery.trim() || debounceQuery.length < MIN_LENGTH) {
      setResult([]);
      return;
    }
    // ⚠️ abort the previous api call to avoid race condition
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      const response = await api.get<WikiReponse>("", {
        params: {
          action: "query",
          list: "search",
          format: "json",
          origin: "*",
          srsearch: debounceQuery,
        },
      });

      setResult(response.data.query.search);
    } catch (err) {
      setError(`Failed to fetch the results ${err}`);
    } finally {
      setLoading(false);
    }
  };
  // ✅ Memoize the function
  fetchResults = useCallback(fetchResults, [debounceQuery]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // ✅ useMemo
  const renderResults = useMemo(() => {
    return result.map((item) => (
      <li key={item.pageid} className="list-group-item">
        <h6>{item.title}</h6>
        <p
          dangerouslySetInnerHTML={{ __html: item.snippet }}
          className="mb-0 small"
        ></p>
      </li>
    ));
  }, [result]); // ⚠️ remember render should happen only when the result changes.

  return (
    <div>
      <input
        type="text"
        value={query}
        placeholder="Search Wikipedia..."
        onChange={handleChange}
      />
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <ul className="list-group">{renderResults}</ul>
    </div>
  );
};

export default Search;
