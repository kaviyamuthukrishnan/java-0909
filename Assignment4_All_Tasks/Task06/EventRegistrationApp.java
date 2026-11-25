import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.io.File;
import java.io.PrintWriter;
import java.sql.*;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class EventRegistrationApp extends JFrame {
    private final JTextField studentIdField = new JTextField(12);
    private final JTextField studentNameField = new JTextField(15);
    private final JComboBox<String> eventBox =
            new JComboBox<>(new String[] {"Tech Fest", "Cultural Fest", "Sports Meet"});
    private final JComboBox<String> filterBox =
            new JComboBox<>(new String[] {"All", "Tech Fest", "Cultural Fest", "Sports Meet"});
    private final DefaultTableModel model = new DefaultTableModel(
            new String[] {"ID", "Student ID", "Student Name", "Event", "Registered At"}, 0) {
        @Override public boolean isCellEditable(int row, int column) { return false; }
    };
    private final JTable table = new JTable(model);
    private final JLabel status = new JLabel("Ready");

    public EventRegistrationApp() {
        super("Campus Event Registration");

        JPanel form = new JPanel(new GridLayout(3, 2, 6, 6));
        form.add(new JLabel("Student ID:")); form.add(studentIdField);
        form.add(new JLabel("Student Name:")); form.add(studentNameField);
        form.add(new JLabel("Event:")); form.add(eventBox);

        JButton registerButton = new JButton("Register");
        JButton filterButton = new JButton("Apply Filter");
        JButton refreshButton = new JButton("Refresh");
        JButton exportButton = new JButton("Export CSV");

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.LEFT));
        actions.add(registerButton);
        actions.add(new JLabel("Filter:"));
        actions.add(filterBox);
        actions.add(filterButton);
        actions.add(refreshButton);
        actions.add(exportButton);

        JPanel north = new JPanel(new BorderLayout());
        north.add(form, BorderLayout.NORTH);
        north.add(actions, BorderLayout.SOUTH);

        add(north, BorderLayout.NORTH);
        add(new JScrollPane(table), BorderLayout.CENTER);
        add(status, BorderLayout.SOUTH);

        registerButton.addActionListener(e -> registerStudent());
        filterButton.addActionListener(e -> loadRegistrations());
        refreshButton.addActionListener(e -> {
            filterBox.setSelectedItem("All");
            loadRegistrations();
        });
        exportButton.addActionListener(e -> exportCsv());

        createMenuBar();
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(850, 500);
        setLocationRelativeTo(null);
        loadRegistrations();
    }

    private void createMenuBar() {
        JMenuBar menuBar = new JMenuBar();
        JMenu fileMenu = new JMenu("File");
        JMenuItem refreshItem = new JMenuItem("Refresh");
        JMenuItem exportItem = new JMenuItem("Export CSV");
        JMenuItem exitItem = new JMenuItem("Exit");
        refreshItem.addActionListener(e -> loadRegistrations());
        exportItem.addActionListener(e -> exportCsv());
        exitItem.addActionListener(e -> dispose());
        fileMenu.add(refreshItem);
        fileMenu.add(exportItem);
        fileMenu.addSeparator();
        fileMenu.add(exitItem);
        menuBar.add(fileMenu);
        setJMenuBar(menuBar);
    }

    private void registerStudent() {
        String studentId = studentIdField.getText().trim();
        String studentName = studentNameField.getText().trim();
        String eventName = (String) eventBox.getSelectedItem();

        if (studentId.isEmpty() || studentName.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Student ID and name are required.",
                    "Validation Error", JOptionPane.ERROR_MESSAGE);
            return;
        }

        setBusy(true, "Registering...");
        new SwingWorker<String, Void>() {
            @Override protected String doInBackground() throws Exception {
                String sql = "INSERT INTO registrations (student_id, student_name, event_name) VALUES (?, ?, ?)";
                try (Connection con = DBConnection.getConnection();
                     PreparedStatement ps = con.prepareStatement(sql)) {
                    ps.setString(1, studentId);
                    ps.setString(2, studentName);
                    ps.setString(3, eventName);
                    ps.executeUpdate();
                    return "Registration successful.";
                } catch (SQLIntegrityConstraintViolationException ex) {
                    throw new Exception("This student is already registered for this event.");
                } catch (SQLException ex) {
                    if (ex.getErrorCode() == 1062) {
                        throw new Exception("This student is already registered for this event.");
                    }
                    throw ex;
                }
            }

            @Override protected void done() {
                try {
                    JOptionPane.showMessageDialog(EventRegistrationApp.this, get());
                    studentIdField.setText("");
                    studentNameField.setText("");
                    filterBox.setSelectedItem("All");
                    loadRegistrations();
                } catch (Exception ex) {
                    Throwable cause = ex.getCause();
                    String message = cause == null ? ex.getMessage() : cause.getMessage();
                    JOptionPane.showMessageDialog(EventRegistrationApp.this, message,
                            "Registration Error", JOptionPane.ERROR_MESSAGE);
                    setBusy(false, "Registration failed.");
                }
            }
        }.execute();
    }

    private void loadRegistrations() {
        String selectedEvent = (String) filterBox.getSelectedItem();
        setBusy(true, "Loading registrations...");
        new SwingWorker<Object[][], Void>() {
            @Override protected Object[][] doInBackground() throws Exception {
                String sql;
                boolean filter = selectedEvent != null && !"All".equals(selectedEvent);
                sql = "SELECT id, student_id, student_name, event_name, registered_at " +
                      "FROM registrations " +
                      (filter ? "WHERE event_name = ? " : "") +
                      "ORDER BY registered_at DESC LIMIT 100 OFFSET 0";
                try (Connection con = DBConnection.getConnection();
                     PreparedStatement ps = con.prepareStatement(sql)) {
                    if (filter) ps.setString(1, selectedEvent);
                    try (ResultSet rs = ps.executeQuery()) {
                        java.util.List<Object[]> rows = new java.util.ArrayList<>();
                        while (rs.next()) {
                            rows.add(new Object[] {
                                rs.getInt("id"), rs.getString("student_id"),
                                rs.getString("student_name"), rs.getString("event_name"),
                                rs.getTimestamp("registered_at")
                            });
                        }
                        return rows.toArray(new Object[0][]);
                    }
                }
            }

            @Override protected void done() {
                try {
                    Object[][] rows = get();
                    model.setRowCount(0);
                    for (Object[] row : rows) model.addRow(row);
                    setBusy(false, rows.length + " registration(s) loaded (first page, up to 100).");
                } catch (Exception ex) {
                    Throwable cause = ex.getCause();
                    String message = cause == null ? ex.getMessage() : cause.getMessage();
                    setBusy(false, "Could not load data: " + message);
                }
            }
        }.execute();
    }

    private void exportCsv() {
        JFileChooser chooser = new JFileChooser();
        chooser.setSelectedFile(new File("event_registrations.csv"));
        if (chooser.showSaveDialog(this) != JFileChooser.APPROVE_OPTION) return;

        try (PrintWriter writer = new PrintWriter(chooser.getSelectedFile(), "UTF-8")) {
            for (int c = 0; c < model.getColumnCount(); c++) {
                if (c > 0) writer.print(",");
                writer.print(csv(model.getColumnName(c)));
            }
            writer.println();

            for (int r = 0; r < model.getRowCount(); r++) {
                for (int c = 0; c < model.getColumnCount(); c++) {
                    if (c > 0) writer.print(",");
                    Object value = model.getValueAt(r, c);
                    writer.print(csv(value == null ? "" : value.toString()));
                }
                writer.println();
            }
            status.setText("CSV exported successfully.");
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage(), "Export Error",
                    JOptionPane.ERROR_MESSAGE);
        }
    }

    private String csv(String value) {
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private void setBusy(boolean busy, String message) {
        status.setText(message);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new EventRegistrationApp().setVisible(true));
    }
}
