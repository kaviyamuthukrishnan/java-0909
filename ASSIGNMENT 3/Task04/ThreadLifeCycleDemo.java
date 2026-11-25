class ScannerStation extends Thread {
    private final int scripts;
    ScannerStation(String name, int scripts) {
        super(name);
        this.scripts = scripts;
    }
    @Override public void run() {
        try {
            for (int i = 1; i <= scripts; i++) {
                Thread.sleep(100);
            }
            System.out.println(getName() + " scanned " + scripts + " scripts.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.out.println(getName() + " was interrupted.");
        }
    }
}
class RunnableStation implements Runnable {
    private final String station;
    private final int scripts;
    RunnableStation(String station, int scripts) {
        this.station = station;
        this.scripts = scripts;
    }
    @Override public void run() {
        try {
            Thread.sleep(100L * scripts);
            System.out.println(station + " scanned " + scripts + " scripts.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
public class ThreadLifeCycleDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread[] stations = {
            new ScannerStation("Station-1", 3),
            new ScannerStation("Station-2", 2),
            new Thread(new RunnableStation("Station-3", 4)),
            new Thread(new RunnableStation("Station-4", 1))
        };
        for (Thread t : stations) t.start();
        System.out.println("Station 1 alive? " + stations[0].isAlive());
        int total = 0;
        for (Thread t : stations) {
            t.join();
            total += 1;
        }
        System.out.println("All " + total + " stations completed.");
    }
}
