
exports.up = function(knex) {
    return knex.schema.alterTable("bookings",function(table){
        table.integer("spotNo").notNull();
})
};

exports.down = function(knex) {
  
};
