exports.up = function (knex) {
    return knex.schema.createTable("locations", (table) => {
       table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary();
       table.uuid("userId").references("id").inTable("users").onDelete("CASCADE");
       table.text("parkingAddress");
       table.text("parkingName");
       table.boolean("isApproved").defaultTo(false);
       table.timestamps(false,true);
       table.specificType("geom ", "geometry(POINT, 4326)");
     }).createTable("spots",(table)=>{
       table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary();
       table.uuid("parkingId").references("id").inTable("locations").onDelete("CASCADE");
     }).createTable("bookings",(table)=>{
        table.uuid("bookingId").defaultTo(knex.raw("uuid_generate_v4()")).primary();
        table.uuid("parkingId").references("id").inTable("locations").onDelete("CASCADE");
        table.uuid("spotId").references("id").inTable("spots").onDelete("CASCADE");
        table.timestamp("startDateTime");
        table.timestamp("endDateTime");9

      })
     ;
   };
   
   exports.down = function (knex) {
    return knex.schema.dropTableIfExists("locations");
   };
   