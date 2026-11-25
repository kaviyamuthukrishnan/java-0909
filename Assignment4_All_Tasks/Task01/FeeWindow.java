import java.awt.GridLayout;
import javax.swing.*;

public class FeeWindow extends JFrame {
    private final JTextField regNo = new JTextField(15);
    private final JTextField amount = new JTextField(15);
    private final JButton pay = new JButton("Pay");
    private final JButton clear = new JButton("Clear");
    private final JButton receipt = new JButton("Receipt");
    private final JLabel status = new JLabel("Enter payment details");
    private final FeeService service = new FeeService();
    private String lastReceipt;

    public FeeWindow() {
        super("Student Fee Payment");
        setLayout(new GridLayout(4, 2, 8, 8));
        add(new JLabel("Registration Number:")); add(regNo);
        add(new JLabel("Amount:")); add(amount);
        add(pay); add(clear);
        add(receipt); add(status);

        pay.addActionListener(e -> processPayment());
        clear.addActionListener(e -> {
            regNo.setText("");
            amount.setText("");
            status.setText("Enter payment details");
        });
        receipt.addActionListener(e -> {
            if (lastReceipt == null) {
                JOptionPane.showMessageDialog(this, "No successful payment receipt is available.");
            } else {
                JOptionPane.showMessageDialog(this, lastReceipt, "Payment Receipt",
                        JOptionPane.INFORMATION_MESSAGE);
            }
        });

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(430, 220);
        setLocationRelativeTo(null);
    }

    private void processPayment() {
        String registration = regNo.getText();
        String paymentAmount = amount.getText();
        pay.setEnabled(false);
        status.setText("Processing payment...");

        new SwingWorker<String, Void>() {
            @Override
            protected String doInBackground() throws Exception {
                return service.payFee(registration, paymentAmount);
            }

            @Override
            protected void done() {
                try {
                    lastReceipt = get();
                    status.setText("Payment Successful");
                    JOptionPane.showMessageDialog(FeeWindow.this, lastReceipt);
                } catch (Exception ex) {
                    Throwable cause = ex.getCause();
                    String message = cause == null ? ex.getMessage() : cause.getMessage();
                    status.setText("Payment Failed");
                    JOptionPane.showMessageDialog(FeeWindow.this, message,
                            "Error", JOptionPane.ERROR_MESSAGE);
                } finally {
                    pay.setEnabled(true);
                }
            }
        }.execute();
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            FeeWindow window = new FeeWindow();
            window.setVisible(true);
        });
    }
}
