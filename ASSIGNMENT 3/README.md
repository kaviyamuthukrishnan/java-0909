# Assignment 3 – CO3 (Programming in Java)

Each Task folder contains the Java source for the corresponding question.
Use JDK 17 or later (the code uses modern Java APIs such as `Path.of` and `Files.writeString`).

## Compile and run
Open Command Prompt in the required Task folder. Example for Task 01:
```bat
javac ATMExceptionDemo.java
java ATMExceptionDemo
```
Repeat with the public class name in each folder:
- Task01: `ATMExceptionDemo`
- Task02: `StorageDemo`
- Task03: `SalesReportDemo`
- Task04: `ThreadLifeCycleDemo`
- Task05: `SeatBooking`
- Task06: `ConcurrencyProblems`
- Task07: `ConcurrentResultProcessor`

Task01 requires `cardreader.txt`, already included. Task03 creates its sample store files automatically.
Task07 creates a small sample set of 20 files (including one corrupt and one missing file) and compares pools of 1, 2, 4 and 8 threads. For the assignment's 10,000-file measurement, increase the loop count in `createSampleFiles` and the submission loop consistently to 10,000, then record your actual measurements.

Run every task yourself, save console screenshots and record actual measurements. Thread output order and timing can vary between runs. Do not report sample timings as measured results.

## Required comparisons / experiments from the assignment
- Task01: Try valid input, letters, a negative amount, an amount above the balance, and temporarily rename `cardreader.txt` to test the missing-file path. For an uncaught stack-trace demonstration, temporarily remove the broad catch and use an invalid operation, then restore the program.
- Task03: `generateManual()` intentionally closes resources only on the success path; `generateSafe()` uses try-with-resources. The demo's empty third file forces a mid-way failure.
- Task04: Change station sleep durations and run repeatedly to record finish order. To test daemon behaviour, call `setDaemon(true)` on a station before `start()`. To test priorities, call `setPriority()` before `start()`.
- Task05: Replace `screen.book(seat)` with `screen.bookUnsafe(seat)` to run the unsafe comparison. Restore `book()` for the synchronized result. `bookWithBlock()` demonstrates the synchronized-block alternative.
- Task06: `WalletTransfer.transferDeadlockProne(a,b,amount)` demonstrates the inconsistent lock-order approach; do not use it in the normal main run because a deadlocked test can remain stuck. The executed `transfer()` uses a consistent lock order and is safe.
- Task07: The included quick demo creates 20 files. For the required 10,000-file experiment, change both occurrences of `20` in `createSampleFiles` and the submission loop to `10000`. Run the program and record the actual elapsed times for pool sizes 1, 2, 4 and 8.
