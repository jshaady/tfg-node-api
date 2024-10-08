const ConflictException = require('../models/ConflictException');

const NewsMapper = require('../mapper/NewsMapper');
const newsMapper = new NewsMapper();
const UserMapper = require('../mapper/UserMapper');
const userMapper = new UserMapper();
const News = require('../models/News');

const dateformat = require('dateformat');

class NewsService {

    /**
    * Constructs News Service.
    * @constructor
    */
    constructor() { }

    /**
     * Get news filtered by location
     * @param  {HttpRequest} req - Request from client
     * @return  {News[]} News
     */
    async getNews(req) {
        const newsData = await newsMapper.getNews(req.query.location, req.query.page);
        if (newsData.news.length == 0) return [];
        else {
            let newsArray = [];
            newsData.news.forEach(element => {
                newsArray.push(new News(element.senduser, element.title, element.message, dateformat(element.date, "dd-mm-yyyy"),
                    element.location, element.imagebase64, element.imagetype));
            });

            let newsPromise = [];
            newsArray.forEach(news => {
                newsPromise.push(userMapper.newsUser(news))
            })

            return Promise.all(newsPromise).then(() => {
                return {
                    'countNews': newsData.countNews,
                    'newsArray': newsArray
                };
            });
        }
    }

    /**
     * Create news
     * @param  {HttpRequest} req - Request from client
     * @return  {String} Confirmation message 
     */
    async createNews(req) {
        let value = null;
        let fileType = null;
        if (req.body.image !== null) {
            value = req.body.image.value;
            fileType = req.body.image.filetype;
        }
        const news = new News(req.username, req.body.title, req.body.message, req.body.date,
            req.body.location, value, fileType);
        if (req.rol !== 1) {
            return new ConflictException('Only an admin can create a news');
        }
        try {
            news.isValidForCreate();
        } catch (e) {
            return new ConflictException('Incorrect data', e.getErrors());
        }
        const newsInsert = {
            senduser: news.getSendUser(),
            title: news.getTitle(),
            message: news.getMessage(),
            date: news.getDate(),
            location: news.getLocation(),
            imagebase64: news.getImageBase64(),
            imagetype: news.getImageType()
        }
        await newsMapper.createNews(newsInsert);
        return 'News created successfully';
    }
}
module.exports = NewsService;