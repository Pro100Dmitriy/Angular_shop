const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const keys = require('../config/keys')
const errorHandler = require('../utils/errorHandler')


module.exports.login = async function(req, res){
    const candidate = await User.findOne({email: req.body.email})

    if(candidate){
        // Cheak password
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password)
        if(passwordResult){
            // Token generate
            const token = jwt.sign({
                email: candidate.email,
                userId: candidate._id
            }, keys.jwt, {expiresIn: 60 * 60})

            res.status(200).json({
                token: `Bearer ${token}`
            })
        }else{
            // Encorected password
            res.status(401).json({
                message: 'Пороли не совпадают'
            })
        }
    }else{
        // User in not exist
        res.status(404).json({
            message: 'Пользователь не найден'
        })
    }
}


module.exports.register = async function(req, res){
    //enail password
    const candidate = await User.findOne({email: req.body.email})

    if( candidate ){
        res.status(409).json({
            message: 'Такой email уже занят. Попробуйтк другой'
        })
    }else{
        const salt = bcrypt.genSaltSync(10)
        const password = req.body.password
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt)
        })

        try{
            await user.save()
            res.status(201).json(user)
        }catch(error){
            errorHandler(res, error)
        }
    }
}