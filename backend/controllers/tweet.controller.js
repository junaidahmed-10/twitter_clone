import {Tweet} from '../models/tweets.model.js';
import { User } from '../models/user.model.js';
import { getOthersProfile } from './user.controller.js';

export const createTweet = async (req, res) => {
    try {
        const { description, id} = req.body;
        if (!description || !id) {
            return res.status(401).json({
                message: "Fields are required",
                success: false
            })
        }
        await Tweet.create({
            description,
            userId: id
        });
        return res.status(201).json({
            message: "Tweet created successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const deleteTweet = async (req, res) => {
    try {
        const {id} = req.params;
        await Tweet.findByIdAndDelete(id)
        return res.status(200).json({
            message: "tweet deleted successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const likeOrDislike = async (req, res) => {
    try {
        const loggedUserId = req.body.id;
        const tweetId = req.params.id;
        const tweet = await Tweet.findById(tweetId)
        if (tweet.like.includes(loggedUserId)) {
            //dislike
            await Tweet.findByIdAndUpdate(tweetId, {$pull:{like:loggedUserId}});
            return res.status(200).json({
                message: "user dislikes your tweet"
            })
        }else{
            //like
            await Tweet.findByIdAndUpdate(tweetId, {$push:{like:loggedUserId}});
            return res.status(200).json({
                message: "user liked your tweet"
            })
        }
    } catch (error) {
        console.log(error);
    }
}

export const getAllTweets = async (req, res) => {
    //logged uder's tweet + followers tweet
    try {
        const id = req.params.id;
        const loggedInUser = await User.findById(id)
        const loggedInUserTweets = await Tweet.find({userId:id});
        const followingUserTweet = await Promise.all(loggedInUser.following.map((otherUsersId) => {
            return Tweet.find({userId:otherUsersId});
        }));
        return res.status(200).json({
            tweets:loggedInUserTweets.concat(...followingUserTweet),
        })
    } catch (error) {
        console.log(error);
    }
}

export const getFollowingTweets = async (req, res) => {
    try {
        const id = req.params.id;
        const loggedInUser = await User.findById(id);
        const followingUserTweet = await Promise.all(loggedInUser.following.map((otherUsersId) => {
            return Tweet.find({userId: otherUsersId})
        }))
        return res.status(200).json({
            tweets: [].concat(...followingUserTweet)
        });
    } catch (error) {
        console.log(error);
    }
}