import java.awt.BorderLayout;
import java.awt.Graphics;
import java.awt.Point;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.util.ArrayList;
import java.util.List;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.SwingUtilities;

public class DrawPad extends JFrame {
    private final List<Point> points = new ArrayList<>();
    private final JLabel status = new JLabel("Clicks: 0");

    public DrawPad() {
        super("Draw Pad");
        setLayout(new BorderLayout());
        add(status, BorderLayout.SOUTH);

        addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                points.add(e.getPoint());
                status.setText("Clicks: " + points.size());
                repaint();
            }
        });

        addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                dispose();
            }
        });

        setSize(400, 300);
        setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
        setLocationRelativeTo(null);
    }

    @Override
    public void paint(Graphics g) {
        super.paint(g);
        for (Point point : points) {
            g.fillOval(point.x - 3, point.y - 3, 6, 6);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new DrawPad().setVisible(true));
    }
}
