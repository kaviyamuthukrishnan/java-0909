import java.io.IOException;

class ExamException extends Exception {
    ExamException(String message) { super(message); }
    ExamException(String message, Throwable cause) { super(message, cause); }
}
class SubmissionStorageException extends ExamException {
    SubmissionStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
class ExamWindowClosedException extends ExamException {
    ExamWindowClosedException(String message) { super(message); }
}
class StudentNotRegisteredException extends ExamException {
    StudentNotRegisteredException(String message) { super(message); }
}
class Storage {
    void save(String fileName, long sizeKb) throws SubmissionStorageException {
        try {
            if (sizeKb > 500) throw new IOException("Disk quota exceeded");
            System.out.println("Saved " + fileName);
        } catch (IOException e) {
            throw new SubmissionStorageException("Could not store " + fileName, e);
        }
    }
}
class ExamService {
    private final Storage storage = new Storage();

    void submit(String fileName, long sizeKb, boolean examOpen, boolean registered)
            throws ExamException {
        if (!examOpen) throw new ExamWindowClosedException("The examination window is closed.");
        if (!registered) throw new StudentNotRegisteredException("Student is not registered.");
        storage.save(fileName, sizeKb);
    }
}
public class StorageDemo {
    public static void main(String[] args) {
        ExamService service = new ExamService();
        String[] names = {"answer01.pdf", "answer02.pdf", "answer03.pdf"};
        long[] sizes = {120, 800, 100};
        boolean[] open = {true, true, false};
        boolean[] registered = {true, true, true};

        for (int i = 0; i < names.length; i++) {
            try {
                service.submit(names[i], sizes[i], open[i], registered[i]);
            } catch (ExamException e) {
                System.out.println("Error: " + e.getMessage());
                if (e.getCause() != null)
                    System.out.println("Cause: " + e.getCause().getMessage());
            }
        }
    }
}
