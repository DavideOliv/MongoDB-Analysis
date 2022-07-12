function get_results(result) {
   print(tojson(result));
}

// to create profile database to save stats query
db.setProfilingLevel(2)

//create index league
//db.teams.createIndex({league:1})


print("---------------LIST OF QUERIES------------");

print("statistiche del database in Kb")
printjson(db.stats({scale:1024}));
print("-------------------------------------------")
print("statistiche collezione (teams) in Kb")
printjson(db.teams.stats({scale:1024}))

print("--------------------------------------------")
print("1) numero di squadre in ogni lega\n") 
db.teams.aggregate([{"$group" : {_id: "$league", n_teams:{$sum:1}}}, 
                     {"$sort":{n_teams: -1}}])
                              .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{"$group" : {_id: "$league", n_teams:{$sum:1}}}, {"$sort":{n_teams: -1}}])
)



print("--------------------------------------------")
print("2) numero di ristoranti in ogni lega\n")
db.teams.aggregate([{$group: {_id: "$league", n_resturants: {$sum:"$total"}}}, 
                     {$sort:{n_resturants:-1}}, 
                     {$limit:10}])
                     .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$group: {_id: "$league", n_resturants: {$sum:"$total"}}}, {$sort:{n_resturants:-1}}, {$limit:10}]))

print("--------------------------------------------")
print("3) numero dei ristoranti più costosi\n")
cursor = db.teams.aggregate([{$unwind: "$businesses"}, 
                              {$match: {"businesses.price": "$$$$"}},
                              {$group: {_id: "$league", t: {$push: "$businesses.price"}}}, 
                              {$project: { n_expResturants: { $size:"$t" }}}, 
                              {$sort: {n_expResturants: -1}}])
                              .forEach(get_results);


printjson(db.teams.explain("executionStats").aggregate([{$unwind: "$businesses"}, 
                              {$match: {"businesses.price": "$$$$"}},
                              {$group: {_id: "$league", t: {$push: "$businesses.price"}}}, 
                              {$project: { n_expResturants: { $size:"$t" }}}, 
                              {$sort: {n_expResturants: -1}}]))


print("--------------------------------------------")
print("4) numero dei ristoranti meno costosi per ogni lega")
cursor = db.teams.aggregate([{$unwind: "$businesses"}, 
                              {$match: {"businesses.price": "$"}},
                              {$group: {_id: "$league", t: {$push: "$businesses.price"}}}, 
                              {$project: { n_cheapResturants: { $size:"$t" }}}, 
                              {$sort: {n_cheapResturants: -1}}])
                              .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$unwind: "$businesses"}, 
                              {$match: {"businesses.price": "$"}},
                              {$group: {_id: "$league", t: {$push: "$businesses.price"}}}, 
                              {$project: { n_cheapResturants: { $size:"$t" }}}, 
                              {$sort: {n_cheapResturants: -1}}]))


print("--------------------------------------------")
print("5) top 10 stati con più squadre e il numero di ristoranti per ogni stato")
cursor = db.teams.aggregate([{$group: {_id: "$state", n_teams: {$sum:1}, n_resturants:{$sum:"$total"}}}, 
                              {$sort: {n_teams: -1}}, 
                              {$limit : 10}])
                              .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$group: {_id: "$state", n_teams: {$sum:1}, n_resturants:{$sum:"$total"}}}, 
                              {$sort: {n_teams: -1}}, 
                              {$limit : 10}]))

                              
print("--------------------------------------------")
print("6) top 10 città con più squadre e il numero di ristoranti per ogni città")
cursor = db.teams.aggregate([{$group: {_id: "$city", n_teams: {$sum:1}, n_resturants:{$sum:"$total"}}}, 
                              {$sort: {n_teams: -1}}, 
                              {$limit : 10}])
                              .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$group: {_id: "$city", n_teams: {$sum:1}, n_resturants:{$sum:"$total"}}}, 
                              {$sort: {n_teams: -1}}, 
                              {$limit : 10}]))


print("--------------------------------------------")
print("7) top 10 tipologie di ristoranti in termini di conteggio")
cursor = db.teams.aggregate([{$unwind: "$businesses"},
                              {$unwind:"$businesses.categories"}, 
                              {$unwind:"$businesses.categories.title"}, 
                              {$project: {t: {$split:["$businesses.categories.title",","]}}}, 
                              {$unwind: "$t"}, 
                              {$group : {  _id:"$t" , count : { $sum : 1 }}}, 
                              {$sort: {count: -1}}, 
                              {$limit:10}])
                              .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$unwind: "$businesses"},
                              {$unwind:"$businesses.categories"}, 
                              {$unwind:"$businesses.categories.title"}, 
                              {$project: {t: {$split:["$businesses.categories.title",","]}}}, 
                              {$unwind: "$t"}, 
                              {$group : {  _id:"$t" , count : { $sum : 1 }}}, 
                              {$sort: {count: -1}}, 
                              {$limit:10}]))

