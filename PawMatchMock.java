import javax.imageio.ImageIO;
import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.MouseWheelEvent;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

public class PawMatchMock extends JFrame {

    // Palette
    private static final Color INDIGO = Color.decode("#3B3C8C");      // Primary
    private static final Color MINT = Color.decode("#4CC9A6");        // Accent
    private static final Color LAVENDER = Color.decode("#A18CD1");    // Secondary
    private static final Color BG = Color.decode("#F9FAFB");          // Background
    private static final Color SLATE = Color.decode("#1F2937");       // Text
    private static final Color CORAL = Color.decode("#FF6B6B");       // Like
    private static final Color COOLGRAY = Color.decode("#9CA3AF");    // Dismiss

    private final CardLayout cards = new CardLayout();
    private final JPanel root = new JPanel(cards);

    public PawMatchMock() {
        super("PawMatch – Concept");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(420, 820);
        setLocationRelativeTo(null);

        // App root
        root.add(homeScreen(), "home");
        root.add(swiperScreen(), "swipe");
        root.add(profileScreen(), "profile");

        setContentPane(root);
        cards.show(root, "home");
    }

    // Reusable header
    private JPanel header(String title, JButton... rightActions) {
        JPanel p = new JPanel(new BorderLayout());
        p.setBackground(INDIGO);
        p.setBorder(new EmptyBorder(16, 18, 16, 18));

        JLabel lbl = new JLabel(title);
        lbl.setForeground(Color.WHITE);
        lbl.setFont(lbl.getFont().deriveFont(Font.BOLD, 20f));
        p.add(lbl, BorderLayout.WEST);

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        actions.setOpaque(false);
        for (JButton b : rightActions) {
            styleHeaderButton(b);
            actions.add(b);
        }
        p.add(actions, BorderLayout.EAST);
        return p;
    }

    private void styleHeaderButton(JButton b) {
        b.setForeground(INDIGO);
        b.setBackground(Color.WHITE);
        b.setFocusPainted(false);
        b.setBorder(BorderFactory.createEmptyBorder(8, 14, 8, 14));
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        b.setFont(b.getFont().deriveFont(Font.BOLD, 12f));
    }

    // Home screen
    private JPanel homeScreen() {
        JPanel page = new JPanel(new BorderLayout());
        page.setBackground(BG);

        JButton toSwipe = new JButton("Explore Dogs");
        JButton toProfile = new JButton("Create Profile");

        toSwipe.addActionListener(e -> cards.show(root, "swipe"));
        toProfile.addActionListener(e -> cards.show(root, "profile"));

        JPanel header = header("PawMatch",
                new JButton(new AbstractAction("Login") {
                    @Override public void actionPerformed(ActionEvent e) {}
                }),
                new JButton(new AbstractAction("Sign Up") {
                    @Override public void actionPerformed(ActionEvent e) {}
                })
        );

        JPanel center = new JPanel();
        center.setBackground(BG);
        center.setLayout(new BoxLayout(center, BoxLayout.Y_AXIS));
        center.setBorder(new EmptyBorder(28, 24, 28, 24));

        JLabel h1 = new JLabel("Welcome to PawMatch");
        h1.setAlignmentX(Component.LEFT_ALIGNMENT);
        h1.setFont(h1.getFont().deriveFont(Font.BOLD, 26f));
        h1.setForeground(SLATE);

        JLabel sub = new JLabel("<html><div style='width:300px;color:#374151'>"
                + "A Tinder-style app for ethical dog breeding and connections."
                + "</div></html>");
        sub.setAlignmentX(Component.LEFT_ALIGNMENT);

        JPanel btnRow = new JPanel(new FlowLayout(FlowLayout.LEFT, 12, 16));
        btnRow.setOpaque(false);

        stylePrimary(toProfile);
        styleSecondary(toSwipe);

        btnRow.add(toProfile);
        btnRow.add(toSwipe);

        // Hero card placeholder
        JPanel hero = roundedPanel(Color.WHITE);
        hero.setLayout(new BorderLayout());
        hero.setPreferredSize(new Dimension(360, 200));
        hero.setBorder(new EmptyBorder(16, 16, 16, 16));

        JLabel heroTxt = new JLabel("Design Preview Area");
        heroTxt.setHorizontalAlignment(SwingConstants.CENTER);
        heroTxt.setForeground(new Color(100, 116, 139));
        hero.add(heroTxt, BorderLayout.CENTER);

        hero.setAlignmentX(Component.LEFT_ALIGNMENT);

        center.add(h1);
        center.add(Box.createVerticalStrut(8));
        center.add(sub);
        center.add(Box.createVerticalStrut(16));
        center.add(hero);
        center.add(Box.createVerticalStrut(16));
        center.add(btnRow);

        page.add(header, BorderLayout.NORTH);
        page.add(center, BorderLayout.CENTER);
        return page;
    }

