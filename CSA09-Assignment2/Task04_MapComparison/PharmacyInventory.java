import java.util.*;

public class PharmacyInventory {
    private static Map<String, Integer> sample(int n, int type) {
        Map<String, Integer> map;
        if (type == 0) map = new HashMap<String, Integer>();
        else if (type == 1) map = new TreeMap<String, Integer>();
        else map = new LinkedHashMap<String, Integer>();
        for (int i = n - 1; i >= 0; i--)
            map.put(String.format("MED%06d", i), 100 + (i % 50));
        return map;
    }

    private static long lookupTime(Map<String, Integer> map, int n) {
        long start = System.nanoTime();
        long total = 0;
        for (int i = 0; i < 100000; i++)
            total += map.getOrDefault(String.format("MED%06d", i % n), 0);
        if (total == -1) System.out.println(total);
        return System.nanoTime() - start;
    }

    public static void main(String[] args) {
        int[] sizes = {1000, 10000, 50000};
        String[] names = {"HashMap", "TreeMap", "LinkedHashMap"};
        for (int n : sizes) {
            System.out.println("\\nMedicines: " + n);
            for (int t = 0; t < 3; t++) {
                Map<String, Integer> map = sample(n, t);
                long time = lookupTime(map, n);
                System.out.printf("%s 100,000 lookups: %.3f ms%n", names[t], time / 1e6);
                System.out.println("First five iteration keys: " + firstKeys(map, 5));
            }
        }
        Map<String, Integer> codeOrder = sample(10, 1);
        Map<String, Integer> insertionOrder = sample(10, 2);
        System.out.println("\\nCode-order report: " + codeOrder.keySet());
        System.out.println("Insertion-order report: " + insertionOrder.keySet());
    }

    private static List<String> firstKeys(Map<String, Integer> map, int limit) {
        List<String> result = new ArrayList<String>();
        for (String key : map.keySet()) {
            if (result.size() == limit) break;
            result.add(key);
        }
        return result;
    }
}