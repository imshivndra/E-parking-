const { Model } = require('objection');

class Locations extends Model {

  // Table name is the only required property.
  static get tableName() {
    return 'locations';
  }
  static get relationMappings(){
  const Spots=require("../models/spotModel");
  return{
    spots:{
      relation:Model.HasManyRelation,
      modelClass:Spots,
      join:{
        from:"locations.id",
        to:"spots.parkingId"
      }
    }
  }

  }
 
  }

    module.exports=Locations;