import java.sql.*;
public class MetadataReport {
    public static void main(String[] a)throws Exception {
        try(Connection c=Db.getConnection()){
            DatabaseMetaData m=c.getMetaData();
            System.out.println("Database: "+m.getDatabaseProductName()+" "+m.getDatabaseProductVersion());
            System.out.println("Driver: "+m.getDriverName()+" "+m.getDriverVersion());
            try(ResultSet r=m.getTables(c.getCatalog(),null,"%",new String[]{"TABLE"})){
                System.out.println("Tables:");while(r.next())System.out.println(" - "+r.getString("TABLE_NAME"));
            }
        }
    }
}
