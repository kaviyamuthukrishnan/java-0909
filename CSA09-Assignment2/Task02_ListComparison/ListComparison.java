import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class ListComparison {
    private static long timeAddEnd(List<Integer> list, int n) {
        long start = System.nanoTime();
        for (int i = 0; i < n; i++) list.add(i);
        return System.nanoTime() - start;
    }
    private static long timeInsertFront(List<Integer> list, int n) {
        long start = System.nanoTime();
        for (int i = 0; i < n; i++) list.add(0, i);
        return System.nanoTime() - start;
    }
    private static long timeGetMiddle(List<Integer> list, int n) {
        for (int i = 0; i < n; i++) list.add(i);
        long start = System.nanoTime();
        long sum = 0;
        for (int i = 0; i < 10000; i++) sum += list.get(list.size() / 2);
        if (sum == -1) System.out.println(sum);
        return System.nanoTime() - start;
    }
    private static long timeIterate(List<Integer> list, int n) {
        for (int i = 0; i < n; i++) list.add(i);
        long start = System.nanoTime();
        long sum = 0;
        for (int value : list) sum += value;
        if (sum == -1) System.out.println(sum);
        return System.nanoTime() - start;
    }
    public static void main(String[] args) {
        int[] sizes = {1000, 10000, 50000};
        for (int n : sizes) {
            System.out.println("\\nList size: " + n);
            List<Integer> a = new ArrayList<Integer>();
            List<Integer> l = new LinkedList<Integer>();
            System.out.printf("Add end - ArrayList: %.3f ms%n", timeAddEnd(a, n)/1e6);
            System.out.printf("Add end - LinkedList: %.3f ms%n", timeAddEnd(l, n)/1e6);

            a = new ArrayList<Integer>(); l = new LinkedList<Integer>();
            System.out.printf("Insert front - ArrayList: %.3f ms%n", timeInsertFront(a, n)/1e6);
            System.out.printf("Insert front - LinkedList: %.3f ms%n", timeInsertFront(l, n)/1e6);

            a = new ArrayList<Integer>(); l = new LinkedList<Integer>();
            System.out.printf("10,000 middle gets - ArrayList: %.3f ms%n", timeGetMiddle(a, n)/1e6);
            System.out.printf("10,000 middle gets - LinkedList: %.3f ms%n", timeGetMiddle(l, n)/1e6);

            a = new ArrayList<Integer>(); l = new LinkedList<Integer>();
            System.out.printf("Iteration - ArrayList: %.3f ms%n", timeIterate(a, n)/1e6);
            System.out.printf("Iteration - LinkedList: %.3f ms%n", timeIterate(l, n)/1e6);
        }
        System.out.println("\\nArrayDeque is preferable for a double-ended Up Next queue.");
    }
}