import java.sql.*; import java.util.*;
public class StudentDao implements Dao<Student,Integer> {
    private final Connection con;
    public StudentDao(Connection con){this.con=con;}
    public Integer insert(Student s)throws SQLException {
        String q="INSERT INTO student(register_no,name,department) VALUES(?,?,?)";
        try(PreparedStatement ps=con.prepareStatement(q,Statement.RETURN_GENERATED_KEYS)){
            ps.setString(1,s.getRegisterNo()); ps.setString(2,s.getName()); ps.setString(3,s.getDepartment()); ps.executeUpdate();
            try(ResultSet k=ps.getGeneratedKeys()){if(k.next())return k.getInt(1);}
        } throw new SQLException("No generated key");
    }
    public Optional<Student> findById(Integer id)throws SQLException {
        try(PreparedStatement ps=con.prepareStatement("SELECT * FROM student WHERE student_id=?")){
            ps.setInt(1,id); try(ResultSet r=ps.executeQuery()){if(r.next())return Optional.of(map(r));}
        } return Optional.empty();
    }
    public List<Student> findAll()throws SQLException {
        List<Student> out=new ArrayList<>();
        try(PreparedStatement ps=con.prepareStatement("SELECT * FROM student");ResultSet r=ps.executeQuery()){
            while(r.next())out.add(map(r));
        } return out;
    }
    public boolean update(Student s)throws SQLException {
        try(PreparedStatement ps=con.prepareStatement("UPDATE student SET register_no=?,name=?,department=? WHERE student_id=?")){
            ps.setString(1,s.getRegisterNo());ps.setString(2,s.getName());ps.setString(3,s.getDepartment());ps.setInt(4,s.getStudentId());return ps.executeUpdate()==1;
        }
    }
    public boolean delete(Integer id)throws SQLException {
        try(PreparedStatement ps=con.prepareStatement("DELETE FROM student WHERE student_id=?")){
            ps.setInt(1,id);return ps.executeUpdate()==1;
        }
    }
    private Student map(ResultSet r)throws SQLException {
        return new Student(r.getInt("student_id"),r.getString("register_no"),r.getString("name"),r.getString("department"));
    }
}
