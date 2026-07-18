require('dotenv').config()
const express = require('express')
const path = require('path')

const homeRoute = require('./routes/home');
const searchRoute = require('./routes/search');
const browseRoute = require('./routes/browse');
const detailRoute = require('./routes/detail');

const app = express()
const port = process.env.PORT || 3001

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/', homeRoute);
app.use('/search', searchRoute);
app.use('/', browseRoute);
app.use('/series', detailRoute);
app.use((req, res, next) => {
    if (req.path.includes('-chapter-')) {
        return detailRoute(req, res, next);
    }
    next();
});

app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Tidak Ditemukan' });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`ManhwaIn running at http://localhost:${port}`)
    })
}

module.exports = app
