const axios = require('axios');
const cheerio = require('cheerio');

class ManhwaIndo {
    constructor() {
        this.baseUrl = 'https://www.manhwaindo.my';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
        };
    }

    async fetchHtml(url) {
        try {
            const response = await axios.get(url, { headers: this.headers, timeout: 10000 });
            return cheerio.load(response.data)
        } catch (error) {
            throw new Error(`Gagal mengambil data dari ${url}: ${error.message}`)
        }
    }

    getImageSrc($el) {
        return $el.attr('data-src') || $el.attr('data-lazy-src') || $el.attr('src');
    }

    async home() {
        const $ = await this.fetchHtml(this.baseUrl);
        const popular = [];
        const latest = [];

        $('.hotslid .bsx').each((i, el) => {
            let url = $(el).find('a').attr('href');
            if (url) url = url.replace(this.baseUrl, '');
            popular.push({
                title: $(el).find('.tt').text().trim(),
                url: url,
                image: this.getImageSrc($(el).find('img')),
                chapter: $(el).find('.epxs').text().trim(),
                rating: $(el).find('.numscore').text().trim(),
                type: $(el).find('.typename').text().trim()
            });
        });

        $('.postbody .bixbox').first().find('.utao').each((i, el) => {
            const chapters = [];
            $(el).find('.luf ul li').each((j, ch) => {
                let url = $(ch).find('a').attr('href');
                if (url) url = url.replace(this.baseUrl, '');
                chapters.push({
                    chapter: $(ch).find('a').text().trim(),
                    url: url,
                    time: $(ch).find('span').text().trim()
                });
            });

            let url = $(el).find('.imgu a').attr('href');
            if (url) url = url.replace(this.baseUrl, '');
            latest.push({
                title: $(el).find('.luf h4').text().trim(),
                url: url,
                image: this.getImageSrc($(el).find('.imgu img')),
                chapters: chapters
            });
        });

        return { popular, latest };
    }

    async search(query, page = 1) {
        const url = page === 1 
            ? `${this.baseUrl}/?s=${encodeURIComponent(query)}`
            : `${this.baseUrl}/page/${page}/?s=${encodeURIComponent(query)}`;
        const $ = await this.fetchHtml(url);
        const results = [];

        $('.listupd .bsx').each((i, el) => {
            let itemUrl = $(el).find('a').attr('href');
            if (itemUrl) itemUrl = itemUrl.replace(this.baseUrl, '');
            results.push({
                title: $(el).find('.tt').text().trim(),
                url: itemUrl,
                image: this.getImageSrc($(el).find('img')),
                chapter: $(el).find('.epxs').text().trim(),
                rating: $(el).find('.numscore').text().trim()
            });
        });

        return {
            results,
            pagination: this.pagination($)
        };
    }

    async detail(urlPath) {
        const url = `${this.baseUrl}${urlPath}`;
        const $ = await this.fetchHtml(url);
        
        const genres = [];
        $('.mgen a').each((i, el) => {
            genres.push($(el).text().trim());
        });

        const chapterList = [];
        $('#chapterlist ul li').each((i, el) => {
            let itemUrl = $(el).find('a').attr('href');
            if (itemUrl) itemUrl = itemUrl.replace(this.baseUrl, '');
            chapterList.push({
                chapterNum: $(el).find('.chapternum').text().trim(),
                url: itemUrl,
                date: $(el).find('.chapterdate').text().trim()
            });
        });

        return {
            title: $('.entry-title').text().trim(),
            thumbnail: this.getImageSrc($('.thumb img')),
            synopsis: $('.entry-content p').text().trim(),
            status: $('.imptdt:contains("Status") i').text().trim() || 'Unknown',
            type: $('.imptdt:contains("Type") a').text().trim() || 'Unknown',
            author: $('.imptdt:contains("Author") i').text().trim() || 'Unknown',
            genres: genres,
            chapters: chapterList
        };
    }

    async reader(urlPath) {
        const url = `${this.baseUrl}${urlPath}`;
        const $ = await this.fetchHtml(url);
        const images = [];

        $('#readerarea img').each((i, el) => {
            const imgSrc = this.getImageSrc($(el));
            if (imgSrc && !imgSrc.includes('svg+xml')) {
                images.push(imgSrc);
            }
        });

        const navigation = { prev: null, next: null, allChapters: null };
        const m = urlPath.match(/\/([^\/]+)-chapter-\d+\/?$/);
        if (m) {
            const seriesPath = `/series/${m[1]}/`;
            navigation.allChapters = seriesPath;
            try {
                const detail = await this.detail(seriesPath);
                const list = detail.chapters.map(c => c.url);
                const norm = (s) => (s || '').replace(/\/+$/, '');
                const key = norm(urlPath);
                const idx = list.findIndex(u => norm(u) === key);
                if (idx !== -1) {
                    if (idx + 1 < list.length) navigation.prev = list[idx + 1];
                    if (idx - 1 >= 0) navigation.next = list[idx - 1];
                }
            } catch (e) {}
        }

        return {
            title: $('.entry-title').text().trim(),
            images: images,
            navigation
        };
    }

    async latest(page = 1) {
        const url = page === 1 ? `${this.baseUrl}/` : `${this.baseUrl}/page/${page}/`;
        const $ = await this.fetchHtml(url);
        const results = [];

        $('.postbody .utao').each((i, el) => {
            const chapters = [];
            $(el).find('.luf ul li').each((j, ch) => {
                let url = $(ch).find('a').attr('href');
                if (url) url = url.replace(this.baseUrl, '');
                chapters.push({
                    chapter: $(ch).find('a').text().trim(),
                    url: url,
                    time: $(ch).find('span').text().trim()
                });
            });

            let url = $(el).find('.imgu a').attr('href');
            if (url) url = url.replace(this.baseUrl, '');
            results.push({
                title: $(el).find('.luf h4').text().trim(),
                url: url,
                image: this.getImageSrc($(el).find('.imgu img')),
                chapters: chapters
            });
        });

        return {
            results: results.map(r => ({ title: r.title, url: r.url, image: r.image, chapter: r.chapters[0] ? r.chapters[0].chapter : '', rating: '' })),
            pagination: this.pagination($)
        };
    }

    async popular(page = 1) {
        const url = `${this.baseUrl}/series/?page=${page}&order=popular`;
        const $ = await this.fetchHtml(url);
        const results = [];

        $('.listupd .bsx').each((i, el) => {
            let url = $(el).find('a').attr('href');
            if (url) url = url.replace(this.baseUrl, '');
            results.push({
                title: $(el).find('.tt').text().trim(),
                url: url,
                image: this.getImageSrc($(el).find('img')),
                chapter: $(el).find('.epxs').text().trim(),
                rating: $(el).find('.numscore').text().trim()
            });
        });

        return {
            results,
            pagination: this.pagination($)
        };
    }

    async genre(genreString, page = 1) {
        const url = page === 1
            ? `${this.baseUrl}/genres/${genreString}/`
            : `${this.baseUrl}/genres/${genreString}/page/${page}/`;
        const $ = await this.fetchHtml(url);
        const results = [];

        $('.listupd .bsx').each((i, el) => {
            let url = $(el).find('a').attr('href');
            if (url) url = url.replace(this.baseUrl, '');
            results.push({
                title: $(el).find('.tt').text().trim(),
                url: url,
                image: this.getImageSrc($(el).find('img')),
                chapter: $(el).find('.epxs').text().trim(),
                rating: $(el).find('.numscore').text().trim()
            });
        });

        return {
            results,
            pagination: this.pagination($)
        };
    }

    pagination($) {
        let currentPage = 1;
        let hasNext = false;
        
        const currentText = $('.pagination .page-numbers.current').text().trim();
        if (currentText) {
            currentPage = parseInt(currentText);
        }

        if ($('.pagination .next.page-numbers').length > 0) {
            hasNext = true;
        }

        return {
            currentPage,
            hasNext
        };
    }
}

module.exports = new ManhwaIndo();