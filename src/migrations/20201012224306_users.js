
exports.up = function(knex) {
  return knex.schema.createTable("users",(table)=>{
table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary();
table.string("fullName");
table.string("email").notNullable().unique();
table.string("password").notNullable();
table.boolean("isEmailVerified").notNullable().defaultTo(false);
table.string("otp");
table.string("userProfileImage");
table.string("mobileNo");
table.enu("userType",["USER","HOST"]);
table.timestamps(false,true);
  });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("users");
};
