#! /bin/bash
for filename in /docker-entrypoint-initdb.d/*.json; do mongoimport --authenticationDatabase admin -u admin -p password --db SportResturants --collection teams --type json --file $filename; done
file="/docker-entrypoint-initdb.d/results.json"
[ -f $file ] && rm $file
mongo -u admin -p password  --authenticationDatabase admin SportResturants --quiet /docker-entrypoint-initdb.d/query.js > /docker-entrypoint-initdb.d/results.json


