# Task 2 – Hospital Outpatient Appointment Desk

This task is design-focused in the assignment. The complete event table, component hierarchy, pseudocode, event trace and alternative analysis are in `../Report/Assignment4_Report.md`, under Task 2.

Suggested implementation components:
- `JFrame` as the main appointment window
- `JPanel` for grouped form sections
- `JTextField` for patient ID
- `JComboBox<String>` for department, doctor and time slot
- `JButton` for Book Appointment
- `JLabel` for status
- `WindowAdapter` for close confirmation

Doctor data should be loaded into a `Map<String, List<String>>` so changing department updates the doctor list without a repeated database request.
