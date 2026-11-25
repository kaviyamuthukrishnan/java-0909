# JAVA ASSIGNMENT 4 – CO4: EVENT-DRIVEN GUI DESIGN

**Institution:** SIMATS Engineering  
**Course:** Programming in Java (CSA09)  
**Student:** Kaviya M.  
**Register Number:** 192421050  
**IDE:** Eclipse  

## Repository structure
- `Task01/` – GUI design review, `FeeWindow.java`, `FeeService.java`
- `Task02/` – Hospital appointment desk event model, hierarchy and pseudocode
- `Task03/` – Responsive campus library search screen
- `Task04/` – DrawPad event-handling repair and repaint-persistent drawing
- `Task05/` – Four event-handling styles and completed lambda converter
- `Task06/` – Campus event registration Swing/JDBC application, SQL schema and CSV export
- `Report/Assignment4_Report.md` – Consolidated assignment report

## Software requirements
- JDK 8 or later (JDK 11+ recommended)
- Eclipse IDE
- MySQL Server 8.x for Task 1 payment database and Task 6 registration database
- MySQL Connector/J added to the Eclipse project build path for Tasks 1 and 6

## How to import into Eclipse
1. Extract this ZIP file.
2. In Eclipse choose **File → New → Java Project**.
3. Create a project named `Assignment4`.
4. Copy the `.java` files from the task folders into the project's `src` folder. Keep the package structure if you create packages; the supplied source files use the default package for easy beginner setup.
5. For Task 1 and Task 6, add MySQL Connector/J to the project's build path.
6. Run the indicated main class for each task.

## Database setup
Run `Task01/database.sql` for Task 1 and `Task06/database.sql` for Task 6. Update database username/password in `FeeService.java` and `DBConnection.java` to match your local MySQL account.

## Run each task
- Task 1: `FeeWindow.java`
- Task 3: `LibrarySearchScreen.java`
- Task 4: `DrawPad.java`
- Task 5: Run any one of `ConverterFrameListener.java`, `ConverterInnerClass.java`, `ConverterAnonymous.java`, `ConverterLambda.java`
- Task 6: `EventRegistrationApp.java`

Task 2 is a design task in the supplied assignment; its event table, component hierarchy, pseudocode and trace are included in the report.

## Evidence and academic integrity
The `Screenshots` folders are placeholders for your own screenshots after executing the programs in Eclipse. Do not submit fabricated screenshots. Capture the actual running windows and test interactions on your computer. The code is a starting implementation and must be configured and tested with your local JDK, database and JDBC driver.

## Suggested progressive Git commits
- `Completed Task 01 - GUI Design Review`
- `Completed Task 02 - Hospital Appointment Desk Design`
- `Completed Task 03 - Library Search GUI`
- `Completed Task 04 - DrawPad Event Handling`
- `Completed Task 05 - Event Handling Styles`
- `Completed Task 06 - Campus Event Registration Application`
- `Added consolidated Assignment 4 report`
