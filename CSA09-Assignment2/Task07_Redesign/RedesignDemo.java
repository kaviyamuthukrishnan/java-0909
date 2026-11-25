public class RedesignDemo {
    private static volatile int sink;

    // Original design: repeatedly creates intermediate String objects.
    private static String original(int fields) {
        String result = "";
        for (int i = 0; i < fields; i++) result = result + "DATA" + i + ";";
        return result;
    }

    // Redesigned: append into one mutable buffer, then create the final String.
    private static String redesigned(int fields) {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < fields; i++) result.append("DATA").append(i).append(';');
        return result.toString();
    }

    private static long benchmark(boolean useBuilder, int repetitions, int fields) {
        long start = System.nanoTime();
        int count = 0;
        for (int r = 0; r < repetitions; r++) {
            String s = useBuilder ? redesigned(fields) : original(fields);
            count += s.length();
        }
        sink = count;
        return System.nanoTime() - start;
    }

    public static void main(String[] args) {
        int repetitions = 3000;
        int fields = 100;
        for (int i = 0; i < 3; i++) {
            benchmark(false, 100, 20);
            benchmark(true, 100, 20);
        }
        long oldTime = 0, newTime = 0;
        int runs = 5;
        for (int i = 0; i < runs; i++) {
            oldTime += benchmark(false, repetitions, fields);
            newTime += benchmark(true, repetitions, fields);
        }
        System.out.printf("Original repeated + average: %.3f ms%n", oldTime / (double) runs / 1e6);
        System.out.printf("Redesigned StringBuilder average: %.3f ms%n", newTime / (double) runs / 1e6);
        System.out.println("Use the same machine/JVM and workload for a fair comparison.");
    }
}