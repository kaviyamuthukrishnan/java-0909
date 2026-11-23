public class StringComparison {
    private static volatile int blackHole;

    private static String buildWithPlus(int fields) {
        String result = "";
        for (int i = 1; i <= fields; i++) result = result + "FIELD" + i + "|";
        return result;
    }

    private static String buildWithBuilder(int fields) {
        StringBuilder result = new StringBuilder();
        for (int i = 1; i <= fields; i++) result.append("FIELD").append(i).append('|');
        return result.toString();
    }

    private static String buildWithBuffer(int fields) {
        StringBuffer result = new StringBuffer();
        for (int i = 1; i <= fields; i++) result.append("FIELD").append(i).append('|');
        return result.toString();
    }

    private static long measure(int mode, int tickets, int fields) {
        long start = System.nanoTime();
        int total = 0;
        for (int t = 0; t < tickets; t++) {
            String value;
            if (mode == 0) value = buildWithPlus(fields);
            else if (mode == 1) value = buildWithBuilder(fields);
            else value = buildWithBuffer(fields);
            total += value.length();
        }
        blackHole = total;
        return System.nanoTime() - start;
    }

    public static void main(String[] args) {
        int[][] workloads = {{1, 5}, {10000, 50}, {2000, 200}};
        String[] names = {"Short: 1 ticket, 5 fields",
                          "Heavy: 10000 tickets, 50 fields",
                          "Wide: 2000 tickets, 200 fields"};
        String[] methods = {"String +", "StringBuilder", "StringBuffer"};

        for (int w = 0; w < workloads.length; w++) {
            System.out.println("\n" + names[w]);
            for (int m = 0; m < 3; m++) {
                // Warm-up reduces (but does not eliminate) JVM warm-up effects.
                for (int k = 0; k < 2; k++) measure(m, 100, 10);
                long sum = 0;
                int repeats = 5;
                for (int r = 0; r < repeats; r++)
                    sum += measure(m, workloads[w][0], workloads[w][1]);
                System.out.printf("%s average: %.3f ms%n", methods[m],
                                  (sum / (double) repeats) / 1_000_000.0);
            }
        }
        System.out.println("\\nNote: timing varies by computer/JVM. Run several times and record your own results.");
    }
}