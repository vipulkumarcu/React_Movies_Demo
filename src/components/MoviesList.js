import React from 'react';

import Movie from './Movie';
import classes from './MoviesList.module.css';

function MovieList ( props )
{
  return (
    <ul className = { classes[ 'movies-list' ] }>
      {
        props.movies.map (
          ( movie ) => (
            <li key = { movie.id }>
              <Movie
                title = { movie.title }
                releaseDate = { movie.releaseDate }
                openingText = { movie.openingText }
              />
              <button onClick = { () => props.onDelete ( movie.id ) }> Delete </button>
            </li>
          )
        )
      }
    </ul>
  );
}

export default MovieList;