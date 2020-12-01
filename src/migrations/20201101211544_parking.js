exports.up = function (knex) {
    return knex.schema.createTable("locations", (table) => {
       table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary();
       table.uuid("userId").references("id").inTable("users").onDelete("CASCADE");
       table.text("parkingAddress");
       table.text("parkingName");
       table.boolean("isApproved").defaultTo(true);
       table.integer("noOfSpots").notNull();
       table.text("parkingDescription");
       table.text("parkingImage").defaultTo("https://www.securityindustry.org/wp-content/uploads/sites/3/2018/05/noimage.png");;
       table.text("parkingCost");
       table.timestamps(false,true);
       table.specificType("geom ", "geometry(POINT, 4326)");
     }).createTable("bookings",(table)=>{
        table.uuid("bookingId").defaultTo(knex.raw("uuid_generate_v4()")).primary();
        table.uuid("parkingId").references("id").inTable("locations");
        table.bigInteger("startDateTime");
        table.bigInteger("endDateTime");
        table.integer("spotNo").notNull();
        table.uuid("userId").references("id").inTable("users");
      })
     ;
   };
   
   exports.down = function (knex) {
    return knex.schema.dropTableIfExists("locations");
   };
   