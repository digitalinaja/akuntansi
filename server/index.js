const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const knex = require("knex");

const PORT = process.env.PORT || 4000;
const DB_CLIENT = process.env.DB_CLIENT || "sqlite3"; // opsi: sqlite3 | mysql2 | pg (jika ditambahkan)
const DB_FILENAME = process.env.DB_FILENAME || path.join(__dirname, "..", "data", "db.sqlite");
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "akuntansi";
const PUBLIC_DIR = path.join(__dirname, "..");

if (DB_CLIENT === "sqlite3") {
  const dataDir = path.dirname(DB_FILENAME);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

const dbConfig =
  DB_CLIENT === "sqlite3"
    ? {
        client: "sqlite3",
        connection: { filename: DB_FILENAME },
        useNullAsDefault: true
      }
    : {
        client: DB_CLIENT,
        connection: {
          host: DB_HOST,
          port: DB_PORT,
          user: DB_USER,
          password: DB_PASSWORD,
          database: DB_NAME
        }
      };

const db = knex(dbConfig);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

async function ensureTables() {
  const hasAccounts = await db.schema.hasTable("accounts");
  if (!hasAccounts) {
    await db.schema.createTable("accounts", table => {
      table.string("id").primary();
      table.string("name").notNullable();
      table.string("type").notNullable();
      table.string("normalBalance").notNullable();
    });
  }

  const hasJournals = await db.schema.hasTable("journals");
  if (!hasJournals) {
    await db.schema.createTable("journals", table => {
      table.increments("id").primary();
      table.string("date").notNullable();
      table.string("description").notNullable();
      table.string("reference");
      table.text("debit").notNullable(); // JSON string
      table.text("credit").notNullable(); // JSON string
    });
  }
}

function mapJournalRow(row) {
  return {
    id: row.id,
    date: row.date,
    description: row.description,
    reference: row.reference || "",
    debit: JSON.parse(row.debit || "[]"),
    credit: JSON.parse(row.credit || "[]")
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/accounts", async (_req, res, next) => {
  try {
    const rows = await db("accounts").select();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post("/api/accounts", async (req, res, next) => {
  try {
    const { id, name, type, normalBalance } = req.body || {};
    if (!id || !name || !type || !normalBalance) {
      return res.status(400).send("Field id, name, type, normalBalance wajib.");
    }
    await db("accounts").insert({ id, name, type, normalBalance });
    res.status(201).json({ id, name, type, normalBalance });
  } catch (err) {
    if (err && err.code === "SQLITE_CONSTRAINT") {
      return res.status(400).send("Kode akun sudah digunakan.");
    }
    next(err);
  }
});

app.put("/api/accounts/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const allowed = ["name", "type", "normalBalance"];
    const payload = {};
    allowed.forEach(k => {
      if (updates[k]) payload[k] = updates[k];
    });
    if (Object.keys(payload).length === 0) {
      return res.status(400).send("Tidak ada field yang diubah.");
    }
    const updated = await db("accounts").where({ id }).update(payload);
    if (!updated) return res.status(404).send("Akun tidak ditemukan.");
    const acc = await db("accounts").where({ id }).first();
    res.json(acc);
  } catch (err) {
    next(err);
  }
});

async function getNextJournalId() {
  const row = await db("journals").max("id as maxId").first();
  return (row?.maxId || 0) + 1;
}

app.get("/api/journals/next-id", async (_req, res, next) => {
  try {
    const nextId = await getNextJournalId();
    res.json({ nextId });
  } catch (err) {
    next(err);
  }
});

app.get("/api/journals", async (_req, res, next) => {
  try {
    const rows = await db("journals").select().orderBy([{ column: "date" }, { column: "id" }]);
    res.json(rows.map(mapJournalRow));
  } catch (err) {
    next(err);
  }
});

app.post("/api/journals", async (req, res, next) => {
  try {
    const { id, date, description, reference, debit = [], credit = [] } = req.body || {};
    if (!date || !description || !debit.length || !credit.length) {
      return res.status(400).send("Field date, description, debit, credit wajib.");
    }
    const journalId = id || (await getNextJournalId());
    await db("journals").insert({
      id: journalId,
      date,
      description,
      reference: reference || "",
      debit: JSON.stringify(debit),
      credit: JSON.stringify(credit)
    });
    res.status(201).json({
      id: journalId,
      date,
      description,
      reference: reference || "",
      debit,
      credit
    });
  } catch (err) {
    next(err);
  }
});

app.get("/api/export", async (_req, res, next) => {
  try {
    const accounts = await db("accounts").select();
    const journalRows = await db("journals").select().orderBy([{ column: "date" }, { column: "id" }]);
    const journals = journalRows.map(mapJournalRow);
    const lastJournalId = journalRows.length ? Math.max(...journalRows.map(r => r.id)) : 0;
    res.json({ accounts, journals, lastJournalId });
  } catch (err) {
    next(err);
  }
});

app.post("/api/import", async (req, res, next) => {
  const { accounts = [], journals = [] } = req.body || {};
  const trx = await db.transaction();
  try {
    await trx("journals").del();
    await trx("accounts").del();
    if (accounts.length) {
      await trx("accounts").insert(accounts);
    }
    if (journals.length) {
      const rows = journals.map(j => ({
        id: j.id,
        date: j.date,
        description: j.description,
        reference: j.reference || "",
        debit: JSON.stringify(j.debit || []),
        credit: JSON.stringify(j.credit || [])
      }));
      await trx("journals").insert(rows);
    }
    await trx.commit();
    res.json({ status: "ok" });
  } catch (err) {
    await trx.rollback();
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send(err.message || "Internal Server Error");
});

async function start() {
  await ensureTables();
  app.listen(PORT, () => {
    console.log(`API server berjalan di http://localhost:${PORT}`);
  });
}

start();
