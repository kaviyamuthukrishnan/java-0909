import java.awt.FlowLayout;
import java.awt.event.*;
import javax.swing.*;

public class ConverterLambda extends JFrame {
    private final JTextField amount = new JTextField(10);
    private final JComboBox<String> target = new JComboBox<>(new String[] {"USD", "EUR"});
    private final JLabel result = new JLabel(" ");

    public ConverterLambda() {
        super("Currency Converter – Lambda");
        setLayout(new FlowLayout());
        JButton convertButton = new JButton("Convert");
        add(new JLabel("INR")); add(amount); add(target); add(convertButton); add(result);

        // One lambda listener is shared by the Convert button and Enter key.
        ActionListener convertAction = e -> convert();
        convertButton.addActionListener(convertAction);
        amount.addActionListener(convertAction);

        addWindowListener(new WindowAdapter() {
            @Override public void windowClosing(WindowEvent e) { dispose(); }
        });
        setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        pack(); setLocationRelativeTo(null);
    }

    private void convert() {
        try {
            double value = Double.parseDouble(amount.getText().trim());
            double rate = "USD".equals(target.getSelectedItem()) ? 0.012 : 0.011;
            String converted = String.format("%.2f %s", value * rate, target.getSelectedItem());
            result.setText(converted);
            JOptionPane.showMessageDialog(this, converted, "Conversion Result",
                    JOptionPane.INFORMATION_MESSAGE);
        } catch (NumberFormatException ex) {
            result.setText("Invalid amount");
            JOptionPane.showMessageDialog(this, "Invalid amount", "Input Error",
                    JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new ConverterLambda().setVisible(true));
    }
}
