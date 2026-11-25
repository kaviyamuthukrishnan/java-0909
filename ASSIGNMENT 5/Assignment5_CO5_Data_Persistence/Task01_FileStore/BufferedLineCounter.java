import java.io.*;
import java.nio.file.*;

public class BufferedLineCounter {
    static long unbuffered(Path p) throws IOException {
        long lines=0; try(FileInputStream in=new FileInputStream(p.toFile())) {
            int b; while((b=in.read())!=-1) if(b=='\n') lines++;
        } return lines;
    }
    static long buffered(Path p) throws IOException {
        long lines=0; byte[] buf=new byte[64*1024];
        try(BufferedInputStream in=new BufferedInputStream(new FileInputStream(p.toFile()),buf.length)) {
            int n; while((n=in.read(buf))!=-1) for(int i=0;i<n;i++) if(buf[i]=='\n') lines++;
        } return lines;
    }
    public static void main(String[] a) throws Exception {
        Path p=Path.of(a.length>0?a[0]:"attendance.log");
        if(!Files.exists(p)) {
            StringBuilder b=new StringBuilder();
            for(int i=0;i<100000;i++) b.append("attendance-record-").append(i).append('\n');
            Files.writeString(p,b);
        }
        long t=System.nanoTime(), x=unbuffered(p), u=System.nanoTime();
        long y=buffered(p), v=System.nanoTime();
        System.out.printf("Unbuffered lines=%d timeMs=%.3f%n",x,(u-t)/1e6);
        System.out.printf("Buffered lines=%d timeMs=%.3f%n",y,(v-u)/1e6);
    }
}
