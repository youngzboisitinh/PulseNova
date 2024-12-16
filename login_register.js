const { User } = require('./userModel');
const { generateToken } = require('./AuthenticationService');
const bcrypt = require('bcrypt');

var email = '';

const login = async (req, res) => {
    const data = req.body;
    try {
        const user = await User.findOne({ 'email': data.email });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            return res.status(404).json({
                success: false,
                error: 'Invalid password'
            });
        }
        email = user.email;
        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            data: 'Error fetching users'
        });
    }
}

const register = async (req, res) => {
    console.log(req.body);
    if (req.body) {
        try {
            const existedUser = await User.findOne({ 'email': req.body.email });
            if (existedUser) {
                return res.status(400).json({
                    success: false,
                    err: 'User already exists'
                });
            }
            else {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.password, salt);

                const newUser = new User({
                    email: req.body.email,
                    password: hashedPassword,
                });
                res.setHeader('Authorization', token);
                res.status(201).json({
                    success: true,
                    userInfo: {
                        _id: savedUser._id,
                        email: savedUser.email,
                    },
                });
            }
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error creating users'
            });
        }
    }
    else {
        return res.status(400).json({
            success: false,
            err: 'Missing required component'
        });
    }
}

module.exports = { login, register, email };