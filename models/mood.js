var mongoose= require('mongoose');

var schema = new mongoose.Schema({
    userid: {type:String, required:true},
    title:{type:String, required:true},
    body:{type:String, required:true},
    mood:{type:String, required:true},
    date:{type:Date, required:true}
})

module.exports = mongoose.model('Blog',schema)