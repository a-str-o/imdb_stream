import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import tmdbApi from '../../api/tmdbApi';
import apiConfig from '../../api/apiConfig';

import './detail.scss';
import CastList from './CastList';
import VideoList from './VideoList';

import MovieList from '../../components/movie-list/MovieList';

const Detail = () => {

    const { category, id } = useParams();
    const [numberSe, setnumberSe] = useState(1)
    const [numberEp, setNumberEp] = useState(1)
    const [item, setItem] = useState(null);

    useEffect(() => {
        const getDetail = async () => {
            const response = await tmdbApi.detail(category, id, {params:{}});
            setItem(response);
            window.scrollTo(0,0);
            
        }
        getDetail();
    }, [category, id]);
    
    return (
        <>
            {
                item && (
                    <>
                    {console.log(item)}
                        <div className="banner" style={{backgroundImage: `url(${apiConfig.originalImage(item.backdrop_path || item.poster_path)})`}}></div>
                        <div className="mb-3 movie-content container">
                            <div className="movie-content__poster">
                                <div className="movie-content__poster__img" 
                                style={{backgroundImage: `url(${apiConfig.originalImage(item.poster_path || item.backdrop_path)})`}}></div>
                            </div>
                            <div className="movie-content__info">
                                <h1 className="title">
                                    {item.title || item.name}
                                </h1>
                                <div className="genres">
                                    {
                                        item.genres && item.genres.slice(0, 5).map((genre, i) => (
                                            <span key={i} className="genres__item">{genre.name}</span>
                                        ))
                                    }
                                </div>
                               
                                <p className="overview">{item.overview}</p>
                                <div className="cast">
                                    <div className="section__header">
                                        <h2>Casts</h2>
                                    </div>
                                    <CastList id={item.id}/>
                                </div>
                            </div>
                        </div>
                        <div className="container">
                            <div className="section mb-3">
                                <VideoList id={item.id}/>
                            </div>
                            <div className="section mb-3">
                                <h2>Watch :</h2>
                                {
                                    category === "movie" ?
                                        <iframe id="ifr" title={`ifr-${id}`} 
                                        src={`https://v2.vidsrc.me/embed/${item.imdb_id}/`} width="100%" height="700" 
                                        allow-forms="true"
                                        allow-pointer-lock="true"
                                        allow-same-origin="true"
                                        allow-scripts="true"
                                        allow-top-navigation="true"
                                        frameborder="0" allowfullscreen="true" />
                                    : 
                                    <div>
                                        <div className="watch-controls">
                                            <div className="control-row">
                                                <div className="control-group">
                                                    <label className="control-label">Season</label>
                                                    <select 
                                                        className="season-select" 
                                                        value={numberSe} 
                                                        onChange={(e) => setnumberSe(parseInt(e.target.value))}
                                                    >
                                                        {
                                                            item && item?.number_of_seasons
                                                            ? 
                                                            Array(item?.number_of_seasons).fill(null).map((item, idx) => (
                                                                    <option key={idx} value={idx + 1}>
                                                                        Season {idx + 1}
                                                                        {item?.seasons?.[idx + 1]?.episode_count ? ` (${item.seasons[idx + 1].episode_count} episodes)` : ''}
                                                                    </option>
                                                                ))
                                                            : 
                                                            null
                                                        }
                                                    </select>
                                                </div>
                                                
                                                <div className="control-group">
                                                    <label className="control-label">Episode</label>
                                                    <select 
                                                        className="episode-select" 
                                                        value={numberEp} 
                                                        onChange={(e) => setNumberEp(parseInt(e.target.value))}
                                                    >
                                                        {
                                                            item && item?.seasons
                                                            ? 
                                                            Array( item.next_episode_to_air?.season_number === numberSe ? (item.next_episode_to_air.episode_number - 1) : 
                                                            item?.seasons[numberSe]?.episode_count).fill(null).map((item, idx) => 
                                                            (
                                                                <option key={idx} value={idx + 1}>
                                                                    Episode {idx + 1}
                                                                </option>
                                                                ))
                                                            : 
                                                            null
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div className="navigation-row">
                                                <button 
                                                    className="nav-btn prev-btn" 
                                                    onClick={() => {
                                                        if (numberEp > 1) {
                                                            setNumberEp(numberEp - 1);
                                                        } else if (numberSe > 1) {
                                                            const prevSeasonEpisodes = item?.seasons[numberSe - 1]?.episode_count || 1;
                                                            setnumberSe(numberSe - 1);
                                                            setNumberEp(prevSeasonEpisodes);
                                                        }
                                                    }}
                                                    disabled={numberSe === 1 && numberEp === 1}
                                                >
                                                    ← Previous
                                                </button>
                                                
                                                <div className="current-episode">
                                                    <div className="episode-info">
                                                        <span className="episode-title">S{String(numberSe).padStart(2, '0')}E{String(numberEp).padStart(2, '0')}</span>
                                                        <span className="episode-progress">
                                                            Episode {numberEp} of {item?.seasons[numberSe]?.episode_count || '?'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    className="nav-btn next-btn" 
                                                    onClick={() => {
                                                        const currentSeasonEpisodes = item?.seasons[numberSe]?.episode_count || 1;
                                                        if (numberEp < currentSeasonEpisodes) {
                                                            setNumberEp(numberEp + 1);
                                                        } else if (numberSe < item?.number_of_seasons) {
                                                            setnumberSe(numberSe + 1);
                                                            setNumberEp(1);
                                                        }
                                                    }}
                                                    disabled={numberSe === item?.number_of_seasons && numberEp === (item?.seasons[numberSe]?.episode_count || 1)}
                                                >
                                                    Next →
                                                </button>
                                            </div>
                                        </div>
                                        <iframe id="ifr" title={`ifr-${id}`} src={`https://v2.vidsrc.me/embed/${item.id}/${numberSe + '-' + numberEp}`} width="100%" height="700" 
                                          allow-forms="true"
                                          allow-pointer-lock="true"
                                          allow-same-origin="true"
                                          allow-scripts="true"
                                          allow-top-navigation="true"
                                          frameborder="0" allowfullscreen="true"/>
                                    </div>
                                }
                            </div>
                            <div className="section mb-3">
                                <div className="section__header mb-2">
                                    <h2>Similar</h2>
                                </div>

                                <MovieList category={category} type="similar" id={item.id}/>
                            </div>
                        </div>
                    </>
                )
            }
        </>
    );
}

export default Detail;
