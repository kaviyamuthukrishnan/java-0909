import java.util.concurrent.atomic.AtomicInteger;

public class SeatBooking {
    private final boolean[] booked;
    private int bookingsMade = 0;

    SeatBooking(int seats) { booked = new boolean[seats]; }

    // Deliberately unsafe version for comparison: check and update are not atomic.
    public void bookUnsafe(int seat) {
        if (!booked[seat]) {
            try { Thread.sleep(2); } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            booked[seat] = true;
            bookingsMade++;
        }
    }

    // Synchronized method: check-and-book is one atomic critical section.
    public synchronized void book(int seat) {
        if (!booked[seat]) {
            booked[seat] = true;
            bookingsMade++;
            System.out.println(Thread.currentThread().getName() + " booked seat " + (seat + 1));
        }
    }

    // Equivalent synchronized-block approach for a shared booking object.
    public void bookWithBlock(int seat) {
        synchronized (this) {
            if (!booked[seat]) {
                booked[seat] = true;
                bookingsMade++;
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        SeatBooking screen = new SeatBooking(10);
        Thread[] users = new Thread[100];
        for (int i = 0; i < users.length; i++) {
            final int seat = i % 10;
            users[i] = new Thread(() -> screen.book(seat), "User-" + (i + 1));
            users[i].start();
        }
        for (Thread t : users) t.join();
        System.out.println("Seats sold: " + screen.bookingsMade);
    }
}
