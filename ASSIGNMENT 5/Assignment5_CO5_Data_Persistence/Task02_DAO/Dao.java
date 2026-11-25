import java.sql.SQLException;
import java.util.*;
public interface Dao<T,K> {
    K insert(T value) throws SQLException;
    Optional<T> findById(K id) throws SQLException;
    List<T> findAll() throws SQLException;
    boolean update(T value) throws SQLException;
    boolean delete(K id) throws SQLException;
}
