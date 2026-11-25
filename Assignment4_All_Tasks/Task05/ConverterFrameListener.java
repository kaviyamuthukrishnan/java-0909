import java.awt.FlowLayout;
import java.awt.event.*;
import javax.swing.*;

public class ConverterFrameListener extends JFrame implements ActionListener {
    private final JTextField amount = new JTextField(10);
    private final JComboBox<String> target = new JComboBox<>(new String[] {"USD", "EUR"});
    private final JLabel result = new JLabel(" ");
    private final JButton convert = new JButton("Convert");

    public ConverterFrameListener() {
        super("Converter – Frame Listener");
        setLayout(new FlowLayout());
        add(new JLabel("INR")); add(amount); add(target); add(convert); add(result);
        convert.addActionListener(this);
        amount.addActionListener(this);
        addWindowListener(new WindowAdapter() {
            @Override public void windowClosing(WindowEvent e) { dispose(); }
        });
        setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        pack(); setLocationRelativeTo(null);
    }

    @Override
    public void actionPerformed(ActionEvent e) { convertAmount(); }

    private void convertAmount() {
        try {
            double value = Double.parseDouble(amount.getText().trim());
            double rate = "USD".equals(target.getSelectedItem()) ? 0.012 : 0.011;
            result.setText(String.format("%.2f %s", value * rate, target.getSelectedItem()));
            JOptionPane.showMessageDialog(this, result.getText(), "Conversion", JOptionPane.INFORMATION_MESSAGE);
        } catch (NumberFormatException ex) {
            result.setText("Invalid amount");
            JOptionPane.showMessageDialog(this, "Invalid amount", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new ConverterFrameListener().setVisible(true));
    }
}