    // Swipe screen
    private JPanel swiperScreen() {
        JPanel page = new JPanel(new BorderLayout());
        page.setBackground(BG);

        JButton toHome = new JButton(new AbstractAction("Home") {
            @Override public void actionPerformed(ActionEvent e) { cards.show(root, "home"); }
        });
        JButton toProfile = new JButton(new AbstractAction("My Profile") {
            @Override public void actionPerformed(ActionEvent e) { cards.show(root, "profile"); }
        });

        page.add(header("Discover Dogs", toHome, toProfile), BorderLayout.NORTH);

        JPanel center = new JPanel();
        center.setBackground(BG);
        center.setBorder(new EmptyBorder(24, 24, 24, 24));
        center.setLayout(new BoxLayout(center, BoxLayout.Y_AXIS));

        // Dog card
        JPanel card = roundedPanel(Color.WHITE);
        card.setLayout(new BorderLayout());
        card.setPreferredSize(new Dimension(360, 520));

        // Image carousel (loads Dog1.jpg, Dog2.JPG, Dog3.JPEG if present)
        String[] files = new String[] { "Dog1.jpg", "Dog2.JPG", "Dog3.JPEG" };
        ImageCarousel carousel = new ImageCarousel(files, new Dimension(360, 360));

        // Info area
        JPanel info = new JPanel();
        info.setOpaque(false);
        info.setLayout(new BoxLayout(info, BoxLayout.Y_AXIS));
        info.setBorder(new EmptyBorder(12, 16, 16, 16));

        JLabel name = new JLabel("Tango • 3y • Golden Retriever");
        name.setForeground(SLATE);
        name.setFont(name.getFont().deriveFont(Font.BOLD, 18f));
        JLabel meta = new JLabel("AKC • 62 lbs • Sex: Male • OFA Hips: Excellent • Temperament: Calm");
        meta.setForeground(new Color(71, 85, 105));

        info.add(name);
        info.add(Box.createVerticalStrut(4));
        info.add(meta);

        card.add(carousel, BorderLayout.NORTH);
        card.add(info, BorderLayout.CENTER);

        // Like / Dismiss
        JPanel actions = new JPanel(new FlowLayout(FlowLayout.CENTER, 24, 18));
        actions.setOpaque(false);

        JButton noBtn = bigCircleButton("✘", COOLGRAY, Color.WHITE);
        JButton yesBtn = bigCircleButton("❤", CORAL, Color.WHITE);

        actions.add(noBtn);
        actions.add(yesBtn);

        center.add(card);
        center.add(actions);

        page.add(center, BorderLayout.CENTER);
        return page;
    }

    // Profile screen (Tabbed)
    private JPanel profileScreen() {
        JPanel page = new JPanel(new BorderLayout());
        page.setBackground(BG);

        JButton toHome = new JButton(new AbstractAction("Home") {
            @Override public void actionPerformed(ActionEvent e) { cards.show(root, "home"); }
        });
        JButton toSwipe = new JButton(new AbstractAction("Discover") {
            @Override public void actionPerformed(ActionEvent e) { cards.show(root, "swipe"); }
        });

        page.add(header("My Dog Profile", toHome, toSwipe), BorderLayout.NORTH);

        JPanel body = new JPanel(new BorderLayout());
        body.setBackground(BG);
        body.setBorder(new EmptyBorder(16, 16, 16, 16));

        JTabbedPane tabs = new JTabbedPane();
        tabs.setBackground(Color.WHITE);
        tabs.setBorder(BorderFactory.createEmptyBorder());
        UIManager.put("TabbedPane.selected", LAVENDER);

        tabs.addTab("Basic Info", section(
                labeledField("Name", "Tango"),
                labeledField("Sex", "Male"),
                labeledField("Age", "3 years"),
                labeledField("Weight", "62 lbs"),
                labeledField("Breed", "Golden Retriever")
        ));

        tabs.addTab("Medical Papers", section(
                labeledField("Vaccinations", "Up to date"),
                labeledField("Health Cert", "Valid through 2026-06"),
                labeledField("OFA Hips", "Excellent"),
                labeledField("Embark DNA", "Clean")
        ));

        tabs.addTab("Training & Certs", section(
                labeledField("Obedience", "AKC CGC"),
                labeledField("Agility", "Beginner"),
                labeledField("Service/Task", "N/A")
        ));

        tabs.addTab("Preferences", section(
                labeledField("Looking For", "Female • 2–5y • 50–75 lbs"),
                labeledField("Distance", "<= 100 miles"),
                labeledField("Notes", "Calm temperament preferred")
        ));

        tabs.addTab("Gallery", galleryPlaceholder());

        body.add(tabs, BorderLayout.CENTER);
        page.add(body, BorderLayout.CENTER);
        return page;
    }

