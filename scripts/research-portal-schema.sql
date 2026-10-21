CREATE TABLE IF NOT EXISTS research_portal_events (
  sequence INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  payload TEXT NOT NULL CHECK(json_valid(payload))
);
CREATE TRIGGER IF NOT EXISTS research_portal_events_no_update
BEFORE UPDATE ON research_portal_events BEGIN SELECT RAISE(ABORT, 'Review events are immutable'); END;
CREATE TRIGGER IF NOT EXISTS research_portal_events_no_delete
BEFORE DELETE ON research_portal_events BEGIN SELECT RAISE(ABORT, 'Review events are immutable'); END;

CREATE TABLE IF NOT EXISTS research_portal_lyrics (
  document_id TEXT NOT NULL,
  lyrics_hash TEXT NOT NULL,
  text TEXT NOT NULL,
  rights_status TEXT NOT NULL CHECK (rights_status = 'RESEARCH_AUTHORIZED'),
  PRIMARY KEY (document_id, lyrics_hash)
);
