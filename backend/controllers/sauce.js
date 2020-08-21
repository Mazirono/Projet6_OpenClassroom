// in controllers/stuff.js

const Thing = require('../models/Sauce');
const User = require('../models/User.js');
const fs = require('fs');
const jwt = require('jsonwebtoken');

exports.createThing = (req, res, next) => {
  const thingObject = JSON.parse(req.body.sauce);
  const thing = new Thing({
    ...thingObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes : 0,
    usersDisliked: [],
    usersLiked: [],
  });
  
  thing.save()
  .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
  .catch(error => res.status(400).json({ error }))
};

exports.getAllStuff = (req, res, next) => {
    Thing.find().then(
      (things) => {
        res.status(200).json(things);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

exports.getOneThing = (req, res, next) => {
  Thing.findOne({
    _id: req.params.id
  }).then(
    (thing) => {
      res.status(200).json(thing);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifyThing = (req, res, next) => {
  Thing.findOne({
    _id: req.params.id
  }).then(
    (thing) => {
      var image_supprimer = req.file;
      console.log(thing.imageUrl);
      console.log(image_supprimer);
      if(image_supprimer == null){
        console.log("rien se passe");
      }
      else{
      const filename = thing.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, function(err) {
        if (err) throw err;
      
        console.log('file deleted');
      });
     }
      const thingObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
      
    }
  )
  /*
  var image_supprimer = req.file;
  console.log(image_supprimer);
  
  if(image_supprimer == null){
    console.log("rien se passe");
  }
  else{
    var imageasupprimer = 'image/'+  image_supprimer.originalname;
  
    console.log(imageasupprimer)
    console.log("supprimer image");
    
    fs.unlink('/image/file.txt', function(err) {
      if (err) throw err;
    
      console.log('file deleted');
    });
    
    }
  */
  
  
   
  
};




exports.deleteThing = (req, res, next) => {
  Thing.findOne({ _id: req.params.id })
    .then(thing => {
      const filename = thing.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Thing.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.likeThing = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
  const userId = decodedToken.userId;

  if(req.body.like == -1){
    
   Thing.updateOne({_id: req.params.id}, { $inc: { dislikes: 1 },$push: { usersDisliked : userId}}, {upsert: true}, function (err) {
      if (err) {
          res.send (err);
     console.log (err);
    }
       res.json ({message: 'User create or update'});
    });
  
    
  }   
  if(req.body.like == 0){
    
    
    Thing.findOne({_id: req.params.id}, function(err,obj) { 
      var count_dislikes = obj.dislikes - 1;
      var count_likes = obj.likes - 1;
      
      
      if(obj.usersDisliked.indexOf(userId) != -1){
        console.log('dislike')
        Thing.updateOne({_id: req.params.id}, {dislikes : count_dislikes, $pull: { usersDisliked: userId } /*$pull: { usersDisliked: ["5f1bf9d5a70e3f11b851004a"] }*/ },{upsert: true}, function (err) {
          if (err) {
              res.send (err);
        console.log (err);
        }
          res.json ({message: 'User create or update'});
        });
      }
      else if(obj.usersLiked.indexOf(userId)!= -1){
        console.log('like')
        Thing.updateOne({_id: req.params.id}, {likes : count_likes, $pull: { usersLiked: userId } /*$pull: { usersDisliked: ["5f1bf9d5a70e3f11b851004a"] }*/ },{upsert: true}, function (err) {
          if (err) {
              res.send (err);
        console.log (err);
        }
          res.json ({message: 'User create or update'});
        });
      }
    });
    
    
  }
  
  if(req.body.like == 1){
   
    Thing.updateOne({_id: req.params.id}, { $inc: { likes: 1 },$push: { usersLiked : [userId]}}, {upsert: true}, function (err) {
      if (err) {
          res.send (err);
     console.log (err);
    }
       res.json ({message: 'User create or update'});
    });
    if(req.body.like == 0){
      console.log('réaction')
    }
   
  }
  

    
};

