const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dateformat = require('dateformat');
const paginate = require('jw-paginate');
const nodemailer = require("nodemailer");

const InternalErrorException = require('../models/InternalErrorException');
const NotFoundException = require('../models/NotFoundException');
const ConflictException = require('../models/ConflictException');
const UnauthorizedRequestException = require('../models/UnauthorizedRequestException');

const User = require('../models/User.js');
const UserMapper = require('../mapper/UserMapper');
const userMapper = new UserMapper();

const MeetMapper = require('../mapper/MeetMapper');
const meetMapper = new MeetMapper();

const ChampionshipMapper = require('../mapper/ChampionshipMapper');
const championshipMapper = new ChampionshipMapper();

const Team = require('../models/Team');
const Match = require('../models/Match');
const Meet = require('../models/Meet');

class UserService {

    /**
    * Constructs User Service.
    * @constructor
    */
    constructor() { }

    /**
    * Get a user
    * @param  {HttpRequest} req - Request from client
    * @return  {User} User 
    */
    async getUser(req) {
        const data = await userMapper.getUserWithTeams(req.query.username.trim());
        if (data.user.length === 0) {
            throw new NotFoundException('Incorrect username');
        } else {
            const birthdate = dateformat(data.user[0].birthdate, "dd-mm-yyyy");
            const user = new User(data.user[0].username, data.user[0].name, data.user[0].surname, data.user[0].email,
                birthdate, data.user[0].country, data.user[0].location, data.user[0].rol, data.user[0].imagebase64, data.user[0].imagetype, data.user[0].description);
            data.teams.forEach(team => {
                user.setTeam(new Team(team.teamname, team.userleader, null, null, null, team.imagebase64,
                    team.imagetype, team.isprivate, null, null));
            });
            return user;
        }
    };

    /**
    * Get the user profile
    * @param  {HttpRequest} req - Request from client
    * @return  {User} User 
    */
    async getProfile(req) {
        const data = await userMapper.getUserWithTeams(req.username);
        if (data.user.length === 0) {
            throw new NotFoundException('Incorrect username');
        } else {
            const user = new User(data.user[0].username, data.user[0].name, data.user[0].surname, data.user[0].email,
                dateformat(data.user[0].birthdate, "yyyy-mm-dd"), data.user[0].country, data.user[0].location, data.user[0].rol,
                data.user[0].imagebase64, data.user[0].imagetype, data.user[0].description);
            return user;
        }
    };

    /**
    * Delete a user
    * @param  {HttpRequest} req - Request from client
    * @return  {String} Confirmation message 
    */
    async delete(req) {
        if (req.rol !== 1) {
            throw new ConflictException('Only an admin can delete an user');
        } else {
            const user = await userMapper.getUser(req.query.username);
            if (user.length === 0) {
                throw new NotFoundException('Incorrect username');
            } else {
                await userMapper.delete(req.query.username);
                return 'User deleted successfully'
            }
        }
    }

    /**
    * Log into the application 
    * @param  {HttpRequest} req - Request from client
    * @return  {User} User
    */
    async signIn(req) {
        const userSearched = await userMapper.getUser(req.body.username);
        if (userSearched.length === 0) {
            throw new ConflictException('Incorrect username');
        } else if (userSearched[0].confirmed === 0) {
            throw new ConflictException('Not confirmed email', { email: userSearched[0].email });
        } else {
            const validPassword = await bcrypt.compare(req.body.password, userSearched[0].password);
            if (!validPassword) {
                throw new ConflictException('Incorrect password');
            } else {
                const user = new User(userSearched[0].username, userSearched[0].name, userSearched[0].surname, userSearched[0].email,
                    dateformat(userSearched[0].birthdate, "yyyy-mm-dd"), userSearched[0].country, userSearched[0].location, userSearched[0].rol,
                    userSearched[0].imagebase64, userSearched[0].imagetype, userSearched[0].description);
                const token = jwt.sign({ username: user.getUsername(), rol: user.getRol() }, 'secret', { expiresIn: '2h' });
                user.setToken(token);
                return user;
            }
        }
    }

