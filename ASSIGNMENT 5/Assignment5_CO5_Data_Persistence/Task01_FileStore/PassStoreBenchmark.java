import java.nio.file.*;
public class PassStoreBenchmark {
    public static void main(String[] a) throws Exception {
        for(int n:new int[]{1000,10000,100000}) {
            Path p=Files.createTempFile("passes",".csv"); PassStore s=new PassStore(p);
            for(int i=0;i<n;i++) s.add("P"+i,"R"+i,"Student"+i,(i%20)+1,3000+i);
            long t=System.nanoTime(); boolean found=s.find("P"+(n-1))!=null; long elapsed=System.nanoTime()-t;
            System.out.printf("records=%d found=%s timeMs=%.3f%n",n,found,elapsed/1e6);
            Files.deleteIfExists(p);
        }
    }
}
