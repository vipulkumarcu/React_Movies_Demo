import React, { useState, useEffect, useCallback } from 'react';

import MoviesList from './components/MoviesList';
import AddMovie from "./components/AddMovie";
import './App.css';

function App ()
{
  const [ movies, setMovies ] = useState ( [] );
  const [ isLoading, setIsLoading ] = useState ( false );
  const [ error, setError ] = useState ( null );
  const [ retrying, setRetrying ] = useState ( false );
  const [ intervalId, setIntervalId ] = useState ( null );

  const fetchMoviesHandler = useCallback (
    async () =>
    {
      setIsLoading ( true );
      setError ( null );

      try
      {
        // const response = await fetch ( "https://swapi.dev/api/films" );

        const response = await fetch ( "https://react-movies-demo-d927f-default-rtdb.firebaseio.com/movies.json" );

        if ( !response.ok )
        {
          throw new Error ( "Something Went Wrong... Retrying" )
        }

        const data = await response.json ();

        const loadedMovies = [];

        for ( const key in data )
        {
          loadedMovies.push (
            {
              id: key,
              title: data[key].title,
              openingText: data[key].openingText,
              releaseDate: data[key].releaseDate,
            }
          )
        }

        // const transformedMovies = data.results.map (
        //   ( movie ) => {
        //     return {
        //       id: movie.episode_id,
        //       title: movie.title,
        //       openingText: movie.opening_crawl,
        //       releaseDate: movie.release_date,
        //     };
        //   }
        // );

        setMovies ( loadedMovies );

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
    },
    [ intervalId ]
  );

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

  useEffect (
    () => {
      fetchMoviesHandler ();

      return () => {
        if ( intervalId )
        {
          clearInterval ( intervalId );
        }
      };
    }, [ fetchMoviesHandler, intervalId ]
  );

  async function addMovieHandler ( movie )
  {
    const response = await fetch ( "https://react-movies-demo-d927f-default-rtdb.firebaseio.com/movies.json",
      {
        method: "POST",
        body: JSON.stringify ( movie ),
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if ( response.ok )
    {
      fetchMoviesHandler ();
    }
    
    else
    {
      throw new Error ( 'Failed to add movie' );
    }
  }

  async function deleteMovieHandler ( id )
  {
    const response = await fetch ( `https://react-movies-demo-d927f-default-rtdb.firebaseio.com/movies/${id}.json`,
      {
        method: 'DELETE',
      }
    );

    if ( !response.ok )
    {
      throw new Error ( 'Could not delete movie.' );
    }

    setMovies ( ( prevMovies ) => prevMovies.filter ( ( movie ) => movie.id !== id ) );

    if ( response.ok )
    {
      fetchMoviesHandler ();
    }
    
    else
    {
      throw new Error ( 'Failed to delete movie' );
    }
  };

  let content = <p> No Movies Found. Click Fetch !! </p>;

  if ( movies.length > 0 )
  {
    content = <MoviesList movies = { movies } onDelete = { deleteMovieHandler } />
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
        <AddMovie onAddMovie = { addMovieHandler } />
      </section>

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