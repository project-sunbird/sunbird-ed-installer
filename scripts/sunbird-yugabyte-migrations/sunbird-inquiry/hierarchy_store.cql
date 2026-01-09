CREATE KEYSPACE IF NOT EXISTS ${ENV}_hierarchy_store WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': '1'
};

CREATE TABLE IF NOT EXISTS ${ENV}_hierarchy_store.questionset_hierarchy (
  identifier text,
  hierarchy text,
  instructions text,
  outcomeDeclaration text,
  PRIMARY KEY (identifier)
);