print("--------------------------------------------")
print("8) top 10 tipologie di ristorante per vicinanza agli stadi")
cursor = db.teams.aggregate([{$unwind: "$businesses"},
                              {$unwind:"$businesses.categories"}, 
                              {$group: {_id:"$businesses.categories.title", distance: {$avg:"$businesses.distance"}, rating:{$avg: "$businesses.rating"}}}, 
                              {$sort: {distance:1}}, 
                              {$limit:10}])
                              .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$unwind: "$businesses"},
                              {$unwind:"$businesses.categories"}, 
                              {$group: {_id:"$businesses.categories.title", distance: {$avg:"$businesses.distance"}, rating:{$avg: "$businesses.rating"}}}, 
                              {$sort: {distance:1}}, 
                              {$limit:10}]))



print("--------------------------------------------")
print("9) top 10 stati con più bar o pub")
cursor = db.teams.aggregate([{$match:{"businesses.categories.title":{$in: [/bar/, /pub/]}}},
                              {$group: {_id:"$state", bar_pubs:{$sum:"$total"}}}, 
                              {$sort:{bar_pubs:-1}},
                              {$limit:10}])
                              .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$match:{"businesses.categories.title":{$in: [/bar/, /pub/]}}},
                              {$group: {_id:"$state", bar_pubs:{$sum:"$total"}}}, 
                              {$sort:{bar_pubs:-1}},
                              {$limit:10}]))

print("--------------------------------------------")
print("10) top 10 stati per rating di ristoranti")
db.teams.aggregate([{$unwind: "$businesses"},
                     {$unwind:"$businesses.categories"},
                     {$group: {_id:"$businesses.categories.title", avg_rating: {$avg:"$businesses.rating"}, sum_review:{$sum: "$businesses.review_count"}}}, 
                     {$sort: {sum_review:-1}}, 
                     {$limit:10}])
                     .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$unwind: "$businesses"},
                                                         {$unwind:"$businesses.categories"},
                                                         {$group: {_id:"$businesses.categories.title", avg_rating: {$avg:"$businesses.rating"}, sum_review:{$sum: "$businesses.review_count"}}}, 
                                                         {$sort: {sum_review:-1}}, 
                                                         {$limit:10}]))



print("--------------------------------------------")
print("11) Quale stato ha il maggior numero di pub o bar sportivi più vicini ai propri stadi?")
db.teams.aggregate([{$match:{"businesses.categories.title":{$in: [/bar/, /pub/]}}},
                     {$group: {_id:"$state", bar_pubs:{$sum:"$total"}}}, 
                     {$sort:{bar_pubs:-1}},
                     {$limit:10}])
                     .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$match:{"businesses.categories.title":{$in: [/bar/, /pub/]}}},{$group: {_id:"$state", bar_pubs:{$sum:"$total"}}}, {$sort:{bar_pubs:-1}},{$limit:10}]))


print("--------------------------------------------")
print("statistiche ristoranti per stato?")
db.teams.aggregate([{$unwind: "$businesses"}, 
                     {$group: {_id:"$state", avg_rating: {$avg:"$businesses.rating"}, sum_review:{$sum: "$businesses.review_count"}}}, 
                     {$sort: {avg_rating:-1}}, 
                     {$limit:10}])
                     .forEach(get_results);


printjson(db.teams.explain("executionStats").aggregate([{$unwind: "$businesses"}, {$group: {_id:"$state", avg_rating: {$avg:"$businesses.rating"}, sum_review:{$sum: "$businesses.review_count"}}}, {$sort: {avg_rating:-1}}, {$limit:10}]));


print("--------------------------------------------")
print("Top 10 città che fanno delivery")
db.teams.aggregate([{$unwind:"$businesses"},
                     {$match:{"businesses.transactions":"delivery"}}, 
                     {$group: {_id:"state", n_delivery:{$sum:1}, avg_rating:{$avg:"$businesses.rating"}}}, 
                     {$sort:{n_delivery:-1}}, 
                     {$limit:10}])
                     .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$unwind:"$businesses"},{$match:{"businesses.transactions":"delivery"}}, {$group: {_id:"$state", n_delivery:{$sum:1}, avg_rating:{$avg:"$businesses.rating"}}}, {$sort:{n_delivery:-1}}, {$limit:10}]));



print("--------------------------------------------")
print("rating per fascia di prezzo?") 
db.teams.aggregate([{$unwind: "$businesses"}, 
                     {$group: {_id:"$businesses.price", avg_rating: {$avg:"$businesses.rating"}, sum_review:{$sum: "$businesses.review_count"}}}, 
                     {$sort: {avg_rating:-1}}, 
                     {$limit:10}])
                     .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$unwind: "$businesses"}, {$group: {_id:"$businesses.price", avg_rating: {$avg:"$businesses.rating"}, sum_review:{$sum: "$businesses.review_count"}}}, {$sort: {avg_rating:-1}}, {$limit:10}]));



