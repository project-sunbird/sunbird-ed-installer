CREATE KEYSPACE IF NOT EXISTS ${ENV}_question_store WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': '1'
};

CREATE TABLE IF NOT EXISTS ${ENV}_question_store.question_data (
  identifier text,
  body blob,
  editorState text,
  answer blob,
  solutions text,
  instructions text,
  hints text,
  media text,
  responseDeclaration text,
  interactions text,
  outcomeDeclaration text,
  feedback text,
  PRIMARY KEY (identifier)
);