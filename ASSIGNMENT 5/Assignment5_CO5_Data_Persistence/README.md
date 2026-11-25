# Assignment 5 – CO5: Data Persistence Engineering

Individual Java assignment: file I/O, buffering, DAO, serialization, JDBC transactions, SQL injection, batch loading and migration.

## Requirements
- JDK 17 or later; MySQL 8.x; MySQL Connector/J; Git/Git Bash.
- Set `DB_URL`, `DB_USER`, `DB_PASSWORD`. Defaults: `jdbc:mysql://localhost:3306/assignment5`, `root`, empty password.
- Run `Task04_JDBC_Transactions/schema.sql` in MySQL.
- Put Connector/J JAR in `lib/`; never commit database passwords.

## Task folders
- PartA_Design_Answers: written layouts, pseudocode, alternatives and Big-O.
- Task01_FileStore: completed PassStore search, buffered line counter and growth benchmark.
- Task02_DAO: generic DAO interface and StudentDao.
- Task03_Serialization: object graph and transient fields.
- Task04_JDBC_Transactions: schema, transaction-safe wallet transfer, unsafe/safe login examples.
- Task05_PassLoader: completed batch loader and rollback test.
- Task06_Migration: validated migration and DatabaseMetaData report.

## Compile/run without database
From `Task01_FileStore`: `javac *.java`, then `java PassStore`, `java BufferedLineCounter`, `java PassStoreBenchmark`.
From `Task03_Serialization`: `javac HostelSnapshot.java`, then `java HostelSnapshot`.

## JDBC
Create one IDE Java project/source root, add Connector/J to Build Path, and place task Java files in the source root (all examples use the default package). Run `PassLoaderDemo` with arguments 1000, 10000 and 100000. The JDBC tasks require the `Db` class and configured MySQL connection.

## Required evidence to collect
1. Run all programs and capture full code/output screenshots.
2. B1: create 1 MB, 10 MB and 50 MB test files; record unbuffered and buffered times. Record lookup time for 1,000 / 10,000 / 100,000 passes.
3. B2: run unsafe and PreparedStatement login tests using a local disposable database and dummy test accounts only; test malformed file lines.
4. B3: implement and measure Statement and non-batched PreparedStatement comparison variants at 10, 1,000, 10,000 and 100,000 rows. Verify using SELECT and ResultSetMetaData. Test auto-commit vs transaction rollback.
5. B4: run migration, inspect migration-rejections.txt and capture DatabaseMetaData output.
6. Fill report tables with actual measurements. Do not invent results.

## GitHub
The brief specifies repository name `CSA09-<RegisterNumber>-Assignment5`. Use your own register number, add faculty as collaborator if private, and commit progressively at least once per task.