print("--------------------------------------------")
print("Top 10 tipologie che fanno delivery")
db.teams.aggregate([{$unwind:"$businesses"},
                     {$unwind:"$businesses.categories"},
                     {$match:{"businesses.transactions":"delivery"}}, 
                     {$group: {_id:"$businesses.categories.title", n_delivery:{$sum:1}}}, 
                     {$sort:{n_delivery:-1}}, 
                     {$limit:10}])
                     .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$unwind:"$businesses"},{$unwind:"$businesses.categories"},{$match:{"businesses.transactions":"delivery"}}, {$group: {_id:"$businesses.categories.title", n_delivery:{$sum:1}}}, {$sort:{n_delivery:-1}}, {$limit:10}]));


print("--------------------------------------------")
print("Top 10 tipologie più costose Contare n° $$$$ per tipologia di ristorante/cibo")
db.teams.aggregate([{$unwind:"$businesses"},
                     {$unwind:"$businesses.categories"},
                     {$match:{"businesses.price":"$$$$"}}, 
                     {$group: {_id:"$businesses.categories.title", n_expensive:{$sum:1}}}, 
                     {$sort:{n_expensive:-1}}, 
                     {$limit:10}])
                     .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$unwind:"$businesses"},{$unwind:"$businesses.categories"},{$match:{"businesses.price":"$$$$"}}, {$group: {_id:"$businesses.categories.title", n_expensive:{$sum:1}}}, {$sort:{n_expensive:-1}}, {$limit:10}]));


print("--------------------------------------------")
print("Top 10 tipologie meno costose Contare n° $ per tipologia di ristorante/cibo")
db.teams.aggregate([{$unwind:"$businesses"},
                     {$unwind:"$businesses.categories"},
                     {$match:{"businesses.price":"$"}}, 
                     {$group: {_id:"$businesses.categories.title", n_cheap:{$sum:1}}}, 
                     {$sort:{n_cheap:-1}}, 
                     {$limit:10}])
                     .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$unwind:"$businesses"},{$unwind:"$businesses.categories"},{$match:{"businesses.price":"$"}}, {$group: {_id:"$businesses.categories.title", n_cheap:{$sum:1}}}, {$sort:{n_cheap:-1}}, {$limit:10}]));


print("--------------------------------------------")
print("Top 10 città con ristoranti più costosi")
db.teams.aggregate([{$unwind: "$businesses"}, 
                     {$match: {"businesses.price": "$$$$"}},
                     {$group: {_id: "$city", t: {$push: "$businesses.price"}}}, 
                     {$project: { n_expResturants: { $size:"$t" }}}, 
                     {$sort: {n_expResturants: -1}},
                     {$limit:10}])
                     .forEach(get_results);

printjson(db.teams.explain("executionStats").aggregate([{$unwind: "$businesses"}, {$match: {"businesses.price": "$$$$"}},{$group: {_id: "$city", t: {$push: "$businesses.price"}}}, {$project: { n_expResturants: { $size:"$t" }}}, {$sort: {n_expResturants: -1}},{$limit:10}]));


print("--------------------------------------------")
print("Top 10 città con ristoranti meno costosi")
db.teams.aggregate([{$unwind: "$businesses"}, 
                     {$match: {"businesses.price": "$"}},
                     {$group: {_id: "$city", t: {$push: "$businesses.price"}}}, 
                     {$project: { n_cheapResturants: { $size:"$t" }}}, 
                     {$sort: {n_cheapResturants: -1}},
                     {$limit:10}])
                     .forEach(get_results);
printjson(db.teams.explain("executionStats").aggregate([{$unwind: "$businesses"}, {$match: {"businesses.price": "$"}},{$group: {_id: "$city", t: {$push: "$businesses.price"}}}, {$project: { n_cheapResturants: { $size:"$t" }}}, {$sort: {n_cheapResturants: -1}},{$limit:10}]));



print("-------------------------------------------------")
print("Trova i ristoranti più economici e più vicini ai campi di calcio (MLS), utilizzando l'indice")
db.teams.find({"league":"MLS", "businesses.distance": {$lte:1000}, "businesses.distance":{$gte:10}, "businesses.price":"$"}, 
               {"businesses.name":1, "businesses.distance":1, "businesses.rating":1, "_id":0}).comment("query_mls").forEach(get_results);

printjson(db.teams.explain("executionStats").find({"league":"MLS", "businesses.distance": {$lte:1000}, "businesses.distance":{$gte:10}, "businesses.price":"$"}, 
               {"businesses.name":1, "businesses.distance":1, "businesses.rating":1, "_id":0}))


print("-----------------------------------------------------")
print("Aggiornamento dei locali chiusi")
db.teams.updateMany({"businesses.is_closed":{$eq:true}},{$set: {"businesses.$.location.address3":"New Opening Soon"}}).forEach(get_results);

