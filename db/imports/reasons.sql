CREATE TABLE reasons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reason TEXT NOT NULL UNIQUE,
        active INTEGER DEFAULT 1,
        filter INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- INSERT INTO "reasons" ("reason", "active", "filter") VALUES ('cookie', '1', '0');
INSERT INTO "reasons" ("reason", "active", "filter") VALUES ('like', '1', '0');
INSERT INTO "reasons" ("reason", "active", "filter") VALUES ('ad', '1', '1');
INSERT INTO "reasons" ("reason", "active", "filter") VALUES ('pol', '1', '1');
INSERT INTO "reasons" ("reason", "active", "filter") VALUES ('bitter', '1', '1');
INSERT INTO "reasons" ("reason", "active", "filter") VALUES ('phlog', '1', '0');
INSERT INTO "reasons" ("reason", "active", "filter") VALUES ('foreign', '1', '1');
INSERT INTO "reasons" ("reason", "active", "filter") VALUES ('OT', '1', '0');
INSERT INTO "reasons" ("reason", "active", "filter") VALUES ('shh', '1', '1');