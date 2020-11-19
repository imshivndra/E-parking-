const { Model } = require('objection');

class Spots extends Model {

  // Table name is the only required property.
  static get tableName() {
    return 'spots';
  }
 
  }

    module.exports=Spots;