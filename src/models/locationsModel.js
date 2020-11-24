const { Model } = require('objection');

class Locations extends Model {

  // Table name is the only required property.
  static get tableName() {
    return 'locations';
  }
  static get relationMappings(){
  const Bookings=require("../models/bookingModel");
  return{
    bookings:{
      relation:Model.HasManyRelation,
      modelClass:Bookings,
      join:{
        from:"locations.id",
        to:"bookings.parkingId"
      }
    }
  }

  }
 
  }

    module.exports=Locations;