    // Helpers
    private JPanel roundedPanel(Color bg) {
        JPanel p = new JPanel() {
            @Override protected void paintComponent(Graphics g) {
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setColor(bg);
                g2.fillRoundRect(0, 0, getWidth(), getHeight(), 24, 24);
                g2.dispose();
                super.paintComponent(g);
            }
            @Override public boolean isOpaque() { return false; }
        };
        p.setOpaque(false);
        p.setBorder(new EmptyBorder(0, 0, 0, 0));
        return p;
    }

    private void stylePrimary(JButton b) {
        b.setBackground(MINT);
        b.setForeground(Color.WHITE);
        b.setFocusPainted(false);
        b.setBorder(BorderFactory.createEmptyBorder(10, 18, 10, 18));
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        b.setFont(b.getFont().deriveFont(Font.BOLD, 14f));
    }

    private void styleSecondary(JButton b) {
        b.setBackground(INDIGO);
        b.setForeground(Color.WHITE);
        b.setFocusPainted(false);
        b.setBorder(BorderFactory.createEmptyBorder(10, 18, 10, 18));
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        b.setFont(b.getFont().deriveFont(Font.BOLD, 14f));
    }

    private JPanel section(JComponent... rows) {
        JPanel wrap = new JPanel();
        wrap.setOpaque(false);
        wrap.setLayout(new BoxLayout(wrap, BoxLayout.Y_AXIS));
        wrap.setBorder(new EmptyBorder(12, 8, 12, 8));
        for (JComponent c : rows) {
            wrap.add(c);
            wrap.add(Box.createVerticalStrut(8));
        }
        return wrap;
    }

