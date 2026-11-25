# PART A – DESIGN ANSWERS

## A1 – File format
**Delimited text layout:** passId, registerNo, name, routeNo, boardingStop, validityDate, amountPaid. Use UTF-8 and one record per line. Quote fields containing commas, quotes or line breaks and escape embedded quotes; use a CSV parser rather than simple split for production.

**Binary DataOutputStream layout:** writeUTF(passId), writeUTF(registerNo), writeUTF(name), writeInt(routeNo), writeUTF(boardingStop), writeLong(validityDate.toEpochDay()), writeDouble(amountPaid). Read fields in exactly the same order. Add a format version/header for future compatibility.

**ADD_PASS pseudocode**
```
ALGORITHM ADD_PASS(pass)
  VALIDATE required fields, date, amount and unique pass ID
  OPEN BufferedWriter in APPEND mode using UTF-8
  ENCODE pass as escaped CSV record
  WRITE record and newline; FLUSH; CLOSE
  RETURN SUCCESS
END
```
**FIND_PASS_BY_ID pseudocode**
```
ALGORITHM FIND_PASS_BY_ID(target)
  IF file missing THEN RETURN NOT_FOUND
  OPEN BufferedReader
  FOR EACH line
    PARSE with CSV-aware parser
    IF invalid THEN LOG line number; CONTINUE
    IF pass.passId = target THEN RETURN pass
  END FOR
  CLOSE reader
  RETURN NOT_FOUND
END
```
**LIST_PASSES_BY_ROUTE pseudocode**
```
ALGORITHM LIST_PASSES_BY_ROUTE(route)
  result <- empty list
  OPEN BufferedReader
  FOR EACH line
    PARSE and validate line
    IF valid AND pass.routeNo = route THEN ADD pass TO result
    ELSE IF invalid THEN LOG damaged line
  END FOR
  CLOSE reader
  RETURN result
END
```
BufferedReader/BufferedWriter support efficient character-based line processing. Missing file: report clearly; create it for first ADD. Damaged line: validate field count/types and skip with a diagnostic. Power failure: for whole-file rewrite use temp file plus atomic move; for append logs validate complete final records/checksums and discard an incomplete tail during recovery.

**Alternative – RandomAccessFile:** fixed-size record i can be read with seek(i * recordSize), O(1) when the record index is known. Finding by ID still requires O(n) without an ID-to-offset index. Fixed-width name/stop fields waste padding. An index improves lookup but costs extra storage and maintenance.

## A2 – Buffered I/O
50 MiB = 52,428,800 bytes, so a byte-at-a-time loop makes about 52.4 million read calls. A 64 KiB buffer reduces bulk reads to about 800. Both are O(N) time; buffered streaming uses O(B) extra memory. Files.readAllLines is O(N) time and O(N) memory (often more due to String/object overhead), appropriate for smaller files needing all lines in memory. Buffering adds little benefit when data is already in memory or processing, not I/O, is the bottleneck.

## A3 – DAO pattern
Repeated steps: obtain connection, prepare SQL, bind values, execute, map ResultSet, handle errors and close resources. Differences: table/columns, key type, predicates and object mapping.
```java
public interface Dao<T,K> {
  K insert(T value) throws SQLException;
  Optional<T> findById(K id) throws SQLException;
  List<T> findAll() throws SQLException;
  boolean update(T value) throws SQLException;
  boolean delete(K id) throws SQLException;
}
```
StudentDao implements Dao<Student,Integer>. Map Student.studentId to student.student_id (primary key), registerNo to register_no, name to name and department to department. SQL in GUI/service classes means schema changes are repeated in many places. DAO centralizes changes. Asymptotic query time and storage are essentially unchanged; DAO adds minor abstraction overhead.

## A4 – Serialization
Mark password and live JDBC Connection transient. Credentials should not be serialized; store salted password hashes securely. Connection is process/session-specific and must be recreated. Serializing Hostel traverses reachable Room and Resident objects; all non-transient reachable fields must be serializable. Add serialVersionUID. A compatible new field in a class is assigned its default value when an old stream is read; incompatible changes or UID mismatch can cause InvalidClassException. CSV/JSON is more interoperable and schema-friendly; Java serialization is convenient for object graphs but tightly coupled to Java class structure. Saving/loading n residents is O(n); text is often larger, serialization often compact but format-dependent.

## A5 – Transactions and injection
**Transfer pseudocode**
```
SET autoCommit FALSE
TRY
  UPDATE source wallet SET balance=balance-amount WHERE id=source AND balance>=amount
  IF affected rows != 1 THEN RAISE ERROR
  UPDATE destination wallet SET balance=balance+amount WHERE id=destination
  IF affected rows != 1 THEN RAISE ERROR
  COMMIT
CATCH ERROR
  ROLLBACK
FINALLY restore connection settings and close resources
END
```
String concatenation allows input such as `admin' -- ` to alter the WHERE clause and bypass password checking. Use `SELECT 1 FROM users WHERE id=? AND pwd_hash=?` and bind both values with PreparedStatement. Escaping or regex validation is weaker because edge cases and SQL dialect/encoding differences can be missed. Parameterization separates SQL syntax from data.
