import java.io.*; import java.nio.file.*; import java.sql.*; import java.util.*;
public class MigratePasses {
    public static void main(String[] a)throws Exception {
        Path input=Path.of(a.length>0?a[0]:"passes.csv"); List<String[]> valid=new ArrayList<>();List<String> rejected=new ArrayList<>();
        try(BufferedReader r=Files.newBufferedReader(input)){
            String line;int no=0;while((line=r.readLine())!=null){no++;String[] f=line.split(",",-1);
                try{if(f.length!=5)throw new IllegalArgumentException("expected 5 fields");
                    Integer.parseInt(f[3]);double amount=Double.parseDouble(f[4]);
                    if(f[0].isBlank()||f[1].isBlank()||f[2].isBlank()||amount<0)throw new IllegalArgumentException("invalid field");
                    valid.add(f);
                }catch(RuntimeException e){rejected.add("Line "+no+": "+e.getMessage()+" | "+line);}
            }
        }
        try(Connection c=Db.getConnection()){System.out.println("Migrated rows: "+PassLoader.loadAll(c,valid));}
        Files.write(Path.of("migration-rejections.txt"),rejected);
        System.out.println("Rejected rows: "+rejected.size());
    }
}
