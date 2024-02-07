#!/usr/bin/env bash

#$1 script_to_run: It can be USER_CACHE_INDEXER, DRUID_CONTENT_INDEXER etc,.
#$2 identifier: userid- Especially for UserCache indexer script to cache specific user id details
#$3 date: YYYY-MM-DD- Especially for UserCache indexer script to cache all the user data from this specific updated date.
#$4 populate_anonymous_user: true/false - Especially for UserCacheIndexer to read anonymous user's data
#$5 refresh_user_data: true/false - Especially for UserCacheIndexer to refresh user's data of redis
DATA_DIR="/data/analytics/content-snapshot/logs"
[[ -d $DATA_DIR ]] || mkdir -p $DATA_DIR
{
   
   echo "Executing the script $1 $2 $3 $4 $5"
   case "$1" in
      "USER_CACHE_INDEXER") 
         echo "Invoked RedisUserDataIndexer"
         source {{ .Values.content.snapshotPath }}/scripts/RedisUserDataIndexer.sh $2 $3 $4 $5 &
      ;;
      "DRUID_CONTENT_INDEXER")
         echo "Invoked DruidContentIndexer"
         source {{ .Values.content.snapshotPath }}/scripts/DruidContentIndexer.sh &
      ;;
   
      "CONTENT_CACHE_INDEXER")  
         echo "Invoked RedisContentIndexer"
         source {{ .Values.content.snapshotPath }}/scripts/RedisContentIndexer.sh &
      ;;
      "DIALCODE_CACHE_INDEXER") 
         echo "Invoked RedisDialcodeIndexer"
         source {{ .Values.content.snapshotPath }}/scripts/RedisDialcodeIndexer.sh &
      ;;
   esac
} >> "$DATA_DIR/$3-shell-execution.log" 2>&1