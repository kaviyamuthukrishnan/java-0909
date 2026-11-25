import java.io.File;
import java.io.FileNotFoundException;
import java.util.InputMismatchException;
import java.util.Scanner;

class InsufficientBalanceException extends Exception {
    InsufficientBalanceException(String message) { super(message); }
}

public class ATMExceptionDemo {
    private static final double BALANCE = 5000.00;

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        try {
            // The file represents the ATM card-reader status.
            File cardReader = new File("cardreader.txt");
            try (Scanner fileScanner = new Scanner(cardReader)) {
                System.out.println("Card reader status: " + fileScanner.nextLine());
            }

            System.out.print("Enter account number (digits only): ");
            long account = sc.nextLong();
            System.out.print("Enter withdrawal amount: ");
            double amount = sc.nextDouble();

            if (account <= 0) throw new IllegalArgumentException("Account number must be positive.");
            if (amount <= 0) throw new IllegalArgumentException("Withdrawal amount must be positive.");
            if (amount > BALANCE) throw new InsufficientBalanceException("Insufficient account balance.");

            System.out.printf("Withdrawal successful. Please collect Rs. %.2f%n", amount);
            System.out.printf("Remaining balance: Rs. %.2f%n", BALANCE - amount);
        } catch (InputMismatchException e) {
            System.out.println("Input error: Enter numeric values only.");
        } catch (InsufficientBalanceException e) {
            System.out.println("Transaction declined: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("Invalid input: " + e.getMessage());
        } catch (FileNotFoundException e) {
            System.out.println("Card-reader error: cardreader.txt is missing.");
        } catch (Exception e) {
            System.out.println("Unexpected ATM error: " + e.getMessage());
        } finally {
            System.out.println("ATM session closed. Thank you.");
            sc.close();
        }
    }
}
