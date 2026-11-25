import java.sql.*; import java.util.*;
public class PassLoaderDemo {
    public static void main(String[] a)throws Exception {
        int n=a.length>0?Integer.parseInt(a[0]):1000; List<String[]> rows=new ArrayList<>();
        for(int i=1;i<=n;i++)rows.add(new String[]{"PASS"+i,"REG"+i,"Student"+i,""+(i%20+1),"4500.00"});
        try(Connection c=Db.getConnection()){System.out.println("Inserted rows: "+PassLoader.loadAll(c,rows));}
    }
}
