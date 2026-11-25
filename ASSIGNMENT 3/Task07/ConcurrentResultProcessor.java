import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

public class ConcurrentResultProcessor {
    static class Result {
        final String file;
        final boolean success;
        final int score;
        final String message;
        Result(String file, boolean success, int score, String message) {
            this.file = file; this.success = success; this.score = score; this.message = message;
        }
    }

    static Result process(Path file) {
        try {
            String content = Files.readString(file).trim();
            int score = Integer.parseInt(content);
            if (score < 0 || score > 100) throw new IllegalArgumentException("Score outside 0-100");
            return new Result(file.getFileName().toString(), true, score, "Processed");
        } catch (Exception e) {
            return new Result(file.getFileName().toString(), false, 0, e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }

    static void createSampleFiles(Path dir) throws IOException {
        Files.createDirectories(dir);
        for (int i = 1; i <= 20; i++) {
            Path p = dir.resolve("student" + i + ".txt");
            if (i == 4) Files.writeString(p, "corrupt");
            else if (i == 9) Files.deleteIfExists(p); // deliberately missing
            else Files.writeString(p, Integer.toString((i * 7) % 101));
        }
    }

    public static void main(String[] args) throws Exception {
        Path dir = Path.of(args.length > 0 ? args[0] : "scores");
        createSampleFiles(dir);
        int[] poolSizes = {1, 2, 4, 8};

        for (int poolSize : poolSizes) {
            ExecutorService pool = Executors.newFixedThreadPool(poolSize);
            List<Future<Result>> futures = new ArrayList<>();
            long start = System.nanoTime();

            for (int i = 1; i <= 20; i++) {
                Path file = dir.resolve("student" + i + ".txt");
                futures.add(pool.submit(() -> process(file)));
            }

            int success = 0, failure = 0, totalScore = 0;
            for (Future<Result> future : futures) {
                Result result = future.get();
                if (result.success) { success++; totalScore += result.score; }
                else { failure++; System.out.println("Failed " + result.file + " -> " + result.message); }
            }
            pool.shutdown();
            pool.awaitTermination(1, TimeUnit.MINUTES);
            long elapsedMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);
            System.out.println("Pool=" + poolSize + " | Success=" + success + " | Failure=" + failure
                    + " | Total score=" + totalScore + " | Time=" + elapsedMs + " ms");
        }
    }
}
