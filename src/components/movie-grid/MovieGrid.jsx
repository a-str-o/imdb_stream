import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router';

import './movie-grid.scss';

import MovieCard from '../movie-card/MovieCard';
import Button, { OutlineButton } from '../button/Button';
import Input from '../input/Input'

import tmdbApi, { category, movieType, tvType } from '../../api/tmdbApi';

const MovieGrid = props => {

    const [items, setItems] = useState([]);

    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);

    const { keyword } = useParams();
    const [genreId, setGenreId] = useState(null);
    const [minRating, setMinRating] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const genreParam = urlParams.get('genre');
        const ratingParam = urlParams.get('rating');
        setGenreId(genreParam ? parseInt(genreParam) : null);
        setMinRating(ratingParam ? parseFloat(ratingParam) : null);
    }, []);

    useEffect(() => {
        const getList = async () => {
            let response = null;
            if (keyword === undefined) {
                const params = {};
                if (genreId) {
                    params.with_genres = genreId;
                }
                if (minRating) {
                    params['vote_average.gte'] = minRating;
                }
                if (genreId || minRating) {
                    response = await tmdbApi.discover(props.category, {params});
                } else {
                    switch(props.category) {
                        case category.movie:
                            response = await tmdbApi.getMoviesList(movieType.upcoming, {params});
                            break;
                        default:
                            response = await tmdbApi.getTvList(tvType.popular, {params});
                    }
                }
            } else {
                const params = {
                    query: keyword
                };
                if (genreId) {
                    params.with_genres = genreId;
                }
                if (minRating) {
                    params['vote_average.gte'] = minRating;
                }
                response = await tmdbApi.search(props.category, {params});
            }
            setItems(response.results);
            setTotalPage(response.total_pages);
        }
        getList();
    }, [props.category, keyword, genreId, minRating]);

    const loadMore = async () => {
        let response = null;
        if (keyword === undefined) {
            const params = {
                page: page + 1
            };
            if (genreId) {
                params.with_genres = genreId;
            }
            if (minRating) {
                params['vote_average.gte'] = minRating;
            }
            if (genreId || minRating) {
                response = await tmdbApi.discover(props.category, {params});
            } else {
                switch(props.category) {
                    case category.movie:
                        response = await tmdbApi.getMoviesList(movieType.upcoming, {params});
                        break;
                    default:
                        response = await tmdbApi.getTvList(tvType.popular, {params});
                }
            }
        } else {
            const params = {
                page: page + 1,
                query: keyword
            };
            if (genreId) {
                params.with_genres = genreId;
            }
            if (minRating) {
                params['vote_average.gte'] = minRating;
            }
            response = await tmdbApi.search(props.category, {params});
        }
        setItems([...items, ...response.results]);
        setPage(page + 1);
    }

    return (
        <>
            <div className="section mb-3">
                <MovieSearch category={props.category} keyword={keyword} genreId={genreId} setGenreId={setGenreId} minRating={minRating} setMinRating={setMinRating}/>
            </div>
            <div className="movie-grid">
                {
                    items.map((item, i) => <MovieCard category={props.category} item={item} key={i}/>)
                }
            </div>
            {
                page < totalPage ? (
                    <div className="movie-grid__loadmore">
                        <OutlineButton className="small" onClick={loadMore}>Load more</OutlineButton>
                    </div>
                ) : null
            }
        </>
    );
}

const MovieSearch = props => {

    const history = useHistory();

    const [keyword, setKeyword] = useState(props.keyword ? props.keyword : '');
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        const fetchGenres = async () => {
            const response = await tmdbApi.getGenres(props.category);
            setGenres(response.genres);
        };
        fetchGenres();
    }, [props.category]);

    const goToSearch = useCallback(
        () => {
            if (keyword.trim().length > 0) {
                const url = `/${category[props.category]}/search/${keyword}`;
                const params = new URLSearchParams();
                if (props.genreId) params.append('genre', props.genreId);
                if (props.minRating) params.append('rating', props.minRating);
                history.push(params.toString() ? `${url}?${params.toString()}` : url);
            }
        },
        [keyword, props.category, history, props.genreId, props.minRating]
    );

    useEffect(() => {
        const enterEvent = (e) => {
            e.preventDefault();
            if (e.keyCode === 13) {
                goToSearch();
            }
        }
        document.addEventListener('keyup', enterEvent);
        return () => {
            document.removeEventListener('keyup', enterEvent);
        };
    }, [keyword, goToSearch]);

    const handleGenreChange = (e) => {
        const value = e.target.value;
        props.setGenreId(value ? parseInt(value) : null);
    };

    const handleRatingChange = (e) => {
        const value = e.target.value;
        props.setMinRating(value ? parseFloat(value) : null);
    };

    const ratingOptions = [
        { value: '', label: 'All Ratings' },
        { value: '9', label: '9+ Stars' },
        { value: '8', label: '8+ Stars' },
        { value: '7', label: '7+ Stars' },
        { value: '6', label: '6+ Stars' },
        { value: '5', label: '5+ Stars' },
        { value: '4', label: '4+ Stars' }
    ];

    return (
        <div className="movie-search">
            <Input
                type="text"
                placeholder="Enter keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
            />
            <Button className="small" onClick={goToSearch}>Search</Button>
            <div className="movie-search__filters">
                <div className="movie-search__filter">
                    <select 
                        value={props.genreId || ''} 
                        onChange={handleGenreChange}
                        className="movie-search__filter-select"
                    >
                        <option value="">All Genres</option>
                        {genres.map((genre, i) => (
                            <option key={i} value={genre.id}>{genre.name}</option>
                        ))}
                    </select>
                </div>
                <div className="movie-search__filter">
                    <select 
                        value={props.minRating || ''} 
                        onChange={handleRatingChange}
                        className="movie-search__filter-select"
                    >
                        {ratingOptions.map((option, i) => (
                            <option key={i} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}

export default MovieGrid;
