import React, { useState, useEffect } from 'react';

import MoviesList from './components/MoviesList';
import './App.css';

function App ()
{
  const [ movies, setMovies ] = useState ( [] );
  const [ isLoading, setIsLoading ] = useState ( false );
  const [ error, setError ] = useState ( null );
  const [ retrying, setRetrying ] = useState ( false );
  const [ intervalId, setIntervalId ] = useState ( null );

  useEffect (
    () => {
      return () => {
        if ( intervalId )
          {
          clearInterval ( intervalId );
        }
      };
    }, [ intervalId ] 
  );

  async function fetchMoviesHandler ()
  {
    setIsLoading ( true );
    setError ( null );

    try
    {
      const response = await fetch ( "https://swapi.dev/api/film" );

      if ( !response.ok )
      {
        throw new Error ( "Something Went Wrong... Retrying" )
      }

      const data = await response.json ();

      const transformedMovies = data.results.map (
        ( movie ) => {
          return {
            id: movie.episode_id,
            title: movie.title,
            openingText: movie.opening_crawl,
            releaseDate: movie.release_date,
          };
        }
      );

      setMovies ( transformedMovies );

      setRetrying ( false );

      if ( intervalId )
      {
        clearInterval ( intervalId );
        setIntervalId ( null );
      }
    }

    catch ( error )
    {
      setError ( error.message );
      setRetrying ( true );
      if ( !intervalId )
      {
        const id = setInterval ( fetchMoviesHandler, 5000 );
        setIntervalId ( id );
      }
    }
    
    setIsLoading ( false );
  }

  function cancelRetryHandler ()
  {
    if ( intervalId )
    {
      clearInterval ( intervalId );
      setIntervalId ( null );
    }
    setRetrying ( false );
    setError ( "Retrying canceled by user." );
  }

  let content = <p> No Movies Found. Click Fetch !! </p>;

  if ( movies.length > 0 )
  {
    content = <MoviesList movies = { movies } />
  }

  if ( error )
  {
    content = <p> { error } </p>
  }

  if ( isLoading )
  {
    content = <p> Loading... </p>
  }

  return (
    <React.Fragment>
      <section>
        <button onClick = { fetchMoviesHandler } > Fetch Movies </button>
      </section>

      <section>
        { content }
        { retrying && <button onClick = { cancelRetryHandler } > Cancel Retry </button> }
      </section>
    </React.Fragment>
  );
}

export default App;