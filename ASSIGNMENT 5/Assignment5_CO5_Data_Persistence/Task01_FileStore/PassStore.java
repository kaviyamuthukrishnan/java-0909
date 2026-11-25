import java.io.*;
import java.nio.file.*;
import java.nio.file.StandardOpenOption;
import java.util.*;

public class PassStore {
    private final Path file;
    public PassStore(Path file) { this.file=file; }

    public void add(String id,String reg,String name,int route,double amount) throws IOException {
        if(id.isBlank()||reg.isBlank()||name.isBlank()||name.contains(",")||name.contains("\n"))
            throw new IllegalArgumentException("Required fields; demo does not allow comma/newline in name");
        if(route<=0||amount<0) throw new IllegalArgumentException("Invalid route/amount");
        try(BufferedWriter w=Files.newBufferedWriter(file,StandardOpenOption.CREATE,StandardOpenOption.APPEND)) {
            w.write(String.join(",",id,reg,name,String.valueOf(route),String.valueOf(amount))); w.newLine();
        }
    }
    public String[] find(String target) throws IOException {
        if(!Files.exists(file)) return null;
        try(BufferedReader r=Files.newBufferedReader(file)) {
            String line;
            while((line=r.readLine())!=null) {
                String[] f=line.split(",",-1);
                if(f.length!=5) { System.err.println("Skipping damaged row: "+line); continue; }
                try { Integer.parseInt(f[3]); Double.parseDouble(f[4]); }
                catch(NumberFormatException e) { System.err.println("Skipping invalid numeric row: "+line); continue; }
                if(f[0].equals(target)) return f;
            }
        }
        return null;
    }
    public List<String[]> listByRoute(int route) throws IOException {
        List<String[]> out=new ArrayList<>();
        if(!Files.exists(file)) return out;
        try(BufferedReader r=Files.newBufferedReader(file)) {
            String line;
            while((line=r.readLine())!=null) {
                String[] f=line.split(",",-1);
                if(f.length!=5) continue;
                try { if(Integer.parseInt(f[3])==route) { Double.parseDouble(f[4]); out.add(f); } }
                catch(NumberFormatException ignored) {}
            }
        }
        return out;
    }
    public static void main(String[] args) throws Exception {
        Path p=Files.createTempFile("passes",".csv"); PassStore s=new PassStore(p);
        s.add("P1001","192311001","Arun",12,4500);
        Files.writeString(p,"P1002,DAMAGED LINE\n",StandardOpenOption.APPEND);
        s.add("P1003","192311003","Divya",7,3800);
        System.out.println(Arrays.toString(s.find("P1003")));
        System.out.println(Arrays.toString(s.find("P1002")));
        System.out.println("Route 12 count: "+s.listByRoute(12).size());
        Files.deleteIfExists(p);
    }
}
