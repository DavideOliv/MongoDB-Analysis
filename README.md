# MongoDB-Analysis
Per avviare il progetto basterà eseguire il seguente comando all'interno della cartella "/ProgettoDB":
> docker-compose up

All'interno del path: */ProgettoDB/data* troverete:
* 148 file **json** per popolare il database
* **query.js**: contentente la lista delle query da eseguire per l'analisi
* **result.json**: che verrà creato al termine e conterrà le informazioni sul risultato delle query e le loro statistiche
* **init_db.sh** : che si occupa di creare e salvare i documenti del database creando una connessionne

Nel progetto è presente anche un file **query.txt**, in cui sono riportate tutte le query da lanciare manualmente tramite la PowerShell di MongoDB.
Per far ciò è necessario entrare nel container chiamato **mongo** :

> docker exec -it mongo bash

Eseguire poi i seguenti comandi per accedere al database:

> mongo -u admin -p password  --authenticationDatabase admin SportResturants

> use SportResturants




