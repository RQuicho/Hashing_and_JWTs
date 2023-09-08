const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config");
const Message = require("../models/message");
const db = require("../db");
const {ensureLoggedIn} = require("../middleware/auth");


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const username = req.user.username;
        const result = await Message.get(req.params.id);
        if (result.from_user.username !== username && result.to_user.username !== username) {
            throw new ExpressError('Unable to get message', 401);
        }
        return res.json({message: result});
    } catch(e) {
        return next(e);
    }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const result = await Message.create({
            from_username: req.user.username,
            to_username: req.user.to_username,
            body: req.user.body
        });
        return res.json({message: result});
    } catch(e) {
        return next(e);
    }
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try {
        const username = req.user.username;
        const msg = await Message.get(req.params.id);
        if (msg.to_user.username !== username) {
            throw new ExpressError('Unable to mark message as read', 401);
        }
        const result = await Message.markRead(req.params.id);
        return res.json({message: result});
    } catch(e) {
        return next(e);
    }
});

module.exports = router;