import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

class Wallet {
    private final int id;
    private int balance;
    private final Lock lock = new ReentrantLock();
    Wallet(int id, int balance) { this.id = id; this.balance = balance; }
    int getId() { return id; }
    void debit(int amount) { balance -= amount; }
    void credit(int amount) { balance += amount; }
    int getBalance() { return balance; }
}
class WalletTransfer {
    // Deliberately unsafe lock order: opposite-direction calls can deadlock.
    static void transferDeadlockProne(Wallet a, Wallet b, int amount) {
        synchronized (a) {
            try { Thread.sleep(50); } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            synchronized (b) {
                a.debit(amount);
                b.credit(amount);
            }
        }
    }

    // Global lock ordering: always lock the lower-ID wallet first.
    static void transfer(Wallet a, Wallet b, int amount) {
        Wallet first = a.getId() < b.getId() ? a : b;
        Wallet second = a.getId() < b.getId() ? b : a;
        synchronized (first) {
            synchronized (second) {
                a.debit(amount);
                b.credit(amount);
            }
        }
    }
}
class TokenCounter {
    private final int[] buffer = new int[5];
    private int count = 0, in = 0, out = 0;

    public synchronized void put(int token) throws InterruptedException {
        while (count == buffer.length) wait();
        buffer[in] = token;
        in = (in + 1) % buffer.length;
        count++;
        notifyAll();
    }

    public synchronized int take() throws InterruptedException {
        while (count == 0) wait();
        int token = buffer[out];
        out = (out + 1) % buffer.length;
        count--;
        notifyAll();
        return token;
    }
}
public class ConcurrencyProblems {
    public static void main(String[] args) throws InterruptedException {
        Wallet w1 = new Wallet(1, 1000), w2 = new Wallet(2, 1000);
        Thread t1 = new Thread(() -> WalletTransfer.transfer(w1, w2, 100));
        Thread t2 = new Thread(() -> WalletTransfer.transfer(w2, w1, 50));
        t1.start(); t2.start(); t1.join(); t2.join();
        System.out.println("Wallet balances: " + w1.getBalance() + ", " + w2.getBalance());

        TokenCounter counter = new TokenCounter();
        int[] collected = new int[2];
        Thread cook = new Thread(() -> {
            try { for (int token = 1; token <= 20; token++) counter.put(token); }
            catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        });
        Thread[] students = new Thread[2];
        for (int s = 0; s < 2; s++) {
            final int id = s;
            students[s] = new Thread(() -> {
                try { for (int k = 0; k < 10; k++) collected[id] += counter.take(); }
                catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            });
        }
        cook.start();
        for (Thread student : students) student.start();
        cook.join();
        for (Thread student : students) student.join();
        System.out.println("Sum of tokens collected: " + (collected[0] + collected[1]) + " (expected 210)");
    }
}
