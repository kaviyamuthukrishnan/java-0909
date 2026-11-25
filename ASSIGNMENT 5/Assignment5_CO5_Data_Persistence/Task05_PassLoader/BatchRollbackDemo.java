import java.sql.*; import java.util.*;
public class BatchRollbackDemo {
    public static void main(String[] a)throws Exception {
        try(Connection c=Db.getConnection()){
            List<String[]> rows=new ArrayList<>();
            for(int i=1;i<=10;i++)rows.add(new String[]{"ROLL"+i,"R"+i,"Test"+i,"5",i==6?"NOT_NUMBER":"100.00"});
            try{PassLoader.loadAll(c,rows);}catch(RuntimeException|SQLException e){System.out.println("Expected failure: "+e.getMessage());}
            try(Statement s=c.createStatement();ResultSet r=s.executeQuery("SELECT COUNT(*) FROM bus_pass WHERE pass_id LIKE 'ROLL%'")){
                r.next();System.out.println("Rows remaining: "+r.getInt(1));
            }
        }
    }
}
