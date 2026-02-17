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
  pageId: number;
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

  const controllerRef = useRef<AbortController | null>(null);

  let fetchResults = async () => {
    if (!debounceQuery.trim() || debounceQuery.length < MIN_LENGTH) {
      setResult([]);
      return;
    }

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
  // Memoize the function
  fetchResults = useCallback(fetchResults, [debounceQuery]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  let content: React.ReactNode = "";

  content = useMemo(
    () => (
      <ul>
        {result.map((item) => (
          <li key={item.pageId}>{item.title}</li>
        ))}
      </ul>
    ),
    [result],
  );

  if (loading) {
    content = <p>Loading...</p>;
  }

  if (error) {
    content = <p>{error}</p>;
  }

  if (
    !loading &&
    !error &&
    debounceQuery.length >= MIN_LENGTH &&
    result.length === 0
  ) {
    content = <p className="text-muted">No Results found.</p>;
  }

  return (
    <div>
      <input type="text" value={query} onChange={handleChange} />
      <br />
      {content}
    </div>
  );
};

export default Search;
