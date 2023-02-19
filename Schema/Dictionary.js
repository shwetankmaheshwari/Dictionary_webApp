const mongoose = require('mongoose');

const DictionarySchema = new mongoose.Schema({
   Word : String,
   Definition : String
});
const DictionaryModel = mongoose.model('define', DictionarySchema);
module.exports= DictionaryModel;