    /**
    * Sign up into the application 
    * @param  {HttpRequest} req - Request from client
    * @return  {String} Confirmation message 
    */
    async signUp(req) {
        if (req.body.password === null) {
            throw new ConflictException('Incorrect data', { error: 'The password cannot be null' });
        } else if (req.body.password.length < 5) {
            throw new ConflictException('Incorrect data', { passwordMinLength: 'The password cannot have less than 4 characters' });
        } else if (req.body.password.length > 25) {
            throw new ConflictException('Incorrect data', { passwordMaxLength: 'The password cannot have more than 25 characters' });
        } else {
            const user = new User(req.body.username, null, null, req.body.email, req.body.birthdate, null, null, 0, null, null, null);
            const cryptPass = await bcrypt.hash(req.body.password, 10);
            const userExists = await userMapper.checkUserExists(user);
            if (userExists.length === 1) {
                if (user.getUsername() === userExists[0].username) {
                    throw new ConflictException('Incorrect data', { usernameExists: 'Username already exists' });
                } else if (user.getEmail() === userExists[0].email) {
                    throw new ConflictException('Incorrect data', { emailExists: 'Email already exists' });
                }
            } else {
                try {
                    user.isValidForCreate();
                } catch (e) {
                    throw new ConflictException('Incorrect data', { errors: e.getErrors() });
                }
                const date = new Date(user.getBirthdate());
                const today = new Date();
                let dd = today.getDate();
                let mm = today.getMonth() + 1;
                if (dd < 10) { dd = '0' + dd; }
                if (mm < 10) { mm = '0' + mm; }
                const userInsert = {
                    username: user.getUsername(),
                    password: cryptPass,
                    email: user.getEmail(),
                    birthdate: date,
                    rol: user.getRol(),
                    confirmed: 0
                };
                await userMapper.createUser(userInsert);
                const emailToken = jwt.sign({ username: user.getUsername() }, 'emailSecret', { expiresIn: '1d' });
                const url = 'http://localhost:3000/user/confirmation/' + emailToken;
                const emailInfo = {
                    to: user.getEmail(),
                    subject: 'Confirmation Email',
                    html: 'Please click this link to confirm your email: <a href="' + url + '">' + url + '</a>'
                };
                await this.sendEmail(emailInfo);
                return 'Created user successfully';
            }
        }
    }

    /**
    * Confirm user email
    * @param  {HttpRequest} req - Request from client
    * @return {String} http URL
    */
    async confirmation(req) {
        const payload = jwt.verify(req.params.emailToken, 'emailSecret');
        if (!payload) {
            throw new UnauthorizedRequestException('Unauthorized request');
        } else {
            await userMapper.confirmation(payload.username);
            return 'http://localhost:4200';
        }
    }

    /**
    * Resend validation email to a user
    * @param  {HttpRequest} req - Request from client
    * @return  {String} Confirmation message 
    */
    async resendEmail(req) {
        const user = await userMapper.getUserByEmail(req.query.email);
        if (user.length === 0) {
            return new ConflictException('Incorrect email');
        } else if (user[0].confirmed === 1) {
            return new ConflictException('Email already confirmed');
        } else {
            const emailToken = jwt.sign({ username: user[0].username }, 'emailSecret', { expiresIn: '1d' });
            const url = 'http://localhost:3000/user/confirmation/' + emailToken;
            const emailInfo = {
                to: user[0].email,
                subject: 'Confirmation Email',
                html: 'Please click this link to confirm your email: <a href="' + url + '">' + url + '</a>'
            }
            await this.sendEmail(emailInfo);
            return 'Confirmation email sended successfully';
        }
    }

    /**
    * Gets the users with whom you have messages
    * @param  {HttpRequest} req - Request from client
    * @return  {User[]} Users
    */
    async getChatUsers(req) {
        let usersArray = [];
        let userNamesChatResponse = [];
        const chatUsernames = await userMapper.getChatUsernames(req.username);
        if (chatUsernames.length === 0) {
            return [];
        } else {
            chatUsernames.forEach(message => {
                if (message.sendUser === req.username) {
                    usersArray.push(message.targetUser);
                } else {
                    usersArray.push(message.sendUser);
                }
            });

            let uniqueUsers = usersArray.filter((item, index, array) => {
                return array.indexOf(item) === index;
            });

            uniqueUsers.forEach(user => {
                userNamesChatResponse.push(user)
            });

            let usersPromise = [];
            userNamesChatResponse.forEach(username => {
                usersPromise.push(userMapper.getChatUser(username));
            });

            let chatUsers = [];
            return Promise.all(usersPromise).then(values => {
                values.forEach(user => {
                    chatUsers.push(user);
                });
                return chatUsers;
            });
        }
    }

    /**
    * Check if a username exists
    * @param  {HttpRequest} req - Request from client
    * @return  {User} User
    */
    async checkUser(req) {
        if (req.username === req.query.username) {
            throw new ConflictException('That is your username');
        } else {
            const user = await userMapper.getUser(req.query.username);
            if (user.length === 0) {
                throw new ConflictException('Incorrect username');
            } else {
                return new User(user[0].username, null, null, null, null, null,
                    null, null, user[0].imagebase64, user[0].imagetype, null);
            }
        }
    }

