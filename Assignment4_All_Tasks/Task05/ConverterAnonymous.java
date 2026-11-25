import java.awt.FlowLayout;
import java.awt.event.*;
import javax.swing.*;

public class ConverterAnonymous extends JFrame {
    private final JTextField amount = new JTextField(10);
    private final JComboBox<String> target = new JComboBox<>(new String[] {"USD", "EUR"});
    private final JLabel result = new JLabel(" ");

    public ConverterAnonymous() {
        super("Converter – Anonymous Listener");
        setLayout(new FlowLayout());
        JButton convert = new JButton("Convert");
        add(new JLabel("INR")); add(amount); add(target); add(convert); add(result);

        ActionListener handler = new ActionListener() {
            @Override public void actionPerformed(ActionEvent e) {
                convertAmount();
            }
        };
        convert.addActionListener(handler);
        amount.addActionListener(handler);

        addWindowListener(new WindowAdapter() {
            @Override public void windowClosing(WindowEvent e) { dispose(); }
        });
        setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        pack(); setLocationRelativeTo(null);
    }

    private void convertAmount() {
        try {
            double value = Double.parseDouble(amount.getText().trim());
            double rate = "USD".equals(target.getSelectedItem()) ? 0.012 : 0.011;
            result.setText(String.format("%.2f %s", value * rate, target.getSelectedItem()));
            JOptionPane.showMessageDialog(this, result.getText());
        } catch (NumberFormatException ex) {
            result.setText("Invalid amount");
            JOptionPane.showMessageDialog(this, "Invalid amount", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new ConverterAnonymous().setVisible(true));
    }
}
