const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const knex = require("knex");
const { authMiddleware } = require("./middleware/auth");
const authRoutes = require("./routes/auth");

const PORT = process.env.PORT || 4000;
const DB_CLIENT = process.env.DB_CLIENT || "sqlite3";
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

// Make db available to routes
app.set('db', db)

app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

async function ensureTables() {
  // Users table
  const hasUsers = await db.schema.hasTable("users");
  if (!hasUsers) {
    await db.schema.createTable("users", table => {
      table.increments("id").primary();
      table.string("email").notNullable().unique();
      table.string("password_hash").notNullable();
      table.string("name").notNullable();
      table.timestamps(true, true);
    });
  }

  // Accounts table (with user_id)
  const hasAccounts = await db.schema.hasTable("accounts");
  if (!hasAccounts) {
    await db.schema.createTable("accounts", table => {
      table.string("id").primary();
      table.integer("user_id").notNullable().references("id").inTable("users");
      table.string("name").notNullable();
      table.string("type").notNullable();
      table.string("normalBalance").notNullable();
    });
  } else {
    // Add user_id column if it doesn't exist
    const hasUserId = await db.schema.hasColumn("accounts", "user_id");
    if (!hasUserId) {
      await db.schema.alterTable("accounts", table => {
        table.integer("user_id").notNullable().default(1);
      });
    }
  }

  // Journals table (with user_id)
  const hasJournals = await db.schema.hasTable("journals");
  if (!hasJournals) {
    await db.schema.createTable("journals", table => {
      table.increments("id").primary();
      table.integer("user_id").notNullable().references("id").inTable("users");
      table.string("date").notNullable();
      table.string("description").notNullable();
      table.string("reference");
      table.text("debit").notNullable();
      table.text("credit").notNullable();
    });
  } else {
    // Add user_id column if it doesn't exist
    const hasUserId = await db.schema.hasColumn("journals", "user_id");
    if (!hasUserId) {
      await db.schema.alterTable("journals", table => {
        table.integer("user_id").notNullable().default(1);
      });
    }
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

// Health check (no auth required)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Auth routes (no auth required)
app.use("/api/auth", authRoutes);

// Protected routes - require auth
app.get("/api/accounts", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const rows = await db("accounts").where({ user_id: userId }).select();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post("/api/accounts", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id, name, type, normalBalance } = req.body || {};
    if (!id || !name || !type || !normalBalance) {
      return res.status(400).json({ message: "Field id, name, type, normalBalance wajib." });
    }
    await db("accounts").insert({ id, user_id: userId, name, type, normalBalance });
    res.status(201).json({ id, user_id: userId, name, type, normalBalance });
  } catch (err) {
    if (err && err.code === "SQLITE_CONSTRAINT") {
      return res.status(400).json({ message: "Kode akun sudah digunakan." });
    }
    next(err);
  }
});

app.put("/api/accounts/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const updates = req.body || {};
    const allowed = ["name", "type", "normalBalance"];
    const payload = {};
    allowed.forEach(k => {
      if (updates[k]) payload[k] = updates[k];
    });
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "Tidak ada field yang diubah." });
    }
    const updated = await db("accounts").where({ id, user_id: userId }).update(payload);
    if (!updated) return res.status(404).json({ message: "Akun tidak ditemukan." });
    const acc = await db("accounts").where({ id, user_id: userId }).first();
    res.json(acc);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/accounts/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const deleted = await db("accounts").where({ id, user_id: userId }).del();
    if (!deleted) return res.status(404).json({ message: "Akun tidak ditemukan." });
    res.json({ message: "Akun berhasil dihapus." });
  } catch (err) {
    next(err);
  }
});

async function getNextJournalId(userId) {
  const row = await db("journals").where({ user_id: userId }).max("id as maxId").first();
  return (row?.maxId || 0) + 1;
}

app.get("/api/journals/next-id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const nextId = await getNextJournalId(userId);
    res.json({ nextId });
  } catch (err) {
    next(err);
  }
});

app.get("/api/journals", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const rows = await db("journals").where({ user_id: userId }).select().orderBy([{ column: "date" }, { column: "id" }]);
    res.json(rows.map(mapJournalRow));
  } catch (err) {
    next(err);
  }
});

app.post("/api/journals", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Support both formats: simple (debitAccountId/creditAccountId/amount) and full (debit/credit arrays)
    let debit, credit;
    const { id, date, description, reference, debitAccountId, creditAccountId, amount } = req.body || {};

    if (debitAccountId && creditAccountId && amount) {
      // Simple format from frontend transaction form
      if (!date || !description) {
        return res.status(400).json({ message: "Field date, description wajib." });
      }
      debit = [{ account: debitAccountId, amount: Number(amount) }];
      credit = [{ account: creditAccountId, amount: Number(amount) }];
    } else {
      // Full format with debit/credit arrays
      debit = req.body.debit || [];
      credit = req.body.credit || [];
      if (!date || !description || !debit.length || !credit.length) {
        return res.status(400).json({ message: "Field date, description, debit, credit wajib." });
      }
    }

    const journalId = id || (await getNextJournalId(userId));
    await db("journals").insert({
      id: journalId,
      user_id: userId,
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

app.delete("/api/journals/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const deleted = await db("journals").where({ id, user_id: userId }).del();
    if (!deleted) return res.status(404).json({ message: "Jurnal tidak ditemukan." });
    res.json({ message: "Jurnal berhasil dihapus." });
  } catch (err) {
    next(err);
  }
});

app.get("/api/export", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const accounts = await db("accounts").where({ user_id: userId }).select();
    const journalRows = await db("journals").where({ user_id: userId }).select().orderBy([{ column: "date" }, { column: "id" }]);
    const journals = journalRows.map(mapJournalRow);
    const lastJournalId = journalRows.length ? Math.max(...journalRows.map(r => r.id)) : 0;
    res.json({ accounts, journals, lastJournalId });
  } catch (err) {
    next(err);
  }
});

app.post("/api/import", authMiddleware, async (req, res, next) => {
  const userId = req.user.userId;
  const { accounts = [], journals = [] } = req.body || {};
  const trx = await db.transaction();
  try {
    await trx("journals").where({ user_id: userId }).del();
    await trx("accounts").where({ user_id: userId }).del();
    if (accounts.length) {
      const accountRows = accounts.map(a => ({ ...a, user_id: userId }));
      await trx("accounts").insert(accountRows);
    }
    if (journals.length) {
      const rows = journals.map(j => ({
        id: j.id,
        user_id: userId,
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
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

async function start() {
  await ensureTables();
  app.listen(PORT, () => {
    console.log(`API server berjalan di http://localhost:${PORT}`);
  });
}

start();