    private JPanel labeledField(String label, String placeholder) {
        JPanel item = roundedPanel(Color.WHITE);
        item.setLayout(new BorderLayout());
        item.setBorder(new EmptyBorder(12, 14, 12, 14));

        JLabel l = new JLabel(label);
        l.setForeground(SLATE);
        l.setFont(l.getFont().deriveFont(Font.BOLD, 13f));

        JTextField tf = new JTextField(placeholder);
        tf.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(229, 231, 235)),
                new EmptyBorder(8, 8, 8, 8)));
        tf.setBackground(Color.WHITE);

        item.add(l, BorderLayout.NORTH);
        item.add(tf, BorderLayout.CENTER);
        return item;
    }

    private JPanel galleryPlaceholder() {
        JPanel grid = new JPanel(new GridLayout(2, 3, 10, 10));
        grid.setOpaque(false);
        grid.setBorder(new EmptyBorder(12, 8, 12, 8));

        for (int i = 0; i < 6; i++) {
            JPanel tile = roundedPanel(new Color(241, 245, 249));
            tile.setBorder(new EmptyBorder(24, 24, 24, 24));
            JLabel plus = new JLabel(i == 0 ? "+ Add Photo" : "Photo");
            plus.setHorizontalAlignment(SwingConstants.CENTER);
            plus.setForeground(new Color(100, 116, 139));
            tile.setLayout(new BorderLayout());
            tile.add(plus, BorderLayout.CENTER);
            grid.add(tile);
        }
        return grid;
    }

    private JButton bigCircleButton(String text, Color bg, Color fg) {
        JButton b = new JButton(text) {
            @Override public Dimension getPreferredSize() { return new Dimension(72, 72); }
        };
        b.setBackground(bg);
        b.setForeground(fg);
        b.setFocusPainted(false);
        b.setBorder(BorderFactory.createEmptyBorder());
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        b.setFont(b.getFont().deriveFont(Font.BOLD, 26f));
        b.setContentAreaFilled(false);
        b.setOpaque(false);
        b.setUI(new javax.swing.plaf.basic.BasicButtonUI(){
            @Override public void paint(Graphics g, JComponent c){
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                AbstractButton ab = (AbstractButton)c;
                ButtonModel m = ab.getModel();
                Color fill = bg;
                if (m.isRollover()) fill = fill.darker();
                g2.setColor(fill);
                g2.fillOval(0, 0, c.getWidth(), c.getHeight());
                g2.setColor(fg);
                FontMetrics fm = g2.getFontMetrics(ab.getFont());
                int tx = (c.getWidth() - fm.stringWidth(ab.getText())) / 2;
                int ty = (c.getHeight() + fm.getAscent() - fm.getDescent()) / 2;
                g2.drawString(ab.getText(), tx, ty);
                g2.dispose();
            }
        });
        return b;
    }

    /** Simple image carousel panel with mouse-wheel (swipe down) + arrow key navigation. */
    private static class ImageCarousel extends JPanel {
        private final String[] paths;
        private int index = 0;
        private final Dimension frameSize;
        private final JLabel imageLabel = new JLabel("", SwingConstants.CENTER);
        private final JLabel counter = new JLabel("", SwingConstants.RIGHT);

        ImageCarousel(String[] paths, Dimension frameSize) {
            this.paths = paths;
            this.frameSize = frameSize;

            setLayout(new BorderLayout());
            setOpaque(false);
            setPreferredSize(frameSize);

            JPanel holder = roundedHolder(new Color(241,245,249));
            holder.setLayout(new BorderLayout());
            holder.setPreferredSize(frameSize);
            holder.add(imageLabel, BorderLayout.CENTER);

            // Counter label (e.g., 1/3)
            counter.setForeground(new Color(100,116,139));
            counter.setBorder(new EmptyBorder(6, 10, 6, 10));
            holder.add(counter, BorderLayout.SOUTH);

            add(holder, BorderLayout.CENTER);

            // Mouse wheel: down = next, up = prev
            addMouseWheelListener(e -> {
                if (e.getWheelRotation() > 0) next();
                else prev();
            });

            // Key bindings for Up/Down
            setFocusable(true);
            getInputMap(WHEN_ANCESTOR_OF_FOCUSED_COMPONENT).put(KeyStroke.getKeyStroke("DOWN"), "next");
            getActionMap().put("next", new AbstractAction() { @Override public void actionPerformed(ActionEvent e) { next(); }});
            getInputMap(WHEN_ANCESTOR_OF_FOCUSED_COMPONENT).put(KeyStroke.getKeyStroke("UP"), "prev");
            getActionMap().put("prev", new AbstractAction() { @Override public void actionPerformed(ActionEvent e) { prev(); }});

            // Initial load
            showCurrent();
        }

        private static JPanel roundedHolder(Color bg) {
            return new JPanel() {
                @Override protected void paintComponent(Graphics g) {
                    Graphics2D g2 = (Graphics2D) g.create();
                    g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                    g2.setColor(bg);
                    g2.fillRoundRect(0, 0, getWidth(), getHeight(), 24, 24);
                    g2.dispose();
                    super.paintComponent(g);
                }
                @Override public boolean isOpaque() { return false; }
            };
        }

        private void next() {
            index = (index + 1) % paths.length;
            showCurrent();
        }

        private void prev() {
            index = (index - 1 + paths.length) % paths.length;
            showCurrent();
        }

        private void showCurrent() {
            // Load & scale image (if exists); otherwise show placeholder text
            Image img = loadScaled(paths[index], frameSize);
            if (img != null) {
                imageLabel.setIcon(new ImageIcon(img));
                imageLabel.setText(null);
            } else {
                imageLabel.setIcon(null);
                imageLabel.setText("<html><div style='color:#64748b'>"
                        + "Missing: " + new File(paths[index]).getName()
                        + "</div></html>");
            }
            counter.setText((index + 1) + "/" + paths.length);
            // ensure keys work without clicking
            requestFocusInWindow();
        }

        private static Image loadScaled(String path, Dimension target) {
            try {
                // Allow both relative and absolute paths
                BufferedImage src = ImageIO.read(new File(path));
                if (src == null) return null;

                int tw = target.width, th = target.height;
                double scale = Math.min((double) tw / src.getWidth(), (double) th / src.getHeight());
                int nw = Math.max(1, (int) Math.round(src.getWidth() * scale));
                int nh = Math.max(1, (int) Math.round(src.getHeight() * scale));

                BufferedImage out = new BufferedImage(nw, nh, BufferedImage.TYPE_INT_ARGB);
                Graphics2D g2 = out.createGraphics();
                g2.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
                g2.drawImage(src, 0, 0, nw, nh, null);
                g2.dispose();
                return out;
            } catch (IOException ex) {
                return null;
            }
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            // Native look & feel
            try { UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName()); } catch (Exception ignored) {}

            PawMatchMock app = new PawMatchMock();
            app.setVisible(true);
        });
    }
}
