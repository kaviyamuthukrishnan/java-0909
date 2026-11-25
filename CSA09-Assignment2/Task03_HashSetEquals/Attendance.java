import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

class Student {
    private final String regNo;
    private final String name;

    Student(String regNo, String name) {
        this.regNo = regNo;
        this.name = name;
    }
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student)) return false;
        Student other = (Student) o;
        return regNo.equals(other.regNo);
    }
    @Override public int hashCode() {
        return Objects.hash(regNo);
    }
    @Override public String toString() { return regNo + " " + name; }
}

public class Attendance {
    public static void main(String[] args) {
        Set<Student> present = new HashSet<Student>();
        present.add(new Student("192311001", "Arun"));
        present.add(new Student("192311002", "Divya"));
        present.add(new Student("192311001", "Arun"));
        System.out.println("Corrected set size: " + present.size());
        System.out.println(present);

        // A second test: same registration number, different name.
        present.add(new Student("192311001", "Arun Kumar"));
        System.out.println("After same ID with a different name: " + present.size());

        // Safe design: identity fields are final, so hash/equality cannot change after insertion.
    }
}