
exports.up = function(knex) {
  return knex.schema.alterTable("locations",(table)=>{
      table.integer("parkingCost").notNull().alter();
  })
};

exports.down = function(knex) {
  
};
