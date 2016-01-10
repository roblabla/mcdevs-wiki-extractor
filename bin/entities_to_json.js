if(process.argv.length <3 || process.argv.length >4) {
  console.log("Usage : node entities_to_json.js <entities.json> [<wikidate>]");
  process.exit(1);
}
var entitiesFilePath=process.argv[2];
var date=process.argv[3] ? process.argv[3] : "2015-07-11T00:00:00Z";

var writeAllEntities=require("../lib/entities_extractor").writeAllEntities;

writeAllEntities(entitiesFilePath,date,function(err){
  if(err) {
    console.log(err.stack);
    return;
  }
  console.log("Entities extracted !");
});