public class Student {
    private int studentId; private String registerNo,name,department;
    public Student(int id,String reg,String name,String dept) {
        this.studentId=id; this.registerNo=reg; this.name=name; this.department=dept;
    }
    public int getStudentId(){return studentId;} public String getRegisterNo(){return registerNo;}
    public String getName(){return name;} public String getDepartment(){return department;}
}
