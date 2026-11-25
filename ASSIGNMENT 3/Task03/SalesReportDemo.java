import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;

public class SalesReportDemo {
    private static final List<String> INPUTS =
            Arrays.asList("store1.txt", "store2.txt", "store3.txt");

    // Manual version: close() is reached only on the successful path.
    static void generateManual() throws IOException {
        BufferedWriter writer = Files.newBufferedWriter(Path.of("manual-report.txt"));
        for (String name : INPUTS) {
            BufferedReader reader = Files.newBufferedReader(Path.of(name));
            String line = reader.readLine();
            if (line == null) throw new IOException("Empty input file: " + name);
            writer.write(name + ": " + line);
            writer.newLine();
            reader.close();
        }
        writer.close();
    }

    // Recommended version: every resource is closed automatically.
    static void generateSafe() throws IOException {
        try (BufferedWriter writer = Files.newBufferedWriter(Path.of("safe-report.txt"))) {
            for (String name : INPUTS) {
                try (BufferedReader reader = Files.newBufferedReader(Path.of(name))) {
                    String line = reader.readLine();
                    if (line == null) throw new IOException("Empty input file: " + name);
                    writer.write(name + ": " + line);
                    writer.newLine();
                }
            }
        }
    }

    public static void main(String[] args) {
        // Create two valid files and one empty file to demonstrate a mid-way failure.
        try {
            Files.writeString(Path.of("store1.txt"), "Sales=12000");
            Files.writeString(Path.of("store2.txt"), "Sales=15000");
            Files.writeString(Path.of("store3.txt"), "");
            try {
                generateManual();
            } catch (IOException e) {
                System.out.println("Manual version failed: " + e.getMessage());
            }
            try {
                generateSafe();
            } catch (IOException e) {
                System.out.println("Try-with-resources version failed: " + e.getMessage());
            }
            System.out.println("Compare manual-report.txt (if completed) and safe-report.txt (partial output).");
        } catch (IOException e) {
            System.out.println("File setup error: " + e.getMessage());
        }
    }
}
