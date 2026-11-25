import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class LibrarySearchScreen extends JFrame {
    private final JTextField searchField = new JTextField(22);
    private final JComboBox<String> category =
            new JComboBox<>(new String[] {"All", "Book", "Author", "Subject"});
    private final DefaultTableModel model =
            new DefaultTableModel(new String[] {"Title", "Author", "Category"}, 0);
    private final JTable results = new JTable(model);
    private final JLabel status = new JLabel("Ready");

    public LibrarySearchScreen() {
        super("Campus Library Search");

        JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT));
        top.add(new JLabel("Search:"));
        top.add(searchField);
        top.add(category);
        JButton searchButton = new JButton("Search");
        top.add(searchButton);

        JPanel bottom = new JPanel(new FlowLayout(FlowLayout.CENTER));
        JButton prev = new JButton("Prev");
        JButton next = new JButton("Next");
        JButton reserve = new JButton("Reserve");
        bottom.add(prev);
        bottom.add(next);
        bottom.add(reserve);

        JPanel statusPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        statusPanel.add(status);

        add(top, BorderLayout.NORTH);
        add(new JScrollPane(results), BorderLayout.CENTER);

        JPanel south = new JPanel(new BorderLayout());
        south.add(bottom, BorderLayout.NORTH);
        south.add(statusPanel, BorderLayout.SOUTH);
        add(south, BorderLayout.SOUTH);

        searchButton.addActionListener(e -> searchBooks());
        searchField.addActionListener(e -> searchBooks());
        prev.addActionListener(e -> status.setText("Previous page selected."));
        next.addActionListener(e -> status.setText("Next page selected."));
        reserve.addActionListener(e -> {
            int row = results.getSelectedRow();
            if (row < 0) {
                status.setText("Select a book before reserving.");
            } else {
                status.setText("Reservation requested for: " + model.getValueAt(row, 0));
            }
        });

        addSampleBooks();
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(700, 430);
        setLocationRelativeTo(null);
    }

    private void addSampleBooks() {
        model.addRow(new Object[] {"Java: The Complete Reference", "Herbert Schildt", "Book"});
        model.addRow(new Object[] {"Effective Java", "Joshua Bloch", "Book"});
        model.addRow(new Object[] {"Clean Code", "Robert C. Martin", "Book"});
        status.setText("Sample library records loaded.");
    }

    private void searchBooks() {
        String query = searchField.getText().trim().toLowerCase();
        String selectedCategory = (String) category.getSelectedItem();
        model.setRowCount(0);

        Object[][] sample = {
            {"Java: The Complete Reference", "Herbert Schildt", "Book"},
            {"Effective Java", "Joshua Bloch", "Book"},
            {"Clean Code", "Robert C. Martin", "Book"}
        };

        int count = 0;
        for (Object[] row : sample) {
            boolean textMatch = query.isEmpty()
                    || row[0].toString().toLowerCase().contains(query)
                    || row[1].toString().toLowerCase().contains(query);
            boolean categoryMatch = "All".equals(selectedCategory)
                    || selectedCategory.equals(row[2]);
            if (textMatch && categoryMatch) {
                model.addRow(row);
                count++;
            }
        }
        status.setText(count + " result(s) found.");
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new LibrarySearchScreen().setVisible(true));
    }
}
