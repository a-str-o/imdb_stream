const apiConfig = {
    baseUrl: 'https://api.themoviedb.org/3/',
    apiKey: '6b3cfd1c595cc8994c09d12fa15da5e5',
    originalImage: (imgPath) => `https://image.tmdb.org/t/p/original/${imgPath}`,
    w500Image: (imgPath) => `https://image.tmdb.org/t/p/w500/${imgPath}`
}

export default apiConfig;