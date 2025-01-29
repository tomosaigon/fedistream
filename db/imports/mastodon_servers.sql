CREATE TABLE "mastodon_servers" (
	"id"	INTEGER,
	"uri"	TEXT NOT NULL,
	"slug"	TEXT NOT NULL,
	"name"	TEXT NOT NULL,
	"enabled"	INTEGER NOT NULL DEFAULT 1,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://fosstodon.org', '$HOME', '$HOME', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://corteximplant.com', 'corteximplant', 'Cortex Implant', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://discuss.systems', 'discuss.systems', 'discuss.systems', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://fosstodon.org', 'fosstodon', 'Fosstodon', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://mastodon.bsd.cafe', 'bsd.cafe', 'bsd.cafe', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://bsd.network', 'bsd.network', 'bsd.network needs auth', '0');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://cyberplace.social', 'cyberplace', 'Cyberplace', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://layer8.space', 'layer8', 'Layer8', '0');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://noc.social', 'noc.social', 'noc.social', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://tilde.zone', 'tilde', 'Tilde Zone', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://techhub.social', 'techhub', 'TechHub', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://infosec.exchange', 'infosec', 'Infosec Ex', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://linuxrocks.online', 'linuxrocks', 'LinuxRocks', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://defcon.social', 'defcon', 'DEFCON', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://ioc.exchange', 'ioc', 'IOC Ex', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://lingo.lol', 'lingo', 'Lingo.lol', '0');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://mathstodon.xyz', 'mathstodon', 'Mathstodon', '0');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://hachyderm.io', 'hachyderm', 'Hachyderm', '1');
INSERT INTO "mastodon_servers" ("uri", "slug", "name", "enabled") VALUES ('https://hostux.social', 'hostux', 'Hostux', '1');