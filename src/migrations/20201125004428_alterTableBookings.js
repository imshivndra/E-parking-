
exports.up = function(knex) {
    return knex.schema.alterTable("bookings",function(table){
        table.uuid("userId").references("id").inTable("users");
})
};

exports.down = function(knex) {
  
};
