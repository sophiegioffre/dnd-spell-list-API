const Pagination = ({ items, pageSize, onPageChange }) => {
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num + 1);
  
  const list = pages.map((page) => {
    return (
      <button type="button" className="btn btn-outline-dark" key={page} onClick={onPageChange}>
        {page}
      </button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      console.log('fetching data...');
      dispatch({type: 'FETCH_INIT'});
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({type: 'FETCH_SUCCESS', payload: result.data});
        }
      } catch (error) {
        if (didCancel) {
          dispatch({type: 'FETCH_FAILURE'});
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, []);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

// App that gets data from url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    'https://api.open5e.com/spells/',
    {
      results: []
    }
  );
  console.log(`data:`);
  console.log(data);
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.results;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
  }
  return (
    <Fragment>
      {isLoading ? (
        <div>Loading ...</div>
      ) : (

        <ul className="list-group">
          {page.map((item) => (
            <li className="list-group-item" key={item.objectID}>
              <h3 className="spell-name">{item.name}</h3>
              <h6 className="spell-description">{item.desc}</h6>
              <p className="details">{item.school} | Spell Components: ({item.components}) {item.material}</p>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        items={data.results}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById('root'));
