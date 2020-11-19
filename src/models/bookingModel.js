const { Model } = require('objection');

class Bookings extends Model {

  // Table name is the only required property.
  static get tableName() {
    return 'bookings';
  }
 
  }

    module.exports=Bookings;