    /**
    * Update user profile
    * @param  {HttpRequest} req - Request from client
    * @return  {String} Confirmation message 
    */
    async updateProfile(req) {
        const user = new User(req.username, req.body.name, req.body.surname, null,req.body.birthdate,
            req.body.country, req.body.location, null, null, null, req.body.description);
        try {
            user.isValidForUpdate();
        } catch (e) {
            throw new ConflictException('Incorrect data', { errors: e.getErrors() });
        }
        const userFromMapper = await userMapper.getUser(user.getUsername());
        if (userFromMapper.length === 0) {
            throw new ConflictException('Incorrect username');
        } else {
            const userUpdate = {
                name: user.getName(),
                surname: user.getSurname(),
                birthdate: user.getBirthdate(),
                country: user.getCountry(),
                location: user.getLocation(),
                description: user.getDescription()
            }
            await userMapper.updateUser(userUpdate, req.username);
            return 'Profile Updated';
        }
    }

    /**
    * Update user profile image
    * @param  {HttpRequest} req - Request from client
    * @return  {String} Confirmation message 
    */
    async updateProfileAvatar(req) {
        const imageData = {
            imagebase64: req.body.value,
            imagetype: req.body.filetype,
        }
        await userMapper.updateProfileAvatar(imageData, req.username)
        return 'Profile image updated';
    }

    /**
    * Get paginated user list
    * @param  {HttpRequest} req - Request from client
    * @return  {JSON} pager options, User[]
    */
    async getUsersList(req) {
        if (req.rol != 1) {
            throw new UnauthorizedRequestException('Unauthorized request');
        } else {
            const page = parseInt(req.query.pageIndex) < 0 ? 0 : parseInt(req.query.pageIndex);
            const data = await userMapper.getUsersList(page, parseInt(req.query.pageSize), req.query.nameOrEmail)
            let users = [];
            if (data.users.length === 0) {
                return [];
            } else {
                data.users.forEach(user => {
                    let birthdate = dateformat(user.birthdate, "yyyy-mm-dd");
                    users.push(new User(user.username, user.name, null, user.email, birthdate, null, null, user.rol, null, null, null));
                });

                const pager = paginate(data.totalUsers, page, parseInt(req.query.pageSize));
                return { pager, users };
            }
        }
    }

    /**
    * Get the statistics of a user
    * @param  {HttpRequest} req - Request from client
    * @return  {JSON} matches[], number of leagues played, number of tournaments played, number of matches wqon, number of matches played
    */
    async getStats(req) {
        const matchesPlayed = await userMapper.getMatchesPlayed(req.query.username.trim(), parseInt(req.query.pageIndex),
                                parseInt(req.query.pageSize), req.query.sport);
        if (matchesPlayed.length < 1) {
            return [];
        } else {
            const matches = [];
            matchesPlayed.forEach(match => {
                matches.push(new Match(match.idchampionship, match.phase, match.team1, match.team2, match.matchresult1, match.matchresult2,
                    dateformat(match.matchdate, 'dd-mm-yy h:MM'), match.position));
            });
            const statsData = await userMapper.getStats(req.query.username.trim(), req.query.sport);
            return {
                'matches': matches,
                'leaguesPlayed': statsData.leaguesPlayed,
                'tournamentsPlayed': statsData.tournamentsPlayed,
                'matchesWon': statsData.matchesWon,
                'matchesPlayed': statsData.matchesPlayed
            }
        }
    }

    /**
    * Get user next events
    * @param  {HttpRequest} req - Request from client
    * @return {Meet[]} If type is meet
    * @return {Chamionship[]} If type is tournament or league
    */
    async events(req) {
        if(req.query.type === 'meets') {
            const meetsFromMapper = await meetMapper.getUserNextMeets(req.username, dateformat(req.query.date, 'yyyy-mm-dd HH:mm'), req.query.page);
            const nextMeets = [];
            meetsFromMapper.forEach(meet => {
                nextMeets.push(new Meet(meet.id, meet.name, meet.usercreator, dateformat(meet.date, 'dd-mm-yyyy HH:mm:ss'), meet.sport, meet.description, meet.location));
            });
            return meetsFromMapper;
        } else if (req.query.type === 'League' || req.query.type === 'Tournament') {
            const championshipFromMapperData = await championshipMapper.getUserNextChampionships(req.username, 
                dateformat(req.query.date, 'yyyy-mm-dd HH:mm:ss'), req.query.page, req.query.type);
            const championshipsData = [];
            championshipFromMapperData.forEach(championshipData => {
                championshipsData.push(championshipData);
            });
            return championshipsData;
        } else {
            throw new NotFoundException('Incorrect championship type');
        }
    }

    /**
    * Send email to a user mail
    * @param  {JSON} emailInfo email info like message, email subject, email recipient
    */
    async sendEmail(emailInfo) {
        try {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: 'xxxxxxx@gmail.com', // generated ethereal user
                    pass: 'fFI1dUas7v' // generated ethereal password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            // send mail with defined transport object
            await transporter.sendMail({
                form: '"Julio" <jqsoto@esei.uvigo.es>',
                to: emailInfo.to, // list of receivers
                subject: emailInfo.subject, // Subject line
                html: emailInfo.html // html body
            });
            return;
        }
        catch (e) {
            throw new InternalErrorException('Internal error');
        }
    }
}
module.exports = UserService;