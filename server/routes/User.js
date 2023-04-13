import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel as User } from '../models/user.js';

const router = express.Router();

//register
router.post('/register', async (req, res) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,

    })

    const result = await user.save();
    const { password, ...data } = await result.toJSON();

    res.send(data);
});

//login
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).send({
            message: 'user not found'
        })
    }

    if (!await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).send({
            message: 'invalid credentials'
        })
    }
    const token = jwt.sign({ _id: user._id }, "secret")

    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });


    res.send({
        message: 'Sucessfully login'
    });

});

//users
router.get('/user', async (req, res) => {
    try {
        const cookie = req.cookies['jwt'];

        const claims = jwt.verify(cookie, 'secret');

        if (!claims) {
            return res.status(400).send({
                message: 'unauthenticated'
            })
        }

        const user = await User.findOne({ _id: claims._id });

        const { password, ...data } = await user.toJSON();

        res.send(data);
    } catch (e) {
        return res.status(400).send({
            message: 'unauthenticated'
        })
    }

});

//logout

router.post('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 0 });

    res.send({
        message: 'You have been logout'
    });
});

export { router as userRouter };